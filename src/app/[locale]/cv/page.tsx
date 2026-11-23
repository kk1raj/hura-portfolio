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
    <section className="space-y-8">
      <header className="liquid-glass space-y-4 rounded-[36px] p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="liquid-pill rounded-full px-3.5 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-white/90">
            {t("badge")}
          </span>
          <span className="liquid-pill inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-medium text-white">
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
          <h1 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">
            {settings.fullName || t("title")}
          </h1>
          {settings.nickname && (
            <span className="font-mono text-sm text-white/55">
              @{settings.nickname}
            </span>
          )}
        </div>

        <p className="max-w-3xl text-sm text-white/70">{t("subtitle")}</p>
      </header>

      <div className="space-y-6">
        <article className="liquid-glass space-y-3 rounded-[32px] p-6 sm:p-8">
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-white/55">
            {t("summaryTitle")}
          </h2>
          <p className="max-w-4xl whitespace-pre-line text-sm leading-relaxed text-white/85 sm:text-base">
            {aboutText}
          </p>
        </article>

        <article className="liquid-glass space-y-4 rounded-[32px] p-6 sm:p-8">
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-white/55">
            {t("languagesTitle")}
          </h2>
          <LanguageBadgesRow
            languages={cvData.languages}
            emptyText={t("languagesEmpty")}
          />
        </article>

        <div className="grid gap-6 lg:grid-cols-2">
          <article className="liquid-glass space-y-4 rounded-[32px] p-6 sm:p-8">
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-white/55">
              {t("educationTitle")}
            </h2>
            {cvData.education.length > 0 ? (
              <ul className="space-y-3">
                {cvData.education.map((item, idx) => (
                  <li
                    key={`${item.degree}-${idx}`}
                    className="flex flex-wrap items-baseline justify-between gap-2 border-b border-white/10 pb-3 last:border-b-0 last:pb-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">
                        {item.degree}
                      </p>
                      <p className="text-xs text-white/60">{item.institution}</p>
                    </div>
                    <span className="font-mono text-xs text-white/60">
                      {item.period}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-white/60">{t("educationEmpty")}</p>
            )}
          </article>

          <article className="liquid-glass space-y-4 rounded-[32px] p-6 sm:p-8">
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-white/55">
              {t("skillsTitle")}
            </h2>
            {cvData.skillCategories.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {cvData.skillCategories.map((group, idx) => (
                  <div key={`${group.category}-${idx}`} className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-white/75">
                      {group.category}
                    </h3>
                    <ul className="flex flex-wrap gap-1.5">
                      {group.skills.map((skill) => (
                        <li
                          key={skill}
                          className="rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 font-mono text-xs text-white/90"
                        >
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/60">{t("skillsPlaceholder")}</p>
            )}
          </article>
        </div>
      </div>
    </section>
  );
}
