"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";
import { createTimeline, onScroll, utils } from "animejs";

const FACES = [
  { src: "/images/team/team-lead-1.png", float: "6.8s", delay: "0s" },
  { src: "/images/team/team-member-natural.png", float: "8.1s", delay: "0.3s" },
  { src: "/images/team/team-lead-2.png", float: "7.6s", delay: "0.5s" },
] as const;

/**
 * Widths are deliberately uneven and each lane breathes on its own clock —
 * the point of the section is elasticity, so nothing should line up. The
 * scale values preserve the previous contraction without animating layout.
 */
const LANES = [
  { label: "Você controla o tempo", icon: "clock", width: "100%", breathe: "7.4s", delay: "0s", scale: 0.965 },
  { label: "Time sob demanda", icon: "team", width: "76%", breathe: "6.1s", delay: "0.8s", scale: 0.954 },
  { label: "Gerente de projeto exclusivo", icon: "person", width: "92%", breathe: "8.2s", delay: "0.35s", scale: 0.962 },
  { label: "Relatórios semanais", icon: "report", width: "68%", breathe: "6.8s", delay: "1.2s", scale: 0.949 },
] as const;

function LaneIcon({ name }: { name: (typeof LANES)[number]["icon"] }) {
  const common = {
    width: 17,
    height: 17,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "clock") {
    return (
      <svg {...common}>
        <circle cx="12" cy="13" r="8" />
        <path d="M12 9.5V13l2.2 2.2M9 2h6" />
      </svg>
    );
  }
  if (name === "team") {
    return (
      <svg {...common}>
        <circle cx="9" cy="8" r="3.2" />
        <path d="M3 20c0-3.3 2.7-5.4 6-5.4s6 2.1 6 5.4M16 5.4a3.2 3.2 0 0 1 0 6M18 20c0-2.4-.9-4-2.2-5" />
      </svg>
    );
  }
  if (name === "person") {
    return (
      <svg {...common}>
        <circle cx="11" cy="8" r="3.4" />
        <path d="M4.5 20c0-3.6 2.9-5.8 6.5-5.8 1.3 0 2.5.3 3.5.8M15.5 18.6l1.6 1.6 3.4-3.6" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v4h4M9.5 12h5M9.5 16h3" />
    </svg>
  );
}

export default function ElasticPlanSection() {
  const trackRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    const copy = copyRef.current;
    if (!track || !stage || !copy) return;

    const copyRows = Array.from(
      copy.querySelectorAll<HTMLElement>("[data-copy-row]"),
    );
    const faces = Array.from(stage.querySelectorAll<HTMLElement>("[data-face]"));
    const fills = Array.from(stage.querySelectorAll<HTMLElement>("[data-fill]"));
    const bodies = Array.from(stage.querySelectorAll<HTMLElement>("[data-body]"));

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      utils.set([...copyRows, ...faces, ...bodies], { opacity: 1, x: 0, y: 0, scale: 1 });
      utils.set(fills, { opacity: 1, scaleX: 1 });
      return;
    }

    utils.set(copyRows, { opacity: 0, y: 26 });
    utils.set(faces, { opacity: 0, scale: 0.5 });
    utils.set(fills, { scaleX: 0 });
    utils.set(bodies, { opacity: 0, x: -14 });

    const timeline = createTimeline({
      defaults: { ease: "outCubic", duration: 460 },
      autoplay: onScroll({
        target: track,
        enter: "top top",
        leave: "bottom bottom",
        // Tight, because the section now runs over a shorter scroll range.
        sync: 0.75,
      }),
    });

    copyRows.forEach((row, index) => {
      timeline.add(row, { opacity: [0, 1], y: [26, 0] }, index * 110);
    });

    faces.forEach((face, index) => {
      timeline.add(
        face,
        { opacity: [0, 1], scale: [0.5, 1], ease: "outBack", duration: 480 },
        140 + index * 90,
      );
    });

    LANES.forEach((_, index) => {
      const at = 460 + index * 150;
      // The bar stretches first and the label rides in behind it, so the lane
      // reads as something being pulled open rather than faded in.
      timeline.add(
        fills[index],
        { scaleX: [0, 1], duration: 620, ease: "outQuart" },
        at,
      );
      timeline.add(
        bodies[index],
        { opacity: [0, 1], x: [-14, 0], duration: 420 },
        at + 160,
      );
    });

    // A held beat at the tail: the timeline stretches across the whole sticky
    // range, so without it the last lane only finishes as the section leaves.
    const openedAt = 460 + (LANES.length - 1) * 150 + 620;
    timeline.add(copyRows[0], { opacity: [1, 1], duration: 380 }, openedAt);

    return () => {
      timeline.revert();
    };
  }, []);

  return (
    <section
      id="plano"
      ref={trackRef}
      data-section="plano"
      className="relative z-[18] h-[130vh] w-full"
      aria-label="Plano Flexível"
    >
      <div className="sticky top-0 flex min-h-screen w-full items-center overflow-hidden bg-white">
        <div
          className="amb-glow pointer-events-none absolute inset-0"
          aria-hidden
          style={
            {
              "--amb-duration": "17s",
              "--amb-low": "0.62",
              background:
                "radial-gradient(ellipse 60% 70% at 24% 46%, rgba(237,26,65,0.13), transparent 64%)",
            } as CSSProperties
          }
        />

        <div className="relative z-10 mx-auto grid w-full max-w-[1300px] grid-cols-1 items-center gap-x-16 gap-y-14 px-6 py-16 sm:px-10 md:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]">
          <div ref={stageRef} className="plan-stage order-2 md:order-1">
            <div className="plan-faces">
              {FACES.map((face) => (
                <span
                  key={face.src}
                  data-face
                  className="plan-face plan-face--photo amb-float"
                  style={
                    {
                      "--amb-duration": face.float,
                      "--amb-delay": face.delay,
                      "--amb-rise": "6px",
                    } as CSSProperties
                  }
                >
                  <Image
                    src={face.src}
                    alt=""
                    width={360}
                    height={360}
                    sizes="(max-width: 768px) 18vw, 7vw"
                  />
                </span>
              ))}
              <span
                data-face
                className="plan-face plan-face--team amb-float"
                role="img"
                aria-label="Foco em resultados"
                style={
                  {
                    "--amb-duration": "7.2s",
                    "--amb-delay": "0.85s",
                    "--amb-rise": "6px",
                  } as CSSProperties
                }
              >
                <Image
                  src="/images/target-arrow.svg"
                  alt=""
                  width={56}
                  height={56}
                  aria-hidden
                />
              </span>
            </div>

            <ul className="plan-lanes">
              {LANES.map((lane) => (
                <li
                  key={lane.label}
                  className="plan-lane"
                  style={
                    {
                      "--lane-w": lane.width,
                      "--lane-breathe": lane.breathe,
                      "--lane-delay": lane.delay,
                      "--lane-breathe-scale": lane.scale,
                    } as CSSProperties
                  }
                >
                  <span data-fill className="plan-lane-fill" aria-hidden>
                    <span className="plan-lane-fill-surface" />
                  </span>
                  <span data-body className="plan-lane-body">
                    <LaneIcon name={lane.icon} />
                    {lane.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div ref={copyRef} className="order-1 flex flex-col items-start md:order-2">
            <p
              data-copy-row
              className="mb-5 font-[family-name:var(--font-geist-mono)] text-xs font-semibold tracking-[0.28em] text-[#ED1A41] uppercase"
            >
              Plano Flexível
            </p>

            <h2
              data-copy-row
              className="font-[family-name:var(--font-jakarta)] text-[clamp(2.1rem,4.4vw,3.5rem)] leading-[1.1] font-extrabold tracking-[-0.025em] text-[#081125]"
            >
              Com o <span className="text-[#ED1A41]">Plano Flexível</span> você
              transforma estratégia em ação.
            </h2>

            <p
              data-copy-row
              className="mt-7 max-w-[42ch] text-[clamp(1rem,1.4vw,1.2rem)] leading-relaxed text-[#081125]/65"
            >
              O controle é seu. A execução é nossa.
              <br />
              Com entregas no seu padrão, no seu prazo.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .plan-stage {
          display: flex;
          flex-direction: column;
          gap: clamp(1.6rem, 3vw, 2.6rem);
          width: 100%;
          max-width: 36rem;
        }

        /* Overlapping, so the team reads as one group rather than five items. */
        .plan-faces {
          display: flex;
          align-items: center;
          padding-left: 0.5rem;
          isolation: isolate;
        }
        .plan-face {
          position: relative;
          flex: 0 0 auto;
          box-sizing: border-box;
          width: clamp(3rem, 5.4vw, 4rem);
          aspect-ratio: 1;
          margin-left: -0.5rem;
          border-radius: 9999px;
          overflow: hidden;
          background: #f1efee;
          border: 0;
          box-shadow: 0 10px 26px rgba(8, 17, 37, 0.14);
        }
        .plan-face img {
          display: block;
          width: 100%;
          height: 100%;
          border-radius: inherit;
          object-fit: cover;
        }
        .plan-face--photo {
          border: 2px solid rgba(255, 255, 255, 0.98);
        }
        .plan-face--team {
          display: grid;
          place-items: center;
          background: var(--noot-ink);
          border: 2px solid rgba(255, 255, 255, 0.98);
          color: #fff;
        }
        .plan-face--team img {
          width: 48%;
          height: 48%;
          border-radius: 0;
          object-fit: contain;
        }

        .plan-lanes {
          display: grid;
          gap: clamp(0.7rem, 1.25vw, 1rem);
        }

        /* Keep layout stable; only the painted surface breathes. */
        .plan-lane {
          position: relative;
          width: var(--lane-w);
          min-width: 12rem;
        }

        /* The outer layer owns the scroll reveal; the inner layer owns the
           continuous breath, so their transforms never compete. */
        .plan-lane-fill {
          position: absolute;
          inset: 0;
          display: block;
          width: 100%;
          height: 100%;
          transform-origin: left center;
        }

        .plan-lane-fill-surface {
          position: absolute;
          inset: 0;
          display: block;
          width: 100%;
          height: 100%;
          border-radius: 9999px;
          border: 1px solid rgba(237, 26, 65, 0.3);
          background: linear-gradient(
            100deg,
            rgba(237, 26, 65, 0.1) 0%,
            rgba(237, 26, 65, 0.03) 62%,
            rgba(255, 255, 255, 0) 100%
          );
          box-shadow: 0 10px 26px rgba(8, 17, 37, 0.07);
          transform-origin: left center;
          animation: plan-breathe var(--lane-breathe, 7s) ease-in-out infinite;
          animation-delay: var(--lane-delay, 0s);
          backface-visibility: hidden;
          will-change: transform;
        }

        @keyframes plan-breathe {
          0%,
          100% {
            transform: scaleX(1);
          }
          50% {
            transform: scaleX(var(--lane-breathe-scale, 0.96));
          }
        }

        .plan-lane-body {
          position: relative;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: clamp(0.88rem, 1.45vw, 1.15rem) clamp(1.2rem, 1.8vw, 1.6rem);
          color: #081125;
          font-size: clamp(0.9rem, 1.15vw, 1.05rem);
          font-weight: 500;
          white-space: nowrap;
        }
        .plan-lane-body svg {
          flex: 0 0 auto;
          color: #ed1a41;
        }

        @media (prefers-reduced-motion: reduce) {
          .plan-lane-fill-surface {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
