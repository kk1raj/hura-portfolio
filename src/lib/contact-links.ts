export function normalizeHttpHref(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const fixedTypo = trimmed
    .replace(/^https?:\/\/wwwfigma\.com/i, "https://www.figma.com")
    .replace(/^wwwfigma\.com/i, "www.figma.com");

  if (/^https?:\/\//i.test(fixedTypo)) {
    return fixedTypo;
  }

  return `https://${fixedTypo}`;
}

export function normalizeTelegramHref(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const handle = trimmed.replace(/^@/, "");
  return `https://t.me/${handle}`;
}
