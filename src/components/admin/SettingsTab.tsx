"use client";

import { useEffect, useState } from "react";
import { DEFAULT_SITE_SETTINGS, type SiteSettings } from "@/types/portfolio";

export function SettingsTab() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/admin/content", {
          cache: "no-store",
        });
        const data = (await response.json().catch(() => ({}))) as {
          settings?: SiteSettings;
          error?: string;
        };
        if (!response.ok) {
          if (!cancelled) {
            setError(data.error || "Не удалось загрузить настройки");
          }
          return;
        }
        if (!cancelled && data.settings) {
          setSettings({ ...DEFAULT_SITE_SETTINGS, ...data.settings });
        }
      } catch {
        if (!cancelled) setError("Сетевая ошибка при загрузке настроек");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    setStatusMessage(null);

    try {
      const response = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "settings", content: settings }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok) {
        setError(data.error || "Не удалось сохранить настройки");
        return;
      }

      setStatusMessage("Настройки сохранены");
    } catch {
      setError("Сетевая ошибка при сохранении настроек");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <p className="text-sm text-neutral-500">Загрузка настроек...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
      {error && (
        <p
          role="alert"
          className="rounded-md border border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950/40 px-3 py-2 text-sm text-red-700 dark:text-red-300"
        >
          {error}
        </p>
      )}

      {statusMessage && (
        <p className="rounded-md border border-emerald-300 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
          {statusMessage}
        </p>
      )}

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
        <label className="inline-flex items-center gap-3 text-sm font-medium">
          <input
            type="checkbox"
            checked={settings.availableForWork}
            onChange={(event) =>
              setSettings((prev) => ({
                ...prev,
                availableForWork: event.target.checked,
              }))
            }
            className="h-4 w-4"
          />
          <span>Available for work</span>
        </label>
      </div>

      <div className="space-y-4 rounded-lg border border-neutral-200 dark:border-neutral-800 p-5">
        <h2 className="text-base font-semibold">Профиль</h2>

        <div className="space-y-1">
          <label className="block text-sm font-medium">
            Имя / Фамилия (на сайте)
          </label>
          <input
            type="text"
            value={settings.fullName}
            onChange={(event) =>
              setSettings((prev) => ({ ...prev, fullName: event.target.value }))
            }
            placeholder="Hurakassi"
            className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-background px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium">Никнейм / Handle</label>
          <input
            type="text"
            value={settings.nickname}
            onChange={(event) =>
              setSettings((prev) => ({ ...prev, nickname: event.target.value }))
            }
            placeholder="kk1raj"
            className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="space-y-4 rounded-lg border border-neutral-200 dark:border-neutral-800 p-5">
        <h2 className="text-base font-semibold">Контакты</h2>

        <div className="space-y-1">
          <label className="block text-sm font-medium">Telegram</label>
          <input
            type="text"
            value={settings.telegram}
            onChange={(event) =>
              setSettings((prev) => ({ ...prev, telegram: event.target.value }))
            }
            placeholder="https://t.me/username или @username"
            className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-background px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            value={settings.email}
            onChange={(event) =>
              setSettings((prev) => ({ ...prev, email: event.target.value }))
            }
            placeholder="you@example.com"
            className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-background px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium">GitHub</label>
          <input
            type="text"
            value={settings.github}
            onChange={(event) =>
              setSettings((prev) => ({ ...prev, github: event.target.value }))
            }
            placeholder="https://github.com/username"
            className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-background px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium">Figma</label>
          <input
            type="text"
            value={settings.figma}
            onChange={(event) =>
              setSettings((prev) => ({ ...prev, figma: event.target.value }))
            }
            placeholder="https://www.figma.com/@username"
            className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
      >
        {isSaving ? "Сохранение..." : "Сохранить настройки"}
      </button>
    </form>
  );
}
