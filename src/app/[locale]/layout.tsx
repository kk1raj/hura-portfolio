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
import { ContactsList } from "@/components/ContactsList";
import { CookieBanner } from "@/components/CookieBanner";
import { CookieSettingsButton } from "@/components/CookieSettingsButton";
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
        <Header />

        <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-10">
          {children}
        </main>

        <section
          id="contact"
          aria-labelledby="contact-heading"
          className="border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50"
        >
          <div className="mx-auto max-w-5xl px-4 py-12">
            <div className="grid gap-10 md:grid-cols-2">
              <div className="space-y-5">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2
                      id="contact-heading"
                      className="text-xl font-semibold tracking-tight"
                    >
                      {tContact("title")}
                    </h2>
                    <span className="rounded border border-neutral-300 dark:border-neutral-700 px-2 py-0.5 text-xs font-medium">
                      {settings.availableForWork
                        ? tCommon("availableForWork")
                        : tCommon("unavailableForWork")}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {tContact("subtitle")}
                  </p>
                </div>

                <div className="space-y-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-background p-4">
                  <h3 className="font-mono text-xs uppercase tracking-wider text-neutral-500">
                    {tContact("directLinksTitle")}
                  </h3>
                  <ContactsList
                    settings={settings}
                    copyLabel={tCommon("copy")}
                    copiedLabel={tCommon("copied")}
                    emptyText={tContact("noDirectContacts")}
                  />
                </div>
              </div>

              <ContactForm />
            </div>
          </div>
        </section>

        <footer className="border-t border-neutral-200 dark:border-neutral-800">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-6 text-xs text-neutral-500">
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
