"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

type TopicOption = "design" | "website" | "job" | "other";

interface ContactFormProps {
  onNavigatePrivacy?: () => void;
}

export function ContactForm({ onNavigatePrivacy }: ContactFormProps) {
  const t = useTranslations("contact");
  const locale = useLocale() as Locale;

  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [topic, setTopic] = useState<TopicOption>("design");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSuccess(false);

    if (
      !name.trim() ||
      contact.trim().length < 2 ||
      message.trim().length < 5 ||
      !consent
    ) {
      setError(t("errorValidation"));
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          contact: contact.trim(),
          topic,
          message: message.trim(),
          locale,
          consent,
          website,
        }),
      });

      if (response.status === 429) {
        setError(t("errorRateLimit"));
        return;
      }

      if (response.status === 400) {
        setError(t("errorValidation"));
        return;
      }

      if (!response.ok) {
        setError(t("errorGeneric"));
        return;
      }

      setIsSuccess(true);
      setName("");
      setContact("");
      setTopic("design");
      setMessage("");
      setConsent(false);
      setWebsite("");
    } catch {
      setError(t("errorGeneric"));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return (
      <div
        role="status"
        className="flex flex-col items-center justify-center gap-4 rounded-[28px] border border-emerald-400/30 bg-emerald-500/10 px-6 py-10 text-center"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-500/20 text-emerald-300 shadow-[0_0_24px_rgba(16,185,129,0.35)]">
          <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
        </div>
        <p className="text-base font-medium text-white">{t("successMessage")}</p>
          <button
            type="button"
            onClick={() => setIsSuccess(false)}
            className="glass-pill rounded-full px-4 py-1.5 text-xs font-medium text-white/90 transition-transform hover:scale-105 active:scale-95"
          >
          {t("submitButton")}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label
            htmlFor="contact-name"
            className="block text-xs font-medium text-white/80"
          >
            {t("nameLabel")}
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            maxLength={120}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t("namePlaceholder")}
            className="w-full rounded-2xl border border-white/20 bg-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-white/50 focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="contact-info"
            className="block text-xs font-medium text-white/80"
          >
            {t("contactFieldLabel")}
          </label>
          <input
            id="contact-info"
            name="contact"
            type="text"
            required
            minLength={2}
            maxLength={160}
            value={contact}
            onChange={(event) => setContact(event.target.value)}
            placeholder={t("contactFieldPlaceholder")}
            className="w-full rounded-2xl border border-white/20 bg-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-white/50 focus:outline-none"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="contact-topic"
          className="block text-xs font-medium text-white/80"
        >
          {t("topicLabel")}
        </label>
        <select
          id="contact-topic"
          name="topic"
          value={topic}
          onChange={(event) => setTopic(event.target.value as TopicOption)}
          className="w-full rounded-2xl border border-white/20 bg-neutral-900/90 px-3.5 py-2.5 text-sm text-white focus:border-white/50 focus:outline-none"
        >
          <option value="design">{t("topicDesign")}</option>
          <option value="website">{t("topicWebsite")}</option>
          <option value="job">{t("topicJob")}</option>
          <option value="other">{t("topicOther")}</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="contact-message"
          className="block text-xs font-medium text-white/80"
        >
          {t("messageLabel")}
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          minLength={5}
          maxLength={4000}
          rows={4}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder={t("messagePlaceholder")}
          className="w-full rounded-2xl border border-white/20 bg-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-white/50 focus:outline-none"
        />
      </div>

      <label className="flex items-start gap-2.5 text-xs text-white/70">
        <input
          type="checkbox"
          required
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-white"
        />
        <span>
          {t("consentText")}{" "}
          <Link
            href="/privacy"
            onClick={onNavigatePrivacy}
            className="text-white underline underline-offset-4 hover:opacity-80"
          >
            {t("consentLink")}
          </Link>
        </span>
      </label>

      {error && (
        <p
          role="alert"
          className="rounded-2xl border border-rose-400/40 bg-rose-500/15 px-3.5 py-2 text-xs text-rose-200"
        >
          {error}
        </p>
      )}

      <div className="pt-1">
        <button
          type="submit"
          disabled={isSubmitting}
          className="glass-droplet w-full rounded-full py-3 text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50"
        >
          {isSubmitting ? t("submittingButton") : t("submitButton")}
        </button>
      </div>
    </form>
  );
}
