"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const WORDMARK = [
  { src: "/images/vector.svg", w: 18, h: 19 },
  { src: "/images/vector_1.svg", w: 22, h: 19 },
  { src: "/images/vector_2.svg", w: 22, h: 19 },
  { src: "/images/vector_3.svg", w: 14, h: 24 },
] as const;

/** "Fale com a gente" is deliberately absent: it is the CTA, not a link. */
const MENU = [
  { id: "oficio", label: "Serviços" },
  { id: "empresas", label: "Clientes" },
  { id: "trabalhos", label: "Trabalhos" },
] as const;

const CTA = { id: "fala-com-a-gente", label: "Fale com a gente" };

/** Where down the viewport a section counts as the one being read. */
const READING_LINE = 0.4;

/**
 * How dark each section's backdrop is. The pill inverts against it — no single
 * tint stays legible over both a cream hero and a near-black gallery, so the
 * glass flips instead of compromising.
 */
const SECTION_TONE: Record<string, "light" | "dark"> = {
  inicio: "light",
  oficio: "dark",
  proposta: "dark",
  plano: "light",
  empresas: "light",
  trabalhos: "dark",
  "fala-com-a-gente": "dark",
  rodape: "dark",
};

/** Sampled just under the pill, not at the reading line. */
const TONE_LINE = 68;

/** Every section in page order — the menu skips some, the backdrop does not. */
const TONE_IDS = [
  "inicio",
  "oficio",
  "plano",
  "proposta",
  "empresas",
  "trabalhos",
  "fala-com-a-gente",
  "rodape",
];

export default function SiteHeader() {
  const rootRef = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [tone, setTone] = useState<"light" | "dark">("light");

  // Sits out of the way until the intro has handed the frame over.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reveal = () => root.classList.add("site-header-in");

    if (document.body.dataset.introDone === "true") {
      reveal();
      return;
    }

    window.addEventListener("noot:intro-done", reveal, { once: true });
    return () => window.removeEventListener("noot:intro-done", reveal);
  }, []);

  // Scrollspy. Measured against a line partway down the viewport rather than
  // the top edge, so a section counts as active once it is actually being
  // read — not the moment its first pixel appears.
  useEffect(() => {
    let frame = 0;

    const sync = () => {
      frame = 0;
      const boxes = TONE_IDS.map((id) => ({
        id,
        bounds: document.getElementById(id)?.getBoundingClientRect(),
      }));

      const line = window.innerHeight * READING_LINE;
      const current = boxes.find(
        ({ id, bounds }) =>
          id !== "inicio" && bounds && bounds.top <= line && bounds.bottom > line,
      );
      setActive(current?.id ?? null);

      const behind = boxes.find(
        ({ bounds }) =>
          bounds && bounds.top <= TONE_LINE && bounds.bottom > TONE_LINE,
      );
      setTone(SECTION_TONE[behind?.id ?? "inicio"] ?? "light");
    };

    const requestSync = () => {
      if (!frame) frame = requestAnimationFrame(sync);
    };

    requestSync();
    window.addEventListener("scroll", requestSync, { passive: true });
    window.addEventListener("resize", requestSync);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestSync);
      window.removeEventListener("resize", requestSync);
    };
  }, []);

  // Close on Escape, and whenever the pointer lands outside the menu.
  useEffect(() => {
    if (!menuOpen) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    const onClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onClick);
    };
  }, [menuOpen]);

  const jumpTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      ref={rootRef}
      className="site-header"
      data-tone={tone}
      aria-label="Cabeçalho"
    >
      <div className="site-nav pointer-events-auto">
        <a
          href="#inicio"
          className="site-nav-brand noot-wordmark"
          aria-label="Noot: início"
        >
          {WORDMARK.map((letter) => (
            <Image
              key={letter.src}
              src={letter.src}
              alt=""
              width={letter.w}
              height={letter.h}
              priority
              unoptimized
              className="w-auto max-w-none"
              style={{ height: `calc(var(--noot-unit) * ${letter.h})` }}
            />
          ))}
          <span className="sr-only">Noot</span>
        </a>

        <nav className="site-nav-links" aria-label="Navegação">
          {MENU.map((item) => (
            <button
              key={item.id}
              type="button"
              className="site-nav-link"
              data-active={active === item.id ? "true" : undefined}
              aria-current={active === item.id ? "true" : undefined}
              onClick={() => jumpTo(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button
          type="button"
          className="site-nav-cta"
          onClick={() => jumpTo(CTA.id)}
        >
          {CTA.label}
        </button>

        <button
          type="button"
          className="site-nav-burger"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="site-menu"
        >
          <span className="sr-only">
            {menuOpen ? "Fechar menu" : "Abrir menu"}
          </span>
          <span className="site-nav-burger-bars" aria-hidden>
            <span data-open={menuOpen ? "true" : undefined} />
            <span data-open={menuOpen ? "true" : undefined} />
          </span>
        </button>
      </div>

      {menuOpen && (
        <nav id="site-menu" className="site-nav-sheet" aria-label="Navegação">
          {[...MENU, CTA].map((item) => (
            <button
              key={item.id}
              type="button"
              className="site-nav-sheet-link"
              data-active={active === item.id ? "true" : undefined}
              onClick={() => jumpTo(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
}
