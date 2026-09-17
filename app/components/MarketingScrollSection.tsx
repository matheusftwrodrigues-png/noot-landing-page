"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import RollButton from "./RollButton";

gsap.registerPlugin(ScrollTrigger);

const PANELS = [
  {
    id: "headline",
    eyebrow: "A proposta",
    text: "Um time de execução inteiro para a sua operação.",
    size: "large" as const,
  },
  {
    id: "body",
    eyebrow: "Sob demanda",
    text: "Um time completo à disposição: cada frente entra conforme o projeto pede e sai quando não precisa mais. Você paga pela entrega, não por um time parado.",
    size: "small" as const,
  },
  {
    id: "cta",
    eyebrow: "Comece agora",
    text: "Conte o que o seu time precisa entregar.",
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

    /** Scroll spent per pixel of horizontal travel. Below 1 the panels move
     *  faster than the wheel, which keeps the pin short. */
    const SCROLL_RATIO = 0.6;

    const ctx = gsap.context(() => {
      gsap.set(track, { x: 0 });

      gsap.to(track, {
        x: () => -getScrollDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${Math.max(getScrollDistance() * SCROLL_RATIO, 1)}`,
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
      className="marketing-scroll relative z-30 h-screen w-full overflow-hidden bg-[#E11640]"
      aria-label="Proposta Noot"
    >
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "linear-gradient(120deg, #E11640 0%, #C4123A 52%, #94102A 100%)",
        }}
      />
      <div
        className="amb-drift pointer-events-none absolute inset-0 opacity-30"
        aria-hidden
        style={
          {
            "--amb-duration": "28s",
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.30), transparent 42%), radial-gradient(circle at 80% 70%, rgba(8,17,37,0.22), transparent 46%)",
          } as CSSProperties
        }
      />

      <div
        ref={trackRef}
        className="relative z-10 flex h-full w-max items-center gap-[9vw] pl-[13vw] pr-[14vw] will-change-transform"
      >
        {PANELS.map((panel) => (
          <article
            key={panel.id}
            className="flex h-full w-[min(78vw,42rem)] shrink-0 flex-col justify-center"
          >
            <p className="mb-6 font-[family-name:var(--font-geist-mono)] text-[0.8rem] font-bold tracking-[0.28em] text-[#112159] uppercase">
              {panel.eyebrow}
            </p>

            {panel.size === "cta" ? (
              <div className="flex flex-col items-start gap-8">
                <h2 className="max-w-[20ch] text-[clamp(1.75rem,4.6vw,3.5rem)] font-semibold leading-[1.12] tracking-tight text-white">
                  {panel.text}
                </h2>
                <RollButton
                  label="Falar com a gente"
                  href="#fala-com-a-gente"
                  variant="light"
                />
              </div>
            ) : (
              <p
                className={
                  panel.size === "small"
                    ? "max-w-[34ch] text-[clamp(1.15rem,2.4vw,1.75rem)] font-medium leading-[1.45] tracking-tight text-white/95"
                    : "max-w-[22ch] text-[clamp(1.75rem,4.6vw,3.5rem)] font-semibold leading-[1.12] tracking-tight text-white"
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
