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
      <header className="space-y-2 border-b border-white/15 pb-6">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-white/55">
          {t("badge")}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
          {t("title")}
        </h1>
        <p className="max-w-2xl text-sm text-white/65">{t("subtitle")}</p>
      </header>

      {projects.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              locale={locale}
              viewProjectLabel={t("viewProject")}
              openDesignLabel={tCommon("openDesignLink")}
              openWebsiteLabel={tCommon("openWebsiteLink")}
              githubLabel={tCommon("githubUrl")}
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          <article className="liquid-glass flex flex-col justify-between gap-4 rounded-[36px] p-5">
            <div className="space-y-4">
              <div className="aspect-[16/10] w-full rounded-[26px] border border-dashed border-white/20 bg-white/[0.04]" />
              <div className="space-y-1.5 px-1">
                <h2 className="text-lg font-medium text-white">
                  {t("sampleProjectTitle")}
                </h2>
                <p className="text-sm text-white/65">
                  {t("sampleProjectSummary")}
                </p>
              </div>
            </div>
            <div className="px-1">
              <Link
                href="/projects/web-platform"
                className="liquid-pill inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium text-white transition-transform hover:scale-105 active:scale-95"
              >
                <span>{t("viewProject")}</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </article>

          <div className="liquid-glass flex items-center justify-center rounded-[36px] p-8 text-center">
            <p className="text-sm text-white/60">{t("emptyState")}</p>
          </div>
        </div>
      )}
    </section>
  );
}
