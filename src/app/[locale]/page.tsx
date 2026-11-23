import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { LandingDesignShowcase } from "@/components/LandingDesignShowcase";
import { LandingWebsitesShowcase } from "@/components/LandingWebsitesShowcase";
import { LanguageBadgesRow } from "@/components/LanguageBadgesRow";
import { Link } from "@/i18n/navigation";
import { isValidLocale } from "@/i18n/routing";
import {
  getCvData,
  getLocalizedValue,
  getProjectsBySection,
  getSiteSettings,
} from "@/lib/data";
import { buildLocalizedMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};
  const t = await getTranslations({ locale, namespace: "meta" });
  return buildLocalizedMetadata({
    locale,
    pathname: "",
    title: t("title"),
    description: t("description"),
  });
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const [
    cvData,
    settings,
    websiteProjects,
    designProjects,
    tCv,
    tWebsites,
    tDesign,
    tCommon,
    tLanding,
  ] = await Promise.all([
    getCvData(),
    getSiteSettings(),
    getProjectsBySection("websites"),
    getProjectsBySection("design"),
    getTranslations({ locale, namespace: "cv" }),
    getTranslations({ locale, namespace: "websites" }),
    getTranslations({ locale, namespace: "design" }),
    getTranslations({ locale, namespace: "common" }),
    getTranslations({ locale, namespace: "landing" }),
  ]);

  const aboutText = getLocalizedValue(cvData.about, locale) || tCv("summaryText");
  const displayName = settings.fullName?.trim() || "Hurakassi";

  return (
    <div className="space-y-20">
      <section className="relative flex min-h-[calc(100vh-7.5rem)] w-full flex-col justify-between gap-10 overflow-hidden rounded-[40px] border border-white/20 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.6)] sm:p-10 lg:p-14">
        {settings.heroImage ? (
          <Image
            src={settings.heroImage}
            alt={displayName}
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[#080b12]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 25%, rgba(99, 102, 241, 0.35), transparent 45%), radial-gradient(circle at 80% 30%, rgba(16, 185, 129, 0.25), transparent 45%), radial-gradient(circle at 50% 85%, rgba(236, 72, 153, 0.22), transparent 50%)",
            }}
          />
        )}

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-black/85"
        />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="liquid-pill rounded-full px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-white/90">
              {tCv("badge")}
            </span>
            <span className="liquid-pill inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-white">
              <span
                className={`h-2 w-2 rounded-full ${
                  settings.availableForWork
                    ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]"
                    : "bg-amber-400"
                }`}
                aria-hidden="true"
              />
              <span>
                {settings.availableForWork
                  ? tCommon("availableForWork")
                  : tCommon("unavailableForWork")}
              </span>
            </span>
          </div>

          <Link
            href="/cv"
            className="liquid-pill inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium text-white transition-all duration-300 hover:scale-105 hover:bg-white/20 active:scale-95"
          >
            <span>{tCv("title")}</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>

        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.15fr_1.45fr] lg:items-end">
          <div className="space-y-2">
            <h1 className="text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
              {displayName}
            </h1>
            {settings.nickname && (
              <p className="font-mono text-sm tracking-[0.22em] text-white/65">
                @{settings.nickname}
              </p>
            )}
          </div>

          <div className="liquid-glass rounded-[28px] p-6">
            <h2 className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-white/60">
              {tCv("summaryTitle")}
            </h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-white/90 sm:text-base">
              {aboutText}
            </p>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="space-y-3">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/65">
              {tCv("languagesTitle")}
            </h2>
            <LanguageBadgesRow
              languages={cvData.languages}
              emptyText={tCv("languagesEmpty")}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <article className="liquid-glass space-y-3 rounded-[28px] p-5 sm:p-6">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/60">
                {tCv("educationTitle")}
              </h2>
              {cvData.education.length > 0 ? (
                <ul className="space-y-2.5">
                  {cvData.education.map((item, idx) => (
                    <li
                      key={`${item.degree}-${idx}`}
                      className="flex flex-wrap items-baseline justify-between gap-2 border-b border-white/10 pb-2.5 last:border-b-0 last:pb-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-white">
                          {item.degree}
                        </p>
                        <p className="text-xs text-white/65">
                          {item.institution}
                        </p>
                      </div>
                      <span className="font-mono text-xs text-white/60">
                        {item.period}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-white/60">{tCv("educationEmpty")}</p>
              )}
            </article>

            <article className="liquid-glass space-y-3 rounded-[28px] p-5 sm:p-6">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/60">
                {tCv("skillsTitle")}
              </h2>
              {cvData.skillCategories.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {cvData.skillCategories.map((group, idx) => (
                    <div
                      key={`${group.category}-${idx}`}
                      className="space-y-1.5"
                    >
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-white/75">
                        {group.category}
                      </h3>
                      <ul className="flex flex-wrap gap-1.5">
                        {group.skills.map((skill) => (
                          <li
                            key={skill}
                            className="rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 font-mono text-xs text-white/90"
                          >
                            {skill}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-white/60">
                  {tCv("skillsPlaceholder")}
                </p>
              )}
            </article>
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <header className="space-y-2 px-1">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-white/50">
            {tWebsites("badge")}
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-white">
            {tWebsites("title")}
          </h2>
          <p className="max-w-2xl text-sm text-white/65">
            {tWebsites("subtitle")}
          </p>
        </header>

        <LandingWebsitesShowcase
          projects={websiteProjects}
          locale={locale}
          viewProjectLabel={tWebsites("viewProject")}
          openWebsiteLabel={tCommon("openWebsiteLink")}
          viewAllLabel={tLanding("viewAllWebsites")}
          abstractItems={[
            {
              tag: tLanding("abstractWeb1Tag"),
              title: tLanding("abstractWeb1Title"),
              subtitle: tLanding("abstractWeb1Subtitle"),
            },
            {
              tag: tLanding("abstractWeb2Tag"),
              title: tLanding("abstractWeb2Title"),
              subtitle: tLanding("abstractWeb2Subtitle"),
            },
          ]}
        />
      </section>

      <section className="space-y-8">
        <header className="space-y-2 px-1">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-white/50">
            {tDesign("badge")}
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-white">
            {tDesign("title")}
          </h2>
          <p className="max-w-2xl text-sm text-white/65">
            {tDesign("subtitle")}
          </p>
        </header>

        <LandingDesignShowcase
          projects={designProjects}
          locale={locale}
          inspectLabel={tLanding("inspectWork")}
          liveRotationLabel={tLanding("liveRotationBadge")}
          viewAllLabel={tLanding("viewAllDesign")}
          abstractItems={[
            {
              tag: tLanding("abstractDesign1Tag"),
              title: tLanding("abstractDesign1Title"),
              subtitle: tLanding("abstractDesign1Subtitle"),
            },
            {
              tag: tLanding("abstractDesign2Tag"),
              title: tLanding("abstractDesign2Title"),
              subtitle: tLanding("abstractDesign2Subtitle"),
            },
          ]}
        />
      </section>
    </div>
  );
}
