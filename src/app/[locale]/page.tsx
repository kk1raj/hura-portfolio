import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { ContactsList } from "@/components/ContactsList";
import { ProjectCard } from "@/components/ProjectCard";
import { Link } from "@/i18n/navigation";
import { isValidLocale } from "@/i18n/routing";
import {
  getCvData,
  getLocalizedValue,
  getProjectsBySection,
  getSiteSettings,
} from "@/lib/data";
import { buildLocalizedMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};
  const t = await getTranslations({ locale, namespace: "meta" });
  return buildLocalizedMetadata({
    locale,
    pathname: "",
    title: t("title"),
    description: t("description"),
  });
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const [
    cvData,
    settings,
    websiteProjects,
    designProjects,
    tCv,
    tWebsites,
    tDesign,
    tCommon,
  ] = await Promise.all([
    getCvData(),
    getSiteSettings(),
    getProjectsBySection("websites"),
    getProjectsBySection("design"),
    getTranslations({ locale, namespace: "cv" }),
    getTranslations({ locale, namespace: "websites" }),
    getTranslations({ locale, namespace: "design" }),
    getTranslations({ locale, namespace: "common" }),
  ]);

  const aboutText = getLocalizedValue(cvData.about, locale) || tCv("summaryText");
  const hasContacts = Boolean(
    settings.email.trim() ||
      settings.telegram.trim() ||
      settings.github.trim() ||
      settings.figma.trim()
  );

  return (
    <div className="space-y-14">
      <section className="space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-dashed border-neutral-300 dark:border-neutral-700 pb-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-mono text-xs uppercase tracking-widest text-neutral-500">
                {tCv("badge")}
              </p>
              <span className="rounded border border-neutral-300 dark:border-neutral-700 px-2 py-0.5 text-xs font-medium">
                {settings.availableForWork
                  ? tCommon("availableForWork")
                  : tCommon("unavailableForWork")}
              </span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">
              {tCv("summaryTitle")}
            </h1>
            <p className="max-w-3xl whitespace-pre-line text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              {aboutText}
            </p>
          </div>

          <Link
            href="/cv"
            className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-medium hover:bg-neutral-100 dark:hover:bg-neutral-900"
          >
            <span>{tCv("title")}</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          <article className="space-y-3 rounded-lg border border-neutral-200 dark:border-neutral-800 p-5">
            <h2 className="text-base font-medium">{tCv("skillsTitle")}</h2>
            {cvData.skillCategories.length > 0 ? (
              <div className="space-y-3">
                {cvData.skillCategories.map((group, idx) => (
                  <div key={`${group.category}-${idx}`} className="space-y-1">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                      {group.category}
                    </h3>
                    <ul className="flex flex-wrap gap-1.5">
                      {group.skills.map((skill) => (
                        <li
                          key={skill}
                          className="rounded border border-neutral-200 dark:border-neutral-800 px-2 py-0.5 font-mono text-xs"
                        >
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-500">
                {tCv("skillsPlaceholder")}
              </p>
            )}
          </article>

          <div className="space-y-4">
            {hasContacts && (
              <article className="space-y-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 p-5">
                <h2 className="text-base font-medium">{tCv("contactsTitle")}</h2>
                <ContactsList
                  settings={settings}
                  copyLabel={tCommon("copy")}
                  copiedLabel={tCommon("copied")}
                />
              </article>
            )}

            <article className="space-y-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 p-5">
              <h2 className="text-base font-medium">{tCv("educationTitle")}</h2>
              {cvData.education.length > 0 ? (
                <ul className="space-y-2">
                  {cvData.education.map((item, idx) => (
                    <li
                      key={`${item.degree}-${idx}`}
                      className="flex flex-wrap items-baseline justify-between gap-2 text-sm"
                    >
                      <span>
                        <strong className="font-medium">{item.degree}</strong>
                        {item.institution ? ` — ${item.institution}` : ""}
                      </span>
                      <span className="font-mono text-xs text-neutral-500">
                        {item.period}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-neutral-500">
                  {tCv("educationEmpty")}
                </p>
              )}
            </article>

            <article className="space-y-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 p-5">
              <h2 className="text-base font-medium">{tCv("languagesTitle")}</h2>
              {cvData.languages.length > 0 ? (
                <ul className="flex flex-wrap gap-2">
                  {cvData.languages.map((item, idx) => (
                    <li
                      key={`${item.language}-${idx}`}
                      className="rounded border border-neutral-200 dark:border-neutral-800 px-2.5 py-1 text-xs"
                    >
                      <span className="font-medium">{item.language}</span>
                      {item.level ? ` (${item.level})` : ""}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-neutral-500">
                  {tCv("languagesEmpty")}
                </p>
              )}
            </article>
          </div>
        </div>
      </section>

      <section className="space-y-6 border-t border-neutral-200 dark:border-neutral-800 pt-10">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1">
            <p className="font-mono text-xs uppercase tracking-widest text-neutral-500">
              {tWebsites("badge")}
            </p>
            <h2 className="text-2xl font-semibold tracking-tight">
              {tWebsites("title")}
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {tWebsites("subtitle")}
            </p>
          </div>
          <Link
            href="/websites"
            className="inline-flex items-center gap-1.5 text-sm font-medium underline underline-offset-4 hover:opacity-80"
          >
            <span>{tWebsites("title")}</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </header>

        {websiteProjects.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2">
            {websiteProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                locale={locale}
                viewProjectLabel={tWebsites("viewProject")}
                openDesignLabel={tCommon("openDesignLink")}
                openWebsiteLabel={tCommon("openWebsiteLink")}
                githubLabel={tCommon("githubUrl")}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 p-6 text-center text-sm text-neutral-500">
            {tWebsites("emptyState")}
          </div>
        )}
      </section>

      <section className="space-y-6 border-t border-neutral-200 dark:border-neutral-800 pt-10">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1">
            <p className="font-mono text-xs uppercase tracking-widest text-neutral-500">
              {tDesign("badge")}
            </p>
            <h2 className="text-2xl font-semibold tracking-tight">
              {tDesign("title")}
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {tDesign("subtitle")}
            </p>
          </div>
          <Link
            href="/design"
            className="inline-flex items-center gap-1.5 text-sm font-medium underline underline-offset-4 hover:opacity-80"
          >
            <span>{tDesign("title")}</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </header>

        {designProjects.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2">
            {designProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                locale={locale}
                viewProjectLabel={tDesign("viewProject")}
                openDesignLabel={tCommon("openDesignLink")}
                openWebsiteLabel={tCommon("openWebsiteLink")}
                githubLabel={tCommon("githubUrl")}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 p-6 text-center text-sm text-neutral-500">
            {tDesign("emptyState")}
          </div>
        )}
      </section>
    </div>
  );
}
