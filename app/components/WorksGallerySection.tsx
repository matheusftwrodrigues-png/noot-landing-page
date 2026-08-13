"use client";

import { useEffect, useRef, useState, type MutableRefObject } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  animate,
  type MotionValue,
} from "motion/react";

const WORKS = [
  {
    src: "/images/works/01.jpg",
    title: "Skyline",
    place: "São Paulo, SP",
    client: "Voomp",
  },
  {
    src: "/images/works/02.jpg",
    title: "Drive",
    place: "Campinas, SP",
    client: "BYD",
  },
  {
    src: "/images/works/03.jpg",
    title: "Campus",
    place: "Belo Horizonte, MG",
    client: "Cogna",
  },
  {
    src: "/images/works/04.jpg",
    title: "Rota",
    place: "Guarulhos, SP",
    client: "Jadlog",
  },
  {
    src: "/images/works/05.jpg",
    title: "Cristo",
    place: "Rio de Janeiro, RJ",
    client: "Voomp",
  },
  {
    src: "/images/works/06.jpg",
    title: "Vitrine",
    place: "Curitiba, PR",
    client: "Voomp",
  },
  {
    src: "/images/works/07.jpg",
    title: "War room",
    place: "São Paulo, SP",
    client: "Cogna",
  },
  {
    src: "/images/works/08.jpg",
    title: "After hours",
    place: "Porto Alegre, RS",
    client: "BYD",
  },
  {
    src: "/images/works/09.jpg",
    title: "Board",
    place: "Brasília, DF",
    client: "Cogna",
  },
  {
    src: "/images/works/10.jpg",
    title: "Mesa",
    place: "Florianópolis, SC",
    client: "Voomp",
  },
  {
    src: "/images/works/11.jpg",
    title: "Metrópole",
    place: "Recife, PE",
    client: "Jadlog",
  },
  {
    src: "/images/works/12.jpg",
    title: "Noite",
    place: "Salvador, BA",
    client: "BYD",
  },
  {
    src: "/images/works/13.jpg",
    title: "Altitude",
    place: "Gramado, RS",
    client: "Voomp",
  },
  {
    src: "/images/works/14.jpg",
    title: "Bastidores",
    place: "São Paulo, SP",
    client: "Cogna",
  },
  {
    src: "/images/works/15.jpg",
    title: "Campo",
    place: "Chapada Diamantina, BA",
    client: "Voomp",
  },
  {
    src: "/images/works/16.jpg",
    title: "Trilha",
    place: "Ubatuba, SP",
    client: "Jadlog",
  },
] as const;

const PLANE_COUNT = 26;
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

type Layout = {
  width: number;
  height: number;
  stepX: number;
  stepY: number;
  stepZ: number;
};

const DEFAULT_LAYOUT: Layout = {
  width: 320,
  height: 384,
  stepX: 240,
  stepY: -84,
  stepZ: -288,
};

function wrap(min: number, max: number, value: number) {
  const range = max - min;
  return ((((value - min) % range) + range) % range) + min;
}

function measureLayout(): Layout {
  const width = Math.min(320, Math.max(168, window.innerWidth * 0.28));
  const height = width * 1.2;
  return {
    width,
    height,
    stepX: width * 0.75,
    stepY: -height * 0.21875,
    stepZ: -width * 0.9,
  };
}

function ScrambleText({ text }: { text: string }) {
  const [shown, setShown] = useState(text);

  useEffect(() => {
    let frame = 0;
    const id = window.setInterval(() => {
      const revealed = Math.min(text.length, Math.floor(frame / 1.6));
      const head = text.slice(0, revealed);
      const tail = Array.from({ length: text.length - revealed }, () =>
        GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
      ).join("");
      setShown(head + tail);
      frame += 1;
      if (revealed >= text.length) window.clearInterval(id);
    }, 24);
    return () => window.clearInterval(id);
  }, [text]);

  return <span>{shown}</span>;
}

function Plane({
  index,
  offset,
  waveVel,
  layoutRef,
  hovered,
  dimmed,
  onHoverStart,
  onHoverEnd,
}: {
  index: number;
  offset: MotionValue<number>;
  waveVel: MotionValue<number>;
  layoutRef: MutableRefObject<Layout>;
  hovered: boolean;
  dimmed: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}) {
  const work = WORKS[index % WORKS.length];
  const hoverLift = useMotionValue(0);
  const label = `${work.place} — ${work.client}`;

  const transform = useTransform(
    [offset, waveVel, hoverLift],
    ([off, vel, lift]) => {
      const { stepX, stepY, stepZ } = layoutRef.current;
      const wrapped = wrap(-PLANE_COUNT / 2, PLANE_COUNT / 2, index - Number(off));
      const wave = Math.sin(wrapped * 0.55) * Number(vel) * 2.4;
      const x = wrapped * stepX;
      const y = wrapped * stepY + wave - Number(lift) * 18;
      const z = wrapped * stepZ + Number(lift) * 220;
      const rotateY = -50 + Number(lift) * 28;
      return `translate3d(${x}px, ${y}px, ${z}px) rotateY(${rotateY}deg)`;
    },
  );

  const zIndex = useTransform(hoverLift, (lift) => (lift > 0.02 ? 100 : 1));

  return (
    <motion.div
      className="works-plane"
      style={{
        width: layoutRef.current.width,
        height: layoutRef.current.height,
        transform,
        filter: hovered
          ? "brightness(1.15)"
          : dimmed
            ? "brightness(0.45)"
            : "brightness(1)",
        zIndex,
      }}
      onMouseEnter={() => {
        onHoverStart();
        animate(hoverLift, 1, { type: "spring", stiffness: 260, damping: 24 });
      }}
      onMouseLeave={() => {
        onHoverEnd();
        animate(hoverLift, 0, { type: "spring", stiffness: 220, damping: 26 });
      }}
    >
      <div className="works-plane-image">
        <img
          src={work.src}
          alt={`${work.title} — ${work.place}`}
          draggable={false}
        />
      </div>
      <div className="works-plane-index">
        {String((index % WORKS.length) + 1).padStart(2, "0")}
      </div>
      <AnimatePresence>
        {hovered && (
          <motion.div
            className="works-label"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <motion.span
              className="works-label-line"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              exit={{ scaleX: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            />
            <div className="works-label-text">
              <p className="works-label-place">
                <ScrambleText text={label} />
              </p>
              <p className="works-label-title">{work.title}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function WorksGallerySection() {
  const trackRef = useRef<HTMLElement>(null);
  const layoutRef = useRef<Layout>(DEFAULT_LAYOUT);
  const [, bump] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  const offset = useTransform(scrollYProgress, [0, 1], [0, 18]);
  const rawVelocity = useVelocity(offset);
  const waveVel = useSpring(rawVelocity, {
    stiffness: 90,
    damping: 22,
    restDelta: 0.001,
  });

  useEffect(() => {
    const apply = () => {
      layoutRef.current = measureLayout();
      bump((n) => n + 1);
    };
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);

  return (
    <section
      id="trabalhos"
      ref={trackRef}
      data-section="trabalhos"
      className="relative z-20 h-[420vh] w-full"
      aria-label="Trabalhos da Noot"
    >
      <div className="works-sticky sticky top-0 h-screen w-full overflow-hidden bg-black">
        <header className="works-header">
          <p className="works-title">Trabalhos</p>
          <p className="works-title works-title-sub">
            Noot
            <sup className="works-count">({WORKS.length})</sup>
          </p>
        </header>

        <p className="works-hint">role para surfar</p>

        <div className="works-viewport">
          <div className="works-planes">
            {Array.from({ length: PLANE_COUNT }, (_, index) => (
              <Plane
                key={index}
                index={index}
                offset={offset}
                waveVel={waveVel}
                layoutRef={layoutRef}
                hovered={hovered === index}
                dimmed={hovered !== null && hovered !== index}
                onHoverStart={() => setHovered(index)}
                onHoverEnd={() =>
                  setHovered((current) => (current === index ? null : current))
                }
              />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .works-header {
          position: absolute;
          z-index: 50;
          top: max(72px, 3vw);
          left: 3vw;
          pointer-events: none;
        }
        .works-title {
          color: #fff;
          font-size: clamp(32px, 5vw, 64px);
          line-height: 0.9;
          font-weight: 500;
          letter-spacing: -0.03em;
          margin-left: 4vw;
        }
        .works-title-sub {
          margin-left: 0;
        }
        .works-count {
          font-size: 0.28em;
          font-weight: 600;
          letter-spacing: 0.04em;
          margin-left: 6px;
          position: relative;
          top: 0.55em;
          vertical-align: top;
          line-height: 0;
          font-variant-numeric: tabular-nums;
        }
        .works-hint {
          position: absolute;
          z-index: 50;
          bottom: 3vw;
          left: 3vw;
          margin: 0;
          font-family: var(--font-geist-mono), ui-monospace, monospace;
          text-transform: uppercase;
          font-size: 10px;
          letter-spacing: 0.08em;
          color: #fff;
          pointer-events: none;
        }
        .works-viewport {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          perspective: 2000px;
          perspective-origin: 10% 10%;
        }
        .works-planes {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          transform-style: preserve-3d;
          transform: translateY(100px);
        }
        .works-plane {
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          transform-style: preserve-3d;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.45);
          transition: filter 0.2s ease;
          cursor: pointer;
        }
        .works-plane-image {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }
        .works-plane-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          pointer-events: none;
        }
        .works-plane-index {
          position: absolute;
          top: -24px;
          left: 0;
          font-family: var(--font-geist-mono), ui-monospace, monospace;
          color: #fff;
          font-size: 10px;
          letter-spacing: 0.05em;
        }
        .works-label {
          position: absolute;
          left: 100%;
          top: 50%;
          margin-left: 12px;
          display: flex;
          align-items: center;
          pointer-events: none;
          white-space: nowrap;
        }
        .works-label-line {
          width: 120px;
          height: 1px;
          background: #fff;
          transform-origin: left;
          flex-shrink: 0;
        }
        .works-label-text {
          padding: 4px 10px;
          font-family: var(--font-geist-mono), ui-monospace, monospace;
          color: #fff;
        }
        .works-label-place {
          margin: 0;
          font-size: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .works-label-title {
          margin: 4px 0 0;
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #ed1a41;
        }
        @media (max-width: 700px) {
          .works-label-line {
            width: 56px;
          }
          .works-plane {
            cursor: auto;
          }
        }
      `}</style>
    </section>
  );
}
