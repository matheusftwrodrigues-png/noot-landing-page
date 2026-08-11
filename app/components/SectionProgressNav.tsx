"use client";

import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "inicio", label: "Logo" },
  { id: "proposta", label: "Proposta" },
  { id: "empresas", label: "Clientes" },
  { id: "fala-com-a-gente", label: "Fala" },
] as const;

type ProgressMap = Record<(typeof SECTIONS)[number]["id"], number>;

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

/** Prefer GSAP pin-spacer height so pinned horizontal sections track correctly */
function getSectionBox(el: HTMLElement) {
  const spacer = el.closest(".pin-spacer") as HTMLElement | null;
  const box = spacer ?? el;
  const rect = box.getBoundingClientRect();
  const top = window.scrollY + rect.top;
  const height = Math.max(box.offsetHeight, el.offsetHeight, 1);
  return { top, height, bottom: top + height };
}

function sectionProgress(el: HTMLElement) {
  const { top, height } = getSectionBox(el);
  const view = window.innerHeight;
  const start = top;
  const end = Math.max(top + height - view, start + 1);
  return clamp01((window.scrollY - start) / (end - start));
}

function emptyProgress(): ProgressMap {
  return {
    inicio: 0,
    proposta: 0,
    empresas: 0,
    "fala-com-a-gente": 0,
  };
}

export default function SectionProgressNav() {
  const [progress, setProgress] = useState<ProgressMap>(emptyProgress);
  const [active, setActive] = useState<string>("inicio");
  const [overall, setOverall] = useState(0);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      const next = emptyProgress();
      const viewMid = window.scrollY + window.innerHeight * 0.45;
      let current: string = SECTIONS[0].id;
      let bestDist = Number.POSITIVE_INFINITY;

      for (const section of SECTIONS) {
        const el = document.getElementById(section.id);
        if (!el) continue;

        const box = getSectionBox(el);
        const p = sectionProgress(el);
        next[section.id] = p;

        if (viewMid >= box.top && viewMid < box.bottom) {
          current = section.id;
          bestDist = 0;
        } else if (bestDist !== 0) {
          const dist = Math.min(
            Math.abs(viewMid - box.top),
            Math.abs(viewMid - box.bottom),
          );
          if (dist < bestDist) {
            bestDist = dist;
            current = section.id;
          }
        }
      }

      const maxScroll = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1,
      );
      const overallP = clamp01(window.scrollY / maxScroll);
      if (overallP >= 0.985) {
        current = "fala-com-a-gente";
        next["fala-com-a-gente"] = 1;
      }

      setOverall(overallP);
      setProgress(next);
      setActive(current);
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    const t1 = window.setTimeout(update, 120);
    const t2 = window.setTimeout(update, 600);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const jumpTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const box = getSectionBox(el);
    window.scrollTo({ top: box.top, behavior: "smooth" });
  };

  return (
    <nav
      className="pointer-events-none fixed top-1/2 right-3 z-50 hidden -translate-y-1/2 sm:right-5 md:block"
      aria-label="Progresso das seções"
    >
      <div className="pointer-events-auto flex flex-col items-end gap-4 rounded-2xl bg-[#171412]/75 px-3 py-4 shadow-[0_12px_40px_rgba(23,20,18,0.25)] ring-1 ring-white/10 backdrop-blur-md">
        <div className="mb-1 flex w-full flex-col items-end gap-1">
          <span className="font-[family-name:var(--font-geist-mono)] text-[0.6rem] tracking-[0.2em] text-white/50 uppercase">
            Jornada
          </span>
          <div className="h-1 w-16 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-[#ED1A41] transition-[width] duration-150"
              style={{ width: `${Math.round(overall * 100)}%` }}
            />
          </div>
          <span className="font-[family-name:var(--font-geist-mono)] text-[0.65rem] text-white/70">
            {Math.round(overall * 100)}%
          </span>
        </div>

        <ul className="flex flex-col gap-3">
          {SECTIONS.map((section, index) => {
            const p = progress[section.id] ?? 0;
            const isActive = active === section.id;
            const remaining = Math.max(0, 100 - Math.round(p * 100));

            return (
              <li key={section.id}>
                <button
                  type="button"
                  onClick={() => jumpTo(section.id)}
                  className="group flex w-full items-center justify-end gap-3 text-right"
                >
                  <span className="flex min-w-[5.5rem] flex-col items-end gap-0.5">
                    <span
                      className={`font-[family-name:var(--font-geist-mono)] text-[0.65rem] tracking-wide transition-colors ${
                        isActive
                          ? "text-white"
                          : "text-white/45 group-hover:text-white/75"
                      }`}
                    >
                      {String(index + 1).padStart(2, "0")} {section.label}
                    </span>
                    <span className="font-[family-name:var(--font-geist-mono)] text-[0.6rem] text-white/35">
                      {p >= 0.97
                        ? "chegou"
                        : p <= 0.02
                          ? "à frente"
                          : `${remaining}% falta`}
                    </span>
                    <span className="mt-0.5 h-0.5 w-14 overflow-hidden rounded-full bg-white/15">
                      <span
                        className="block h-full rounded-full bg-[#ED1A41] transition-[width] duration-150"
                        style={{ width: `${Math.round(p * 100)}%` }}
                      />
                    </span>
                  </span>

                  <span
                    className={`relative flex h-2.5 w-2.5 shrink-0 items-center justify-center rounded-full transition-all ${
                      isActive
                        ? "bg-[#ED1A41] shadow-[0_0_0_4px_rgba(237,26,65,0.25)]"
                        : p > 0.02
                          ? "bg-white/55"
                          : "bg-white/20"
                    }`}
                    aria-hidden
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
