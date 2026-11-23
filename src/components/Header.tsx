"use client";

import { useLocale, useTranslations } from "next-intl";
import { Mail } from "lucide-react";
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

interface HeaderProps {
  brandName?: string;
}

export function Header({ brandName }: HeaderProps) {
  const t = useTranslations("nav");
  const currentLocale = useLocale() as Locale;
  const pathname = usePathname();
  const isHomeActive = pathname === "/";
  const displayBrand = brandName?.trim() || t("brand");

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/80 dark:border-neutral-800/80 bg-background/95 backdrop-blur-sm">
      <div className="mx-auto grid max-w-[1440px] grid-cols-2 items-center gap-4 px-6 py-4 md:grid-cols-3 md:px-12">
        <div className="justify-self-start">
          <Link
            href="/"
            aria-current={isHomeActive ? "page" : undefined}
            className={
              isHomeActive
                ? "inline-block border-b border-foreground pb-0.5 text-xs font-semibold uppercase tracking-[0.24em] text-foreground"
                : "inline-block text-xs font-semibold uppercase tracking-[0.24em] text-neutral-600 transition-colors hover:text-foreground dark:text-neutral-400"
            }
          >
            {displayBrand}
          </Link>
        </div>

        <nav
          aria-label={t("brand")}
          className="col-span-2 order-3 flex items-center justify-center gap-6 border-t border-neutral-200/70 pt-3 dark:border-neutral-800/70 md:col-span-1 md:order-2 md:border-t-0 md:pt-0"
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
                    ? "border-b border-foreground pb-0.5 text-xs font-semibold uppercase tracking-[0.18em] text-foreground"
                    : "pb-0.5 text-xs font-medium uppercase tracking-[0.18em] text-neutral-500 transition-colors hover:text-foreground dark:text-neutral-400"
                }
              >
                {t(tab.key)}
              </Link>
            );
          })}
        </nav>

        <div className="order-2 flex items-center justify-self-end gap-3 md:order-3">
          <div
            role="group"
            aria-label={t("languageLabel")}
            className="flex items-center gap-1 text-[11px] font-mono tracking-wider"
          >
            {LOCALES.map((loc, index) => {
              const isCurrent = loc === currentLocale;
              return (
                <span key={loc} className="inline-flex items-center">
                  {index > 0 && (
                    <span
                      className="mx-1 text-neutral-300 dark:text-neutral-700"
                      aria-hidden="true"
                    >
                      /
                    </span>
                  )}
                  <Link
                    href={pathname}
                    locale={loc}
                    aria-current={isCurrent ? "true" : undefined}
                    className={
                      isCurrent
                        ? "font-bold text-foreground underline underline-offset-4"
                        : "text-neutral-500 transition-colors hover:text-foreground dark:text-neutral-400"
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
            className="inline-flex items-center gap-1.5 border border-foreground/30 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
          >
            <Mail className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{t("contactCta")}</span>
          </a>
        </div>
      </div>
    </header>
  );
}
