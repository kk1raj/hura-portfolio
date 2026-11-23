import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { ProjectCard } from "@/components/ProjectCard";
import { Link } from "@/i18n/navigation";
import { isValidLocale } from "@/i18n/routing";
import { getProjectsBySection } from "@/lib/data";
import { buildLocalizedMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};
  const t = await getTranslations({ locale, namespace: "websites" });
  return buildLocalizedMetadata({
    locale,
    pathname: "/websites",
    title: t("title"),
    description: t("subtitle"),
  });
}

export default async function WebsitesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const [t, tCommon, projects] = await Promise.all([
    getTranslations({ locale, namespace: "websites" }),
    getTranslations({ locale, namespace: "common" }),
    getProjectsBySection("websites"),
  ]);

  return (
    <section className="space-y-8">
      <header className="space-y-2 border-b border-dashed border-neutral-300 dark:border-neutral-700 pb-6">
        <p className="font-mono text-xs uppercase tracking-widest text-neutral-500">
          {t("badge")}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">
          {t("subtitle")}
        </p>
      </header>

      {projects.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              locale={locale}
              viewProjectLabel={t("viewProject")}
              liveLabel={tCommon("liveUrl")}
              githubLabel={tCommon("githubUrl")}
              figmaLabel={tCommon("figmaUrl")}
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <article className="flex flex-col justify-between gap-4 rounded-lg border border-neutral-200 dark:border-neutral-800 p-5">
            <div className="space-y-3">
              <div className="aspect-video w-full rounded border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-100/50 dark:bg-neutral-900/50" />
              <h2 className="text-lg font-medium">{t("sampleProjectTitle")}</h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {t("sampleProjectSummary")}
              </p>
            </div>
            <div>
              <Link
                href="/projects/web-platform"
                className="inline-flex items-center gap-1.5 text-sm font-medium underline underline-offset-4 hover:opacity-80"
              >
                <span>{t("viewProject")}</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </article>

          <div className="flex items-center justify-center rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 p-5 text-center">
            <p className="text-sm text-neutral-500">{t("emptyState")}</p>
          </div>
        </div>
      )}
    </section>
  );
}
