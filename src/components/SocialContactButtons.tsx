import { Mail } from "lucide-react";
import { normalizeHttpHref, normalizeTelegramHref } from "@/lib/contact-links";
import type { SiteSettings } from "@/types/portfolio";

interface SocialContactButtonsProps {
  settings: SiteSettings;
}

export function SocialContactButtons({ settings }: SocialContactButtonsProps) {
  const email = settings.email.trim();
  const telegramHref = normalizeTelegramHref(settings.telegram);
  const githubHref = normalizeHttpHref(settings.github);
  const figmaHref = normalizeHttpHref(settings.figma);

  if (!email && !telegramHref && !githubHref && !figmaHref) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
      {email && (
        <a
          href={`mailto:${email}`}
          aria-label={`Email: ${email}`}
          title={email}
          className="inline-flex items-center gap-2 border border-neutral-300 dark:border-neutral-700 px-4 py-2 text-xs font-mono uppercase tracking-[0.14em] transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
        >
          <Mail className="h-4 w-4" aria-hidden="true" />
          <span>Email</span>
        </a>
      )}

      {telegramHref && (
        <a
          href={telegramHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Telegram: ${settings.telegram.trim()}`}
          title={settings.telegram.trim()}
          className="inline-flex items-center gap-2 border border-neutral-300 dark:border-neutral-700 px-4 py-2 text-xs font-mono uppercase tracking-[0.14em] transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M21.5 4.5 2.5 11.8l6.8 2.4 2.6 6.8 3.6-4.1 5.1 3.7z" />
            <path d="m9.3 14.2 12.2-9.7" />
          </svg>
          <span>Telegram</span>
        </a>
      )}

      {githubHref && (
        <a
          href={githubHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`GitHub: ${githubHref}`}
          title={githubHref}
          className="inline-flex items-center gap-2 border border-neutral-300 dark:border-neutral-700 px-4 py-2 text-xs font-mono uppercase tracking-[0.14em] transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
            <path d="M9 18c-4.51 2-5-2-7-2" />
          </svg>
          <span>GitHub</span>
        </a>
      )}

      {figmaHref && (
        <a
          href={figmaHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Figma: ${figmaHref}`}
          title={figmaHref}
          className="inline-flex items-center gap-2 border border-neutral-300 dark:border-neutral-700 px-4 py-2 text-xs font-mono uppercase tracking-[0.14em] transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z" />
            <path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z" />
            <path d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z" />
            <path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z" />
            <path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z" />
          </svg>
          <span>Figma</span>
        </a>
      )}
    </div>
  );
}
