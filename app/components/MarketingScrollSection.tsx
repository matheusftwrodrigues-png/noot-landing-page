"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const PANELS = [
  {
    id: "headline",
    eyebrow: "Marketing elástico",
    text: "Escale seu marketing com inteligência e um time completo. Tudo sob medida para o seu negócio.",
    size: "large" as const,
  },
  {
    id: "body",
    eyebrow: "Time + tecnologia",
    text: "Tenha acesso a especialistas de alta performance e tecnologia de ponta em um único plano elástico. Flexível, eficiente e sob medida para o que sua empresa precisa.",
    size: "small" as const,
  },
  {
    id: "cta",
    eyebrow: "Comece agora",
    text: "Experimente com as primeiras horas grátis!",
    size: "cta" as const,
  },
] as const;

export default function MarketingScrollSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const getScrollDistance = () =>
      Math.max(track.scrollWidth - window.innerWidth, 0);

    const ctx = gsap.context(() => {
      gsap.set(track, { x: 0 });

      gsap.to(track, {
        x: () => -getScrollDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${Math.max(getScrollDistance(), 1)}`,
          pin: true,
          pinSpacing: true,
          scrub: 0.35,
          invalidateOnRefresh: true,
        },
      });
    }, section);

    const refresh = () => ScrollTrigger.refresh();
    requestAnimationFrame(refresh);
    const t1 = window.setTimeout(refresh, 180);
    const t2 = window.setTimeout(refresh, 700);

    window.addEventListener("resize", refresh);
    window.addEventListener("load", refresh);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener("resize", refresh);
      window.removeEventListener("load", refresh);
      ctx.revert();
    };
  }, []);

  return (
    <section
      id="proposta"
      ref={sectionRef}
      data-section="proposta"
      className="marketing-scroll relative z-30 h-screen w-full overflow-hidden bg-[#14110f]"
      aria-label="Proposta Noot"
    >
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "linear-gradient(120deg, #14110f 0%, #1c1714 42%, #2a1518 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(237,26,65,0.35), transparent 40%), radial-gradient(circle at 80% 70%, rgba(237,26,65,0.18), transparent 45%)",
        }}
      />

      <div
        ref={trackRef}
        className="relative z-10 flex h-full w-max items-center gap-[14vw] pl-[10vw] pr-[28vw] will-change-transform"
      >
        {PANELS.map((panel) => (
          <article
            key={panel.id}
            className="flex h-full w-[min(78vw,42rem)] shrink-0 flex-col justify-center"
          >
            <p className="mb-6 font-[family-name:var(--font-geist-mono)] text-xs tracking-[0.28em] text-[#ED1A41] uppercase">
              {panel.eyebrow}
            </p>

            {panel.size === "cta" ? (
              <div className="flex flex-col items-start gap-8">
                <h2 className="max-w-[16ch] text-[clamp(2.4rem,6vw,4.75rem)] font-semibold leading-[1.05] tracking-tight text-[#f7f2ec]">
                  {panel.text}
                </h2>
                <a
                  href="#empresas"
                  className="inline-flex items-center justify-center bg-[#ED1A41] px-7 py-3.5 font-[family-name:var(--font-geist-mono)] text-sm tracking-wide text-white transition-colors hover:bg-[#c91436]"
                >
                  Experimente grátis
                </a>
              </div>
            ) : (
              <p
                className={
                  panel.size === "small"
                    ? "max-w-[34ch] text-[clamp(1.05rem,2.2vw,1.55rem)] font-medium leading-[1.45] tracking-tight text-[#e8e0d6]"
                    : "max-w-[22ch] text-[clamp(1.75rem,4.6vw,3.5rem)] font-semibold leading-[1.12] tracking-tight text-[#f7f2ec]"
                }
              >
                {panel.text}
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
