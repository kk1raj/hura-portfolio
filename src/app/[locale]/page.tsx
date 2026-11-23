import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { DesignSection } from "@/components/DesignSection";
import { isValidLocale } from "@/i18n/routing";

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

  return <DesignSection locale={locale} />;
}
