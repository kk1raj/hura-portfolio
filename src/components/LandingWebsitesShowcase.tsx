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
    <div className="space-y-8">
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
                className={`liquid-glass group relative flex min-h-[360px] flex-col justify-between overflow-hidden rounded-[36px] p-3.5 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-white/40 active:scale-[0.99] ${flexClass}`}
              >
                <div className="relative flex flex-1 flex-col justify-between overflow-hidden rounded-[28px] border border-white/15 bg-gradient-to-br from-white/10 via-white/[0.03] to-black/60 p-6">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-40 transition-opacity duration-500 group-hover:opacity-70"
                  >
                    <div className="absolute right-8 top-8 h-32 w-32 rounded-[24px] border border-white/25 transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute bottom-20 left-8 h-20 w-48 rounded-[18px] border border-dashed border-white/20" />
                  </div>

                  <div className="relative z-10 flex items-center justify-between">
                    <span className="liquid-pill rounded-full px-3.5 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-white/90">
                      {slot.item.tag}
                    </span>
                    <span className="liquid-pill flex h-9 w-9 items-center justify-center rounded-full text-white transition-transform duration-300 group-hover:scale-110">
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </div>

                  <div className="relative z-10 flex items-end justify-between gap-4 pt-24">
                    <div className="liquid-glass rounded-[22px] px-4 py-3">
                      <h3 className="text-xl font-semibold tracking-tight text-white">
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

          const { project } = slot;
          const title = getLocalizedValue(project.title, locale) || project.slug;
          const description = getLocalizedValue(project.description, locale);
          const openExternal =
            project.open_external_on_click && Boolean(project.project_url);

          const inner = (
            <div className="relative flex flex-1 flex-col justify-between overflow-hidden rounded-[28px] border border-white/15 p-5 sm:p-6">
              {project.cover_image ? (
                <Image
                  src={project.cover_image}
                  alt={title}
                  fill
                  unoptimized
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                />
              ) : (
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-br from-indigo-950/60 via-neutral-900 to-black"
                />
              )}

              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/20"
              />

              <div className="relative z-10 flex items-center justify-between gap-3">
                <span className="liquid-pill rounded-full px-3.5 py-1 font-mono text-[11px] uppercase tracking-[0.16em] text-white">
                  0{slot.index + 1} · {project.tags.slice(0, 3).join(" · ") || "WEB"}
                </span>
                <span className="liquid-pill inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs font-medium text-white transition-transform duration-300 group-hover:scale-105">
                  <span>
                    {openExternal ? openWebsiteLabel : viewProjectLabel}
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </div>

              <div className="relative z-10 pt-28">
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
          );

          const sharedClass = `liquid-glass group relative flex min-h-[360px] flex-col overflow-hidden rounded-[36px] p-3.5 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-white/40 active:scale-[0.99] ${flexClass}`;

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

      <div className="flex justify-center">
        <Link
          href="/websites"
          className="liquid-pill inline-flex w-full items-center justify-center gap-2 rounded-full px-8 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-all duration-300 hover:scale-[1.03] hover:bg-white/20 active:scale-95 sm:w-auto"
        >
          <span>{viewAllLabel}</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
