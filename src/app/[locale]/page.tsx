import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { LandingDesignShowcase } from "@/components/LandingDesignShowcase";
import { LandingWebsitesShowcase } from "@/components/LandingWebsitesShowcase";
import { LanguageBadgesRow } from "@/components/LanguageBadgesRow";
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
    tLanding,
  ] = await Promise.all([
    getCvData(),
    getSiteSettings(),
    getProjectsBySection("websites"),
    getProjectsBySection("design"),
    getTranslations({ locale, namespace: "cv" }),
    getTranslations({ locale, namespace: "websites" }),
    getTranslations({ locale, namespace: "design" }),
    getTranslations({ locale, namespace: "common" }),
    getTranslations({ locale, namespace: "landing" }),
  ]);

  const aboutText = getLocalizedValue(cvData.about, locale) || tCv("summaryText");

  return (
    <div className="space-y-20">
      <section className="space-y-10">
        <header className="space-y-6 border-b border-neutral-200 dark:border-neutral-800 pb-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-xs uppercase tracking-[0.22em] text-neutral-500">
                {tCv("badge")}
              </span>
              <span className="border border-neutral-300 dark:border-neutral-700 px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wider">
                {settings.availableForWork
                  ? tCommon("availableForWork")
                  : tCommon("unavailableForWork")}
              </span>
            </div>

            <Link
              href="/cv"
              className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.16em] text-neutral-600 underline underline-offset-4 hover:text-foreground dark:text-neutral-400"
            >
              <span>{tCv("title")}</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.2fr_1.5fr] lg:items-end">
            <div className="space-y-2">
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                {settings.fullName || "Hurakassi"}
              </h1>
              {settings.nickname && (
                <p className="font-mono text-sm tracking-widest text-neutral-500">
                  @{settings.nickname}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500">
                {tCv("summaryTitle")}
              </h2>
              <p className="whitespace-pre-line text-base leading-relaxed text-neutral-700 dark:text-neutral-300">
                {aboutText}
              </p>
            </div>
          </div>
        </header>

        <div className="space-y-8">
          <div className="space-y-3">
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500">
              {tCv("languagesTitle")}
            </h2>
            <LanguageBadgesRow
              languages={cvData.languages}
              emptyText={tCv("languagesEmpty")}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <article className="space-y-4 border border-neutral-200 dark:border-neutral-800 p-6">
              <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500">
                {tCv("educationTitle")}
              </h2>
              {cvData.education.length > 0 ? (
                <ul className="space-y-3">
                  {cvData.education.map((item, idx) => (
                    <li
                      key={`${item.degree}-${idx}`}
                      className="flex flex-wrap items-baseline justify-between gap-2 border-b border-dashed border-neutral-200 dark:border-neutral-800 pb-3 last:border-b-0 last:pb-0"
                    >
                      <div>
                        <p className="text-sm font-medium">{item.degree}</p>
                        <p className="text-xs text-neutral-500">
                          {item.institution}
                        </p>
                      </div>
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

            <article className="space-y-4 border border-neutral-200 dark:border-neutral-800 p-6">
              <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500">
                {tCv("skillsTitle")}
              </h2>
              {cvData.skillCategories.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {cvData.skillCategories.map((group, idx) => (
                    <div
                      key={`${group.category}-${idx}`}
                      className="space-y-1.5"
                    >
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                        {group.category}
                      </h3>
                      <ul className="flex flex-wrap gap-1.5">
                        {group.skills.map((skill) => (
                          <li
                            key={skill}
                            className="border border-neutral-200 dark:border-neutral-800 px-2.5 py-0.5 font-mono text-xs"
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
          </div>
        </div>
      </section>

      <section className="space-y-8 border-t border-neutral-200 dark:border-neutral-800 pt-14">
        <header className="space-y-2">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-neutral-500">
            {tWebsites("badge")}
          </p>
          <h2 className="text-3xl font-semibold tracking-tight">
            {tWebsites("title")}
          </h2>
          <p className="max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">
            {tWebsites("subtitle")}
          </p>
        </header>

        <LandingWebsitesShowcase
          projects={websiteProjects}
          locale={locale}
          viewProjectLabel={tWebsites("viewProject")}
          openWebsiteLabel={tCommon("openWebsiteLink")}
          viewAllLabel={tLanding("viewAllWebsites")}
          abstractItems={[
            {
              tag: tLanding("abstractWeb1Tag"),
              title: tLanding("abstractWeb1Title"),
              subtitle: tLanding("abstractWeb1Subtitle"),
            },
            {
              tag: tLanding("abstractWeb2Tag"),
              title: tLanding("abstractWeb2Title"),
              subtitle: tLanding("abstractWeb2Subtitle"),
            },
          ]}
        />
      </section>

      <section className="space-y-8 border-t border-neutral-200 dark:border-neutral-800 pt-14">
        <header className="space-y-2">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-neutral-500">
            {tDesign("badge")}
          </p>
          <h2 className="text-3xl font-semibold tracking-tight">
            {tDesign("title")}
          </h2>
          <p className="max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">
            {tDesign("subtitle")}
          </p>
        </header>

        <LandingDesignShowcase
          projects={designProjects}
          locale={locale}
          inspectLabel={tLanding("inspectWork")}
          liveRotationLabel={tLanding("liveRotationBadge")}
          viewAllLabel={tLanding("viewAllDesign")}
          abstractItems={[
            {
              tag: tLanding("abstractDesign1Tag"),
              title: tLanding("abstractDesign1Title"),
              subtitle: tLanding("abstractDesign1Subtitle"),
            },
            {
              tag: tLanding("abstractDesign2Tag"),
              title: tLanding("abstractDesign2Title"),
              subtitle: tLanding("abstractDesign2Subtitle"),
            },
          ]}
        />
      </section>
    </div>
  );
}
