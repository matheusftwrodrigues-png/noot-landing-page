"use client";

import type { CSSProperties } from "react";

/**
 * One line of characters, each able to roll on its own delay. Two of these
 * stacked (one in view, one waiting below) give the staggered swap.
 */
function Line({ text, next = false }: { text: string; next?: boolean }) {
  return (
    <span className={`roll-line${next ? " roll-line-next" : ""}`}>
      {Array.from(text).map((char, index) => (
        <span
          key={`${char}-${index}`}
          style={{ "--i": index } as CSSProperties}
        >
          {char === " " ? " " : char}
        </span>
      ))}
    </span>
  );
}

function ArrowIcon({ direction }: { direction: "down" | "out" }) {
  return (
    <svg viewBox="0 0 18 18" fill="none" aria-hidden>
      {direction === "down" ? (
        <>
          <path d="M9 3v12" />
          <path d="m4.5 10.5 4.5 4.5 4.5-4.5" />
        </>
      ) : (
        <>
          <path d="M4 14 14 4" />
          <path d="M7 4h7v7" />
        </>
      )}
    </svg>
  );
}

export default function RollButton({
  label,
  href,
  variant = "outline",
  arrowDirection = "out",
  className = "",
  onClick,
}: {
  label: string;
  href: string;
  /**
   * "solid" carries the brand fill, for the one primary action on a screen.
   * "outline" sits on dark backgrounds, "dark" on light ones, and "light" on
   * the brand red, where a red fill would vanish into the background.
   */
  variant?: "outline" | "solid" | "dark" | "light";
  arrowDirection?: "down" | "out";
  className?: string;
  onClick?: () => void;
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={`roll-button roll-button--${variant} ${className}`}
    >
      {/* The visible label is built twice, so screen readers get it once. */}
      <span className="sr-only">{label}</span>
      <span className="roll" aria-hidden>
        <Line text={label} />
        <Line text={label} next />
      </span>
      <span
        className={`roll-button-arrow roll-button-arrow--${arrowDirection}`}
        aria-hidden
      >
        <ArrowIcon direction={arrowDirection} />
      </span>
    </a>
  );
}
