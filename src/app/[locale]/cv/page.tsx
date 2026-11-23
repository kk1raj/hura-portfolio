import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContactsList } from "@/components/ContactsList";
import { PrintCvButton } from "@/components/PrintCvButton";
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
  const hasContacts = Boolean(
    settings.email.trim() ||
      settings.telegram.trim() ||
      settings.github.trim() ||
      settings.figma.trim()
  );

  return (
    <section className="space-y-8 print:space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-dashed border-neutral-300 dark:border-neutral-700 pb-6 print:border-solid print:border-neutral-400 print:pb-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-mono text-xs uppercase tracking-widest text-neutral-500">
              {t("badge")}
            </p>
            <span className="rounded border border-neutral-300 dark:border-neutral-700 px-2 py-0.5 text-xs font-medium print:border-neutral-500">
              {settings.availableForWork
                ? tCommon("availableForWork")
                : tCommon("unavailableForWork")}
            </span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="max-w-2xl text-sm text-neutral-600 dark:text-neutral-400 print:text-neutral-700">
            {t("subtitle")}
          </p>
        </div>

        <PrintCvButton label={t("printPdf")} />
      </header>

      <div className="space-y-6 print:space-y-4">
        {hasContacts && (
          <article className="space-y-3 rounded-lg border border-neutral-200 dark:border-neutral-800 p-5 print:border-neutral-300 print:p-4 break-inside-avoid">
            <h2 className="text-lg font-medium">{t("contactsTitle")}</h2>
            <ContactsList
              settings={settings}
              copyLabel={tCommon("copy")}
              copiedLabel={tCommon("copied")}
            />
          </article>
        )}

        <article className="space-y-2 rounded-lg border border-neutral-200 dark:border-neutral-800 p-5 print:border-neutral-300 print:p-4 break-inside-avoid">
          <h2 className="text-lg font-medium">{t("summaryTitle")}</h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-600 dark:text-neutral-400 print:text-neutral-800">
            {aboutText}
          </p>
        </article>

        <article className="space-y-4 rounded-lg border border-neutral-200 dark:border-neutral-800 p-5 print:border-neutral-300 print:p-4 break-inside-avoid">
          <h2 className="text-lg font-medium">{t("skillsTitle")}</h2>
          {cvData.skillCategories.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {cvData.skillCategories.map((group, idx) => (
                <div key={`${group.category}-${idx}`} className="space-y-1.5">
                  <h3 className="text-sm font-semibold">{group.category}</h3>
                  <ul className="flex flex-wrap gap-1.5">
                    {group.skills.map((skill) => (
                      <li
                        key={skill}
                        className="rounded border border-neutral-200 dark:border-neutral-800 px-2 py-0.5 font-mono text-xs print:border-neutral-400"
                      >
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {t("skillsPlaceholder")}
            </p>
          )}
        </article>

        <article className="space-y-4 rounded-lg border border-neutral-200 dark:border-neutral-800 p-5 print:border-neutral-300 print:p-4 break-inside-avoid">
          <h2 className="text-lg font-medium">{t("educationTitle")}</h2>
          {cvData.education.length > 0 ? (
            <ul className="space-y-3">
              {cvData.education.map((item, idx) => (
                <li
                  key={`${item.degree}-${idx}`}
                  className="flex flex-wrap items-baseline justify-between gap-2 border-b border-dashed border-neutral-200 dark:border-neutral-800 pb-2 last:border-b-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium">{item.degree}</p>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 print:text-neutral-700">
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

        <article className="space-y-4 rounded-lg border border-neutral-200 dark:border-neutral-800 p-5 print:border-neutral-300 print:p-4 break-inside-avoid">
          <h2 className="text-lg font-medium">{t("languagesTitle")}</h2>
          {cvData.languages.length > 0 ? (
            <ul className="grid gap-2 sm:grid-cols-2">
              {cvData.languages.map((item, idx) => (
                <li
                  key={`${item.language}-${idx}`}
                  className="flex items-center justify-between rounded border border-neutral-200 dark:border-neutral-800 px-3 py-2 text-sm print:border-neutral-300"
                >
                  <span className="font-medium">{item.language}</span>
                  <span className="font-mono text-xs text-neutral-500">
                    {item.level}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-neutral-500">{t("languagesEmpty")}</p>
          )}
        </article>
      </div>
    </section>
  );
}
