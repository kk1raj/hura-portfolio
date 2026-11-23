import type { Metadata } from "next";
import { LOCALES, type Locale } from "@/i18n/routing";

const FALLBACK_SITE_URL = "http://localhost:3000";

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) {
    return FALLBACK_SITE_URL;
  }

  try {
    const parsed = new URL(raw);
    return parsed.origin;
  } catch {
    return FALLBACK_SITE_URL;
  }
}

export function buildLanguageAlternates(
  pathname: string
): Record<string, string> {
  const siteUrl = getSiteUrl();
  const normalizedPath =
    pathname === "/" ? "" : pathname.startsWith("/") ? pathname : `/${pathname}`;

  const languages: Record<string, string> = {};
  for (const loc of LOCALES) {
    languages[loc] = `${siteUrl}/${loc}${normalizedPath}`;
  }
  languages["x-default"] = `${siteUrl}/en${normalizedPath}`;
  return languages;
}

interface LocalizedMetadataInput {
  locale: Locale;
  pathname: string;
  title: string;
  description: string;
  images?: string[];
}

export function buildLocalizedMetadata({
  locale,
  pathname,
  title,
  description,
  images,
}: LocalizedMetadataInput): Metadata {
  const siteUrl = getSiteUrl();
  const normalizedPath =
    pathname === "/" ? "" : pathname.startsWith("/") ? pathname : `/${pathname}`;
  const canonicalUrl = `${siteUrl}/${locale}${normalizedPath}`;
  const languages = buildLanguageAlternates(normalizedPath);

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "Hura Portfolio & CV",
      locale,
      type: "website",
      ...(images && images.length > 0 ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(images && images.length > 0 ? { images } : {}),
    },
  };
}
