"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getLocalizedValue, type Project } from "@/types/portfolio";

export interface AbstractShowcaseItem {
  tag: string;
  title: string;
  subtitle: string;
}

interface LandingWebsitesShowcaseProps {
  projects: Project[];
  locale: Locale;
  viewProjectLabel: string;
  openWebsiteLabel: string;
  viewAllLabel: string;
  abstractItems: [AbstractShowcaseItem, AbstractShowcaseItem];
}

export function LandingWebsitesShowcase({
  projects,
  locale,
  viewProjectLabel,
  openWebsiteLabel,
  viewAllLabel,
  abstractItems,
}: LandingWebsitesShowcaseProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const slots: Array<
    | { kind: "project"; project: Project; index: number }
    | { kind: "abstract"; item: AbstractShowcaseItem; index: number }
  > = [0, 1].map((index) => {
    const project = projects[index];
    if (project) {
      return { kind: "project", project, index };
    }
    return { kind: "abstract", item: abstractItems[index], index };
  });

  return (
    <div className="space-y-6">
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
                key={`abstract-web-${slot.index}`}
                href="/websites"
                onMouseEnter={() => setHoveredIndex(slot.index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onFocus={() => setHoveredIndex(slot.index)}
                onBlur={() => setHoveredIndex(null)}
                className={`group relative flex min-h-[340px] flex-col justify-between overflow-hidden border border-neutral-800 bg-neutral-950/60 p-6 transition-all duration-500 ease-out hover:border-foreground ${flexClass}`}
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-30 transition-opacity duration-500 group-hover:opacity-60"
                >
                  <div className="absolute inset-x-8 top-16 h-px bg-neutral-800" />
                  <div className="absolute inset-y-8 left-1/2 w-px bg-neutral-800" />
                  <div className="absolute right-10 top-10 h-28 w-28 border border-neutral-800 transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute bottom-14 left-10 h-16 w-44 border border-dashed border-neutral-800" />
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

                <div className="relative z-10 space-y-2 pt-24">
                  <h3 className="text-2xl font-semibold tracking-tight text-white">
                    {slot.item.title}
                  </h3>
                  <p className="font-mono text-xs text-neutral-500">
                    {slot.item.subtitle}
                  </p>
                </div>
              </Link>
            );
          }

          const { project } = slot;
          const title = getLocalizedValue(project.title, locale) || project.slug;
          const description = getLocalizedValue(project.description, locale);
          const openExternal =
            project.open_external_on_click && Boolean(project.project_url);

          const inner = (
            <>
              {project.cover_image ? (
                <Image
                  src={project.cover_image}
                  alt={title}
                  fill
                  unoptimized
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
              ) : (
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-neutral-900"
                >
                  <div className="absolute inset-8 border border-dashed border-neutral-700" />
                </div>
              )}

              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/20 transition-opacity duration-300 group-hover:from-black/90"
              />

              <div className="relative z-10 flex items-center justify-between text-white">
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-300">
                  0{slot.index + 1} /{" "}
                  {project.tags.slice(0, 3).join(" · ") || "WEB"}
                </span>
                <span className="inline-flex items-center gap-1 border border-white/30 bg-black/40 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider backdrop-blur-xs">
                  <span>
                    {openExternal ? openWebsiteLabel : viewProjectLabel}
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </div>

              <div className="relative z-10 space-y-2 pt-28 text-white">
                <h3 className="text-2xl font-semibold tracking-tight md:text-3xl">
                  {title}
                </h3>
                {description && (
                  <p className="line-clamp-2 max-w-xl text-sm text-neutral-200">
                    {description}
                  </p>
                )}
              </div>
            </>
          );

          const sharedClass = `group relative flex min-h-[340px] flex-col justify-between overflow-hidden border border-neutral-800 p-6 transition-all duration-500 ease-out hover:border-foreground ${flexClass}`;

          return openExternal && project.project_url ? (
            <a
              key={project.id}
              href={project.project_url}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => setHoveredIndex(slot.index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onFocus={() => setHoveredIndex(slot.index)}
              onBlur={() => setHoveredIndex(null)}
              className={sharedClass}
            >
              {inner}
            </a>
          ) : (
            <Link
              key={project.id}
              href={`/projects/${project.slug}`}
              onMouseEnter={() => setHoveredIndex(slot.index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onFocus={() => setHoveredIndex(slot.index)}
              onBlur={() => setHoveredIndex(null)}
              className={sharedClass}
            >
              {inner}
            </Link>
          );
        })}
      </div>

      <div className="flex justify-center pt-2">
        <Link
          href="/websites"
          className="inline-flex w-full items-center justify-center gap-2 border border-neutral-700 px-6 py-3.5 font-mono text-xs uppercase tracking-[0.2em] text-white transition-colors hover:border-foreground hover:bg-foreground hover:text-background sm:w-auto"
        >
          <span>{viewAllLabel}</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
