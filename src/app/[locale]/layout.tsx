import type { Metadata } from "next";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { ContactModal } from "@/components/ContactModal";
import { CookieBanner } from "@/components/CookieBanner";
import { CookieSettingsButton } from "@/components/CookieSettingsButton";
import { FloatingSocialDock } from "@/components/FloatingSocialDock";
import { Header } from "@/components/Header";
import { Link } from "@/i18n/navigation";
import { isValidLocale, LOCALES } from "@/i18n/routing";
import { getSiteSettings } from "@/lib/data";
import { buildLocalizedMetadata, getSiteUrl } from "@/lib/seo";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) {
    return {};
  }

  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    metadataBase: new URL(getSiteUrl()),
    ...buildLocalizedMetadata({
      locale,
      pathname: "",
      title: t("title"),
      description: t("description"),
    }),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!isValidLocale(locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const [messages, tFooter, tNav, settings] = await Promise.all([
    getMessages(),
    getTranslations({ locale, namespace: "footer" }),
    getTranslations({ locale, namespace: "nav" }),
    getSiteSettings(),
  ]);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="min-h-screen flex flex-col">
        <Header brandName={settings.fullName} />

        <main className="flex-1 mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 md:px-10 md:py-10">
          {children}
        </main>

        <footer className="border-t border-white/10 pb-20 sm:pb-8">
          <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-6 py-6 text-xs text-white/50 md:px-10">
            <p>{tFooter("rights")}</p>
            <div className="flex flex-wrap items-center gap-4">
              <CookieSettingsButton />
              <Link
                href="/privacy"
                className="underline underline-offset-4 transition-colors hover:text-white"
              >
                {tNav("privacy")}
              </Link>
              <NextLink
                href="/admin"
                className="underline underline-offset-4 transition-colors hover:text-white"
              >
                {tNav("admin")}
              </NextLink>
            </div>
          </div>
        </footer>

        <FloatingSocialDock
          settings={settings}
          contactLabel={tNav("contactCta")}
        />
        <ContactModal availableForWork={settings.availableForWork} />
        <CookieBanner />
      </div>
    </NextIntlClientProvider>
  );
}
