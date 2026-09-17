"use client";

import Image from "next/image";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import CaseModal, { type CaseOrigin } from "./CaseModal";

const WORKS = [
  {
    src: "/images/works/behance/01-beflex-rebranding.png",
    title: "Rebranding BeFlex",
    category: "Rebranding",
    href: "https://www.behance.net/gallery/164883139/Rebranding-BeFlex",
  },
  {
    src: "/images/works/behance/02-harley-davidson.jpg",
    title: "Website Harley-Davidson",
    category: "Website",
    href: "https://www.behance.net/gallery/164985633/Website-Harley-Davidson",
  },
  {
    src: "/images/works/behance/03-gamers-club.png",
    title: "Branding Gamers Club",
    category: "Branding",
    href: "https://www.behance.net/gallery/166220863/Branding-Gamers-Club",
  },
  {
    src: "/images/works/behance/04-frigorifico-cancian.png",
    title: "Landing Page Frigorífico Cancian",
    category: "Landing page",
    href: "https://www.behance.net/gallery/165081939/Landing-Page-Frigorifico-Cancian",
  },
  {
    src: "/images/works/behance/05-fb-law.jpg",
    title: "Branding FB Law",
    category: "Branding",
    href: "https://www.behance.net/gallery/165986711/Branding-Advocacia-FB-Franchising-Business-Law",
  },
  {
    src: "/images/works/behance/06-oiti.jpg",
    title: "Branding Oiti",
    category: "Branding",
    href: "https://www.behance.net/gallery/165988229/Branding-Oiti",
  },
  {
    src: "/images/works/behance/07-inteccon.png",
    title: "Website Inteccon",
    category: "Website",
    href: "https://www.behance.net/gallery/165981187/Website-Inteccon",
  },
  {
    src: "/images/works/behance/08-beflex-website.png",
    title: "Website BeFlex",
    category: "Website",
    href: "https://www.behance.net/gallery/164888975/Website-BeFlex",
  },
  {
    src: "/images/works/behance/09-sorobag.png",
    title: "Website Sorobag",
    category: "Website",
    href: "https://www.behance.net/gallery/164988291/Website-Sorobag",
  },
  {
    src: "/images/works/behance/10-amiici.png",
    title: "Aplicativo Amiici",
    category: "iOS e Android",
    href: "https://www.behance.net/gallery/164971661/iOS-e-Android-Amiici",
  },
] as const;

const SPLIT = Math.ceil(WORKS.length / 2);
const SPEED = 0.04;
const PARALLAX = 94;

type RowWork = (typeof WORKS)[number] & { index: number };

const Card = memo(function Card({
  work,
  clone,
  onOpen,
}: {
  work: RowWork;
  clone: boolean;
  onOpen: (index: number, origin: CaseOrigin) => void;
}) {
  return (
    <button
      type="button"
      onClick={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        onOpen(work.index, {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
      }}
      className="works-card"
      data-cursor-label="Ver o case"
      aria-hidden={clone || undefined}
      tabIndex={clone ? -1 : undefined}
      aria-label={`Abrir o case ${work.title}`}
    >
      <span className="works-card-media">
        <Image
          src={work.src}
          alt={work.title}
          fill
          sizes="(max-width: 640px) 84vw, (max-width: 1024px) 48vw, 32vw"
          className="works-card-image"
        />
      </span>
      <span className="works-card-shade" aria-hidden="true" />
      <span className="works-card-caption">
        <span className="works-card-category">{work.category}</span>
        <strong className="works-card-title">{work.title}</strong>
      </span>
    </button>
  );
});

const Row = memo(function Row({
  works,
  direction,
  paused,
  onOpen,
}: {
  works: RowWork[];
  direction: 1 | -1;
  paused: boolean;
  onOpen: (index: number, origin: CaseOrigin) => void;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [copies, setCopies] = useState(2);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const fit = () => {
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      const single = (track.scrollWidth + gap) / copies;
      if (!single) return;
      const needed = Math.max(2, Math.ceil(viewport.clientWidth / single) + 1);
      if (needed !== copies) setCopies(needed);
    };

    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [copies]);

  const pausedRef = useRef(false);
  const syncRef = useRef(() => {});

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let x = 0;
    let frame = 0;
    let previous = 0;
    let inView = false;
    let copyWidth = 0;

    const measure = () => {
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      copyWidth = (track.scrollWidth + gap) / copies;
    };

    const stop = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      previous = 0;
    };

    const tick = (now: number) => {
      const elapsed = previous ? Math.min(now - previous, 64) : 0;
      previous = now;

      if (copyWidth > 0) {
        x += direction * SPEED * elapsed;
        x = ((x % copyWidth) + copyWidth) % copyWidth;
        track.style.transform = `translate3d(${x - copyWidth}px, 0, 0)`;
      }

      frame = requestAnimationFrame(tick);
    };

    const sync = () => {
      const shouldPlay = inView && !document.hidden && !pausedRef.current;
      if (shouldPlay && !frame) frame = requestAnimationFrame(tick);
      if (!shouldPlay) stop();
    };

    measure();
    syncRef.current = sync;

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        sync();
      },
      { threshold: 0.01 },
    );
    observer.observe(viewport);

    const resize = new ResizeObserver(measure);
    resize.observe(track);
    document.addEventListener("visibilitychange", sync);

    return () => {
      syncRef.current = () => {};
      observer.disconnect();
      resize.disconnect();
      document.removeEventListener("visibilitychange", sync);
      stop();
    };
  }, [copies, direction]);

  useEffect(() => {
    pausedRef.current = hovered || paused;
    syncRef.current();
  }, [hovered, paused]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;

    const sync = () => {
      frame = 0;
      const rect = viewport.getBoundingClientRect();
      const centre = rect.top + rect.height / 2;
      const progress = Math.min(1.5, Math.max(-0.5, centre / window.innerHeight));
      viewport.style.setProperty(
        "--works-parallax",
        `${((0.5 - progress) * PARALLAX).toFixed(1)}px`,
      );
    };

    const request = () => {
      if (!frame) frame = requestAnimationFrame(sync);
    };

    request();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
    };
  }, []);

  return (
    <div
      ref={viewportRef}
      className="works-row"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div ref={trackRef} className="works-track">
        {Array.from({ length: copies }, (_, copy) =>
          works.map((work) => (
            <Card
              key={`${copy}-${work.index}`}
              work={work}
              clone={copy > 0}
              onOpen={onOpen}
            />
          )),
        )}
      </div>
    </div>
  );
});

export default function WorksMarqueeSection() {
  const [openCase, setOpenCase] = useState<number | null>(null);
  const [origin, setOrigin] = useState<CaseOrigin | null>(null);

  const handleOpen = useCallback((index: number, from: CaseOrigin) => {
    setOrigin(from);
    setOpenCase(index);
  }, []);

  const rows: RowWork[][] = [
    WORKS.slice(0, SPLIT).map((work, index) => ({ ...work, index })),
    WORKS.slice(SPLIT).map((work, index) => ({
      ...work,
      index: SPLIT + index,
    })),
  ];

  return (
    <section
      id="trabalhos"
      data-section="trabalhos"
      className="works"
      aria-label="Trabalhos da Noot"
    >
      <header className="works-header">
        <p className="works-eyebrow">Nossos cases</p>
        <h2 className="works-title">
          Marcas que confiaram
          <br />o próprio nome à gente
        </h2>
      </header>

      <div className="works-rows">
        <Row
          works={rows[0]}
          direction={1}
          paused={openCase !== null}
          onOpen={handleOpen}
        />
        <Row
          works={rows[1]}
          direction={-1}
          paused={openCase !== null}
          onOpen={handleOpen}
        />
      </div>

      <CaseModal
        work={openCase === null ? null : WORKS[openCase]}
        index={openCase ?? 0}
        total={WORKS.length}
        origin={origin}
        onClose={() => setOpenCase(null)}
      />

      <style>{`
        .works {
          position: relative;
          z-index: 20;
          width: 100%;
          padding: clamp(112px, 16vh, 196px) 0 clamp(124px, 18vh, 216px);
          background: #050B1C;
          overflow: hidden;
        }
        .works-header {
          margin: 0 auto clamp(60px, 7vw, 100px);
          padding: 0 24px;
          max-width: 900px;
          text-align: center;
        }
        .works-eyebrow {
          margin: 0 0 18px;
          color: var(--noot-red);
          font-size: clamp(13px, 1.1vw, 16px);
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }
        .works-title {
          margin: 0;
          color: #fff;
          font-size: clamp(30px, 4.4vw, 60px);
          line-height: 1.02;
          font-weight: 600;
          letter-spacing: -0.03em;
        }
        .works-rows {
          display: flex;
          flex-direction: column;
          gap: clamp(22px, 2.2vw, 34px);
        }
        .works-row {
          width: 100%;
          overflow: hidden;
        }
        .works-track {
          display: flex;
          gap: clamp(22px, 2.2vw, 34px);
          width: max-content;
          will-change: transform;
        }
        .works-card {
          position: relative;
          display: block;
          flex: 0 0 auto;
          width: clamp(280px, 32vw, 560px);
          aspect-ratio: 4 / 3;
          border-radius: 22px;
          overflow: hidden;
          clip-path: inset(0 round 22px);
          isolation: isolate;
          transform: translateZ(0);
          backface-visibility: hidden;
          background: #0C1730;
          color: #fff;
          cursor: pointer;
          text-decoration: none;
          transition: opacity 0.24s ease;
        }
        .works-row:hover .works-card {
          opacity: 0.45;
        }
        .works-row:hover .works-card:hover {
          opacity: 1;
        }
        .works-card-media {
          position: absolute;
          left: 0;
          right: 0;
          top: -14%;
          height: 128%;
          transform: translate3d(0, var(--works-parallax, 0px), 0);
          will-change: transform;
        }
        .works-card-image {
          object-fit: cover;
        }
        .works-card-shade {
          position: absolute;
          inset: 0;
          z-index: 2;
          background: linear-gradient(
            180deg,
            transparent 42%,
            rgba(5, 11, 28, 0.88) 100%
          );
          pointer-events: none;
        }
        .works-card-caption {
          position: absolute;
          right: clamp(18px, 2vw, 28px);
          bottom: clamp(18px, 2vw, 28px);
          left: clamp(18px, 2vw, 28px);
          z-index: 3;
          display: flex;
          flex-direction: column;
          gap: 6px;
          color: #fff;
          text-align: left;
          pointer-events: none;
        }
        .works-card-category {
          color: rgba(255, 255, 255, 0.68);
          font-family: var(--font-geist-mono);
          font-size: 10px;
          line-height: 1.2;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }
        .works-card-title {
          font-size: clamp(1.05rem, 1.5vw, 1.35rem);
          line-height: 1.15;
          font-weight: 600;
          letter-spacing: -0.02em;
        }
        @media (prefers-reduced-motion: reduce) {
          .works-row {
            overflow-x: auto;
          }
          .works-card {
            transition: none;
          }
        }
      `}</style>
    </section>
  );
}
