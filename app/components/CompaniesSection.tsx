"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { createTimeline, onScroll, utils } from "animejs";

const COMPANIES = [
  {
    src: "/images/companies/voomp.svg",
    name: "Voomp",
    w: 132,
    h: 28,
    angle: 0,
  },
  {
    src: "/images/companies/byd.svg",
    name: "BYD",
    w: 139,
    h: 40,
    angle: -90,
  },
  {
    src: "/images/companies/cogna.svg",
    name: "Cogna",
    w: 160,
    h: 48,
    angle: 90,
  },
  {
    src: "/images/companies/jadlog.svg",
    name: "Jadlog",
    w: 140,
    h: 48,
    angle: 180,
  },
] as const;

function Stars({
  className = "",
  starClass = "",
}: {
  className?: string;
  starClass?: string;
}) {
  return (
    <div
      className={`flex items-center gap-1 ${className}`}
      aria-label="5 de 5 estrelas"
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className={`h-5 w-5 fill-[#ED1A41] sm:h-6 sm:w-6 ${starClass}`}
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
  return {
    x: Math.cos(rad) * radius,
    y: Math.sin(rad) * radius,
  };
}

export default function CompaniesSection() {
  const trackRef = useRef<HTMLElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const scoreRef = useRef<HTMLDivElement>(null);
  const logoRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lineRefs = useRef<(SVGLineElement | null)[]>([]);
  const finaleRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const ring = ringRef.current;
    const score = scoreRef.current;
    const finale = finaleRef.current;
    const logos = logoRefs.current.filter(Boolean) as HTMLDivElement[];
    const lines = lineRefs.current.filter(Boolean) as SVGLineElement[];
    if (!track || !ring || !score || !finale || logos.length !== COMPANIES.length) {
      return;
    }

    const radius = () => Math.min(window.innerWidth, window.innerHeight) * 0.28;

    const placeLogos = () => {
      const r = radius();
      logos.forEach((logo, i) => {
        const { x, y } = polar(COMPANIES[i].angle, r);
        utils.set(logo, { x, y });
      });
    };

    placeLogos();

    utils.set(score, { opacity: 0, scale: 0.7 });
    utils.set(finale, { opacity: 0, y: 20 });
    utils.set(logos, { opacity: 0, scale: 0.4 });
    utils.set(ring, { opacity: 0, scale: 0.85, rotate: -30 });
    utils.set(lines, { strokeDashoffset: 120 });
    utils.set(score.querySelectorAll(".score-star"), {
      opacity: 0,
      scale: 0.3,
    });

    const step = 650;

    const timeline = createTimeline({
      defaults: { ease: "outCubic", duration: 700 },
      autoplay: onScroll({
        target: track,
        enter: "top top",
        leave: "bottom bottom",
        sync: 0.7,
      }),
    });

    timeline.add(
      ring,
      {
        opacity: [0, 1],
        scale: [0.85, 1],
        rotate: [-30, 0],
        duration: 900,
      },
      0,
    );

    timeline.add(
      score,
      {
        opacity: [0, 1],
        scale: [0.7, 1],
        ease: "outBack",
        duration: 800,
      },
      200,
    );

    timeline.add(
      score.querySelectorAll(".score-star"),
      {
        opacity: [0, 1],
        scale: [0.3, 1],
        delay: (_el: unknown, i = 0) => i * 80,
        ease: "outBack",
        duration: 420,
      },
      480,
    );

    logos.forEach((logo, index) => {
      const at = 900 + index * step;
      const r = radius();
      const from = polar(COMPANIES[index].angle, r * 1.85);
      const to = polar(COMPANIES[index].angle, r);

      timeline.add(
        logo,
        {
          opacity: [0, 1],
          scale: [0.4, 1],
          x: [from.x, to.x],
          y: [from.y, to.y],
          ease: "outBack",
          duration: 750,
        },
        at,
      );

      if (lines[index]) {
        timeline.add(
          lines[index],
          {
            strokeDashoffset: [120, 0],
            duration: 600,
            ease: "inOutQuad",
          },
          at + 120,
        );
      }
    });

    timeline.add(
      finale,
      {
        opacity: [0, 1],
        y: [20, 0],
        duration: 650,
      },
      900 + COMPANIES.length * step + 100,
    );

    const onResize = () => {
      placeLogos();
    };
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
      className="companies-track relative z-10 h-[380vh] w-full"
      aria-label="Clientes nota 5"
    >
      <div className="sticky top-0 flex min-h-screen w-full items-center justify-center overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              "radial-gradient(circle at 50% 45%, rgba(237,26,65,0.1), transparent 55%), linear-gradient(180deg, #f7f4f0 0%, #ebe4dc 50%, #f3efe9 100%)",
          }}
        />

        <div className="relative z-10 flex h-[min(78vh,36rem)] w-[min(92vw,36rem)] items-center justify-center">
          {/* Orbit ring */}
          <div
            ref={ringRef}
            className="pointer-events-none absolute inset-[12%] rounded-full border border-dashed border-[#ED1A41]/35"
            style={{ opacity: 0 }}
            aria-hidden
          />

          {/* Constellation lines */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            aria-hidden
          >
            {COMPANIES.map((company, index) => {
              const next = COMPANIES[(index + 1) % COMPANIES.length];
              const a = polar(company.angle, 38);
              const b = polar(next.angle, 38);
              return (
                <line
                  key={company.name}
                  ref={(el) => {
                    lineRefs.current[index] = el;
                  }}
                  x1={50 + a.x}
                  y1={50 + a.y}
                  x2={50 + b.x}
                  y2={50 + b.y}
                  stroke="#ED1A41"
                  strokeWidth="0.35"
                  strokeOpacity="0.35"
                  strokeDasharray="120"
                  strokeDashoffset="120"
                />
              );
            })}
          </svg>

          {/* Center score */}
          <div
            ref={scoreRef}
            className="relative z-20 flex flex-col items-center gap-3"
            style={{ opacity: 0 }}
          >
            <p className="font-[family-name:var(--font-geist-mono)] text-xs tracking-[0.3em] text-[#ED1A41] uppercase">
              Avaliação
            </p>
            <p className="text-[clamp(4rem,12vw,6.5rem)] font-semibold leading-none tracking-tight text-[#171412]">
              5<span className="text-[#ED1A41]">.0</span>
            </p>
            <Stars starClass="score-star" />
          </div>

          {/* Orbiting logos */}
          {COMPANIES.map((company, index) => (
            <div
              key={company.src}
              ref={(el) => {
                logoRefs.current[index] = el;
              }}
              className="absolute z-30 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2"
              style={{ left: "50%", top: "50%", opacity: 0 }}
            >
              <div className="rounded-2xl bg-white/90 px-4 py-3 shadow-[0_16px_40px_rgba(23,20,18,0.1)] ring-1 ring-black/5 backdrop-blur-sm">
                <Image
                  src={company.src}
                  alt={company.name}
                  width={company.w}
                  height={company.h}
                  className="h-7 w-auto max-w-[6.5rem] object-contain sm:h-8 sm:max-w-[8rem]"
                />
              </div>
              <Stars className="scale-75" />
            </div>
          ))}
        </div>

        <p
          ref={finaleRef}
          className="absolute bottom-10 left-1/2 z-20 w-[min(90vw,28rem)] -translate-x-1/2 text-center font-[family-name:var(--font-geist-mono)] text-sm leading-relaxed text-zinc-600"
          style={{ opacity: 0 }}
        >
          Voomp, BYD, Cogna e Jadlog — uma constelação de{" "}
          <span className="font-semibold text-[#ED1A41]">nota máxima</span>.
        </p>
      </div>
    </section>
  );
}
