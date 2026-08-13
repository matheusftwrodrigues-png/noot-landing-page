"use client";

import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "inicio", label: "Logo" },
  { id: "oficio", label: "Ofício" },
  { id: "proposta", label: "Proposta" },
  { id: "empresas", label: "Clientes" },
  { id: "trabalhos", label: "Galeria" },
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
    oficio: 0,
    proposta: 0,
    empresas: 0,
    trabalhos: 0,
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
      className="pointer-events-none fixed inset-y-0 left-0 z-50 hidden md:flex"
      aria-label="Progresso das seções"
    >
      <div className="group/nav pointer-events-auto flex h-full w-12 flex-col items-center py-[9vh] opacity-100 transition-opacity duration-300 hover:opacity-100">
        <div className="relative flex h-full w-full flex-col items-center">
          <div
            className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white mix-blend-difference"
            aria-hidden
          />
          <div
            className="absolute top-0 left-1/2 w-px -translate-x-1/2 bg-[#ED1A41] transition-[height] duration-150"
            style={{ height: `${Math.round(overall * 100)}%` }}
            aria-hidden
          />

          <ul className="relative z-10 flex h-full flex-col items-center justify-between">
            {SECTIONS.map((section) => {
              const p = progress[section.id] ?? 0;
              const isActive = active === section.id;

              return (
                <li key={section.id} className="relative flex items-center">
                  <button
                    type="button"
                    onClick={() => jumpTo(section.id)}
                    className="group flex h-6 w-6 items-center justify-center"
                    aria-current={isActive ? "true" : undefined}
                    aria-label={section.label}
                  >
                    <span
                      className={`rounded-full transition-all duration-200 ${
                        isActive
                          ? "h-2 w-2 bg-[#ED1A41] shadow-[0_0_0_3px_rgba(237,26,65,0.28)]"
                          : p > 0.02
                            ? "h-1.5 w-1.5 bg-white mix-blend-difference"
                            : "h-1 w-1 bg-white/70 mix-blend-difference"
                      }`}
                      aria-hidden
                    />
                    <span
                      className={`pointer-events-none absolute top-1/2 left-7 -translate-y-1/2 font-[family-name:var(--font-geist-mono)] text-[0.6rem] tracking-[0.16em] whitespace-nowrap uppercase mix-blend-difference transition-opacity duration-200 ${
                        isActive
                          ? "text-white opacity-70"
                          : "text-white opacity-0 group-hover/nav:opacity-50"
                      }`}
                    >
                      {section.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </nav>
  );
}
