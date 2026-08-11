"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createTimeline, onScroll, utils } from "animejs";

const LETTERS = [
  { src: "/images/vector.svg", alt: "N", w: 18, h: 19 },
  { src: "/images/vector_1.svg", alt: "O", w: 22, h: 19 },
  { src: "/images/vector_2.svg", alt: "O", w: 22, h: 19 },
  { src: "/images/vector_3.svg", alt: "T", w: 14, h: 24 },
] as const;

export default function NootLettersSection() {
  const trackRef = useRef<HTMLElement>(null);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const hintRef = useRef<HTMLDivElement>(null);
  const [hintGone, setHintGone] = useState(false);

  useEffect(() => {
    const track = trackRef.current;
    const letters = letterRefs.current.filter(Boolean) as HTMLSpanElement[];
    if (!track || letters.length !== LETTERS.length) return;

    utils.set(letters, {
      opacity: 0,
      y: 64,
      scale: 0.72,
      rotate: -8,
    });

    const timeline = createTimeline({
      defaults: {
        ease: "outCubic",
        duration: 700,
      },
      autoplay: onScroll({
        target: track,
        enter: "top top",
        leave: "bottom bottom",
        sync: 0.65,
      }),
    });

    letters.forEach((letter, index) => {
      timeline.add(
        letter,
        {
          opacity: [0, 1],
          y: [64, 0],
          scale: [0.72, 1],
          rotate: [-8, 0],
        },
        index * 550,
      );
    });

    timeline.add(
      letters,
      {
        scale: [1, 1.12, 1],
        y: [0, -18, 0],
        rotate: [0, 0],
        ease: "inOutQuad",
        duration: 900,
      },
      "+=200",
    );

    return () => {
      timeline.revert();
    };
  }, []);

  useEffect(() => {
    const hint = hintRef.current;
    if (!hint) return;

    const onScroll = () => {
      const y = window.scrollY;
      const fade = Math.min(1, y / (window.innerHeight * 0.35));
      hint.style.opacity = String(1 - fade);
      hint.style.transform = `translateY(${fade * 18}px)`;
      if (y > window.innerHeight * 0.4) setHintGone(true);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      id="inicio"
      ref={trackRef}
      data-section="inicio"
      className="noot-letters-track relative h-[320vh] w-full"
      aria-label="Noot logo reveal"
    >
      <div className="noot-letters-sticky sticky top-0 flex min-h-screen w-full items-center justify-center overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 45%, rgba(237, 26, 65, 0.12), transparent 70%), linear-gradient(180deg, #f7f4f0 0%, #ebe4dc 48%, #f3efe9 100%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          aria-hidden
          style={{
            backgroundImage:
              "repeating-linear-gradient(-12deg, transparent, transparent 22px, rgba(237, 26, 65, 0.03) 22px, rgba(237, 26, 65, 0.03) 23px)",
          }}
        />

        <div className="relative z-10 flex flex-col items-center gap-10 px-6">
          <h1 className="flex items-end justify-center gap-2 sm:gap-3 md:gap-4">
            {LETTERS.map((letter, index) => (
              <span
                key={letter.src}
                ref={(el) => {
                  letterRefs.current[index] = el;
                }}
                className="inline-block will-change-transform"
                style={{ opacity: 0 }}
              >
                <Image
                  src={letter.src}
                  alt={letter.alt}
                  width={letter.w}
                  height={letter.h}
                  priority
                  className="h-[clamp(3.5rem,14vw,8.5rem)] w-auto"
                />
              </span>
            ))}
            <span className="sr-only">Noot</span>
          </h1>
        </div>

        {/* Scroll cue */}
        {!hintGone && (
          <div
            ref={hintRef}
            className="scroll-hint absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-3"
          >
            <p className="font-[family-name:var(--font-geist-mono)] text-xs tracking-[0.28em] text-[#ED1A41] uppercase">
              Role para explorar
            </p>
            <div className="flex h-12 w-7 items-start justify-center rounded-full border-2 border-[#ED1A41]/45 pt-2">
              <span className="scroll-hint-wheel block h-2 w-1 rounded-full bg-[#ED1A41]" />
            </div>
            <div className="scroll-hint-chevrons flex flex-col items-center gap-0.5 text-[#ED1A41]/70" aria-hidden>
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
                <path d="M6 9l6 6 6-6" />
              </svg>
              <svg viewBox="0 0 24 24" className="h-4 w-4 -mt-2 fill-none stroke-current stroke-2 opacity-50">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
