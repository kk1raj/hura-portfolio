"use client";

import { useLocale, useTranslations } from "next-intl";
import { Globe, Mail } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { LOCALES, type Locale } from "@/i18n/routing";

interface NavTab {
  key: "design" | "websites" | "cv";
  href: "/design" | "/websites" | "/cv";
  isActive: (pathname: string) => boolean;
}

const NAV_TABS: readonly NavTab[] = [
  {
    key: "design",
    href: "/design",
    isActive: (pathname) =>
      pathname === "/design" || pathname.startsWith("/design/"),
  },
  {
    key: "websites",
    href: "/websites",
    isActive: (pathname) =>
      pathname === "/websites" || pathname.startsWith("/websites/"),
  },
  {
    key: "cv",
    href: "/cv",
    isActive: (pathname) =>
      pathname === "/cv" || pathname.startsWith("/cv/"),
  },
];

export function Header() {
  const t = useTranslations("nav");
  const currentLocale = useLocale() as Locale;
  const pathname = usePathname();
  const isHomeActive = pathname === "/";

  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800 bg-background">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/"
            aria-current={isHomeActive ? "page" : undefined}
            className={
              isHomeActive
                ? "rounded px-3 py-1.5 text-sm font-semibold uppercase tracking-wider bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                : "rounded px-2 py-1.5 text-sm font-semibold uppercase tracking-wider text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-900"
            }
          >
            {t("brand")}
          </Link>

          <nav
            aria-label={t("brand")}
            className="flex items-center gap-1 rounded-md border border-neutral-200 dark:border-neutral-800 p-1"
          >
            {NAV_TABS.map((tab) => {
              const active = tab.isActive(pathname);
              return (
                <Link
                  key={tab.key}
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  className={
                    active
                      ? "rounded px-3 py-1.5 text-sm font-medium bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                      : "rounded px-3 py-1.5 text-sm font-medium text-neutral-600 hover:text-foreground dark:text-neutral-400 dark:hover:text-foreground"
                  }
                >
                  {t(tab.key)}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div
            role="group"
            aria-label={t("languageLabel")}
            className="flex items-center gap-1 rounded-md border border-neutral-200 dark:border-neutral-800 px-2 py-1 text-xs"
          >
            <Globe className="mr-1 h-3.5 w-3.5 text-neutral-500" aria-hidden="true" />
            {LOCALES.map((loc, index) => {
              const isCurrent = loc === currentLocale;
              return (
                <span key={loc} className="inline-flex items-center">
                  {index > 0 && (
                    <span
                      className="mx-1 text-neutral-300 dark:text-neutral-700"
                      aria-hidden="true"
                    >
                      |
                    </span>
                  )}
                  <Link
                    href={pathname}
                    locale={loc}
                    aria-current={isCurrent ? "true" : undefined}
                    className={
                      isCurrent
                        ? "font-bold underline underline-offset-4 text-foreground"
                        : "text-neutral-500 hover:text-foreground dark:text-neutral-400"
                    }
                  >
                    {loc.toUpperCase()}
                  </Link>
                </span>
              );
            })}
          </div>

          <a
            href="#contact"
            className="inline-flex items-center gap-1.5 rounded-md border border-neutral-900 dark:border-neutral-200 px-3 py-1.5 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
          >
            <Mail className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{t("contactCta")}</span>
          </a>
        </div>
      </div>
    </header>
  );
}
