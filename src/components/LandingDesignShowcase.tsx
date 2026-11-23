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
      return {
        kind: "abstract",
        item: abstractItems[slotIndex],
        index: slotIndex,
      };
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
    <div className="space-y-8">
      {slides.length > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <span className="liquid-pill inline-flex items-center gap-2 rounded-full px-3.5 py-1 font-mono text-[11px] uppercase tracking-[0.16em] text-white/80">
            <span
              className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"
              aria-hidden="true"
            />
            <span>{liveRotationLabel}</span>
          </span>

          <div className="liquid-pill flex items-center gap-1.5 rounded-full px-3 py-1.5">
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
                      ? "h-2 w-6 rounded-full bg-white transition-all"
                      : "h-2 w-2 rounded-full bg-white/35 hover:bg-white/70 transition-all"
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
                className={`liquid-glass group relative flex min-h-[400px] flex-col overflow-hidden rounded-[36px] p-3.5 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-white/40 active:scale-[0.99] ${flexClass}`}
              >
                <div className="relative flex flex-1 flex-col justify-between overflow-hidden rounded-[28px] border border-white/15 bg-gradient-to-br from-fuchsia-950/35 via-white/[0.04] to-black/70 p-6">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-45 transition-opacity duration-500 group-hover:opacity-75"
                  >
                    <div className="absolute left-10 top-12 h-36 w-36 rounded-full border border-white/25 transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute bottom-14 right-10 h-24 w-44 rounded-[22px] border border-white/20" />
                  </div>

                  <div className="relative z-10 flex items-center justify-between">
                    <span className="liquid-pill rounded-full px-3.5 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-white/90">
                      {slot.item.tag}
                    </span>
                    <span className="liquid-pill flex h-9 w-9 items-center justify-center rounded-full text-white transition-transform duration-300 group-hover:scale-110">
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </div>

                  <div className="relative z-10 pt-28">
                    <div className="liquid-glass inline-block rounded-[22px] px-4 py-3 text-white">
                      <h3 className="text-xl font-semibold tracking-tight">
                        {slot.item.title}
                      </h3>
                      <p className="mt-1 font-mono text-xs text-white/65">
                        {slot.item.subtitle}
                      </p>
                    </div>
                  </div>
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
              className={`liquid-glass group relative flex min-h-[400px] flex-col overflow-hidden rounded-[36px] p-3.5 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-white/40 active:scale-[0.99] ${flexClass}`}
            >
              <div className="relative flex flex-1 flex-col justify-between overflow-hidden rounded-[28px] border border-white/15 p-5 sm:p-6">
                {imageUrl ? (
                  <Image
                    key={imageUrl}
                    src={imageUrl}
                    alt={title}
                    fill
                    unoptimized
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-br from-purple-950/60 via-neutral-900 to-black"
                  />
                )}

                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/20"
                />

                <div className="relative z-10 flex items-center justify-between gap-3">
                  <span className="liquid-pill rounded-full px-3.5 py-1 font-mono text-[11px] uppercase tracking-[0.16em] text-white">
                    0{slot.index + 1} ·{" "}
                    {project.tags.slice(0, 3).join(" · ") || "DESIGN"}
                  </span>
                  <span className="liquid-pill inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs font-medium text-white transition-transform duration-300 group-hover:scale-105">
                    <span>{inspectLabel}</span>
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </div>

                <div className="relative z-10 pt-32">
                  <div className="liquid-glass inline-block max-w-xl rounded-[24px] px-5 py-3.5 text-white">
                    <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">
                      {title}
                    </h3>
                    {description && (
                      <p className="mt-1 line-clamp-2 text-xs text-white/75 sm:text-sm">
                        {description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="flex justify-center">
        <Link
          href="/design"
          className="liquid-pill inline-flex w-full items-center justify-center gap-2 rounded-full px-8 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-all duration-300 hover:scale-[1.03] hover:bg-white/20 active:scale-95 sm:w-auto"
        >
          <span>{viewAllLabel}</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
