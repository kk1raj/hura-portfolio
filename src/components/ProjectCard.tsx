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
    <div className="relative aspect-video w-full overflow-hidden rounded border border-neutral-800 bg-neutral-900/50">
      <Image
        src={project.cover_image}
        alt={title}
        fill
        unoptimized
        sizes="(max-width: 640px) 100vw, 50vw"
        className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
      />
    </div>
  ) : (
    <div className="aspect-video w-full rounded border border-dashed border-neutral-700 bg-neutral-900/50" />
  );

  return (
    <article className="flex flex-col justify-between gap-4 rounded-lg border border-neutral-800 p-5">
      <div className="space-y-3">
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

        <div className="space-y-1.5">
          {openExternal && primaryExternalUrl ? (
            <a
              href={primaryExternalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-lg font-medium text-white hover:underline underline-offset-4"
            >
              <span>{title}</span>
              <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            </a>
          ) : (
            <Link
              href={detailHref}
              className="block text-lg font-medium text-white hover:underline underline-offset-4"
            >
              {title}
            </Link>
          )}

          {description && (
            <p className="line-clamp-3 text-sm text-neutral-400">
              {description}
            </p>
          )}
        </div>

        {project.tags.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <li
                key={tag}
                className="rounded border border-neutral-800 px-2 py-0.5 font-mono text-xs text-neutral-400"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-900 pt-3 text-sm">
        <Link
          href={detailHref}
          className="inline-flex items-center gap-1.5 font-medium text-white underline underline-offset-4 hover:opacity-80"
        >
          <span>{viewProjectLabel}</span>
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>

        <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-neutral-300">
          {primaryExternalUrl && (
            <a
              href={primaryExternalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 underline underline-offset-4 hover:opacity-80"
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
              className="inline-flex items-center gap-1 underline underline-offset-4 hover:opacity-80"
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
