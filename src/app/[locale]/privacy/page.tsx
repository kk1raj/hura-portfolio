import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { isValidLocale } from "@/i18n/routing";

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "privacy" });

  return (
    <article className="max-w-3xl space-y-8">
      <header className="space-y-2 border-b border-dashed border-neutral-300 dark:border-neutral-700 pb-6">
        <p className="font-mono text-xs uppercase tracking-widest text-neutral-500">
          {t("badge")}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="font-mono text-xs text-neutral-500">{t("updatedAt")}</p>
      </header>

      <div className="space-y-6 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
        <p>{t("intro")}</p>

        <section className="space-y-2">
          <h2 className="text-base font-medium text-foreground">
            {t("dataCollectionTitle")}
          </h2>
          <p>{t("dataCollectionText")}</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-medium text-foreground">
            {t("contactTitle")}
          </h2>
          <p>{t("contactText")}</p>
        </section>
      </div>
    </article>
  );
}
