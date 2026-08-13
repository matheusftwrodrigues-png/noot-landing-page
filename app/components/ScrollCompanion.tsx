"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ScrollCompanion() {
  const rootRef = useRef<HTMLDivElement>(null);
  const bobRef = useRef<HTMLDivElement>(null);
  const spinRef = useRef<HTMLDivElement>(null);
  const v1Ref = useRef<HTMLDivElement>(null);
  const v2Ref = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const bobEl = bobRef.current;
    const spin = spinRef.current;
    const v1 = v1Ref.current;
    const v2 = v2Ref.current;
    const hint = hintRef.current;
    if (!root || !bobEl || !spin || !v1 || !v2) return;

    const ctx = gsap.context(() => {
      gsap.set(v2, { opacity: 0, scale: 0.7, rotate: -25 });

      gsap.fromTo(
        root,
        { opacity: 0, scale: 0.6 },
        {
          opacity: 1,
          scale: 1,
          duration: 1,
          delay: 0.35,
          ease: "back.out(1.5)",
        },
      );

      const bob = gsap.to(bobEl, {
        y: -10,
        duration: 1.4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 1.2,
      });

      gsap.to(spin, {
        rotation: 720,
        ease: "none",
        scrollTrigger: {
          start: "top top",
          end: "max",
          scrub: 0.45,
          onUpdate: (self) => {
            if (self.progress > 0.025) bob.pause();
            else if (bob.paused()) bob.resume();
          },
        },
      });

      gsap.fromTo(
        root,
        { y: 0 },
        {
          y: -56,
          ease: "none",
          scrollTrigger: {
            start: "top top",
            end: "max",
            scrub: 0.6,
          },
        },
      );

      // Morph v1 → v2 mid-journey (around clientes / fala)
      const morph = gsap.timeline({
        scrollTrigger: {
          start: "30% top",
          end: "55% top",
          scrub: 0.55,
        },
      });

      morph
        .to(
          v1,
          {
            opacity: 0,
            scale: 0.65,
            rotate: 30,
            ease: "power2.inOut",
            duration: 1,
          },
          0,
        )
        .to(
          v2,
          {
            opacity: 1,
            scale: 1,
            rotate: 0,
            ease: "power2.inOut",
            duration: 1,
          },
          0.15,
        )
        .to(
          spin,
          {
            scale: 1.12,
            duration: 0.35,
            yoyo: true,
            repeat: 1,
            ease: "power1.inOut",
          },
          0.35,
        );

      if (hint) {
        gsap.to(hint, {
          opacity: 0,
          y: 8,
          ease: "power1.out",
          scrollTrigger: {
            start: "top+=60 top",
            end: "top+=260 top",
            scrub: true,
          },
        });
      }
    }, root);

    const refresh = () => ScrollTrigger.refresh();
    requestAnimationFrame(refresh);
    window.addEventListener("load", refresh);

    return () => {
      window.removeEventListener("load", refresh);
      ctx.revert();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="pointer-events-none fixed right-4 bottom-6 z-[45] sm:right-6 sm:bottom-8 md:right-8"
      style={{ opacity: 0 }}
      aria-hidden
    >
      <div ref={bobRef} className="flex flex-col items-center gap-2">
        <div
          ref={spinRef}
          className="relative h-14 w-[3.15rem] will-change-transform sm:h-16 sm:w-14 md:h-[4.5rem] md:w-[4rem]"
          style={{ transformOrigin: "50% 50%" }}
        >
          <div className="absolute inset-[-18%] rounded-full bg-[#ED1A41]/12 blur-md" />

          <div
            ref={v1Ref}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Image
              src="/images/react_noot.svg"
              alt=""
              width={182}
              height={202}
              priority
              className="h-full w-auto drop-shadow-[0_8px_24px_rgba(31,54,99,0.35)]"
            />
          </div>

          <div
            ref={v2Ref}
            className="absolute inset-0 flex items-center justify-center"
            style={{ opacity: 0 }}
          >
            <Image
              src="/images/react_noot_2.svg"
              alt=""
              width={182}
              height={202}
              priority
              className="h-full w-auto drop-shadow-[0_8px_24px_rgba(31,54,99,0.35)]"
            />
          </div>
        </div>

        <span
          ref={hintRef}
          className="font-[family-name:var(--font-geist-mono)] text-[0.6rem] tracking-[0.22em] text-[#1F3663]/70 uppercase"
        >
          Role ↓
        </span>
      </div>
    </div>
  );
}
