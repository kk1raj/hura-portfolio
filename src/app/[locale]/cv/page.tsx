import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LanguageBadgesRow } from "@/components/LanguageBadgesRow";
import { isValidLocale } from "@/i18n/routing";
import { getCvData, getLocalizedValue, getSiteSettings } from "@/lib/data";
import { buildLocalizedMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};
  const t = await getTranslations({ locale, namespace: "cv" });
  return buildLocalizedMetadata({
    locale,
    pathname: "/cv",
    title: t("title"),
    description: t("subtitle"),
  });
}

export default async function CvPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const [t, tCommon, cvData, settings] = await Promise.all([
    getTranslations({ locale, namespace: "cv" }),
    getTranslations({ locale, namespace: "common" }),
    getCvData(),
    getSiteSettings(),
  ]);

  const aboutText = getLocalizedValue(cvData.about, locale) || t("summaryText");

  return (
    <section className="mx-auto w-full max-w-[1440px] space-y-10 px-4 pt-32 pb-16 sm:px-6 md:px-10 md:pt-24">
      <header className="space-y-3 border-b border-neutral-800 pb-8">
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500">
            {t("badge")}
          </p>
          <span className="inline-flex items-center gap-2 rounded border border-neutral-700 px-2.5 py-0.5 text-xs font-medium text-white">
            <span
              className={`h-2 w-2 rounded-full ${
                settings.availableForWork ? "bg-emerald-400" : "bg-amber-400"
              }`}
              aria-hidden="true"
            />
            <span>
              {settings.availableForWork
                ? tCommon("availableForWork")
                : tCommon("unavailableForWork")}
            </span>
          </span>
        </div>

        <div className="flex flex-wrap items-baseline gap-3">
          <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
            {settings.fullName || t("title")}
          </h1>
          {settings.nickname && (
            <span className="font-mono text-sm text-neutral-500">
              @{settings.nickname}
            </span>
          )}
        </div>

        <p className="max-w-3xl text-sm text-neutral-400">{t("subtitle")}</p>
      </header>

      <div className="space-y-8">
        <article className="space-y-3 border border-neutral-800 p-6">
          <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-neutral-500">
            {t("summaryTitle")}
          </h2>
          <p className="max-w-4xl whitespace-pre-line text-sm leading-relaxed text-neutral-300">
            {aboutText}
          </p>
        </article>

        <article className="space-y-4 border border-neutral-800 p-6">
          <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-neutral-500">
            {t("languagesTitle")}
          </h2>
          <LanguageBadgesRow
            languages={cvData.languages}
            emptyText={t("languagesEmpty")}
          />
        </article>

        <div className="grid gap-6 lg:grid-cols-2">
          <article className="space-y-4 border border-neutral-800 p-6">
            <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-neutral-500">
              {t("educationTitle")}
            </h2>
            {cvData.education.length > 0 ? (
              <ul className="space-y-3">
                {cvData.education.map((item, idx) => (
                  <li
                    key={`${item.degree}-${idx}`}
                    className="flex flex-wrap items-baseline justify-between gap-2 border-b border-dashed border-neutral-800 pb-3 last:border-b-0 last:pb-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">
                        {item.degree}
                      </p>
                      <p className="text-xs text-neutral-400">
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
              <p className="text-sm text-neutral-500">{t("educationEmpty")}</p>
            )}
          </article>

          <article className="space-y-4 border border-neutral-800 p-6">
            <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-neutral-500">
              {t("skillsTitle")}
            </h2>
            {cvData.skillCategories.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2">
                {cvData.skillCategories.map((group, idx) => (
                  <div key={`${group.category}-${idx}`} className="space-y-2">
                    <h3 className="text-sm font-semibold text-white">
                      {group.category}
                    </h3>
                    <ul className="flex flex-wrap gap-1.5">
                      {group.skills.map((skill) => (
                        <li
                          key={skill}
                          className="border border-neutral-800 px-2.5 py-0.5 font-mono text-xs text-neutral-300"
                        >
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-400">
                {t("skillsPlaceholder")}
              </p>
            )}
          </article>
        </div>
      </div>
    </section>
  );
}
