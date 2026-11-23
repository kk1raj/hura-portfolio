"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { MessageSquare } from "lucide-react";
import { OPEN_CONTACT_MODAL_EVENT } from "@/components/ContactModal";
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

  const activeNavIndex = NAV_TABS.findIndex((tab) => tab.isActive(pathname));
  const [hoveredNavIndex, setHoveredNavIndex] = useState<number | null>(null);
  const [hoveredLocaleIndex, setHoveredLocaleIndex] = useState<number | null>(
    null
  );

  const visibleNavIndex =
    hoveredNavIndex !== null ? hoveredNavIndex : activeNavIndex;
  const showNavDrop = visibleNavIndex >= 0;

  const activeLocaleIndex = LOCALES.indexOf(currentLocale);
  const visibleLocaleIndex =
    hoveredLocaleIndex !== null ? hoveredLocaleIndex : activeLocaleIndex;

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="mx-auto grid max-w-[1440px] grid-cols-2 items-center gap-3 px-4 py-4 sm:px-6 md:grid-cols-3 md:px-10">
        <div className="justify-self-start">
          <Link
            href="/"
            aria-current={isHomeActive ? "page" : undefined}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.22em] text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.05] active:scale-95 ${
              isHomeActive
                ? "liquid-pill liquid-drop-active"
                : "liquid-pill hover:bg-white/20"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full transition-colors ${
                isHomeActive ? "bg-white shadow-[0_0_10px_#fff]" : "bg-white/50"
              }`}
              aria-hidden="true"
            />
            <span>{displayBrand}</span>
          </Link>
        </div>

        <nav
          aria-label={t("brand")}
          onMouseLeave={() => setHoveredNavIndex(null)}
          className="col-span-2 order-3 justify-self-center md:col-span-1 md:order-2"
        >
          <div className="liquid-pill relative grid w-[300px] grid-cols-3 items-center rounded-full p-1.5 sm:w-[360px]">
            <span
              aria-hidden="true"
              className={`pointer-events-none absolute top-1.5 bottom-1.5 left-1.5 w-[calc((100%-0.75rem)/3)] rounded-full liquid-drop-active transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                showNavDrop
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-90"
              } ${hoveredNavIndex !== null ? "scale-x-[1.04]" : ""}`}
              style={{
                transform: `translateX(${Math.max(0, visibleNavIndex) * 100}%)`,
              }}
            />

            {NAV_TABS.map((tab, idx) => {
              const active = tab.isActive(pathname);
              const highlighted = visibleNavIndex === idx;
              return (
                <Link
                  key={tab.key}
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  onMouseEnter={() => setHoveredNavIndex(idx)}
                  onFocus={() => setHoveredNavIndex(idx)}
                  onBlur={() => setHoveredNavIndex(null)}
                  className={`relative z-10 flex items-center justify-center rounded-full py-2 text-xs font-medium tracking-[0.08em] transition-all duration-300 active:scale-95 ${
                    highlighted
                      ? "text-white font-semibold"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  {t(tab.key)}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="order-2 flex items-center justify-self-end gap-2.5 md:order-3">
          <div
            role="group"
            aria-label={t("languageLabel")}
            onMouseLeave={() => setHoveredLocaleIndex(null)}
            className="liquid-pill relative hidden grid-cols-4 items-center rounded-full p-1 sm:grid"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-1 bottom-1 left-1 w-[calc((100%-0.5rem)/4)] rounded-full bg-white/25 border border-white/35 shadow-[inset_0_1px_2px_rgba(255,255,255,0.6)] transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)]"
              style={{
                transform: `translateX(${Math.max(0, visibleLocaleIndex) * 100}%)`,
              }}
            />

            {LOCALES.map((loc, idx) => {
              const isCurrent = loc === currentLocale;
              return (
                <Link
                  key={loc}
                  href={pathname}
                  locale={loc}
                  aria-current={isCurrent ? "true" : undefined}
                  onMouseEnter={() => setHoveredLocaleIndex(idx)}
                  className={`relative z-10 px-2.5 py-1 text-center font-mono text-[10px] font-semibold tracking-wider transition-colors active:scale-95 ${
                    visibleLocaleIndex === idx
                      ? "text-white"
                      : "text-white/65 hover:text-white"
                  }`}
                >
                  {loc.toUpperCase()}
                </Link>
              );
            })}
          </div>

          <div className="liquid-pill flex items-center gap-0.5 rounded-full p-1 sm:hidden">
            {LOCALES.map((loc) => {
              const isCurrent = loc === currentLocale;
              return (
                <Link
                  key={loc}
                  href={pathname}
                  locale={loc}
                  className={`rounded-full px-1.5 py-1 font-mono text-[10px] font-semibold ${
                    isCurrent ? "bg-white/25 text-white" : "text-white/65"
                  }`}
                >
                  {loc.toUpperCase()}
                </Link>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() =>
              window.dispatchEvent(new Event(OPEN_CONTACT_MODAL_EVENT))
            }
            className="liquid-pill inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium text-white transition-all duration-300 hover:scale-[1.04] hover:bg-white/20 active:scale-95"
          >
            <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{t("contactCta")}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
