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
      <article className="mx-auto w-full max-w-[1440px] space-y-8 px-4 pt-32 pb-16 sm:px-6 md:px-10 md:pt-24">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <Link
            href="/design"
            className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{t("backToDesign")}</span>
          </Link>
          <span className="text-neutral-700" aria-hidden="true">
            /
          </span>
          <Link
            href="/websites"
            className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{t("backToWebsites")}</span>
          </Link>
        </div>

        <header className="space-y-2 border-b border-dashed border-neutral-800 pb-6">
          <p className="font-mono text-xs uppercase tracking-widest text-neutral-500">
            {t("badge")}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            {slug}
          </h1>
          <p className="font-mono text-xs text-neutral-500">
            {t("slugLabel")}: {slug}
          </p>
        </header>

        <div className="space-y-4 rounded-lg border border-dashed border-neutral-800 p-6">
          <h2 className="text-lg font-medium text-white">
            {t("overviewTitle")}
          </h2>
          <div className="aspect-video w-full rounded border border-dashed border-neutral-700 bg-neutral-900/50" />
          <p className="text-sm text-neutral-400">{t("overviewPlaceholder")}</p>
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
    <article className="mx-auto w-full max-w-[1440px] space-y-8 px-4 pt-32 pb-16 sm:px-6 md:px-10 md:pt-24">
      <div>
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{backLabel}</span>
        </Link>
      </div>

      <header className="space-y-4 border-b border-dashed border-neutral-800 pb-6">
        <p className="font-mono text-xs uppercase tracking-widest text-neutral-500">
          {project.section}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          {title}
        </h1>

        {project.tags.length > 0 && (
          <ul aria-label={t("tagsTitle")} className="flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <li
                key={tag}
                className="rounded border border-neutral-800 px-2.5 py-0.5 font-mono text-xs text-neutral-400"
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
                className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-neutral-900"
              >
                <span>{item.label}</span>
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            ))}
          </div>
        )}
      </header>

      {project.cover_image && (
        <div className="overflow-hidden rounded-lg border border-neutral-800">
          <Image
            src={project.cover_image}
            alt={title}
            width={1280}
            height={720}
            unoptimized
            className="h-auto w-full object-cover"
          />
        </div>
      )}

      {description && (
        <section className="space-y-2 rounded-lg border border-neutral-800 p-6">
          <h2 className="text-lg font-medium text-white">
            {t("overviewTitle")}
          </h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-300">
            {description}
          </p>
        </section>
      )}

      {project.gallery.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-medium text-white">
            {t("galleryTitle")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {project.gallery.map((imageUrl, idx) => (
              <div
                key={`${imageUrl}-${idx}`}
                className="overflow-hidden rounded-lg border border-neutral-800"
              >
                <Image
                  src={imageUrl}
                  alt={`${title} — ${idx + 1}`}
                  width={1200}
                  height={800}
                  unoptimized
                  className="h-auto w-full object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
