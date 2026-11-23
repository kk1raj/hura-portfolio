import { CopyButton } from "@/components/CopyButton";
import { normalizeHttpHref, normalizeTelegramHref } from "@/lib/contact-links";
import type { SiteSettings } from "@/types/portfolio";

interface ContactsListProps {
  settings: SiteSettings;
  copyLabel: string;
  copiedLabel: string;
  emptyText?: string;
}

export function ContactsList({
  settings,
  copyLabel,
  copiedLabel,
  emptyText,
}: ContactsListProps) {
  const email = settings.email.trim();
  const telegram = settings.telegram.trim();
  const githubHref = normalizeHttpHref(settings.github);
  const figmaHref = normalizeHttpHref(settings.figma);
  const telegramHref = normalizeTelegramHref(telegram);

  const hasAny = Boolean(email || telegram || githubHref || figmaHref);

  if (!hasAny) {
    return emptyText ? (
      <p className="text-sm text-neutral-500">{emptyText}</p>
    ) : null;
  }

  return (
    <ul className="space-y-2.5 text-sm">
      {email && (
        <li className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs uppercase text-neutral-500">
            Email:
          </span>
          <a
            href={`mailto:${email}`}
            className="underline underline-offset-4 hover:opacity-80"
          >
            {email}
          </a>
          <CopyButton
            value={email}
            copyLabel={copyLabel}
            copiedLabel={copiedLabel}
          />
        </li>
      )}

      {telegram && telegramHref && (
        <li className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs uppercase text-neutral-500">
            Telegram:
          </span>
          <a
            href={telegramHref}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 hover:opacity-80"
          >
            {telegram}
          </a>
          <CopyButton
            value={telegram}
            copyLabel={copyLabel}
            copiedLabel={copiedLabel}
          />
        </li>
      )}

      {githubHref && (
        <li className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs uppercase text-neutral-500">
            GitHub:
          </span>
          <a
            href={githubHref}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 hover:opacity-80"
          >
            {settings.github.trim()}
          </a>
        </li>
      )}

      {figmaHref && (
        <li className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs uppercase text-neutral-500">
            Figma:
          </span>
          <a
            href={figmaHref}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 hover:opacity-80"
          >
            {settings.figma.trim()}
          </a>
        </li>
      )}
    </ul>
  );
}
