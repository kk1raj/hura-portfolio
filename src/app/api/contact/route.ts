import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 3;
const rateLimitStore = new Map<string, number[]>();

const TOPIC_LABELS: Record<"design" | "website" | "job" | "other", string> = {
  design: "Design Project",
  website: "Website / Web App",
  job: "Job / Collaboration",
  other: "Other",
};

const ContactSubmissionSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  contact: z.string().trim().min(2, "Contact is required").max(160),
  topic: z.enum(["design", "website", "job", "other"]),
  message: z.string().trim().min(5, "Message is too short").max(4000),
  locale: z.enum(["en", "uk", "pl", "ru"]),
  consent: z.literal(true),
  website: z.string().max(200).optional().default(""),
});

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  return realIp || "unknown";
}

function isRateLimited(ip: string, now: number): boolean {
  if (rateLimitStore.size > 500) {
    for (const [key, timestamps] of rateLimitStore.entries()) {
      const valid = timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
      if (valid.length === 0) {
        rateLimitStore.delete(key);
      } else {
        rateLimitStore.set(key, valid);
      }
    }
  }

  const existing = rateLimitStore.get(ip) ?? [];
  const recent = existing.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
    rateLimitStore.set(ip, recent);
    return true;
  }

  recent.push(now);
  rateLimitStore.set(ip, recent);
  return false;
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const parsed = ContactSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  if (parsed.data.website.trim().length > 0) {
    return NextResponse.json({ ok: true });
  }

  const ip = getClientIp(request);
  if (isRateLimited(ip, Date.now())) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) {
    console.error("Telegram contact configuration is missing on the server.");
    return NextResponse.json(
      { error: "Contact delivery is not configured" },
      { status: 500 }
    );
  }

  const { name, contact, topic, message, locale } = parsed.data;
  const formattedText = [
    "<b>New Portfolio Inquiry</b>",
    "",
    `<b>Topic:</b> ${escapeHtml(TOPIC_LABELS[topic])}`,
    `<b>Name:</b> ${escapeHtml(name)}`,
    `<b>Contact:</b> ${escapeHtml(contact)}`,
    `<b>Locale:</b> ${escapeHtml(locale.toUpperCase())}`,
    "",
    "<b>Message:</b>",
    escapeHtml(message),
  ].join("\n");

  try {
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: formattedText,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
        signal: AbortSignal.timeout(10000),
      }
    );

    const telegramResult = (await telegramResponse.json().catch(() => null)) as
      | { ok?: boolean }
      | null;

    if (!telegramResponse.ok || !telegramResult?.ok) {
      console.error(
        "Telegram sendMessage failed with status:",
        telegramResponse.status
      );
      return NextResponse.json(
        { error: "Failed to deliver message" },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(
      "Telegram request error:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      { error: "Failed to deliver message" },
      { status: 502 }
    );
  }
}
