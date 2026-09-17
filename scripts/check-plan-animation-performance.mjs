import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const chromePath =
  process.env.CHROME_PATH ??
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9333;
const screenshotPath = process.argv
  .find((argument) => argument.startsWith("--screenshot="))
  ?.slice("--screenshot=".length);
const viewport =
  process.argv
    .find((argument) => argument.startsWith("--viewport="))
    ?.slice("--viewport=".length) ?? "1440x900";
const [viewportWidth, viewportHeight] = viewport.split("x").map(Number);
const profileDir = mkdtempSync(join(tmpdir(), "noot-plan-perf-"));
const profilePath = resolve(profileDir);
const tempPath = resolve(tmpdir());

const browser = spawn(
  chromePath,
  [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profilePath}`,
    "--disable-extensions",
    "--disable-background-networking",
    "--no-first-run",
    `--window-size=${viewportWidth},${viewportHeight}`,
    "about:blank",
  ],
  { stdio: "ignore" },
);

const wait = (ms) => new Promise((resolveWait) => setTimeout(resolveWait, ms));

async function getDebugTarget() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const targets = await fetch(`http://127.0.0.1:${port}/json/list`).then(
        (response) => response.json(),
      );
      const page = targets.find((target) => target.type === "page");
      if (page) return page;
    } catch {
      // Chrome is still starting.
    }
    await wait(100);
  }
  throw new Error("Chrome DevTools target did not become available.");
}

function connect(webSocketDebuggerUrl) {
  const socket = new WebSocket(webSocketDebuggerUrl);
  let id = 0;
  const pending = new Map();
  const listeners = new Map();

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const request = pending.get(message.id);
      if (!request) return;
      pending.delete(message.id);
      if (message.error) request.reject(new Error(message.error.message));
      else request.resolve(message.result);
      return;
    }
    const eventListeners = listeners.get(message.method) ?? [];
    eventListeners.forEach((listener) => listener(message.params));
  });

  const opened = new Promise((resolveOpen, rejectOpen) => {
    socket.addEventListener("open", resolveOpen, { once: true });
    socket.addEventListener("error", rejectOpen, { once: true });
  });

  return {
    opened,
    send(method, params = {}) {
      const requestId = ++id;
      socket.send(JSON.stringify({ id: requestId, method, params }));
      return new Promise((resolveRequest, rejectRequest) => {
        pending.set(requestId, {
          resolve: resolveRequest,
          reject: rejectRequest,
        });
      });
    },
    once(method) {
      return new Promise((resolveEvent) => {
        const eventListeners = listeners.get(method) ?? [];
        const listener = (params) => {
          listeners.set(
            method,
            (listeners.get(method) ?? []).filter((item) => item !== listener),
          );
          resolveEvent(params);
        };
        listeners.set(method, [...eventListeners, listener]);
      });
    },
    close() {
      socket.close();
    },
  };
}

function metric(metrics, name) {
  return metrics.find((item) => item.name === name)?.value ?? 0;
}

try {
  const target = await getDebugTarget();
  const cdp = connect(target.webSocketDebuggerUrl);
  await cdp.opened;
  await Promise.all([
    cdp.send("Page.enable"),
    cdp.send("Runtime.enable"),
    cdp.send("Performance.enable"),
  ]);
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: viewportWidth,
    height: viewportHeight,
    deviceScaleFactor: 1,
    mobile: viewportWidth < 768,
  });

  const loaded = cdp.once("Page.loadEventFired");
  await cdp.send("Page.navigate", { url: "http://localhost:3000" });
  await loaded;
  await wait(1200);

  await cdp.send("Runtime.evaluate", {
    expression: `(() => {
      const plan = document.querySelector('#plano');
      const scrollRange = plan.offsetHeight - innerHeight;
      document.documentElement.style.scrollBehavior = 'auto';
      scrollTo(0, plan.offsetTop + scrollRange * 0.85);
    })()`,
  });
  await cdp.send("Runtime.evaluate", {
    expression: `Array.from(document.querySelectorAll('.plan-lane')).forEach((lane, index) => {
      if (index === 0) return;
      lane.style.animationPlayState = 'paused';
      const surface = lane.querySelector('.plan-lane-fill-surface');
      if (surface) surface.style.animationPlayState = 'paused';
    })`,
  });
  await cdp.send("Runtime.evaluate", {
    expression: `Promise.race([
      Promise.all([
        document.fonts.ready,
        ...Array.from(document.querySelectorAll('#plano img'), (image) => image.complete
          ? Promise.resolve()
          : new Promise((resolveImage) => {
              image.addEventListener('load', resolveImage, { once: true });
              image.addEventListener('error', resolveImage, { once: true });
            }))
      ]),
      new Promise((resolveTimeout) => setTimeout(resolveTimeout, 2000))
    ])`,
    awaitPromise: true,
  });
  await wait(1500);

  await cdp.send("Runtime.evaluate", {
    expression: `(document.querySelector('.plan-lane-fill-surface')
      ?? document.querySelector('.plan-lane')).style.animationPlayState = 'paused'`,
  });
  await wait(100);
  const controlBefore = await cdp.send("Performance.getMetrics");
  await cdp.send("Runtime.evaluate", {
    expression: `(async () => {
      const visualBar = document.querySelector('.plan-lane-fill-surface')
        ?? document.querySelector('.plan-lane');
      for (let frame = 0; frame < 240; frame += 1) {
        await new Promise(requestAnimationFrame);
        visualBar.getBoundingClientRect().width;
      }
    })()`,
    awaitPromise: true,
  });
  const controlAfter = await cdp.send("Performance.getMetrics");
  await cdp.send("Runtime.evaluate", {
    expression: `(document.querySelector('.plan-lane-fill-surface')
      ?? document.querySelector('.plan-lane')).style.animationPlayState = 'running'`,
  });
  await wait(100);

  const before = await cdp.send("Performance.getMetrics");
  const sample = await cdp.send("Runtime.evaluate", {
    expression: `(async () => {
      const visualBar = document.querySelector('.plan-lane-fill-surface')
        ?? document.querySelector('.plan-lane');
      if (!visualBar) throw new Error('Plan lane not found');
      const initialStyle = getComputedStyle(visualBar);
      const widths = [];
      const frameTimes = [];
      const usesTransform = visualBar.classList.contains('plan-lane-fill-surface');
      let previous = performance.now();
      for (let frame = 0; frame < 240; frame += 1) {
        await new Promise(requestAnimationFrame);
        const now = performance.now();
        frameTimes.push(now - previous);
        previous = now;
        widths.push(usesTransform
          ? new DOMMatrixReadOnly(getComputedStyle(visualBar).transform).a * visualBar.offsetWidth
          : visualBar.getBoundingClientRect().width);
      }
      return {
        animationName: initialStyle.animationName,
        animationPlayState: initialStyle.animationPlayState,
        widthDelta: Math.max(...widths) - Math.min(...widths),
        firstWidth: widths[0],
        lastWidth: widths.at(-1),
        slowFrames: frameTimes.filter((time) => time > 20).length,
        worstFrame: Math.max(...frameTimes),
      };
    })()`,
    awaitPromise: true,
    returnByValue: true,
  });
  const after = await cdp.send("Performance.getMetrics");

  const animatedLayoutDelta =
    metric(after.metrics, "LayoutCount") - metric(before.metrics, "LayoutCount");
  const controlLayoutDelta =
    metric(controlAfter.metrics, "LayoutCount") -
    metric(controlBefore.metrics, "LayoutCount");
  const animationLayoutCost = Math.max(
    0,
    animatedLayoutDelta - controlLayoutDelta,
  );
  const recalcDelta =
    metric(after.metrics, "RecalcStyleCount") -
    metric(before.metrics, "RecalcStyleCount");
  const result = sample.result.value;
  const smooth = animationLayoutCost <= 3 && result.widthDelta >= 1;

  console.log(
    JSON.stringify(
      {
        verdict: smooth ? "PASS" : "FAIL",
        animatedLayoutCount: animatedLayoutDelta,
        pausedLayoutCount: controlLayoutDelta,
        animationLayoutCost,
        styleRecalcCount: recalcDelta,
        visualWidthDeltaPx: Number(result.widthDelta.toFixed(2)),
        firstWidthPx: Number(result.firstWidth.toFixed(2)),
        lastWidthPx: Number(result.lastWidth.toFixed(2)),
        animationName: result.animationName,
        animationPlayState: result.animationPlayState,
        slowFrames: result.slowFrames,
        worstFrameMs: Number(result.worstFrame.toFixed(2)),
      },
      null,
      2,
    ),
  );

  if (screenshotPath) {
    await cdp.send("Runtime.evaluate", {
      expression: `(() => {
        const plan = document.querySelector('#plano');
        document.documentElement.style.scrollBehavior = 'auto';
        document.documentElement.style.overflow = 'auto';
        document.body.style.overflow = 'auto';
        scrollTo(0, plan.offsetTop + (plan.offsetHeight - innerHeight) * 0.5);
        document.querySelectorAll('[data-fill]').forEach((element) => {
          element.style.transform = 'scaleX(1)';
        });
        document.querySelectorAll('[data-body], [data-face], [data-copy-row]').forEach((element) => {
          element.style.opacity = '1';
          element.style.transform = 'none';
        });
      })()`,
    });
    await wait(100);
    const screenshot = await cdp.send("Page.captureScreenshot", {
      format: "png",
      fromSurface: true,
    });
    writeFileSync(resolve(screenshotPath), Buffer.from(screenshot.data, "base64"));
  }

  cdp.close();
  if (!smooth) process.exitCode = 1;
} finally {
  browser.kill();
  if (profilePath.startsWith(`${tempPath}\\`) && profilePath.includes("noot-plan-perf-")) {
    await wait(250);
    rmSync(profilePath, { recursive: true, force: true });
  }
}
