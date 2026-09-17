"use client";

import RollButton from "./RollButton";
import SiteFooter from "./SiteFooter";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * The closing argument, one panel per beat. Each one carries a step of the
 * pitch instead of padding the scroll: the reader has the demand, the Noot has
 * the team, so the only thing left is to start. The last panel asks for the
 * smallest possible first message.
 */
const BEATS = [
  {
    id: "next",
    kind: "whisper" as const,
    text: "Próximo passo",
  },
  {
    id: "demand",
    kind: "line" as const,
    text: "Você tem a demanda.",
  },
  {
    id: "team",
    kind: "line" as const,
    text: "A gente tem o time.",
  },
  {
    id: "ask",
    kind: "hero" as const,
    before: "Então,",
    highlight: "vamos construir.",
  },
  {
    id: "cta",
    kind: "cta" as const,
    text: "Conte o que está na fila.",
    sub: "Sem formulário, sem burocracia.",
  },
];

export default function TalkToUsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    const glow = glowRef.current;
    if (!section || !track) return;

    const getScrollDistance = () =>
      Math.max(track.scrollWidth - window.innerWidth, 0);

    /** Scroll spent per pixel of horizontal travel — see MarketingScrollSection. */
    const SCROLL_RATIO = 0.5;
    const getScrollLength = () =>
      Math.max(getScrollDistance() * SCROLL_RATIO, 1);

    const ctx = gsap.context(() => {
      gsap.set(track, { x: 0 });

      const scrollTween = gsap.to(track, {
        x: () => -getScrollDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${getScrollLength()}`,
          pin: true,
          pinSpacing: true,
          scrub: 0.7,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          preventOverlaps: true,
        },
      });

      if (glow) {
        gsap.to(glow, {
          xPercent: 70,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${getScrollLength()}`,
            scrub: 1,
          },
        });
      }

      gsap.utils.toArray<HTMLElement>(".talk-panel").forEach((panel) => {
        gsap.fromTo(
          panel,
          { opacity: 0.35, y: 28 },
          {
            opacity: 1,
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: panel,
              containerAnimation: scrollTween,
              start: "left 80%",
              end: "left 40%",
              scrub: true,
            },
          },
        );
      });

    }, section);

    requestAnimationFrame(() => ScrollTrigger.refresh());

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);
    window.addEventListener("load", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", onResize);
      ctx.revert();
    };
  }, []);

  return (
    <>
      <section
        id="fala-com-a-gente"
        ref={sectionRef}
        data-section="fala-com-a-gente"
        className="talk-scroll relative z-40 h-screen w-full overflow-hidden"
        aria-label="Fale com a Noot"
      >
      <div
        className="absolute inset-0"
        aria-hidden
        style={{
          background:
            "linear-gradient(115deg, #ED1A41 0%, #b81232 38%, #081125 78%)",
        }}
      />
      <div
        ref={glowRef}
        className="pointer-events-none absolute -left-1/4 top-1/2 h-[70vmax] w-[70vmax] -translate-y-1/2 rounded-full opacity-40 blur-3xl"
        aria-hidden
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.35), transparent 60%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        aria-hidden
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent, transparent 48px, rgba(255,255,255,0.06) 48px, rgba(255,255,255,0.06) 49px)",
        }}
      />

      <div
        ref={trackRef}
        className="relative z-10 flex h-full w-max items-center gap-[10vw] pl-[10vw] pr-[max(8vw,calc(50vw-11rem))] will-change-transform"
      >
        {BEATS.map((beat) => (
          <article
            key={beat.id}
            data-talk-beat={beat.id}
            data-talk-final={beat.kind === "cta" ? "true" : undefined}
            className="talk-panel flex h-full shrink-0 flex-col justify-center"
          >
            {beat.kind === "whisper" && (
              <p className="font-[family-name:var(--font-geist-mono)] text-[clamp(0.85rem,1.5vw,1.15rem)] tracking-[0.35em] text-white/70 uppercase">
                {beat.text}
              </p>
            )}

            {beat.kind === "line" && (
              <p className="max-w-[12ch] text-[clamp(2.4rem,7vw,5.5rem)] font-semibold leading-[1.05] tracking-tight text-white">
                {beat.text}
              </p>
            )}

            {beat.kind === "hero" && (
              <h2 className="max-w-[12ch] text-[clamp(2.8rem,8vw,6.25rem)] font-semibold leading-[0.98] tracking-tight text-white">
                <span className="block text-white/80">{beat.before}</span>
                <span className="block text-white">{beat.highlight}</span>
              </h2>
            )}

            {beat.kind === "cta" && (
              <div className="flex w-[min(22rem,86vw)] flex-col items-start gap-6">
                <p className="text-[clamp(2rem,5vw,3.75rem)] font-semibold leading-[1.05] tracking-tight text-white">
                  {beat.text}
                </p>
                <p className="font-[family-name:var(--font-geist-mono)] text-[0.8rem] tracking-wide whitespace-nowrap text-white/70 sm:text-sm">
                  {beat.sub}
                </p>
                <RollButton
                  label="Falar com a Noot"
                  href="mailto:ola@noot.com.br?subject=Projeto%20para%20a%20Noot"
                  variant="light"
                />
              </div>
            )}
          </article>
        ))}
      </div>

      </section>
      <SiteFooter />
    </>
  );
}
