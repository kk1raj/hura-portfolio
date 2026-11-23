import Image from "next/image";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getLocalizedValue, type Project } from "@/types/portfolio";

interface ProjectCardProps {
  project: Project;
  locale: Locale;
  viewProjectLabel: string;
  openDesignLabel: string;
  openWebsiteLabel: string;
  githubLabel: string;
}

export function ProjectCard({
  project,
  locale,
  viewProjectLabel,
  openDesignLabel,
  openWebsiteLabel,
  githubLabel,
}: ProjectCardProps) {
  const title = getLocalizedValue(project.title, locale) || project.slug;
  const description = getLocalizedValue(project.description, locale);
  const primaryExternalUrl =
    project.section === "design"
      ? project.project_url || project.figma_url
      : project.project_url;
  const openExternal =
    project.open_external_on_click && Boolean(primaryExternalUrl);
  const detailHref = `/projects/${project.slug}`;

  const coverNode = project.cover_image ? (
    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[26px] border border-white/15 bg-black/40">
      <Image
        src={project.cover_image}
        alt={title}
        fill
        unoptimized
        sizes="(max-width: 640px) 100vw, 50vw"
        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
      />
    </div>
  ) : (
    <div className="aspect-[16/10] w-full rounded-[26px] border border-dashed border-white/20 bg-white/[0.04]" />
  );

  return (
    <article className="liquid-glass flex flex-col justify-between gap-4 rounded-[36px] p-4 transition-all duration-300 hover:border-white/35">
      <div className="space-y-4">
        {openExternal && primaryExternalUrl ? (
          <a
            href={primaryExternalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group block"
          >
            {coverNode}
          </a>
        ) : (
          <Link href={detailHref} className="group block">
            {coverNode}
          </Link>
        )}

        <div className="space-y-2 px-2">
          {openExternal && primaryExternalUrl ? (
            <a
              href={primaryExternalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-lg font-semibold text-white hover:underline underline-offset-4"
            >
              <span>{title}</span>
              <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            </a>
          ) : (
            <Link
              href={detailHref}
              className="block text-lg font-semibold text-white hover:underline underline-offset-4"
            >
              {title}
            </Link>
          )}

          {description && (
            <p className="line-clamp-3 text-sm text-white/70">{description}</p>
          )}

          {project.tags.length > 0 && (
            <ul className="flex flex-wrap gap-1.5 pt-1">
              {project.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 font-mono text-xs text-white/85"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-2 pt-3 text-sm">
        <Link
          href={detailHref}
          className="liquid-pill inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium text-white transition-transform hover:scale-105 active:scale-95"
        >
          <span>{viewProjectLabel}</span>
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          {primaryExternalUrl && (
            <a
              href={primaryExternalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="liquid-pill inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-white/90 transition-transform hover:scale-105 active:scale-95"
            >
              <span>
                {project.section === "design"
                  ? openDesignLabel
                  : openWebsiteLabel}
              </span>
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          )}
          {project.section === "websites" && project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="liquid-pill inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-white/90 transition-transform hover:scale-105 active:scale-95"
            >
              <span>{githubLabel}</span>
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
