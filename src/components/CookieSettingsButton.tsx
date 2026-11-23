"use client";

import { useTranslations } from "next-intl";
import { OPEN_COOKIE_SETTINGS_EVENT } from "@/components/CookieBanner";

export function CookieSettingsButton() {
  const t = useTranslations("cookies");

  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT))}
      className="underline underline-offset-4 transition-colors hover:text-white"
    >
      {t("footerTrigger")}
    </button>
  );
}
