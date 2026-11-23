import { defineRouting } from "next-intl/routing";

export const LOCALES = ["en", "uk", "pl", "ru"] as const;
export type Locale = (typeof LOCALES)[number];

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: "en",
});

export function isValidLocale(locale: string | undefined): locale is Locale {
  return (
    typeof locale === "string" &&
    (LOCALES as readonly string[]).includes(locale)
  );
}
