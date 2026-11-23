"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { AbstractShowcaseItem } from "@/components/LandingWebsitesShowcase";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getLocalizedValue, type Project } from "@/types/portfolio";

interface LandingDesignShowcaseProps {
  projects: Project[];
  locale: Locale;
  inspectLabel: string;
  liveRotationLabel: string;
  viewAllLabel: string;
  abstractItems: [AbstractShowcaseItem, AbstractShowcaseItem];
}

interface DesignSlide {
  project: Project;
  imageUrl: string | null;
}

const ROTATION_INTERVAL_MS = 60_000;

export function LandingDesignShowcase({
  projects,
  locale,
  inspectLabel,
  liveRotationLabel,
  viewAllLabel,
  abstractItems,
}: LandingDesignShowcaseProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tick, setTick] = useState(0);

  const slides = useMemo<DesignSlide[]>(() => {
    const items: DesignSlide[] = [];
    for (const project of projects) {
      const images = [project.cover_image, ...project.gallery].filter(
        (img): img is string => Boolean(img && img.trim().length > 0)
      );
      if (images.length > 0) {
        for (const imageUrl of images) {
          items.push({ project, imageUrl });
        }
      } else {
        items.push({ project, imageUrl: null });
      }
    }
    return items;
  }, [projects]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setTick((prev) => prev + 1);
    }, ROTATION_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slots: Array<
    | { kind: "slide"; slide: DesignSlide; index: number }
    | { kind: "abstract"; item: AbstractShowcaseItem; index: number }
  > = [0, 1].map((slotIndex) => {
    if (slides.length === 0) {
      return { kind: "abstract", item: abstractItems[slotIndex], index: slotIndex };
    }
    if (slides.length === 1) {
      return slotIndex === 0
        ? { kind: "slide", slide: slides[0], index: slotIndex }
        : { kind: "abstract", item: abstractItems[1], index: slotIndex };
    }

    const slideIndex = (tick + slotIndex) % slides.length;
    return { kind: "slide", slide: slides[slideIndex], index: slotIndex };
  });

  return (
    <div className="space-y-6">
      {slides.length > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-neutral-500">
            <span
              className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"
              aria-hidden="true"
            />
            <span>{liveRotationLabel}</span>
          </span>

          <div className="flex items-center gap-1.5">
            {slides.slice(0, 8).map((_, idx) => {
              const isActive = tick % slides.length === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setTick(idx)}
                  aria-label={`Slide ${idx + 1}`}
                  className={
                    isActive
                      ? "h-1.5 w-6 bg-foreground transition-all"
                      : "h-1.5 w-2 bg-neutral-300 hover:bg-neutral-500 dark:bg-neutral-700 transition-all"
                  }
                />
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-6 lg:flex-row">
        {slots.map((slot) => {
          const isExpanded = hoveredIndex === slot.index;
          const isCompressed =
            hoveredIndex !== null && hoveredIndex !== slot.index;
          const flexClass = isExpanded
            ? "lg:flex-[1.45]"
            : isCompressed
              ? "lg:flex-[0.85]"
              : "lg:flex-1";

          if (slot.kind === "abstract") {
            return (
              <Link
                key={`abstract-design-${slot.index}`}
                href="/design"
                onMouseEnter={() => setHoveredIndex(slot.index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onFocus={() => setHoveredIndex(slot.index)}
                onBlur={() => setHoveredIndex(null)}
                className={`group relative flex min-h-[380px] flex-col justify-between overflow-hidden border border-neutral-200 bg-neutral-50/40 p-6 transition-all duration-500 ease-out hover:border-foreground dark:border-neutral-800 dark:bg-neutral-950/60 dark:hover:border-foreground ${flexClass}`}
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-30 transition-opacity duration-500 group-hover:opacity-60"
                >
                  <div className="absolute left-10 top-12 h-36 w-36 rounded-full border border-neutral-300 transition-transform duration-500 group-hover:scale-110 dark:border-neutral-700" />
                  <div className="absolute bottom-12 right-10 h-28 w-52 border border-neutral-300 dark:border-neutral-700" />
                </div>

                <div className="relative z-10 flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                    {slot.item.tag}
                  </span>
                  <ArrowUpRight
                    className="h-4 w-4 text-neutral-400 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground"
                    aria-hidden="true"
                  />
                </div>

                <div className="relative z-10 space-y-2 pt-28">
                  <h3 className="text-2xl font-semibold tracking-tight">
                    {slot.item.title}
                  </h3>
                  <p className="font-mono text-xs text-neutral-500">
                    {slot.item.subtitle}
                  </p>
                </div>
              </Link>
            );
          }

          const { project, imageUrl } = slot.slide;
          const title = getLocalizedValue(project.title, locale) || project.slug;
          const description = getLocalizedValue(project.description, locale);

          return (
            <Link
              key={`design-slot-${slot.index}-${project.id}`}
              href={`/projects/${project.slug}`}
              onMouseEnter={() => setHoveredIndex(slot.index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onFocus={() => setHoveredIndex(slot.index)}
              onBlur={() => setHoveredIndex(null)}
              className={`group relative flex min-h-[380px] flex-col justify-between overflow-hidden border border-neutral-200 p-6 transition-all duration-500 ease-out hover:border-foreground dark:border-neutral-800 dark:hover:border-foreground ${flexClass}`}
            >
              {imageUrl ? (
                <Image
                  key={imageUrl}
                  src={imageUrl}
                  alt={title}
                  fill
                  unoptimized
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
              ) : (
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-neutral-100 dark:bg-neutral-900"
                >
                  <div className="absolute inset-8 border border-dashed border-neutral-300 dark:border-neutral-700" />
                </div>
              )}

              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/20 transition-opacity duration-300 group-hover:from-black/90"
              />

              <div className="relative z-10 flex items-center justify-between text-white">
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-300">
                  0{slot.index + 1} /{" "}
                  {project.tags.slice(0, 3).join(" · ") || "DESIGN"}
                </span>
                <span className="inline-flex items-center gap-1 border border-white/30 bg-black/30 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider backdrop-blur-xs">
                  <span>{inspectLabel}</span>
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </div>

              <div className="relative z-10 space-y-2 pt-32 text-white">
                <h3 className="text-2xl font-semibold tracking-tight md:text-3xl">
                  {title}
                </h3>
                {description && (
                  <p className="line-clamp-2 max-w-xl text-sm text-neutral-200">
                    {description}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="flex justify-center pt-2">
        <Link
          href="/design"
          className="inline-flex w-full items-center justify-center gap-2 border border-neutral-300 dark:border-neutral-700 px-6 py-3.5 font-mono text-xs uppercase tracking-[0.2em] transition-colors hover:border-foreground hover:bg-foreground hover:text-background sm:w-auto"
        >
          <span>{viewAllLabel}</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
