"use client";

import { useEffect, useRef } from "react";
import { createTimeline, utils } from "animejs";
import RollButton from "./RollButton";

export default function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);

  // Keep the ambient loop running only while the hero is actually visible.
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const layers = Array.from(
      hero.querySelectorAll<HTMLElement>("[data-hero-ambient]"),
    );
    let heroIsVisible = true;

    const syncPlayback = () => {
      const play = heroIsVisible && !document.hidden;
      layers.forEach((layer) => {
        layer.style.animationPlayState = play ? "running" : "paused";
      });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        heroIsVisible = entry.isIntersecting;
        syncPlayback();
      },
      { threshold: 0.01 },
    );

    observer.observe(hero);
    document.addEventListener("visibilitychange", syncPlayback);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
    };
  }, []);

  // Reveal once the intro loader has handed the frame over.
  useEffect(() => {
    const reveal = revealRef.current;
    if (!reveal) return;

    const rows = Array.from(
      reveal.querySelectorAll<HTMLElement>("[data-hero-row]"),
    );
    if (rows.length === 0) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduced) {
      utils.set(rows, { opacity: 1, y: 0 });
      return;
    }

    utils.set(rows, { opacity: 0, y: 22 });

    let timeline: ReturnType<typeof createTimeline> | null = null;

    const play = () => {
      timeline = createTimeline({
        defaults: { ease: "outExpo", duration: 900 },
      });
      rows.forEach((row, index) => {
        timeline?.add(row, { opacity: [0, 1], y: [22, 0] }, index * 140);
      });
    };

    if (document.body.dataset.introDone === "true") {
      play();
      return;
    }

    window.addEventListener("noot:intro-done", play, { once: true });
    return () => {
      window.removeEventListener("noot:intro-done", play);
      timeline?.revert();
    };
  }, []);

  return (
    <section
      ref={heroRef}
      id="inicio"
      data-section="inicio"
      className="relative flex min-h-screen w-full flex-col overflow-hidden bg-white"
      aria-label="Início"
    >
      {/* The paired glows move like a slow tide, adding depth without pulling
          attention away from the headline. */}
      <div
        data-hero-ambient
        className="hero-glow hero-glow-primary pointer-events-none"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 46% 40% at 50% 48%, rgba(237, 26, 65, 0.18), rgba(237, 26, 65, 0.055) 48%, rgba(255,255,255,0) 76%)",
        }}
      />

      <div
        data-hero-ambient
        className="hero-glow hero-glow-secondary pointer-events-none"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 31% 27% at 61% 42%, rgba(237, 26, 65, 0.085), rgba(255,255,255,0) 72%)",
        }}
      />

      <div
        ref={revealRef}
        className="relative z-20 flex flex-1 flex-col items-center justify-center px-6 pt-28 pb-20 text-center"
      >
        <h1
          data-hero-row
          className="w-full max-w-[16ch] font-[family-name:var(--font-jakarta)] text-[clamp(2.35rem,7.4vw,5.4rem)] leading-[1.04] font-extrabold tracking-[-0.025em] text-balance text-[#081125]"
          style={{ opacity: 0 }}
        >
          Construímos o que o seu time precisa
        </h1>

        <p
          data-hero-row
          className="mt-8 w-full max-w-[72ch] text-[clamp(1.05rem,1.5vw,1.3rem)] leading-relaxed text-balance text-[#081125]/65"
          style={{ opacity: 0 }}
        >
          Toda a execução em um time só. Você traz a demanda e recebe o projeto
          pronto, sem montar estrutura nova para cada entrega.
        </p>

        <div
          data-hero-row
          className="mt-12 flex flex-col items-center gap-4 sm:flex-row"
          style={{ opacity: 0 }}
        >
          <RollButton
            label="Falar com a Noot"
            href="#fala-com-a-gente"
            variant="solid"
          />
          <RollButton
            label="Ver os cases"
            href="#trabalhos"
            variant="dark"
            arrowDirection="down"
          />
        </div>
      </div>
    </section>
  );
}
