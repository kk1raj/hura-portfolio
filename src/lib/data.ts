import "server-only";
import { getServerReadSupabaseClient } from "@/lib/supabase/server";
import {
  type CvData,
  CvDataSchema,
  DEFAULT_CV_DATA,
  DEFAULT_SITE_SETTINGS,
  getLocalizedValue,
  normalizeLocalizedText,
  normalizeProjectRow,
  type Project,
  type ProjectSection,
  type SiteContentKey,
  type SiteSettings,
  SiteSettingsSchema,
} from "@/types/portfolio";

export { getLocalizedValue };

function parseSiteSettings(raw: unknown): SiteSettings {
  const parsed = SiteSettingsSchema.safeParse({
    ...DEFAULT_SITE_SETTINGS,
    ...(typeof raw === "object" && raw !== null ? raw : {}),
  });
  return parsed.success ? parsed.data : { ...DEFAULT_SITE_SETTINGS };
}

function hasNonEmptySettings(settings: SiteSettings): boolean {
  return Boolean(
    settings.telegram.trim() ||
      settings.email.trim() ||
      settings.github.trim() ||
      settings.figma.trim()
  );
}

export async function getProjectsBySection(
  section: ProjectSection
): Promise<Project[]> {
  const supabase = getServerReadSupabaseClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("section", section)
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data
    .map((row) => normalizeProjectRow(row))
    .filter((item): item is Project => item !== null);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const supabase = getServerReadSupabaseClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return normalizeProjectRow(data);
}

export async function getSiteContent(key: "cv_data"): Promise<CvData>;
export async function getSiteContent(
  key: "settings" | "profile_settings"
): Promise<SiteSettings>;
export async function getSiteContent(
  key: SiteContentKey
): Promise<CvData | SiteSettings>;
export async function getSiteContent(
  key: SiteContentKey
): Promise<CvData | SiteSettings> {
  const supabase = getServerReadSupabaseClient();
  if (!supabase) {
    return key === "cv_data"
      ? { ...DEFAULT_CV_DATA }
      : { ...DEFAULT_SITE_SETTINGS };
  }

  if (key === "cv_data") {
    const { data, error } = await supabase
      .from("site_content")
      .select("content")
      .eq("key", "cv_data")
      .maybeSingle();

    if (error || !data?.content) {
      return { ...DEFAULT_CV_DATA };
    }

    const raw =
      typeof data.content === "object" && data.content !== null
        ? (data.content as Record<string, unknown>)
        : {};
    const parsed = CvDataSchema.safeParse({
      about: normalizeLocalizedText(raw.about),
      skillCategories: Array.isArray(raw.skillCategories)
        ? raw.skillCategories
        : [],
      education: Array.isArray(raw.education) ? raw.education : [],
      languages: Array.isArray(raw.languages) ? raw.languages : [],
    });
    return parsed.success ? parsed.data : { ...DEFAULT_CV_DATA };
  }

  const { data, error } = await supabase
    .from("site_content")
    .select("key, content, updated_at")
    .in("key", ["settings", "profile_settings"])
    .order("updated_at", { ascending: false });

  if (error || !data || data.length === 0) {
    return { ...DEFAULT_SITE_SETTINGS };
  }

  const rows = data as Array<{
    key: string;
    content: unknown;
    updated_at: string;
  }>;

  const exactRow = rows.find((row) => row.key === key);
  const exactParsed = exactRow
    ? parseSiteSettings(exactRow.content)
    : null;
  if (exactParsed && hasNonEmptySettings(exactParsed)) {
    return exactParsed;
  }

  const latestNonEmpty = rows
    .map((row) => parseSiteSettings(row.content))
    .find((settings) => hasNonEmptySettings(settings));
  if (latestNonEmpty) {
    return latestNonEmpty;
  }

  return exactParsed ?? parseSiteSettings(rows[0].content);
}

export async function getCvData(): Promise<CvData> {
  return getSiteContent("cv_data");
}

export async function getSiteSettings(): Promise<SiteSettings> {
  return getSiteContent("settings");
}
