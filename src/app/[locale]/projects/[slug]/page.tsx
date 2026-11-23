import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { isValidLocale } from "@/i18n/routing";

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
  const t = await getTranslations({ locale, namespace: "projectDetail" });

  return (
    <article className="space-y-8">
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-neutral-600 hover:text-foreground dark:text-neutral-400"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{t("backToDesign")}</span>
        </Link>
        <span className="text-neutral-300 dark:text-neutral-700" aria-hidden="true">
          /
        </span>
        <Link
          href="/websites"
          className="inline-flex items-center gap-1.5 text-neutral-600 hover:text-foreground dark:text-neutral-400"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{t("backToWebsites")}</span>
        </Link>
      </div>

      <header className="space-y-2 border-b border-dashed border-neutral-300 dark:border-neutral-700 pb-6">
        <p className="font-mono text-xs uppercase tracking-widest text-neutral-500">
          {t("badge")}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">{slug}</h1>
        <p className="font-mono text-xs text-neutral-500">
          {t("slugLabel")}: {slug}
        </p>
      </header>

      <div className="space-y-4 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 p-6">
        <h2 className="text-lg font-medium">{t("overviewTitle")}</h2>
        <div className="aspect-video w-full rounded border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-100/50 dark:bg-neutral-900/50" />
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {t("overviewPlaceholder")}
        </p>
      </div>
    </article>
  );
}
