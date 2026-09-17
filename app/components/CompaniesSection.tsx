"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";
import { createTimeline, onScroll, utils } from "animejs";
import RollButton from "./RollButton";

const COMPANIES = [
  // `scale` trims each mark to the same optical weight: BYD is a solid
  // wordmark edge to edge, so it needs to sit smaller than the lighter marks.
  { src: "/images/logos/eduzz.svg", name: "Eduzz", w: 143, h: 37, angle: 0, scale: 1.12 },
  { src: "/images/logos/cogna.svg", name: "Cogna", w: 111, h: 40, angle: 90, scale: 1.04 },
  { src: "/images/logos/jadlog.png", name: "Jadlog", w: 129, h: 42, angle: 180, scale: 0.98 },
  { src: "/images/logos/byd.svg", name: "BYD", w: 104, h: 21, angle: 270, scale: 0.8 },
] as const;

const WORDMARK = [
  { src: "/images/vector.svg", w: 18, h: 19 },
  { src: "/images/vector_1.svg", w: 22, h: 19 },
  { src: "/images/vector_2.svg", w: 22, h: 19 },
  { src: "/images/vector_3.svg", w: 14, h: 24 },
] as const;

function Stars({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center gap-0.5 ${className}`}
      aria-label="5 de 5 estrelas"
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className="h-3 w-3 fill-[#ED1A41] sm:h-3.5 sm:w-3.5"
          aria-hidden
        >
          <path d="M12 2.5l2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 16.4 6.6 19.3l1-6.1L3.2 8.9l6.1-.9L12 2.5z" />
        </svg>
      ))}
    </div>
  );
}

function polar(angleDeg: number, radius: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: Math.cos(rad) * radius, y: Math.sin(rad) * radius };
}

export default function CompaniesSection() {
  const trackRef = useRef<HTMLElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const logoRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const track = trackRef.current;
    const ring = ringRef.current;
    const mark = markRef.current;
    const copy = copyRef.current;
    const logos = logoRefs.current.filter(Boolean) as HTMLDivElement[];
    if (!track || !ring || !mark || !copy || logos.length !== COMPANIES.length) {
      return;
    }

    const copyRows = Array.from(
      copy.querySelectorAll<HTMLElement>("[data-copy-row]"),
    );

    // Keep the whole card inside the ring box, whatever the viewport.
    const radius = () => {
      const size = Math.min(ring.offsetWidth, ring.offsetHeight);
      const card = logos[0];
      const pad = card
        ? Math.max(card.offsetWidth, card.offsetHeight) / 2 + 6
        : 70;
      return Math.max(size / 2 - pad, size * 0.2);
    };

    const placeLogos = () => {
      const r = radius();
      logos.forEach((logo, i) => {
        const { x, y } = polar(COMPANIES[i].angle, r);
        utils.set(logo, { x, y });
      });
    };

    placeLogos();

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      utils.set([...logos, ring, mark, ...copyRows], { opacity: 1, scale: 1 });
      return;
    }

    utils.set(mark, { opacity: 0, scale: 0.82 });
    utils.set(copyRows, { opacity: 0, y: 26 });
    utils.set(logos, { opacity: 0, scale: 0.55 });
    utils.set(ring, { opacity: 0, scale: 0.9, rotate: -18 });

    const step = 160;

    const timeline = createTimeline({
      defaults: { ease: "outCubic", duration: 460 },
      autoplay: onScroll({
        target: track,
        enter: "top top",
        leave: "bottom bottom",
        // Tighter than the other sections: this one now runs over a shorter
        // scroll range, so heavy smoothing would leave the orbit behind.
        sync: 0.75,
      }),
    });

    copyRows.forEach((row, index) => {
      timeline.add(row, { opacity: [0, 1], y: [26, 0] }, index * 120);
    });

    timeline.add(
      ring,
      { opacity: [0, 1], scale: [0.9, 1], rotate: [-18, 0], duration: 560 },
      120,
    );
    timeline.add(
      mark,
      { opacity: [0, 1], scale: [0.82, 1], ease: "outBack", duration: 520 },
      260,
    );

    logos.forEach((logo, index) => {
      const at = 420 + index * step;
      const r = radius();
      const from = polar(COMPANIES[index].angle, r * 1.5);
      const to = polar(COMPANIES[index].angle, r);

      timeline.add(
        logo,
        {
          opacity: [0, 1],
          scale: [0.55, 1],
          x: [from.x, to.x],
          y: [from.y, to.y],
          ease: "outBack",
          duration: 520,
        },
        at,
      );
    });

    // A held beat at the tail. The timeline is stretched across the whole
    // sticky range, so without it the last logo only lands as the section is
    // already scrolling away — this buys the finished orbit a moment on screen.
    const assembledAt = 420 + (COMPANIES.length - 1) * step + 520;
    timeline.add(ring, { rotate: [0, 0], duration: 420 }, assembledAt);

    const onResize = () => placeLogos();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      timeline.revert();
    };
  }, []);

  return (
    <section
      id="empresas"
      ref={trackRef}
      data-section="empresas"
      className="relative z-10 h-[140vh] w-full"
      aria-label="Clientes"
    >
      <div className="sticky top-0 flex min-h-screen w-full items-center overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              "linear-gradient(180deg, #f7f4f0 0%, #ebe4dc 50%, #f3efe9 100%)",
          }}
        />

        {/* only the red pool breathes — fading the base gradient would make
            the whole section pulse */}
        <div
          className="amb-glow pointer-events-none absolute inset-0"
          aria-hidden
          style={
            {
              "--amb-duration": "18s",
              "--amb-low": "0.6",
              background:
                "radial-gradient(circle at 68% 50%, rgba(237,26,65,0.12), transparent 55%)",
            } as CSSProperties
          }
        />

        <div className="relative z-10 mx-auto grid w-full max-w-[1300px] grid-cols-1 items-center gap-x-16 gap-y-14 px-6 pt-32 pb-16 sm:px-10 md:py-16 md:grid-cols-[minmax(0,1.06fr)_minmax(0,0.94fr)]">
          {/* copy */}
          <div ref={copyRef} className="flex flex-col items-start">
            <p
              data-copy-row
              className="font-[family-name:var(--font-geist-mono)] text-xs font-semibold tracking-[0.28em] text-[#ED1A41] uppercase"
            >
              Clientes
            </p>

            <h2
              data-copy-row
              className="mt-6 font-[family-name:var(--font-jakarta)] text-[clamp(2.4rem,5vw,3.9rem)] leading-[1.06] font-extrabold tracking-[-0.02em] text-balance text-[#081125]"
            >
              Times que já contam com a gente
            </h2>

            <p
              data-copy-row
              className="mt-7 max-w-[46ch] text-[clamp(1.05rem,1.4vw,1.25rem)] leading-relaxed text-[#081125]/65"
            >
              Cogna, BYD, Eduzz e Jadlog. Portes e setores diferentes, com a
              mesma necessidade: tirar projeto do papel sem montar um time novo
              para cada demanda.
            </p>

            <div data-copy-row className="mt-10">
              <RollButton
                label="Ver os trabalhos"
                href="#trabalhos"
                variant="dark"
                arrowDirection="down"
              />
            </div>
          </div>

          {/* orbit */}
          <div className="flex justify-center md:justify-end">
            <div
              ref={ringRef}
              className="relative aspect-square w-[min(86vw,34rem)] max-w-full"
            >
              {/* the dashed ring turns once every 90s — barely perceptible,
                  but it stops the orbit from reading as a flat diagram */}
              <div
                className="amb-spin-slow pointer-events-none absolute inset-[16%] rounded-full border border-dashed border-[#ED1A41]/30"
                aria-hidden
              />

              {/* the Noot wordmark holds the centre */}
              <div
                ref={markRef}
                className="noot-wordmark absolute top-1/2 left-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 items-end"
                style={
                  {
                    "--noot-unit": "calc(clamp(25px, 3.3vw, 38px) / 24)",
                    opacity: 0,
                  } as CSSProperties
                }
              >
                <span
                  className="amb-float flex items-end"
                  style={
                    {
                      "--amb-duration": "7.5s",
                      "--amb-rise": "4px",
                    } as CSSProperties
                  }
                >
                  {WORDMARK.map((letter) => (
                    <Image
                      key={letter.src}
                      src={letter.src}
                      alt=""
                      width={letter.w}
                      height={letter.h}
                      unoptimized
                      className="w-auto max-w-none"
                      style={{ height: `calc(var(--noot-unit) * ${letter.h})` }}
                    />
                  ))}
                </span>
                <span className="sr-only">Noot</span>
              </div>

              {COMPANIES.map((company, index) => (
                <div
                  key={company.src}
                  ref={(el) => {
                    logoRefs.current[index] = el;
                  }}
                  className="absolute top-1/2 left-1/2 z-30 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2"
                  style={{ opacity: 0 }}
                >
                  <div
                    className="client-logo-card amb-float flex items-center justify-center rounded-2xl bg-white/95 shadow-[0_16px_40px_rgba(8,17,37,0.12)] ring-1 ring-[#081125]/5 backdrop-blur-sm"
                    style={
                      {
                        "--amb-duration": "6.4s",
                        "--amb-delay": `${index * -1.35}s`,
                        "--amb-rise": "6px",
                      } as CSSProperties
                    }
                  >
                    <Image
                      src={company.src}
                      alt={company.name}
                      width={company.w}
                      height={company.h}
                      unoptimized
                      className="w-auto object-contain"
                      style={{
                        height: `calc(var(--client-logo-h) * ${company.scale})`,
                        maxWidth: `calc(var(--client-logo-w) * ${company.scale})`,
                      }}
                    />
                  </div>
                  <Stars />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
