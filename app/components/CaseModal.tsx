"use client";

import type { CSSProperties } from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, type Variants } from "motion/react";
import RollButton from "./RollButton";

export type CaseWork = {
  src: string;
  title: string;
  category: string;
};

/** Where on screen the case was opened from, so the panel can grow out of it. */
export type CaseOrigin = { x: number; y: number };

/** Placeholder copy until the real cases come in. */
const LOREM_ONE =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

const LOREM_TWO =
  "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

const LOREM_THREE =
  "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis.";

const META = [
  { label: "Categoria", value: (work: CaseWork) => work.category },
  { label: "Entregas", value: () => "Lorem, ipsum, dolor" },
  { label: "Ano", value: () => "2025" },
] as const;

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** Body blocks come in one after the other, just behind the panel itself. */
const GROUP: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.055, delayChildren: 0.16 } },
};

const ITEM: Variants = {
  hidden: { opacity: 0, y: 18 },
  shown: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_OUT },
  },
};

/** A dashed slot standing in for media that has not been supplied yet. */
function MediaSlot({
  label,
  ratio,
  className = "",
  delay = "0s",
}: {
  label: string;
  ratio: string;
  className?: string;
  delay?: string;
}) {
  return (
    <motion.div
      variants={ITEM}
      className={`amb-pulse-soft flex items-center justify-center rounded-2xl border border-dashed border-[#081125]/20 bg-[#081125]/[0.03] ${className}`}
      style={
        {
          aspectRatio: ratio,
          "--amb-low": "0.6",
          "--amb-duration": "6s",
          "--amb-delay": delay,
        } as CSSProperties
      }
    >
      <span className="font-[family-name:var(--font-geist-mono)] text-[10px] tracking-[0.22em] text-[#081125]/35 uppercase">
        {label}
      </span>
    </motion.div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section variants={ITEM} className="mt-14">
      <h3 className="font-[family-name:var(--font-geist-mono)] text-[11px] font-semibold tracking-[0.24em] text-[#ED1A41] uppercase">
        {title}
      </h3>
      <div className="mt-4 max-w-[68ch] text-[1.02rem] leading-relaxed text-[#081125]/70">
        {children}
      </div>
    </motion.section>
  );
}

export default function CaseModal({
  work,
  index,
  total,
  origin,
  onClose,
}: {
  work: CaseWork | null;
  index: number;
  total: number;
  origin: CaseOrigin | null;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const articleRef = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(false);
  const open = work !== null;

  // Rendered into <body> so the panel is not trapped by the gallery
  // section's stacking context (the fixed header would otherwise sit on top).
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  // Anchor the panel's growth to the card that was clicked. This runs before
  // the browser paints, so the very first frame already scales from the right
  // point. Clamping keeps the anchor on the panel when the card sits far off
  // to the side.
  useLayoutEffect(() => {
    const article = articleRef.current;
    if (!article || !open) return;

    if (!origin) {
      article.style.transformOrigin = "50% 40%";
      return;
    }

    // Measure the panel unscaled: its opening frame is already at scale 0.82,
    // and a scaled rect would put the anchor in the wrong place. Transforms do
    // not affect layout, so dropping it for one measurement costs nothing and
    // never reaches the screen (this runs before paint).
    const previous = article.style.transform;
    article.style.transform = "none";
    const box = article.getBoundingClientRect();
    article.style.transform = previous;

    const x = Math.min(Math.max(origin.x - box.left, 0), box.width);
    const y = Math.min(Math.max(origin.y - box.top, 0), box.height);
    article.style.transformOrigin = `${x}px ${y}px`;
  }, [open, origin]);

  // Hold the page still behind the panel, and give the scrollbar's width back
  // so the layout underneath does not jump sideways.
  useEffect(() => {
    if (!open) return;

    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;
    const gap = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = "hidden";
    if (gap > 0) body.style.paddingRight = `${gap}px`;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    const focus = window.setTimeout(() => closeRef.current?.focus(), 420);

    return () => {
      window.clearTimeout(focus);
      window.removeEventListener("keydown", onKey);
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {work && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto overscroll-contain p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.24, delay: 0.06 } }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-label={`Case ${work.title}`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.div
            className="pointer-events-none fixed inset-0 bg-[#081125]/85"
            aria-hidden
            initial={{ backdropFilter: "blur(0px)" }}
            animate={{ backdropFilter: "blur(6px)" }}
            exit={{ backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />

          <motion.article
            ref={articleRef}
            className="relative z-10 my-auto w-full max-w-[1040px] overflow-hidden rounded-[28px] bg-[#F7F4F0] shadow-[0_40px_120px_rgba(8,17,37,0.5)]"
            initial={{ opacity: 0, scale: 0.82 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.26, ease: "easeIn" } }}
            transition={{ duration: 0.52, ease: EASE_OUT }}
          >
            <motion.button
              ref={closeRef}
              type="button"
              onClick={onClose}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.28, ease: EASE_OUT }}
              className="absolute top-5 right-5 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#081125] shadow-[0_8px_24px_rgba(8,17,37,0.18)] ring-1 ring-[#081125]/5 transition-colors hover:bg-white"
            >
              <span className="sr-only">Fechar case</span>
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </motion.button>

            {/* cover — settles out of a slow push-in as the panel lands */}
            <div className="relative aspect-[16/7] w-full overflow-hidden bg-[#081125]">
              <motion.img
                src={work.src}
                alt={work.title}
                className="h-full w-full object-cover"
                draggable={false}
                initial={{ scale: 1.16 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.1, ease: EASE_OUT }}
              />
              <div
                className="pointer-events-none absolute inset-0"
                aria-hidden
                style={{
                  background:
                    "linear-gradient(180deg, rgba(8,17,37,0.35) 0%, rgba(8,17,37,0) 40%, rgba(8,17,37,0.82) 100%)",
                }}
              />
              <motion.p
                className="absolute bottom-6 left-6 font-[family-name:var(--font-geist-mono)] text-[10px] tracking-[0.24em] text-white/70 uppercase sm:left-10"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.3, ease: EASE_OUT }}
              >
                Case {String(index + 1).padStart(2, "0")} / {total}
              </motion.p>
            </div>

            <motion.div
              className="px-6 pt-10 pb-12 sm:px-10 sm:pt-12 sm:pb-16"
              variants={GROUP}
              initial="hidden"
              animate="shown"
            >
              <motion.p
                variants={ITEM}
                className="font-[family-name:var(--font-geist-mono)] text-[11px] font-semibold tracking-[0.24em] text-[#ED1A41] uppercase"
              >
                {work.category}
              </motion.p>

              <motion.h2
                variants={ITEM}
                className="mt-4 font-[family-name:var(--font-jakarta)] text-[clamp(2rem,4vw,3.1rem)] leading-[1.06] font-extrabold tracking-[-0.02em] text-balance text-[#081125]"
              >
                {work.title}
              </motion.h2>

              <motion.dl
                variants={ITEM}
                className="mt-10 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-[#081125]/10 pt-8 sm:grid-cols-3"
              >
                {META.map((item) => (
                  <div key={item.label}>
                    <dt className="font-[family-name:var(--font-geist-mono)] text-[10px] tracking-[0.2em] text-[#081125]/40 uppercase">
                      {item.label}
                    </dt>
                    <dd className="mt-2 text-[0.98rem] text-[#081125]">
                      {item.value(work)}
                    </dd>
                  </div>
                ))}
              </motion.dl>

              <Section title="O desafio">
                <p>{LOREM_ONE}</p>
              </Section>

              <MediaSlot
                label="Espaço para vídeo"
                ratio="16 / 9"
                className="mt-10"
              />

              <Section title="O que fizemos">
                <p>{LOREM_TWO}</p>
              </Section>

              <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <MediaSlot label="Espaço para foto" ratio="4 / 3" delay="-2s" />
                <MediaSlot label="Espaço para foto" ratio="4 / 3" delay="-4s" />
              </div>

              <MediaSlot
                label="Espaço para foto larga"
                ratio="21 / 9"
                className="mt-5"
                delay="-1s"
              />

              <Section title="Resultado">
                <p>{LOREM_THREE}</p>
              </Section>

              <motion.div
                variants={ITEM}
                className="mt-14 flex flex-col items-start gap-5 border-t border-[#081125]/10 pt-10 sm:flex-row sm:items-center sm:justify-between"
              >
                <p className="max-w-[38ch] text-[1.02rem] text-[#081125]/60">
                  Quer um projeto assim para o seu time?
                </p>
                <RollButton
                  label="Falar com a Noot"
                  href="#fala-com-a-gente"
                  variant="solid"
                  className="shrink-0"
                  onClick={onClose}
                />
              </motion.div>
            </motion.div>
          </motion.article>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
