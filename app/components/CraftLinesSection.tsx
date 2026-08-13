"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";

const LINES = [
  {
    text: "DEV",
    from: "8vw",
    to: "-22vw",
    variant: "fill" as const,
    pad: "pl-[8vw]",
  },
  {
    text: "DESIGN UI/UX",
    from: "-12vw",
    to: "16vw",
    variant: "stroke" as const,
    pad: "pl-[2vw]",
  },
  {
    text: "TRÁFEGO",
    from: "18vw",
    to: "-28vw",
    variant: "accent" as const,
    pad: "pl-[14vw]",
  },
];

function TextLine({
  text,
  variant,
  pad,
  progress,
  from,
  to,
}: {
  text: string;
  variant: (typeof LINES)[number]["variant"];
  pad: string;
  progress: MotionValue<number>;
  from: string;
  to: string;
}) {
  const x = useTransform(progress, [0, 1], [from, to]);
  const color =
    variant === "accent"
      ? "text-[#ED1A41]"
      : variant === "stroke"
        ? "text-transparent"
        : "text-[#f7f4f0]";
  const stroke =
    variant === "stroke"
      ? { WebkitTextStroke: "0.028em #f7f4f0" }
      : undefined;

  return (
    <div className={`overflow-hidden ${pad}`}>
      <motion.p
        className={`w-max whitespace-nowrap font-semibold tracking-[-0.05em] uppercase will-change-transform ${color}`}
        style={{ x, ...stroke }}
      >
        {text}
      </motion.p>
    </div>
  );
}

export default function CraftLinesSection() {
  const trackRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start end", "end start"],
  });

  return (
    <section
      id="oficio"
      ref={trackRef}
      data-section="oficio"
      className="relative z-[15] min-h-screen w-full"
      aria-label="Dev, Design UI/UX e Tráfego"
    >
      <div className="relative flex min-h-screen w-full flex-col justify-center overflow-hidden bg-[#14080b]">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 90% 70% at 18% 110%, rgba(237, 26, 65, 0.55), transparent 58%), radial-gradient(circle at 88% 8%, rgba(237, 26, 65, 0.22), transparent 42%), linear-gradient(180deg, #1a0b0f 0%, #0c0708 55%, #1c0a10 100%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
          aria-hidden
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(237, 26, 65, 0.35) 3px, rgba(237, 26, 65, 0.35) 4px)",
            maskImage:
              "linear-gradient(180deg, transparent, black 18%, black 82%, transparent)",
          }}
        />
        <p
          className="pointer-events-none absolute top-1/2 left-1/2 z-0 -translate-x-1/2 -translate-y-1/2 rotate-[-18deg] font-semibold tracking-[-0.08em] text-white/[0.04] uppercase select-none"
          style={{ fontSize: "min(42vw, 18rem)" }}
          aria-hidden
        >
          Noot
        </p>

        <div className="relative z-10 flex flex-col gap-[0.08em] py-8 text-[clamp(4.25rem,14vw,10.5rem)] leading-[0.86]">
          {LINES.map((line) => (
            <TextLine
              key={line.text}
              text={line.text}
              variant={line.variant}
              pad={line.pad}
              progress={scrollYProgress}
              from={line.from}
              to={line.to}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
