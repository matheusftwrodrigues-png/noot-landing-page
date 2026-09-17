"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { createTimeline, utils } from "animejs";

const LETTERS = [
  { src: "/images/noot/n-white.svg", w: 18, h: 19 },
  { src: "/images/noot/o-white.svg", w: 22, h: 19 },
  { src: "/images/noot/o-slash-white.svg", w: 22, h: 19 },
  { src: "/images/noot/t-white.svg", w: 14, h: 24 },
] as const;

/**
 * A brand signal instead of a camera zoom: the wordmark assembles on navy,
 * a pink beam crosses the viewport, grows into a full field, then lifts away
 * like a curtain to reveal the hero.
 */
export default function IntroLoader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const beamRef = useRef<HTMLSpanElement>(null);
  const wordRef = useRef<HTMLDivElement>(null);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [done, setDone] = useState(false);

  const releasePage = useCallback(() => {
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
    document.body.dataset.introDone = "true";
    window.dispatchEvent(new CustomEvent("noot:intro-done"));
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const beam = beamRef.current;
    const word = wordRef.current;
    const letters = letterRefs.current.filter(Boolean) as HTMLSpanElement[];
    if (!root || !beam || !word || letters.length !== LETTERS.length) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduced) {
      releasePage();
      const frame = requestAnimationFrame(() => setDone(true));
      return () => cancelAnimationFrame(frame);
    }

    window.scrollTo(0, 0);
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    utils.set(letters, { opacity: 0, y: 20 });
    utils.set(word, { scale: 0.94 });
    utils.set(beam, { scaleX: 0, scaleY: 0.002 });
    utils.set(root, { y: "0%" });

    const timeline = createTimeline({
      onComplete: () => {
        setDone(true);
        releasePage();
      },
    });

    letters.forEach((letter, index) => {
      timeline.add(
        letter,
        {
          opacity: [0, 1],
          y: [20, 0],
          duration: 620,
          ease: "outExpo",
        },
        index * 78,
      );
    });

    timeline
      .add(
        word,
        { scale: [0.94, 1], duration: 720, ease: "outExpo" },
        0,
      )
      .add(
        beam,
        { scaleX: [0, 1], duration: 520, ease: "outExpo" },
        560,
      )
      .add(
        beam,
        { scaleY: [0.002, 1], duration: 640, ease: "inOutQuad" },
        1040,
      )
      .add(
        word,
        { scale: [1, 1.055], duration: 640, ease: "inOutQuad" },
        1040,
      )
      .add(
        root,
        { y: ["0%", "-100%"], duration: 780, ease: "inOutExpo" },
        1760,
      );

    return () => {
      timeline.revert();
      releasePage();
    };
  }, [releasePage]);

  if (done) return null;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#081125]"
      role="status"
      aria-live="polite"
    >
      <span
        ref={beamRef}
        className="noot-intro-beam pointer-events-none absolute inset-0 bg-[#ED1A41]"
        aria-hidden
      />

      <div
        ref={wordRef}
        className="noot-intro-mark relative z-10 flex w-max shrink-0 items-end"
        aria-hidden
      >
        {LETTERS.map((letter, index) => (
          <span
            key={letter.src}
            ref={(el) => {
              letterRefs.current[index] = el;
            }}
            className="noot-intro-letter inline-block shrink-0"
          >
            <Image
              src={letter.src}
              alt=""
              width={letter.w}
              height={letter.h}
              priority
              unoptimized
              className="w-auto max-w-none"
              style={{ height: `calc(var(--noot-unit) * ${letter.h})` }}
            />
          </span>
        ))}
      </div>

      <span className="sr-only">Noot, carregando</span>
    </div>
  );
}
