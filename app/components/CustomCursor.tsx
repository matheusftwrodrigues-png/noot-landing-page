"use client";

import { useEffect, useRef } from "react";

/**
 * Time constant for the dot's chase. After this many milliseconds it has
 * covered roughly 63% of the distance to the pointer. Keeping this temporal
 * keeps the subtle trail feeling the same at every refresh rate.
 */
const FOLLOW_RESPONSE_MS = 110;

/** Anything the dot should swell over. */
const INTERACTIVE = 'a, button, [role="button"], input, select, textarea, label';
/** Anything that opens the dot into a labelled disc. */
const LABELLED = "[data-cursor-label]";

export default function CustomCursor() {
  const rootRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const text = textRef.current;
    if (!root || !text) return;

    // Pointer-driven, so it only makes sense with a real pointer. Coarse
    // pointers keep the native behaviour (see .noot-cursor in globals.css).
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!fine.matches) return;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let targetX = x;
    let targetY = y;
    let visible = false;
    let frame = 0;
    let label = "";
    let lastFrameTime = performance.now();

    const render = (now: number) => {
      const elapsed = Math.min(now - lastFrameTime, 64);
      const follow = 1 - Math.exp(-elapsed / FOLLOW_RESPONSE_MS);
      lastFrameTime = now;
      x += (targetX - x) * follow;
      y += (targetY - y) * follow;
      root.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      frame = requestAnimationFrame(render);
    };

    // Sizes live in CSS, keyed off data-state — nothing here has to know how
    // big any state is.
    const setState = (nextLabel: string | null, active: boolean) => {
      if (nextLabel && nextLabel !== label) {
        label = nextLabel;
        text.textContent = nextLabel;
      }
      if (!nextLabel) label = "";
      root.dataset.state = nextLabel ? "label" : active ? "active" : "rest";
    };

    const onMove = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;

      // Stay out of the way until the intro has handed over the frame.
      if (!visible && document.body.dataset.introDone === "true") {
        visible = true;
        x = targetX;
        y = targetY;
        root.style.opacity = "1";
      }
    };

    const onOver = (event: PointerEvent) => {
      const target = event.target as Element | null;
      const labelled = target?.closest?.(LABELLED) as HTMLElement | null;
      setState(
        labelled?.dataset.cursorLabel ?? null,
        Boolean(target?.closest?.(INTERACTIVE)),
      );
    };

    const onLeave = () => {
      root.style.opacity = "0";
      visible = false;
    };

    setState(null, false);
    frame = requestAnimationFrame(render);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={rootRef} className="noot-cursor" data-state="rest" aria-hidden>
      <span className="noot-cursor-shape" />
      <span ref={textRef} className="noot-cursor-text" />
    </div>
  );
}
