"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

type TopicOption = "design" | "website" | "job" | "other";

export function ContactForm() {
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

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-2.5">
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

      <div className="grid gap-2.5 sm:grid-cols-3">
        <div className="space-y-1">
          <label htmlFor="contact-name" className="block text-xs font-medium">
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
            className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-background px-2.5 py-1.5 text-xs"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="contact-info" className="block text-xs font-medium">
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
            className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-background px-2.5 py-1.5 text-xs"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="contact-topic" className="block text-xs font-medium">
            {t("topicLabel")}
          </label>
          <select
            id="contact-topic"
            name="topic"
            value={topic}
            onChange={(event) => setTopic(event.target.value as TopicOption)}
            className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-background px-2.5 py-1.5 text-xs"
          >
            <option value="design">{t("topicDesign")}</option>
            <option value="website">{t("topicWebsite")}</option>
            <option value="job">{t("topicJob")}</option>
            <option value="other">{t("topicOther")}</option>
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="contact-message" className="block text-xs font-medium">
          {t("messageLabel")}
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          minLength={5}
          maxLength={4000}
          rows={2}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder={t("messagePlaceholder")}
          className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-background px-2.5 py-1.5 text-xs"
        />
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-md border border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950/40 px-2.5 py-1.5 text-xs text-red-700 dark:text-red-300"
        >
          {error}
        </p>
      )}

      {isSuccess && (
        <p
          role="status"
          className="rounded-md border border-emerald-300 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1.5 text-xs text-emerald-700 dark:text-emerald-300"
        >
          {t("successMessage")}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <label className="flex items-start gap-2 text-xs text-neutral-600 dark:text-neutral-400">
          <input
            type="checkbox"
            required
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
            className="mt-0.5 h-3.5 w-3.5 shrink-0"
          />
          <span>
            {t("consentText")}{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-foreground"
            >
              {t("consentLink")}
            </Link>
          </span>
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-neutral-900 px-3.5 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
        >
          {isSubmitting ? t("submittingButton") : t("submitButton")}
        </button>
      </div>
    </form>
  );
}
