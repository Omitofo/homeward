"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/motion/register";
import { duration, ease, stagger } from "@/motion/tokens";
import { useMotionPreference } from "@/motion/hooks/useMotionPreference";

const HEADLINE = ["A home is waiting.", "So are they."];

type HeroProps = {
  photoUrls: { src: string; alt: string }[];
};

export function Hero({ photoUrls }: HeroProps) {
  const rootRef = useRef<HTMLElement>(null);
  const { level } = useMotionPreference();

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const words = root.querySelectorAll<HTMLElement>("[data-hero-word]");
      const rest = root.querySelectorAll<HTMLElement>("[data-hero-fade]");
      const photos = root.querySelectorAll<HTMLElement>("[data-hero-photo]");

      if (level === "off") {
        gsap.set([words, rest, photos], { autoAlpha: 1, y: 0, rotate: 0 });
        return;
      }

      if (level === "reduced") {
        gsap.fromTo(
          [words, rest, photos],
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: duration.instant,
            stagger: stagger.tight,
            ease: ease.out,
          },
        );
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: ease.out } });

      tl.fromTo(
        words,
        { autoAlpha: 0, y: 24 },
        {
          autoAlpha: 1,
          y: 0,
          duration: duration.base,
          stagger: stagger.base,
        },
        0.1,
      )
        .fromTo(
          rest,
          { autoAlpha: 0, y: 12 },
          {
            autoAlpha: 1,
            y: 0,
            duration: duration.fast,
            stagger: stagger.tight,
          },
          "-=0.15",
        )
        .fromTo(
          photos,
          { autoAlpha: 0, y: 20, rotate: 0 },
          {
            autoAlpha: 1,
            y: 0,
            rotate: (i: number) => (i === 0 ? -6 : i === 1 ? 3 : -2),
            duration: duration.slow,
            stagger: stagger.base,
            ease: ease.out,
          },
          "-=0.25",
        );
    },
    { scope: rootRef, dependencies: [level] },
  );

  return (
    <section
      ref={rootRef}
      className="relative flex min-h-[100dvh] flex-col justify-center overflow-hidden px-4 pb-16 pt-20"
    >
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="space-y-6 text-center lg:text-left">
          <p
            data-hero-fade
            className="text-sm font-medium uppercase tracking-wide text-muted"
            style={{ opacity: 0 }}
          >
            Find a companion
          </p>

          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {HEADLINE.map((line) => (
              <span key={line} className="block">
                {line.split(" ").map((word, i) => (
                  <span
                    key={`${line}-${i}`}
                    data-hero-word
                    className="mr-[0.3em] inline-block last:mr-0"
                    style={{ opacity: 0 }}
                  >
                    {word}
                  </span>
                ))}
              </span>
            ))}
          </h1>

          <p
            data-hero-fade
            className="mx-auto max-w-md text-lg leading-relaxed text-muted lg:mx-0"
            style={{ opacity: 0 }}
          >
            Browse animals from verified rescues. Filter what matters. Message when
            you’re ready.
          </p>

          <div
            data-hero-fade
            className="flex flex-wrap items-center justify-center gap-3 lg:justify-start"
            style={{ opacity: 0 }}
          >
            <Link
              href="/explore"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-5 text-base font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Explore animals
            </Link>
            <Link
              href="/explore"
              className="text-sm font-medium text-muted underline-offset-4 hover:text-foreground hover:underline"
            >
              Skip intro →
            </Link>
          </div>
        </div>

        {/* Photo stack — first image is LCP candidate */}
        <div className="relative mx-auto flex h-72 w-full max-w-sm items-center justify-center sm:h-80 lg:h-96">
          {photoUrls.slice(0, 3).map((photo, i) => (
            <div
              key={photo.src || i}
              data-hero-photo
              className="absolute overflow-hidden rounded-xl border border-border bg-card shadow-lg"
              style={{
                opacity: 0,
                width: "70%",
                aspectRatio: "1",
                zIndex: 3 - i,
                left: `${12 + i * 8}%`,
                top: `${8 + i * 6}%`,
              }}
            >
              {photo.src ? (
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 1024px) 70vw, 280px"
                  className="object-cover"
                  priority={i === 0}
                />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
