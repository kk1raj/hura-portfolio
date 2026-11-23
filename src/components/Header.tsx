"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
    isActive: (pathname) => pathname === "/cv" || pathname.startsWith("/cv/"),
  },
];

interface DropletRect {
  left: number;
  width: number;
  visible: boolean;
}

interface HeaderProps {
  brandName?: string;
}

export function Header({ brandName }: HeaderProps) {
  const t = useTranslations("nav");
  const currentLocale = useLocale() as Locale;
  const pathname = usePathname();
  const isHomeActive = pathname === "/";
  const displayBrand = brandName?.trim() || t("brand");

  const headerRef = useRef<HTMLElement | null>(null);
  const navTrackRef = useRef<HTMLDivElement | null>(null);
  const navTabRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const localeTrackRef = useRef<HTMLDivElement | null>(null);
  const localeItemRefs = useRef<Array<HTMLAnchorElement | null>>([]);

  const activeNavIndex = NAV_TABS.findIndex((tab) => tab.isActive(pathname));
  const activeLocaleIndex = Math.max(0, LOCALES.indexOf(currentLocale));

  const [hoveredNavIndex, setHoveredNavIndex] = useState<number | null>(null);
  const [hoveredLocaleIndex, setHoveredLocaleIndex] = useState<number | null>(
    null
  );
  const [isBrandHovered, setIsBrandHovered] = useState(false);

  const [navDroplet, setNavDroplet] = useState<DropletRect>({
    left: 0,
    width: 0,
    visible: false,
  });
  const [localeDroplet, setLocaleDroplet] = useState<DropletRect>({
    left: 0,
    width: 0,
    visible: false,
  });

  const visibleNavIndex =
    hoveredNavIndex !== null ? hoveredNavIndex : activeNavIndex;
  const visibleLocaleIndex =
    hoveredLocaleIndex !== null ? hoveredLocaleIndex : activeLocaleIndex;

  const syncNavDroplet = useCallback((targetIndex: number) => {
    if (targetIndex < 0) {
      setNavDroplet((prev) =>
        prev.visible ? { ...prev, visible: false } : prev
      );
      return;
    }
    const targetEl = navTabRefs.current[targetIndex];
    if (!targetEl) return;

    const left = targetEl.offsetLeft;
    const width = targetEl.offsetWidth;
    setNavDroplet((prev) => {
      if (prev.visible && prev.left === left && prev.width === width) {
        return prev;
      }
      return { left, width, visible: true };
    });
  }, []);

  const syncLocaleDroplet = useCallback((targetIndex: number) => {
    const safeIndex = targetIndex >= 0 ? targetIndex : 0;
    const targetEl = localeItemRefs.current[safeIndex];
    if (!targetEl) return;

    const left = targetEl.offsetLeft;
    const width = targetEl.offsetWidth;
    setLocaleDroplet((prev) => {
      if (prev.visible && prev.left === left && prev.width === width) {
        return prev;
      }
      return { left, width, visible: true };
    });
  }, []);

  useEffect(() => {
    const rafId = window.requestAnimationFrame(() => {
      syncNavDroplet(visibleNavIndex);
      syncLocaleDroplet(visibleLocaleIndex);
    });

    const handleResize = () => {
      syncNavDroplet(visibleNavIndex);
      syncLocaleDroplet(visibleLocaleIndex);
    };
    window.addEventListener("resize", handleResize);

    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            syncNavDroplet(visibleNavIndex);
            syncLocaleDroplet(visibleLocaleIndex);
          })
        : null;

    if (observer) {
      if (navTrackRef.current) observer.observe(navTrackRef.current);
      if (localeTrackRef.current) observer.observe(localeTrackRef.current);
    }

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
      observer?.disconnect();
    };
  }, [
    visibleNavIndex,
    visibleLocaleIndex,
    currentLocale,
    pathname,
    syncNavDroplet,
    syncLocaleDroplet,
  ]);

  function handleHeaderMouseMove(event: React.MouseEvent<HTMLElement>) {
    const el = headerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    el.style.setProperty("--my", `${event.clientY - rect.top}px`);
  }

  function handleNavEnter(index: number) {
    setHoveredNavIndex(index);
    syncNavDroplet(index);
  }

  function handleNavLeave() {
    setHoveredNavIndex(null);
    syncNavDroplet(activeNavIndex);
  }

  function handleLocaleEnter(index: number) {
    setHoveredLocaleIndex(index);
    syncLocaleDroplet(index);
  }

  function handleLocaleLeave() {
    setHoveredLocaleIndex(null);
    syncLocaleDroplet(activeLocaleIndex);
  }

  const brandHighlighted = isHomeActive || isBrandHovered;

  return (
    <header
      ref={headerRef}
      onMouseMove={handleHeaderMouseMove}
      className="glass-bar fixed inset-x-0 top-0 z-40 w-full border-b border-white/10"
    >
      {/* Refractive bottom edge strip for optical glass background distortion */}
      <div
        aria-hidden="true"
        className="glass-refract-edge pointer-events-none absolute inset-x-0 bottom-0 h-3 opacity-85"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-75"
        style={{
          background:
            "radial-gradient(280px circle at var(--mx, 50%) var(--my, 0%), rgba(255,255,255,0.09), transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-x-2 gap-y-2.5 px-3 py-2.5 sm:px-6 sm:py-3 md:grid md:grid-cols-[1fr_auto_1fr] md:gap-3 md:px-10">
        {/* Left: Brand Pill */}
        <div className="order-1 shrink-0 md:justify-self-start">
          <Link
            href="/"
            aria-current={isHomeActive ? "page" : undefined}
            onMouseEnter={() => setIsBrandHovered(true)}
            onMouseLeave={() => setIsBrandHovered(false)}
            onFocus={() => setIsBrandHovered(true)}
            onBlur={() => setIsBrandHovered(false)}
            className={`relative inline-flex items-center gap-1.5 sm:gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-white transition-all duration-300 active:scale-95 sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.22em] ${
              brandHighlighted
                ? "glass-droplet"
                : "glass-capsule hover:border-white/30"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                isHomeActive
                  ? "bg-white shadow-[0_0_8px_rgba(255,255,255,0.95)]"
                  : "bg-white/50"
              }`}
              aria-hidden="true"
            />
            <span>{displayBrand}</span>
          </Link>
        </div>

        {/* Center: Telegram iOS Sliding Droplet Capsule */}
        <nav
          aria-label={t("brand")}
          onMouseLeave={handleNavLeave}
          className="order-3 flex w-full justify-center md:order-2 md:w-auto md:justify-self-center"
        >
          <div
            ref={navTrackRef}
            className="glass-capsule relative inline-flex items-center gap-0.5 rounded-full p-1"
          >
            <span
              aria-hidden="true"
              className={`glass-droplet pointer-events-none absolute top-1 bottom-1 left-0 rounded-full transition-[transform,width,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                navDroplet.visible && navDroplet.width > 0
                  ? "opacity-100"
                  : "opacity-0"
              }`}
              style={{
                width: `${navDroplet.width}px`,
                transform: `translate3d(${navDroplet.left}px, 0, 0)`,
              }}
            />

            {NAV_TABS.map((tab, idx) => {
              const active = tab.isActive(pathname);
              const highlighted = visibleNavIndex === idx;
              return (
                <Link
                  key={tab.key}
                  ref={(el) => {
                    navTabRefs.current[idx] = el;
                  }}
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  onMouseEnter={() => handleNavEnter(idx)}
                  onFocus={() => handleNavEnter(idx)}
                  onBlur={handleNavLeave}
                  className={`relative z-10 whitespace-nowrap rounded-full px-4 py-1.5 text-xs tracking-[0.06em] transition-colors duration-200 active:scale-95 sm:px-5 ${
                    highlighted
                      ? "font-semibold text-white"
                      : "font-medium text-white/70 hover:text-white"
                  }`}
                >
                  {t(tab.key)}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Right: Sliding Language Droplet + Contacts Trigger */}
        <div className="order-2 flex shrink-0 items-center gap-1.5 sm:gap-2 md:order-3 md:justify-self-end">
          <div
            ref={localeTrackRef}
            role="group"
            aria-label={t("languageLabel")}
            onMouseLeave={handleLocaleLeave}
            className="glass-capsule relative hidden items-center rounded-full p-1 sm:inline-flex"
          >
            <span
              aria-hidden="true"
              className={`glass-droplet pointer-events-none absolute top-1 bottom-1 left-0 rounded-full transition-[transform,width,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                localeDroplet.visible && localeDroplet.width > 0
                  ? "opacity-100"
                  : "opacity-0"
              }`}
              style={{
                width: `${localeDroplet.width}px`,
                transform: `translate3d(${localeDroplet.left}px, 0, 0)`,
              }}
            />

            {LOCALES.map((loc, idx) => {
              const isCurrent = loc === currentLocale;
              const highlighted = visibleLocaleIndex === idx;
              return (
                <Link
                  key={loc}
                  ref={(el) => {
                    localeItemRefs.current[idx] = el;
                  }}
                  href={pathname}
                  locale={loc}
                  aria-current={isCurrent ? "true" : undefined}
                  onMouseEnter={() => handleLocaleEnter(idx)}
                  onFocus={() => handleLocaleEnter(idx)}
                  onBlur={handleLocaleLeave}
                  className={`relative z-10 rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold tracking-wider transition-colors active:scale-95 ${
                    highlighted
                      ? "text-white"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {loc.toUpperCase()}
                </Link>
              );
            })}
          </div>

          {/* Mobile compact language bar */}
          <div className="glass-capsule flex items-center gap-0.5 rounded-full p-0.5 sm:hidden">
            {LOCALES.map((loc) => {
              const isCurrent = loc === currentLocale;
              return (
                <Link
                  key={loc}
                  href={pathname}
                  locale={loc}
                  className={`rounded-full px-1.5 py-0.5 font-mono text-[10px] font-semibold ${
                    isCurrent ? "glass-droplet text-white" : "text-white/65"
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
            className="glass-pill inline-flex items-center gap-1 sm:gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium text-white transition-all duration-300 hover:border-white/35 hover:bg-white/10 active:scale-95 sm:px-4 sm:py-2 sm:text-xs"
          >
            <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{t("contactCta")}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
