import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { isValidLocale } from "@/i18n/routing";
import { getLocalizedValue, getProjectBySlug } from "@/lib/data";
import { buildLocalizedMetadata } from "@/lib/seo";

const DEMO_SLUGS = new Set(["design-case-study", "web-platform"]);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isValidLocale(locale)) return {};

  const [t, project] = await Promise.all([
    getTranslations({ locale, namespace: "projectDetail" }),
    getProjectBySlug(slug),
  ]);

  if (!project) {
    return buildLocalizedMetadata({
      locale,
      pathname: `/projects/${slug}`,
      title: DEMO_SLUGS.has(slug) ? slug : t("notFoundTitle"),
      description: DEMO_SLUGS.has(slug)
        ? t("overviewPlaceholder")
        : t("notFoundDescription"),
    });
  }

  const title = getLocalizedValue(project.title, locale) || project.slug;
  const description =
    getLocalizedValue(project.description, locale) || t("overviewTitle");

  return buildLocalizedMetadata({
    locale,
    pathname: `/projects/${slug}`,
    title,
    description: description.slice(0, 160),
    images: project.cover_image ? [project.cover_image] : undefined,
  });
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isValidLocale(locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const [t, tCommon, project] = await Promise.all([
    getTranslations({ locale, namespace: "projectDetail" }),
    getTranslations({ locale, namespace: "common" }),
    getProjectBySlug(slug),
  ]);

  if (!project) {
    if (!DEMO_SLUGS.has(slug)) {
      notFound();
    }

    return (
      <article className="space-y-8">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link
            href="/design"
            className="liquid-pill inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs text-white transition-transform hover:scale-105"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{t("backToDesign")}</span>
          </Link>
          <Link
            href="/websites"
            className="liquid-pill inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs text-white transition-transform hover:scale-105"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{t("backToWebsites")}</span>
          </Link>
        </div>

        <header className="liquid-glass space-y-2 rounded-[32px] p-6 sm:p-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/55">
            {t("badge")}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            {slug}
          </h1>
          <p className="font-mono text-xs text-white/55">
            {t("slugLabel")}: {slug}
          </p>
        </header>

        <div className="liquid-glass space-y-4 rounded-[36px] p-6 sm:p-8">
          <h2 className="text-lg font-medium text-white">
            {t("overviewTitle")}
          </h2>
          <div className="aspect-video w-full rounded-[26px] border border-dashed border-white/20 bg-white/[0.04]" />
          <p className="text-sm text-white/70">{t("overviewPlaceholder")}</p>
        </div>
      </article>
    );
  }

  const title = getLocalizedValue(project.title, locale) || project.slug;
  const description = getLocalizedValue(project.description, locale);
  const backHref = project.section === "websites" ? "/websites" : "/design";
  const backLabel =
    project.section === "websites" ? t("backToWebsites") : t("backToDesign");

  const primaryDesignUrl = project.project_url || project.figma_url;
  const externalLinks =
    project.section === "design"
      ? primaryDesignUrl
        ? [{ label: tCommon("openDesignLink"), href: primaryDesignUrl }]
        : []
      : [
          project.project_url
            ? { label: tCommon("openWebsiteLink"), href: project.project_url }
            : null,
          project.github_url
            ? { label: tCommon("githubUrl"), href: project.github_url }
            : null,
        ].filter((item): item is { label: string; href: string } => item !== null);

  return (
    <article className="space-y-8">
      <div>
        <Link
          href={backHref}
          className="liquid-pill inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium text-white transition-transform hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{backLabel}</span>
        </Link>
      </div>

      <header className="liquid-glass space-y-4 rounded-[36px] p-6 sm:p-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/55">
          {project.section}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
          {title}
        </h1>

        {project.tags.length > 0 && (
          <ul aria-label={t("tagsTitle")} className="flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full border border-white/20 bg-white/10 px-3 py-0.5 font-mono text-xs text-white/85"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}

        {externalLinks.length > 0 && (
          <div aria-label={t("linksTitle")} className="flex flex-wrap gap-2.5 pt-1">
            {externalLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="liquid-drop-active inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-white transition-transform hover:scale-105 active:scale-95"
              >
                <span>{item.label}</span>
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            ))}
          </div>
        )}
      </header>

      {project.cover_image && (
        <div className="liquid-glass overflow-hidden rounded-[36px] p-3">
          <Image
            src={project.cover_image}
            alt={title}
            width={1280}
            height={720}
            unoptimized
            className="h-auto w-full rounded-[26px] object-cover"
          />
        </div>
      )}

      {description && (
        <section className="liquid-glass space-y-2 rounded-[32px] p-6 sm:p-8">
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-white/55">
            {t("overviewTitle")}
          </h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-white/85 sm:text-base">
            {description}
          </p>
        </section>
      )}

      {project.gallery.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-white/55 px-1">
            {t("galleryTitle")}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {project.gallery.map((imageUrl, idx) => (
              <div
                key={`${imageUrl}-${idx}`}
                className="liquid-glass overflow-hidden rounded-[32px] p-3"
              >
                <Image
                  src={imageUrl}
                  alt={`${title} — ${idx + 1}`}
                  width={1200}
                  height={800}
                  unoptimized
                  className="h-auto w-full rounded-[24px] object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
