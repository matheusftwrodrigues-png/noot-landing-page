"use client";

import Image from "next/image";

const CLIENTS = [
  { src: "/images/logos/cogna.svg", name: "Cogna Educação", w: 99, h: 36 },
  { src: "/images/logos/byd.svg", name: "BYD", w: 139, h: 40 },
  { src: "/images/logos/voomp.svg", name: "Voomp", w: 146, h: 31 },
  { src: "/images/logos/jadlog.png", name: "Jadlog", w: 129, h: 42 },
] as const;

/** Repeated so a single lane is always wider than the viewport. */
const LANE = [...CLIENTS, ...CLIENTS, ...CLIENTS];

function Lane({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <ul
      className="flex shrink-0 items-center gap-10 pr-10 sm:gap-14 sm:pr-14"
      aria-hidden={duplicate || undefined}
    >
      {LANE.map((client, index) => (
        <li key={`${client.name}-${index}`} className="shrink-0">
          <Image
            src={client.src}
            alt={duplicate ? "" : client.name}
            width={client.w}
            height={client.h}
            unoptimized
            className="h-auto opacity-90"
            style={{ width: `calc(${client.w}px * var(--logo-scale, 1))` }}
          />
        </li>
      ))}
    </ul>
  );
}

export default function ClientLogosMarquee() {
  return (
    <div className="logo-marquee w-full">
      <div className="logo-marquee-track flex w-max">
        <Lane />
        <Lane duplicate />
      </div>
    </div>
  );
}
