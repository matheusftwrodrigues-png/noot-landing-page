import Image from "next/image";
import type { CSSProperties } from "react";

const WORDMARK = [
  { src: "/images/noot/n-white.svg", width: 18, height: 19 },
  { src: "/images/noot/o-white.svg", width: 22, height: 19 },
  { src: "/images/noot/o-slash-white.svg", width: 22, height: 19 },
  { src: "/images/noot/t-white.svg", width: 14, height: 24 },
] as const;

const MENU = [
  { label: "Início", href: "#inicio" },
  { label: "Serviços", href: "#oficio" },
  { label: "Clientes", href: "#empresas" },
  { label: "Trabalhos", href: "#trabalhos" },
] as const;

const SOCIALS = [
  {
    name: "WhatsApp",
    href: "https://wa.me/5515991400807",
    icon: (
      <path d="M12.04 2a9.75 9.75 0 0 0-8.47 14.59L2.2 21.6l5.13-1.34A9.8 9.8 0 1 0 12.04 2Zm0 17.82a8.1 8.1 0 0 1-4.12-1.13l-.3-.18-3.04.8.81-2.96-.2-.3a8.07 8.07 0 1 1 6.85 3.77Zm4.43-6.05c-.24-.12-1.44-.71-1.66-.8-.22-.08-.38-.12-.55.13-.16.24-.63.8-.77.96-.14.16-.28.18-.52.06-.24-.12-1.03-.38-1.95-1.21a7.3 7.3 0 0 1-1.35-1.68c-.14-.24-.01-.37.1-.49.11-.1.24-.28.37-.42.12-.14.16-.24.24-.4.08-.17.04-.31-.02-.43-.06-.12-.55-1.31-.75-1.8-.2-.47-.4-.4-.55-.41h-.47c-.16 0-.42.06-.65.3-.22.24-.85.83-.85 2.03s.87 2.36 1 2.53c.12.16 1.71 2.61 4.14 3.66.58.25 1.03.4 1.38.51.58.19 1.11.16 1.53.1.47-.07 1.44-.59 1.64-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.47-.28Z" />
    ),
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/agencianoot",
    icon: (
      <path d="M6.38 8.16H2.75V19.8h3.63V8.16ZM4.57 2.36a2.1 2.1 0 1 0 0 4.2 2.1 2.1 0 0 0 0-4.2ZM20.27 13.13c0-3.5-1.87-5.13-4.37-5.13a4.24 4.24 0 0 0-3.84 2.1h-.05V8.16H8.53V19.8h3.63v-5.76c0-1.52.29-2.99 2.17-2.99 1.86 0 1.88 1.74 1.88 3.09v5.66h3.63l.43-6.67Z" />
    ),
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/agencianoot/",
    icon: (
      <path d="M12 2.2c3.2 0 3.58.01 4.85.07 3.26.15 4.78 1.7 4.93 4.93.06 1.27.07 1.65.07 4.8s-.01 3.53-.07 4.8c-.15 3.22-1.66 4.78-4.93 4.93-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-3.28-.15-4.78-1.71-4.93-4.93-.06-1.27-.07-1.65-.07-4.8s.01-3.53.07-4.8c.15-3.23 1.66-4.78 4.93-4.93C8.42 2.21 8.8 2.2 12 2.2Zm0-2.2C8.74 0 8.33.01 7.05.07 2.67.27.27 2.67.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.38 2.6 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.38-.2 6.78-2.6 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95C23.73 2.67 21.33.27 16.95.07 15.67.01 15.26 0 12 0Zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32Zm0 10.16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.41-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88Z" />
    ),
  },
] as const;

export default function SiteFooter() {
  return (
    <footer
      id="rodape"
      data-section="rodape"
      className="relative z-40 w-full border-t border-white/10 bg-[#050B1C] text-white"
    >
      <div className="mx-auto w-full max-w-[1300px] px-6 pt-14 pb-8 sm:px-10 lg:pt-16">
        <div className="grid grid-cols-1 gap-x-16 gap-y-12 md:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_max-content_max-content] lg:gap-x-20 xl:gap-x-32">
          <section className="flex flex-col items-start">
            <a
              href="#inicio"
              className="noot-wordmark flex w-fit items-end"
              aria-label="Noot: voltar ao início"
              style={
                {
                  "--noot-unit": "calc(clamp(42px, 4.6vw, 58px) / 24)",
                } as CSSProperties
              }
            >
              {WORDMARK.map((letter) => (
                <Image
                  key={letter.src}
                  src={letter.src}
                  alt=""
                  width={letter.width}
                  height={letter.height}
                  unoptimized
                  className="w-auto max-w-none"
                  style={{
                    height: `calc(var(--noot-unit) * ${letter.height})`,
                  }}
                />
              ))}
              <span className="sr-only">Noot</span>
            </a>

            <p className="mt-7 max-w-[40ch] text-sm leading-relaxed font-normal text-white/64">
              Construímos o que o seu time precisa.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold tracking-[-0.01em] text-white">
              Nossas redes
            </h2>
            <nav
              className="mt-3 flex items-center gap-2"
              aria-label="Redes sociais"
            >
              {SOCIALS.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.name}
                  title={social.name}
                  className="flex h-10 w-8 items-center justify-start rounded-lg text-white/70 transition-[color,transform] duration-200 hover:-translate-y-0.5 hover:text-white"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-[18px] w-[18px] fill-current"
                    aria-hidden
                  >
                    {social.icon}
                  </svg>
                </a>
              ))}
            </nav>
          </section>

          <nav
            aria-label="Menu do rodapé"
            className="md:col-span-2 lg:col-span-1"
          >
            <h2 className="text-lg font-semibold tracking-[-0.01em] text-white">
              Menu
            </h2>
            <ul className="mt-5 space-y-1">
              {MENU.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="inline-flex min-h-10 items-center text-[0.98rem] font-medium text-white/68 transition-colors duration-200 hover:text-white"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-row items-center justify-between gap-4 border-t border-white/10 pt-5 text-xs text-white/42">
          <p>© 2026 Noot. Todos os direitos reservados.</p>
          <a
            href="#inicio"
            aria-label="Voltar ao início"
            title="Voltar ao início"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-white text-[#081125] shadow-[0_10px_28px_rgba(255,255,255,0.12)] transition-[transform,background-color] duration-200 hover:-translate-y-1 hover:bg-[#EEF1F7] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 fill-none stroke-current"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M12 19V5" />
              <path d="m6.5 10.5 5.5-5.5 5.5 5.5" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
