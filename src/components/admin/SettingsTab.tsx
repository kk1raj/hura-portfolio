"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Upload } from "lucide-react";
import { DEFAULT_SITE_SETTINGS, type SiteSettings } from "@/types/portfolio";

export function SettingsTab() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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

  async function handleHeroUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (!response.ok || !data.url) {
        throw new Error(data.error || "Ошибка загрузки фото");
      }
      setSettings((prev) => ({ ...prev, heroImage: data.url ?? "" }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки фото");
    } finally {
      setIsUploading(false);
    }
  }

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
        <h2 className="text-base font-semibold">Профиль и фон главного экрана</h2>

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

        <div className="space-y-2 pt-2">
          <label className="block text-sm font-medium">
            Фоновое фото главного экрана (Hero Photo)
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-900">
              <Upload className="h-4 w-4" aria-hidden="true" />
              <span>{isUploading ? "Загрузка..." : "Загрузить Hero фото"}</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                disabled={isUploading}
                onChange={handleHeroUpload}
                className="hidden"
              />
            </label>

            {settings.heroImage && (
              <button
                type="button"
                onClick={() =>
                  setSettings((prev) => ({ ...prev, heroImage: "" }))
                }
                className="text-xs text-red-400 underline underline-offset-4"
              >
                Убрать фото
              </button>
            )}
          </div>

          {settings.heroImage && (
            <div className="mt-2 flex items-center gap-3">
              <Image
                src={settings.heroImage}
                alt="Hero preview"
                width={160}
                height={90}
                unoptimized
                className="h-20 w-36 rounded border border-neutral-700 object-cover"
              />
              <span className="break-all font-mono text-xs text-neutral-500">
                {settings.heroImage}
              </span>
            </div>
          )}
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
        disabled={isSaving || isUploading}
        className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:opacity-90 disabled:opacity-50"
      >
        {isSaving ? "Сохранение..." : "Сохранить настройки"}
      </button>
    </form>
  );
}
