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
    <div>
      {/* Full-bleed edge-to-edge Hero section spanning 100% monitor width under the optical glass header */}
      <section className="relative flex min-h-screen w-full flex-col justify-between overflow-hidden border-b border-neutral-800 pt-32 pb-14 sm:pb-16 md:pt-28 lg:pb-20">
        {settings.heroImage ? (
          <Image
            src={settings.heroImage}
            alt={displayName}
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-cover object-center"
          />
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[#0b0b0d]"
            style={{
              backgroundImage: [
                "radial-gradient(ellipse 90% 60% at 50% 18%, rgba(255, 255, 255, 0.14), transparent 65%)",
                "linear-gradient(125deg, rgba(255, 255, 255, 0.06) 0%, transparent 40%, rgba(255, 255, 255, 0.04) 75%, transparent 100%)",
                "repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.03) 0px, rgba(255, 255, 255, 0.03) 1px, transparent 1px, transparent 120px)",
              ].join(", "),
            }}
          />
        )}

        {/* Editorial darkening & vignette so hero text and glass header contrast sharply */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/45 to-[#09090b]"
        />

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-11rem)] w-full max-w-[1440px] flex-col justify-between gap-12 px-4 sm:px-6 md:px-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="border border-white/20 bg-black/50 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-white/90 backdrop-blur-sm">
                {tCv("badge")}
              </span>
              <span className="inline-flex items-center gap-2 border border-white/20 bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                <span
                  className={`h-2 w-2 rounded-full ${
                    settings.availableForWork
                      ? "bg-emerald-400"
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
              className="inline-flex items-center gap-1.5 border border-white/25 bg-black/50 px-3.5 py-1.5 font-mono text-xs uppercase tracking-[0.16em] text-white backdrop-blur-sm transition-colors hover:border-white hover:bg-white hover:text-black"
            >
              <span>{tCv("title")}</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.15fr_1.45fr] lg:items-end">
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

            <div className="border border-white/15 bg-black/45 p-6 backdrop-blur-md">
              <h2 className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-white/60">
                {tCv("summaryTitle")}
              </h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-white/90 sm:text-base">
                {aboutText}
              </p>
            </div>
          </div>

          <div className="space-y-6">
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
              <article className="space-y-3 border border-white/15 bg-black/45 p-5 backdrop-blur-md sm:p-6">
                <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/60">
                  {tCv("educationTitle")}
                </h2>
                {cvData.education.length > 0 ? (
                  <ul className="space-y-2.5">
                    {cvData.education.map((item, idx) => (
                      <li
                        key={`${item.degree}-${idx}`}
                        className="flex flex-wrap items-baseline justify-between gap-2 border-b border-dashed border-white/15 pb-2.5 last:border-b-0 last:pb-0"
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

              <article className="space-y-3 border border-white/15 bg-black/45 p-5 backdrop-blur-md sm:p-6">
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
                              className="border border-white/20 bg-white/5 px-2.5 py-0.5 font-mono text-xs text-white/90"
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
        </div>
      </section>

      {/* Clean Editorial Sections for Websites & Apps and Design Works */}
      <div className="mx-auto w-full max-w-[1440px] space-y-24 px-4 py-16 sm:px-6 md:px-10 md:py-24">
        <section className="space-y-8">
          <header className="space-y-2 border-b border-dashed border-neutral-800 pb-6">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500">
              {tWebsites("badge")}
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-white">
              {tWebsites("title")}
            </h2>
            <p className="max-w-2xl text-sm text-neutral-400">
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
          <header className="space-y-2 border-b border-dashed border-neutral-800 pb-6">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500">
              {tDesign("badge")}
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-white">
              {tDesign("title")}
            </h2>
            <p className="max-w-2xl text-sm text-neutral-400">
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
    </div>
  );
}
