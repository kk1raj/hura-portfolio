import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { isValidLocale } from "@/i18n/routing";

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
  const t = await getTranslations({ locale, namespace: "cv" });

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

      <div className="space-y-6">
        <article className="space-y-2 rounded-lg border border-neutral-200 dark:border-neutral-800 p-5">
          <h2 className="text-lg font-medium">{t("summaryTitle")}</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {t("summaryText")}
          </p>
        </article>

        <article className="space-y-2 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 p-5">
          <h2 className="text-lg font-medium">{t("experienceTitle")}</h2>
          <p className="text-sm text-neutral-500">{t("experiencePlaceholder")}</p>
        </article>

        <article className="space-y-2 rounded-lg border border-neutral-200 dark:border-neutral-800 p-5">
          <h2 className="text-lg font-medium">{t("skillsTitle")}</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {t("skillsPlaceholder")}
          </p>
        </article>
      </div>
    </section>
  );
}
