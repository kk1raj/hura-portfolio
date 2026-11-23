import type { Metadata } from "next";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { Header } from "@/components/Header";
import { Link } from "@/i18n/navigation";
import { isValidLocale, LOCALES } from "@/i18n/routing";

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
    title: t("title"),
    description: t("description"),
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

  const [messages, tContact, tFooter, tNav] = await Promise.all([
    getMessages(),
    getTranslations({ locale, namespace: "contact" }),
    getTranslations({ locale, namespace: "footer" }),
    getTranslations({ locale, namespace: "nav" }),
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
            <div className="max-w-xl space-y-6">
              <div className="space-y-1">
                <h2
                  id="contact-heading"
                  className="text-xl font-semibold tracking-tight"
                >
                  {tContact("title")}
                </h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {tContact("subtitle")}
                </p>
              </div>

              <form className="space-y-4">
                <div className="space-y-1">
                  <label
                    htmlFor="contact-name"
                    className="block text-sm font-medium"
                  >
                    {tContact("nameLabel")}
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    placeholder={tContact("namePlaceholder")}
                    className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-background px-3 py-2 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="contact-email"
                    className="block text-sm font-medium"
                  >
                    {tContact("emailLabel")}
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    placeholder={tContact("emailPlaceholder")}
                    className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-background px-3 py-2 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="contact-message"
                    className="block text-sm font-medium"
                  >
                    {tContact("messageLabel")}
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={4}
                    placeholder={tContact("messagePlaceholder")}
                    className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-background px-3 py-2 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    disabled
                    className="rounded-md border border-neutral-300 dark:border-neutral-700 px-4 py-2 text-sm font-medium opacity-60 cursor-not-allowed"
                  >
                    {tContact("submitButton")}
                  </button>
                  <p className="text-xs text-neutral-500">
                    {tContact("note")}
                  </p>
                </div>
              </form>
            </div>
          </div>
        </section>

        <footer className="border-t border-neutral-200 dark:border-neutral-800">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-6 text-xs text-neutral-500">
            <p>{tFooter("rights")}</p>
            <div className="flex items-center gap-4">
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
      </div>
    </NextIntlClientProvider>
  );
}
