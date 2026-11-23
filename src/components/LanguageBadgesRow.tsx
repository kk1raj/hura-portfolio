import type { CvLanguageItem } from "@/types/portfolio";

interface LanguageBadgesRowProps {
  languages: CvLanguageItem[];
  emptyText: string;
}

interface LevelStyle {
  pillClass: string;
  dotClass: string;
}

function getLevelStyle(rawLevel: string): LevelStyle {
  const normalized = rawLevel.trim().toLowerCase();

  if (
    normalized.includes("native") ||
    normalized.includes("носител") ||
    normalized.includes("рідн") ||
    normalized.includes("ojczyst") ||
    normalized.includes("c2")
  ) {
    return {
      pillClass: "border-emerald-400/50 bg-emerald-500/20 text-emerald-200",
      dotClass: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.75)]",
    };
  }

  if (
    normalized.includes("c1") ||
    normalized.includes("advanced") ||
    normalized.includes("fluent")
  ) {
    return {
      pillClass: "border-sky-400/50 bg-sky-500/20 text-sky-200",
      dotClass: "bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.75)]",
    };
  }

  if (normalized.includes("b2") || normalized.includes("upper")) {
    return {
      pillClass: "border-amber-400/50 bg-amber-500/20 text-amber-200",
      dotClass: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.75)]",
    };
  }

  if (normalized.includes("b1") || normalized.includes("intermediate")) {
    return {
      pillClass: "border-orange-400/50 bg-orange-500/20 text-orange-200",
      dotClass: "bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.75)]",
    };
  }

  return {
    pillClass: "border-rose-400/50 bg-rose-500/20 text-rose-200",
    dotClass: "bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.75)]",
  };
}

export function LanguageBadgesRow({
  languages,
  emptyText,
}: LanguageBadgesRowProps) {
  if (languages.length === 0) {
    return <p className="text-sm text-white/60">{emptyText}</p>;
  }

  return (
    <ul className="flex flex-wrap items-center gap-3">
      {languages.map((item, idx) => {
        const style = getLevelStyle(item.level);
        return (
          <li
            key={`${item.language}-${idx}`}
            className="liquid-pill inline-flex items-center gap-3 rounded-full px-4 py-2 text-sm text-white"
          >
            <span
              className={`h-2.5 w-2.5 shrink-0 rounded-full ${style.dotClass}`}
              aria-hidden="true"
            />
            <span className="font-medium">{item.language}</span>
            <span
              className={`rounded-full border px-2.5 py-0.5 font-mono text-xs font-semibold ${style.pillClass}`}
            >
              {item.level}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
