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
      pillClass: "border-emerald-500/40 bg-emerald-500/15 text-emerald-300",
      dotClass: "bg-emerald-400",
    };
  }

  if (
    normalized.includes("c1") ||
    normalized.includes("advanced") ||
    normalized.includes("fluent")
  ) {
    return {
      pillClass: "border-sky-500/40 bg-sky-500/15 text-sky-300",
      dotClass: "bg-sky-400",
    };
  }

  if (normalized.includes("b2") || normalized.includes("upper")) {
    return {
      pillClass: "border-amber-500/40 bg-amber-500/15 text-amber-300",
      dotClass: "bg-amber-400",
    };
  }

  if (normalized.includes("b1") || normalized.includes("intermediate")) {
    return {
      pillClass: "border-orange-500/40 bg-orange-500/15 text-orange-300",
      dotClass: "bg-orange-400",
    };
  }

  return {
    pillClass: "border-rose-500/40 bg-rose-500/15 text-rose-300",
    dotClass: "bg-rose-400",
  };
}

export function LanguageBadgesRow({
  languages,
  emptyText,
}: LanguageBadgesRowProps) {
  if (languages.length === 0) {
    return <p className="text-sm text-neutral-400">{emptyText}</p>;
  }

  return (
    <ul className="flex flex-wrap items-center gap-2.5">
      {languages.map((item, idx) => {
        const style = getLevelStyle(item.level);
        return (
          <li
            key={`${item.language}-${idx}`}
            className="inline-flex items-center gap-2.5 rounded-sm border border-white/15 bg-black/50 px-3.5 py-2 text-sm text-white backdrop-blur-sm"
          >
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${style.dotClass}`}
              aria-hidden="true"
            />
            <span className="font-medium">{item.language}</span>
            <span
              className={`rounded-sm border px-2 py-0.5 font-mono text-xs font-medium ${style.pillClass}`}
            >
              {item.level}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
