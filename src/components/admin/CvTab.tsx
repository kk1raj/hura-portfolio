"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { LOCALES, type Locale } from "@/i18n/routing";
import {
  type CvData,
  DEFAULT_CV_DATA,
} from "@/types/portfolio";

export function CvTab() {
  const [cvData, setCvData] = useState<CvData>(DEFAULT_CV_DATA);
  const [activeLang, setActiveLang] = useState<Locale>("en");
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
          cv_data?: CvData;
          error?: string;
        };
        if (!response.ok) {
          if (!cancelled) setError(data.error || "Не удалось загрузить CV");
          return;
        }
        if (!cancelled && data.cv_data) {
          setCvData(data.cv_data);
        }
      } catch {
        if (!cancelled) setError("Сетевая ошибка при загрузке CV");
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
        body: JSON.stringify({ key: "cv_data", content: cvData }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok) {
        setError(data.error || "Не удалось сохранить CV");
        return;
      }

      setStatusMessage("Данные CV сохранены");
    } catch {
      setError("Сетевая ошибка при сохранении CV");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <p className="text-sm text-neutral-500">Загрузка данных CV...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
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

      <section className="space-y-3 rounded-lg border border-neutral-200 dark:border-neutral-800 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold">О себе (4 языка)</h2>
          <div className="flex gap-1">
            {LOCALES.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => setActiveLang(loc)}
                className={
                  activeLang === loc
                    ? "rounded bg-neutral-900 px-2.5 py-1 text-xs font-semibold text-white dark:bg-neutral-100 dark:text-neutral-900"
                    : "rounded border border-neutral-300 dark:border-neutral-700 px-2.5 py-1 text-xs text-neutral-600 dark:text-neutral-400"
                }
              >
                {loc.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <textarea
          rows={5}
          value={cvData.about[activeLang]}
          onChange={(event) => {
            const value = event.target.value;
            setCvData((prev) => ({
              ...prev,
              about: { ...prev.about, [activeLang]: value },
            }));
          }}
          placeholder={`Текст "О себе" на ${activeLang.toUpperCase()}`}
          className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-background px-3 py-2 text-sm"
        />
      </section>

      <section className="space-y-4 rounded-lg border border-neutral-200 dark:border-neutral-800 p-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-base font-semibold">Навыки по категориям</h2>
          <button
            type="button"
            onClick={() =>
              setCvData((prev) => ({
                ...prev,
                skillCategories: [
                  ...prev.skillCategories,
                  { category: "", skills: [] },
                ],
              }))
            }
            className="inline-flex items-center gap-1 rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-medium"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Добавить категорию</span>
          </button>
        </div>

        {cvData.skillCategories.map((item, idx) => (
          <div
            key={idx}
            className="grid gap-3 rounded border border-dashed border-neutral-300 dark:border-neutral-700 p-3 sm:grid-cols-[1fr_2fr_auto]"
          >
            <input
              type="text"
              value={item.category}
              onChange={(event) => {
                const value = event.target.value;
                setCvData((prev) => ({
                  ...prev,
                  skillCategories: prev.skillCategories.map((cat, i) =>
                    i === idx ? { ...cat, category: value } : cat
                  ),
                }));
              }}
              placeholder="Категория (напр. Frontend)"
              className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-background px-3 py-2 text-sm"
            />
            <input
              type="text"
              value={item.skills.join(", ")}
              onChange={(event) => {
                const skills = event.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean);
                setCvData((prev) => ({
                  ...prev,
                  skillCategories: prev.skillCategories.map((cat, i) =>
                    i === idx ? { ...cat, skills } : cat
                  ),
                }));
              }}
              placeholder="Навыки через запятую (Next.js, TypeScript...)"
              className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-background px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() =>
                setCvData((prev) => ({
                  ...prev,
                  skillCategories: prev.skillCategories.filter(
                    (_, i) => i !== idx
                  ),
                }))
              }
              aria-label="Удалить категорию"
              className="inline-flex items-center justify-center rounded-md border border-red-300 dark:border-red-900 px-3 py-2 text-red-600"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ))}
      </section>

      <section className="space-y-4 rounded-lg border border-neutral-200 dark:border-neutral-800 p-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-base font-semibold">Образование</h2>
          <button
            type="button"
            onClick={() =>
              setCvData((prev) => ({
                ...prev,
                education: [
                  ...prev.education,
                  { degree: "", institution: "", period: "" },
                ],
              }))
            }
            className="inline-flex items-center gap-1 rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-medium"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Добавить образование</span>
          </button>
        </div>

        {cvData.education.map((item, idx) => (
          <div
            key={idx}
            className="grid gap-3 rounded border border-dashed border-neutral-300 dark:border-neutral-700 p-3 sm:grid-cols-[1fr_1fr_140px_auto]"
          >
            <input
              type="text"
              value={item.degree}
              onChange={(event) => {
                const value = event.target.value;
                setCvData((prev) => ({
                  ...prev,
                  education: prev.education.map((ed, i) =>
                    i === idx ? { ...ed, degree: value } : ed
                  ),
                }));
              }}
              placeholder="Степень / специальность"
              className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-background px-3 py-2 text-sm"
            />
            <input
              type="text"
              value={item.institution}
              onChange={(event) => {
                const value = event.target.value;
                setCvData((prev) => ({
                  ...prev,
                  education: prev.education.map((ed, i) =>
                    i === idx ? { ...ed, institution: value } : ed
                  ),
                }));
              }}
              placeholder="Учебное заведение"
              className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-background px-3 py-2 text-sm"
            />
            <input
              type="text"
              value={item.period}
              onChange={(event) => {
                const value = event.target.value;
                setCvData((prev) => ({
                  ...prev,
                  education: prev.education.map((ed, i) =>
                    i === idx ? { ...ed, period: value } : ed
                  ),
                }));
              }}
              placeholder="2020–2024"
              className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-background px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() =>
                setCvData((prev) => ({
                  ...prev,
                  education: prev.education.filter((_, i) => i !== idx),
                }))
              }
              aria-label="Удалить запись об образовании"
              className="inline-flex items-center justify-center rounded-md border border-red-300 dark:border-red-900 px-3 py-2 text-red-600"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ))}
      </section>

      <section className="space-y-4 rounded-lg border border-neutral-200 dark:border-neutral-800 p-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-base font-semibold">Языки</h2>
          <button
            type="button"
            onClick={() =>
              setCvData((prev) => ({
                ...prev,
                languages: [...prev.languages, { language: "", level: "" }],
              }))
            }
            className="inline-flex items-center gap-1 rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-medium"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Добавить язык</span>
          </button>
        </div>

        {cvData.languages.map((item, idx) => (
          <div
            key={idx}
            className="grid gap-3 rounded border border-dashed border-neutral-300 dark:border-neutral-700 p-3 sm:grid-cols-[1fr_1fr_auto]"
          >
            <input
              type="text"
              value={item.language}
              onChange={(event) => {
                const value = event.target.value;
                setCvData((prev) => ({
                  ...prev,
                  languages: prev.languages.map((lang, i) =>
                    i === idx ? { ...lang, language: value } : lang
                  ),
                }));
              }}
              placeholder="Язык (напр. English)"
              className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-background px-3 py-2 text-sm"
            />
            <input
              type="text"
              value={item.level}
              onChange={(event) => {
                const value = event.target.value;
                setCvData((prev) => ({
                  ...prev,
                  languages: prev.languages.map((lang, i) =>
                    i === idx ? { ...lang, level: value } : lang
                  ),
                }));
              }}
              placeholder="Уровень (напр. C1 / Native)"
              className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-background px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() =>
                setCvData((prev) => ({
                  ...prev,
                  languages: prev.languages.filter((_, i) => i !== idx),
                }))
              }
              aria-label="Удалить язык"
              className="inline-flex items-center justify-center rounded-md border border-red-300 dark:border-red-900 px-3 py-2 text-red-600"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ))}
      </section>

      <button
        type="submit"
        disabled={isSaving}
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
      >
        {isSaving ? "Сохранение..." : "Сохранить CV"}
      </button>
    </form>
  );
}
