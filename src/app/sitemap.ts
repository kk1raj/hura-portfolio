import type { MetadataRoute } from "next";
import { LOCALES } from "@/i18n/routing";
import { getProjectsBySection } from "@/lib/data";
import { buildLanguageAlternates, getSiteUrl } from "@/lib/seo";

const STATIC_PATHS = ["", "/design", "/websites", "/cv", "/privacy"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const path of STATIC_PATHS) {
    const languages = buildLanguageAlternates(path);
    for (const locale of LOCALES) {
      entries.push({
        url: `${siteUrl}/${locale}${path}`,
        lastModified: now,
        changeFrequency: path === "" ? "weekly" : "monthly",
        priority: path === "" ? 1.0 : 0.8,
        alternates: { languages },
      });
    }
  }

  const [designProjects, websiteProjects] = await Promise.all([
    getProjectsBySection("design"),
    getProjectsBySection("websites"),
  ]);

  const seenSlugs = new Set<string>();
  for (const project of [...designProjects, ...websiteProjects]) {
    if (seenSlugs.has(project.slug)) continue;
    seenSlugs.add(project.slug);

    const projectPath = `/projects/${project.slug}`;
    const languages = buildLanguageAlternates(projectPath);
    const updatedAt = new Date(project.updated_at);
    const lastModified = Number.isNaN(updatedAt.getTime()) ? now : updatedAt;

    for (const locale of LOCALES) {
      entries.push({
        url: `${siteUrl}/${locale}${projectPath}`,
        lastModified,
        changeFrequency: "monthly",
        priority: 0.7,
        alternates: { languages },
      });
    }
  }

  return entries;
}
