"use client";

import { useEffect, useRef } from "react";
import { createTimeline, utils } from "animejs";
import RollButton from "./RollButton";

/** The service deck, condensed. The list is a sample of what the team
 *  covers, not its boundary — the copy above it says so. */
const SERVICES = [
  {
    title: ["Design", "& UI/UX"],
    items: [
      "Identidade visual, branding e peças gráficas",
      "Wireframes, protótipos e design system",
      "Interfaces, jornadas e adaptação responsiva",
    ],
  },
  {
    title: ["Dev", "& Tecnologia"],
    items: [
      "Sites, landing pages e plataformas sob medida",
      "Apps iOS, Android e sistemas internos",
      "Integrações, automação e fluxos de IA",
    ],
  },
  {
    title: ["Tráfego", "& Conteúdo"],
    items: [
      "Meta, Google, TikTok e LinkedIn Ads, com SEO",
      "Social, copy e roteiros para cada canal",
      "Captação, edição, motion e relatórios",
    ],
  },
] as const;

export default function CraftSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const reveal = revealRef.current;
    if (!section || !reveal) return;

    const rows = Array.from(
      reveal.querySelectorAll<HTMLElement>("[data-reveal]"),
    );
    if (rows.length === 0) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      utils.set(rows, { opacity: 1, y: 0 });
      return;
    }

    utils.set(rows, { opacity: 0, y: 32 });

    let timeline: ReturnType<typeof createTimeline> | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();

        timeline = createTimeline({
          defaults: { ease: "outExpo", duration: 850 },
        });
        rows.forEach((row, index) => {
          timeline?.add(row, { opacity: [0, 1], y: [32, 0] }, index * 110);
        });
      },
      { threshold: 0, rootMargin: "-15% 0px -15% 0px" },
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
      timeline?.revert();
    };
  }, []);

  return (
    <section
      id="oficio"
      ref={sectionRef}
      data-section="oficio"
      className="relative z-[15] w-full overflow-hidden bg-[#081125]"
      aria-label="Serviços"
    >
      <div
        className="amb-drift pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 65% 50% at 78% 22%, rgba(237,26,65,0.16), transparent 60%)",
        }}
      />

      <div
        ref={revealRef}
        className="relative z-10 mx-auto grid max-w-[1300px] grid-cols-1 items-center gap-x-20 gap-y-16 px-6 pt-[clamp(8rem,18vh,13rem)] pb-[clamp(6rem,15vh,11rem)] sm:px-10 md:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]"
      >
        {/* service rows — each one is a cube that rotates on its bottom edge */}
        <ul data-reveal className="craft-stack order-2 md:order-1">
          {SERVICES.map((service) => (
            <li key={service.title.join(" ")} className="craft-row">
              <div className="craft-row-inner">
                {/* the face waiting underneath, pre-rotated into place */}
                <div className="craft-face craft-face-hover">
                  <span className="craft-title font-[family-name:var(--font-jakarta)]">
                    {service.title[0]}
                    <br />
                    {service.title[1]}
                  </span>
                  <ul className="craft-list">
                    {service.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                {/* the face in view, which also sets the row's height */}
                <div className="craft-face craft-face-main">
                  <span className="craft-title font-[family-name:var(--font-jakarta)]">
                    {service.title[0]}
                    <br />
                    {service.title[1]}
                  </span>
                  <ul className="craft-list" aria-hidden>
                    {service.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* pitch */}
        <div className="order-1 flex flex-col items-start md:order-2">
          <h2
            data-reveal
            className="font-[family-name:var(--font-jakarta)] text-[clamp(2.35rem,4.9vw,3.9rem)] leading-[1.06] font-extrabold tracking-[-0.02em] text-[#F7F4F0]"
          >
            Todas as frentes,
            <br />
            um time só
          </h2>

          <p
            data-reveal
            className="mt-8 max-w-[46ch] text-[clamp(1.05rem,1.5vw,1.3rem)] leading-relaxed text-white/60"
          >
            Tudo o que o projeto pedir debaixo do mesmo teto, sem terceirizar
            pedaço nem trocar de fornecedor no meio do caminho. O seu time traz
            a demanda e recebe o projeto pronto.
          </p>

          <div data-reveal className="mt-11">
            <RollButton
              label="Falar com a Noot"
              href="#fala-com-a-gente"
              variant="solid"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
