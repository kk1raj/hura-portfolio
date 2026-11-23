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
      pillClass:
        "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
      dotClass: "bg-emerald-500",
    };
  }

  if (
    normalized.includes("c1") ||
    normalized.includes("advanced") ||
    normalized.includes("fluent")
  ) {
    return {
      pillClass:
        "border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-300",
      dotClass: "bg-blue-500",
    };
  }

  if (normalized.includes("b2") || normalized.includes("upper")) {
    return {
      pillClass:
        "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
      dotClass: "bg-amber-500",
    };
  }

  if (normalized.includes("b1") || normalized.includes("intermediate")) {
    return {
      pillClass:
        "border-orange-500/40 bg-orange-500/10 text-orange-700 dark:text-orange-300",
      dotClass: "bg-orange-500",
    };
  }

  return {
    pillClass:
      "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300",
    dotClass: "bg-rose-500",
  };
}

export function LanguageBadgesRow({
  languages,
  emptyText,
}: LanguageBadgesRowProps) {
  if (languages.length === 0) {
    return <p className="text-sm text-neutral-500">{emptyText}</p>;
  }

  return (
    <ul className="flex flex-wrap items-center gap-3">
      {languages.map((item, idx) => {
        const style = getLevelStyle(item.level);
        return (
          <li
            key={`${item.language}-${idx}`}
            className="inline-flex items-center gap-3 border border-neutral-200 dark:border-neutral-800 px-4 py-2.5 text-sm"
          >
            <span
              className={`h-2.5 w-2.5 shrink-0 rounded-full ${style.dotClass}`}
              aria-hidden="true"
            />
            <span className="font-medium">{item.language}</span>
            <span
              className={`rounded border px-2 py-0.5 font-mono text-xs font-semibold ${style.pillClass}`}
            >
              {item.level}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
