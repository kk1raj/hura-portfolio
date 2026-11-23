import { z } from "zod";
import type { Locale } from "@/i18n/routing";

export const LocalizedTextSchema = z.object({
  en: z.string(),
  uk: z.string(),
  pl: z.string(),
  ru: z.string(),
});
export type LocalizedText = z.infer<typeof LocalizedTextSchema>;

export const EMPTY_LOCALIZED_TEXT: LocalizedText = {
  en: "",
  uk: "",
  pl: "",
  ru: "",
};

export const ProjectSectionSchema = z.enum(["design", "websites"]);
export type ProjectSection = z.infer<typeof ProjectSectionSchema>;

const OptionalHttpUrlSchema = z
  .string()
  .trim()
  .refine(
    (val) => val === "" || /^https?:\/\/.+/i.test(val),
    "URL must start with http:// or https://"
  )
  .nullable();

export const ProjectSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1),
  section: ProjectSectionSchema,
  title: LocalizedTextSchema,
  description: LocalizedTextSchema,
  tags: z.array(z.string()),
  project_url: z.string().nullable(),
  github_url: z.string().nullable(),
  figma_url: z.string().nullable(),
  open_external_on_click: z.boolean(),
  cover_image: z.string().nullable(),
  gallery: z.array(z.string()),
  sort_order: z.number().int(),
  is_published: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Project = z.infer<typeof ProjectSchema>;

export const ProjectFormInputSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(120)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug may only contain lowercase letters, numbers, and hyphens"
    ),
  section: ProjectSectionSchema,
  title: LocalizedTextSchema,
  description: LocalizedTextSchema,
  tags: z.array(z.string().trim().min(1)).max(30),
  project_url: OptionalHttpUrlSchema,
  github_url: OptionalHttpUrlSchema,
  figma_url: OptionalHttpUrlSchema,
  open_external_on_click: z.boolean(),
  cover_image: z.string().trim().nullable(),
  gallery: z.array(z.string().trim().min(1)).max(40),
  sort_order: z.number().int().min(0).max(10000),
  is_published: z.boolean(),
});
export type ProjectFormInput = z.infer<typeof ProjectFormInputSchema>;

export const CvSkillCategorySchema = z.object({
  category: z.string(),
  skills: z.array(z.string()),
});
export type CvSkillCategory = z.infer<typeof CvSkillCategorySchema>;

export const CvEducationItemSchema = z.object({
  degree: z.string(),
  institution: z.string(),
  period: z.string(),
});
export type CvEducationItem = z.infer<typeof CvEducationItemSchema>;

export const CvLanguageItemSchema = z.object({
  language: z.string(),
  level: z.string(),
});
export type CvLanguageItem = z.infer<typeof CvLanguageItemSchema>;

export const CvDataSchema = z.object({
  about: LocalizedTextSchema,
  skillCategories: z.array(CvSkillCategorySchema),
  education: z.array(CvEducationItemSchema),
  languages: z.array(CvLanguageItemSchema),
});
export type CvData = z.infer<typeof CvDataSchema>;

export const DEFAULT_CV_DATA: CvData = {
  about: { ...EMPTY_LOCALIZED_TEXT },
  skillCategories: [],
  education: [],
  languages: [],
};

export const SiteSettingsSchema = z.object({
  fullName: z.string().default("Hurakassi"),
  nickname: z.string().default("kk1raj"),
  availableForWork: z.boolean(),
  telegram: z.string(),
  email: z.string(),
  github: z.string(),
  figma: z.string(),
});
export type SiteSettings = z.infer<typeof SiteSettingsSchema>;

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  fullName: "Hurakassi",
  nickname: "kk1raj",
  availableForWork: true,
  telegram: "",
  email: "",
  github: "",
  figma: "",
};

export const SiteContentKeySchema = z.enum([
  "cv_data",
  "settings",
  "profile_settings",
]);
export type SiteContentKey = z.infer<typeof SiteContentKeySchema>;

export interface SiteContentRecord<T = unknown> {
  id: string;
  key: SiteContentKey;
  content: T;
  updated_at: string;
}

export function normalizeLocalizedText(raw: unknown): LocalizedText {
  if (typeof raw !== "object" || raw === null) {
    return { ...EMPTY_LOCALIZED_TEXT };
  }
  const obj = raw as Record<string, unknown>;
  return {
    en: typeof obj.en === "string" ? obj.en : "",
    uk: typeof obj.uk === "string" ? obj.uk : "",
    pl: typeof obj.pl === "string" ? obj.pl : "",
    ru: typeof obj.ru === "string" ? obj.ru : "",
  };
}

export function normalizeProjectRow(raw: unknown): Project | null {
  if (typeof raw !== "object" || raw === null) return null;
  const row = raw as Record<string, unknown>;

  const candidate = {
    id: row.id,
    slug: row.slug,
    section: row.section,
    title: normalizeLocalizedText(row.title),
    description: normalizeLocalizedText(row.description),
    tags: Array.isArray(row.tags)
      ? row.tags.filter((t): t is string => typeof t === "string")
      : [],
    project_url: typeof row.project_url === "string" ? row.project_url : null,
    github_url: typeof row.github_url === "string" ? row.github_url : null,
    figma_url: typeof row.figma_url === "string" ? row.figma_url : null,
    open_external_on_click: Boolean(row.open_external_on_click),
    cover_image: typeof row.cover_image === "string" ? row.cover_image : null,
    gallery: Array.isArray(row.gallery)
      ? row.gallery.filter((g): g is string => typeof g === "string")
      : [],
    sort_order: typeof row.sort_order === "number" ? row.sort_order : 0,
    is_published: row.is_published !== false,
    created_at:
      typeof row.created_at === "string"
        ? row.created_at
        : new Date().toISOString(),
    updated_at:
      typeof row.updated_at === "string"
        ? row.updated_at
        : new Date().toISOString(),
  };

  const parsed = ProjectSchema.safeParse(candidate);
  return parsed.success ? parsed.data : null;
}

export function getLocalizedValue(text: LocalizedText, locale: Locale): string {
  return (
    text[locale]?.trim() ||
    text.en?.trim() ||
    text.ru?.trim() ||
    text.uk?.trim() ||
    text.pl?.trim() ||
    ""
  );
}
