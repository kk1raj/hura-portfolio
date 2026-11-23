import type { Metadata } from "next";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { ContactForm } from "@/components/ContactForm";
import { CookieBanner } from "@/components/CookieBanner";
import { CookieSettingsButton } from "@/components/CookieSettingsButton";
import { Header } from "@/components/Header";
import { SocialContactButtons } from "@/components/SocialContactButtons";
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

  const [messages, tContact, tFooter, tNav, tCommon, settings] =
    await Promise.all([
      getMessages(),
      getTranslations({ locale, namespace: "contact" }),
      getTranslations({ locale, namespace: "footer" }),
      getTranslations({ locale, namespace: "nav" }),
      getTranslations({ locale, namespace: "common" }),
      getSiteSettings(),
    ]);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="min-h-screen flex flex-col">
        <Header brandName={settings.fullName} />

        <main className="flex-1 mx-auto w-full max-w-[1440px] px-6 py-12 md:px-12">
          {children}
        </main>

        <section
          id="contact"
          aria-labelledby="contact-heading"
          className="border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-950/40"
        >
          <div className="mx-auto max-w-[1440px] px-6 py-10 md:px-12">
            <div className="mx-auto max-w-3xl space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-4">
                <div className="space-y-1">
                  <h2
                    id="contact-heading"
                    className="text-lg font-semibold uppercase tracking-[0.14em]"
                  >
                    {tContact("title")}
                  </h2>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    {tContact("subtitle")}
                  </p>
                </div>

                <span className="border border-neutral-300 dark:border-neutral-700 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider">
                  {settings.availableForWork
                    ? tCommon("availableForWork")
                    : tCommon("unavailableForWork")}
                </span>
              </div>

              <ContactForm />

              <div className="border-t border-dashed border-neutral-200 dark:border-neutral-800 pt-4">
                <SocialContactButtons settings={settings} />
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-neutral-200 dark:border-neutral-800">
          <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-6 py-6 text-xs text-neutral-500 md:px-12">
            <p>{tFooter("rights")}</p>
            <div className="flex flex-wrap items-center gap-4">
              <CookieSettingsButton />
              <Link
                href="/privacy"
                className="hover:text-foreground underline underline-offset-4"
              >
                {tNav("privacy")}
              </Link>
              <NextLink
                href="/admin"
                className="hover:text-foreground underline underline-offset-4"
              >
                {tNav("admin")}
              </NextLink>
            </div>
          </div>
        </footer>

        <CookieBanner />
      </div>
    </NextIntlClientProvider>
  );
}
