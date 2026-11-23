"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const CONSENT_STORAGE_KEY = "portfolio_cookie_consent";
const CONSENT_UPDATED_EVENT = "portfolio-cookie-consent-updated";
export const OPEN_COOKIE_SETTINGS_EVENT = "open-cookie-settings";

interface CookieConsentState {
  necessary: true;
  analytics: boolean;
  updatedAt: string;
}

function subscribeConsent(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(CONSENT_UPDATED_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CONSENT_UPDATED_EVENT, callback);
  };
}

function getClientConsentSnapshot(): string {
  try {
    return window.localStorage.getItem(CONSENT_STORAGE_KEY) ?? "UNSET";
  } catch {
    return "UNSET";
  }
}

function getServerConsentSnapshot(): string | null {
  return null;
}

function parseSavedAnalytics(snapshot: string | null): boolean {
  if (!snapshot || snapshot === "UNSET") return false;
  try {
    const parsed = JSON.parse(snapshot) as Partial<CookieConsentState>;
    return Boolean(parsed.analytics);
  } catch {
    return false;
  }
}

export function CookieBanner() {
  const t = useTranslations("cookies");
  const snapshot = useSyncExternalStore(
    subscribeConsent,
    getClientConsentSnapshot,
    getServerConsentSnapshot
  );

  const [isManuallyOpen, setIsManuallyOpen] = useState(false);
  const [analyticsDraft, setAnalyticsDraft] = useState<boolean | null>(null);

  useEffect(() => {
    function handleReopen() {
      setAnalyticsDraft(parseSavedAnalytics(getClientConsentSnapshot()));
      setIsManuallyOpen(true);
    }
    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, handleReopen);
    return () => {
      window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, handleReopen);
    };
  }, []);

  if (snapshot === null) {
    return null;
  }

  const isVisible = snapshot === "UNSET" || isManuallyOpen;
  if (!isVisible) {
    return null;
  }

  const analyticsChecked = analyticsDraft ?? parseSavedAnalytics(snapshot);

  function saveConsent(analytics: boolean) {
    const payload: CookieConsentState = {
      necessary: true,
      analytics,
      updatedAt: new Date().toISOString(),
    };
    const serialized = JSON.stringify(payload);
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, serialized);
      document.cookie = `${CONSENT_STORAGE_KEY}=${encodeURIComponent(
        serialized
      )}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      // Storage unavailable
    }
    setAnalyticsDraft(null);
    setIsManuallyOpen(false);
    window.dispatchEvent(new Event(CONSENT_UPDATED_EVENT));
  }

  return (
    <aside
      aria-label={t("title")}
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-4xl rounded-[32px] liquid-glass p-5 sm:p-6"
    >
      <div className="space-y-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-white">{t("title")}</h2>
            <Link
              href="/privacy"
              onClick={() => setIsManuallyOpen(false)}
              className="text-xs underline underline-offset-4 text-white/70 hover:text-white"
            >
              {t("privacyLink")}
            </Link>
          </div>
          <p className="text-xs text-white/70">
            {t("description")}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex items-start gap-2.5 rounded-2xl border border-white/15 bg-white/5 p-3 text-xs">
            <input
              type="checkbox"
              checked
              disabled
              className="mt-0.5 h-4 w-4 shrink-0"
            />
            <span>
              <strong className="block font-medium text-white">
                {t("necessaryTitle")}
              </strong>
              <span className="text-white/60">{t("necessaryDesc")}</span>
            </span>
          </label>

          <label className="flex items-start gap-2.5 rounded-2xl border border-white/15 bg-white/5 p-3 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={analyticsChecked}
              onChange={(event) => setAnalyticsDraft(event.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0"
            />
            <span>
              <strong className="block font-medium text-white">
                {t("analyticsTitle")}
              </strong>
              <span className="text-white/60">{t("analyticsDesc")}</span>
            </span>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => saveConsent(true)}
            className="liquid-drop-active rounded-full px-4 py-1.5 text-xs font-medium text-white transition-transform hover:scale-105 active:scale-95"
          >
            {t("acceptAll")}
          </button>
          <button
            type="button"
            onClick={() => saveConsent(false)}
            className="liquid-pill rounded-full px-4 py-1.5 text-xs font-medium text-white/85 transition-transform hover:scale-105 active:scale-95"
          >
            {t("necessaryOnly")}
          </button>
          <button
            type="button"
            onClick={() => saveConsent(analyticsChecked)}
            className="liquid-pill rounded-full px-4 py-1.5 text-xs font-medium text-white/85 transition-transform hover:scale-105 active:scale-95"
          >
            {t("savePreferences")}
          </button>
        </div>
      </div>
    </aside>
  );
}
