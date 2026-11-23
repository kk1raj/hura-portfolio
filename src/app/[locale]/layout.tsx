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

  const displayBrand = settings.fullName?.trim() || tNav("brand");

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <svg
        aria-hidden="true"
        className="pointer-events-none fixed h-0 w-0 overflow-hidden"
      >
        <defs>
          <filter id="glass-refract" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.015 0.055"
              numOctaves="2"
              seed="7"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="6"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      <div className="min-h-screen flex flex-col">
        <Header brandName={settings.fullName} />

        <main className="flex-1 w-full">{children}</main>

        <footer className="glass-bar relative overflow-hidden border-t border-white/10">
          <div
            aria-hidden="true"
            className="glass-refract-edge pointer-events-none absolute inset-x-0 top-0 h-3 opacity-85"
          />

          <div className="relative z-10 mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-4 pt-6 pb-24 text-xs text-white/60 sm:px-6 md:px-10 md:py-6 md:pr-64">
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/"
                className="glass-pill rounded-full px-3.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:border-white/35"
              >
                {displayBrand}
              </Link>
              <p>{tFooter("rights")}</p>
            </div>

            <nav
              aria-label={tNav("brand")}
              className="flex flex-wrap items-center gap-1.5"
            >
              <Link
                href="/design"
                className="rounded-full px-3 py-1.5 text-white/75 transition-colors hover:bg-white/10 hover:text-white"
              >
                {tNav("design")}
              </Link>
              <Link
                href="/websites"
                className="rounded-full px-3 py-1.5 text-white/75 transition-colors hover:bg-white/10 hover:text-white"
              >
                {tNav("websites")}
              </Link>
              <Link
                href="/cv"
                className="rounded-full px-3 py-1.5 text-white/75 transition-colors hover:bg-white/10 hover:text-white"
              >
                {tNav("cv")}
              </Link>
            </nav>

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
