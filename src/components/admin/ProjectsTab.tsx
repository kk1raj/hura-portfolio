"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import { LOCALES, type Locale } from "@/i18n/routing";
import {
  EMPTY_LOCALIZED_TEXT,
  type LocalizedText,
  type Project,
  type ProjectFormInput,
  type ProjectSection,
} from "@/types/portfolio";

interface ProjectsTabProps {
  section: ProjectSection;
}

interface FormState {
  slug: string;
  title: LocalizedText;
  description: LocalizedText;
  tagsInput: string;
  project_url: string;
  github_url: string;
  figma_url: string;
  open_external_on_click: boolean;
  cover_image: string;
  gallery: string[];
  sort_order: number;
  is_published: boolean;
}

function createInitialFormState(): FormState {
  return {
    slug: "",
    title: { ...EMPTY_LOCALIZED_TEXT },
    description: { ...EMPTY_LOCALIZED_TEXT },
    tagsInput: "",
    project_url: "",
    github_url: "",
    figma_url: "",
    open_external_on_click: false,
    cover_image: "",
    gallery: [],
    sort_order: 0,
    is_published: true,
  };
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

async function uploadImageFile(file: File): Promise<string> {
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
    throw new Error(data.error || "Ошибка загрузки изображения");
  }

  return data.url;
}

async function fetchSectionProjects(
  section: ProjectSection
): Promise<Project[]> {
  const response = await fetch(`/api/admin/projects?section=${section}`, {
    cache: "no-store",
  });
  const data = (await response.json().catch(() => ({}))) as {
    projects?: Project[];
    error?: string;
  };
  if (!response.ok) {
    throw new Error(data.error || "Не удалось загрузить проекты");
  }
  return data.projects ?? [];
}

export function ProjectsTab({ section }: ProjectsTabProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState<Locale>("en");
  const [slugTouched, setSlugTouched] = useState(false);
  const [form, setForm] = useState<FormState>(createInitialFormState);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  async function reloadProjects() {
    setIsLoading(true);
    setError(null);
    try {
      const items = await fetchSectionProjects(section);
      setProjects(items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Сетевая ошибка при загрузке проектов"
      );
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function loadInitial() {
      try {
        const items = await fetchSectionProjects(section);
        if (!cancelled) {
          setProjects(items);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Сетевая ошибка при загрузке проектов"
          );
          setProjects([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }
    void loadInitial();
    return () => {
      cancelled = true;
    };
  }, [section]);

  function openCreateForm() {
    setEditingId(null);
    setSlugTouched(false);
    setActiveLang("en");
    setForm({
      ...createInitialFormState(),
      sort_order: projects.length,
    });
    setError(null);
    setStatusMessage(null);
    setIsFormOpen(true);
  }

  function openEditForm(project: Project) {
    setEditingId(project.id);
    setSlugTouched(true);
    setActiveLang("en");
    setForm({
      slug: project.slug,
      title: { ...project.title },
      description: { ...project.description },
      tagsInput: project.tags.join(", "),
      project_url:
        project.project_url ??
        (section === "design" ? project.figma_url : null) ??
        "",
      github_url: project.github_url ?? "",
      figma_url: project.figma_url ?? "",
      open_external_on_click: project.open_external_on_click,
      cover_image: project.cover_image ?? "",
      gallery: [...project.gallery],
      sort_order: project.sort_order,
      is_published: project.is_published,
    });
    setError(null);
    setStatusMessage(null);
    setIsFormOpen(true);
  }

  async function handleCoverUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsUploading(true);
    setError(null);
    try {
      const url = await uploadImageFile(file);
      setForm((prev) => ({ ...prev, cover_image: url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки обложки");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleGalleryUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = event.target.files ? Array.from(event.target.files) : [];
    event.target.value = "";
    if (files.length === 0) return;

    setIsUploading(true);
    setError(null);
    try {
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const url = await uploadImageFile(file);
        uploadedUrls.push(url);
      }
      setForm((prev) => ({
        ...prev,
        gallery: [...prev.gallery, ...uploadedUrls],
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки галереи");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    setStatusMessage(null);

    const payload: ProjectFormInput = {
      slug: form.slug.trim(),
      section,
      title: form.title,
      description: form.description,
      tags: form.tagsInput
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0),
      project_url: form.project_url.trim() || null,
      github_url:
        section === "websites" ? form.github_url.trim() || null : null,
      figma_url: null,
      open_external_on_click: form.open_external_on_click,
      cover_image: form.cover_image.trim() || null,
      gallery: form.gallery,
      sort_order: Number.isFinite(form.sort_order) ? form.sort_order : 0,
      is_published: form.is_published,
    };

    try {
      const endpoint = editingId
        ? `/api/admin/projects/${editingId}`
        : "/api/admin/projects";
      const method = editingId ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        setError(data.error || "Не удалось сохранить проект");
        return;
      }

      setIsFormOpen(false);
      setEditingId(null);
      setForm(createInitialFormState());
      setStatusMessage(
        editingId ? "Проект обновлён" : "Проект успешно добавлен"
      );
      await reloadProjects();
    } catch {
      setError("Сетевая ошибка при сохранении проекта");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(project: Project) {
    const label = project.title.en || project.title.ru || project.slug;
    if (!window.confirm(`Удалить проект "${label}"?`)) {
      return;
    }

    setError(null);
    setStatusMessage(null);
    try {
      const response = await fetch(`/api/admin/projects/${project.id}`, {
        method: "DELETE",
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok) {
        setError(data.error || "Не удалось удалить проект");
        return;
      }
      setStatusMessage("Проект удалён");
      await reloadProjects();
    } catch {
      setError("Сетевая ошибка при удалении проекта");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold capitalize">
            Раздел: {section}
          </h2>
          <p className="text-xs text-neutral-500">
            Проекты секции &quot;{section}&quot; из таблицы projects.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center gap-1.5 rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:opacity-90 dark:bg-neutral-100 dark:text-neutral-900"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>+ Добавить проект</span>
        </button>
      </div>

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

      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-lg border border-neutral-300 dark:border-neutral-700 p-5"
        >
          <div className="flex items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-3">
            <h3 className="text-base font-semibold">
              {editingId ? "Редактирование проекта" : "Новый проект"}
            </h3>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-foreground"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              <span>Закрыть</span>
            </button>
          </div>

          <div className="space-y-3 rounded-md border border-dashed border-neutral-300 dark:border-neutral-700 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                Язык контента формы
              </span>
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

            <div className="space-y-1">
              <label className="block text-sm font-medium">
                Заголовок ({activeLang.toUpperCase()})
              </label>
              <input
                type="text"
                value={form.title[activeLang]}
                onChange={(event) => {
                  const value = event.target.value;
                  setForm((prev) => ({
                    ...prev,
                    title: { ...prev.title, [activeLang]: value },
                    slug:
                      !editingId && !slugTouched && activeLang === "en"
                        ? slugify(value)
                        : prev.slug,
                  }));
                }}
                placeholder={`Название на ${activeLang.toUpperCase()}`}
                className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium">
                Описание ({activeLang.toUpperCase()})
              </label>
              <textarea
                rows={4}
                value={form.description[activeLang]}
                onChange={(event) => {
                  const value = event.target.value;
                  setForm((prev) => ({
                    ...prev,
                    description: { ...prev.description, [activeLang]: value },
                  }));
                }}
                placeholder={`Описание проекта на ${activeLang.toUpperCase()}`}
                className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-sm font-medium">Slug (URL)</label>
              <input
                type="text"
                required
                value={form.slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  setForm((prev) => ({ ...prev, slug: event.target.value }));
                }}
                placeholder="my-project-slug"
                className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-background px-3 py-2 font-mono text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium">
                {section === "design"
                  ? "Инструменты / Категории"
                  : "Стек технологий"}
              </label>
              <input
                type="text"
                value={form.tagsInput}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, tagsInput: event.target.value }))
                }
                placeholder={
                  section === "design"
                    ? "Figma, UI/UX, Branding"
                    : "Next.js, TypeScript, Tailwind"
                }
                className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium">
                {section === "design"
                  ? "Ссылка на Figma / Behance / Dribbble (необязательно)"
                  : "Live URL (ссылка на сайт)"}
              </label>
              <input
                type="url"
                value={form.project_url}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    project_url: event.target.value,
                  }))
                }
                placeholder={
                  section === "design"
                    ? "https://www.figma.com/... или https://www.behance.net/..."
                    : "https://example.com"
                }
                className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-background px-3 py-2 text-sm"
              />
            </div>

            {section === "websites" && (
              <div className="space-y-1">
                <label className="block text-sm font-medium">
                  GitHub URL (необязательно)
                </label>
                <input
                  type="url"
                  value={form.github_url}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      github_url: event.target.value,
                    }))
                  }
                  placeholder="https://github.com/username/repo"
                  className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-background px-3 py-2 text-sm"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-sm font-medium">
                Порядок сортировки
              </label>
              <input
                type="number"
                value={form.sort_order}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    sort_order: Number.parseInt(event.target.value || "0", 10),
                  }))
                }
                className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.open_external_on_click}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    open_external_on_click: event.target.checked,
                  }))
                }
                className="h-4 w-4"
              />
              <span>
                Перекидывать сразу на внешнюю ссылку при клике на фото
              </span>
            </label>

            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    is_published: event.target.checked,
                  }))
                }
                className="h-4 w-4"
              />
              <span>Опубликован</span>
            </label>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Обложка</label>
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-900">
                <Upload className="h-4 w-4" aria-hidden="true" />
                <span>{isUploading ? "Загрузка..." : "Загрузить обложку"}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                  disabled={isUploading}
                  onChange={handleCoverUpload}
                  className="hidden"
                />
              </label>

              {form.cover_image && (
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, cover_image: "" }))}
                  className="text-xs text-red-600 underline underline-offset-4"
                >
                  Убрать обложку
                </button>
              )}
            </div>

            {form.cover_image && (
              <div className="mt-2 flex items-center gap-3">
                <Image
                  src={form.cover_image}
                  alt="Cover preview"
                  width={128}
                  height={72}
                  unoptimized
                  className="h-18 w-32 rounded border border-neutral-300 dark:border-neutral-700 object-cover"
                />
                <span className="break-all font-mono text-xs text-neutral-500">
                  {form.cover_image}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Галерея фото</label>
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-900">
              <Upload className="h-4 w-4" aria-hidden="true" />
              <span>{isUploading ? "Загрузка..." : "Добавить фото в галерею"}</span>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                disabled={isUploading}
                onChange={handleGalleryUpload}
                className="hidden"
              />
            </label>

            {form.gallery.length > 0 && (
              <div className="mt-2 grid gap-3 sm:grid-cols-3">
                {form.gallery.map((url, idx) => (
                  <div
                    key={`${url}-${idx}`}
                    className="space-y-2 rounded border border-neutral-200 dark:border-neutral-800 p-2"
                  >
                    <Image
                      src={url}
                      alt={`Gallery item ${idx + 1}`}
                      width={240}
                      height={140}
                      unoptimized
                      className="h-28 w-full rounded object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          gallery: prev.gallery.filter((_, i) => i !== idx),
                        }))
                      }
                      className="text-xs text-red-600 underline underline-offset-4"
                    >
                      Удалить фото
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isSaving || isUploading}
              className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
            >
              {isSaving
                ? "Сохранение..."
                : editingId
                  ? "Сохранить изменения"
                  : "Создать проект"}
            </button>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="rounded-md border border-neutral-300 dark:border-neutral-700 px-4 py-2 text-sm"
            >
              Отмена
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <p className="text-sm text-neutral-500">Загрузка проектов...</p>
      ) : projects.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 p-8 text-center text-sm text-neutral-500">
          В разделе {section} пока нет проектов.
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <article
              key={project.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4"
            >
              <div className="flex items-center gap-4">
                {project.cover_image ? (
                  <Image
                    src={project.cover_image}
                    alt={project.title.en || project.slug}
                    width={80}
                    height={56}
                    unoptimized
                    className="h-14 w-20 rounded border border-neutral-200 dark:border-neutral-800 object-cover"
                  />
                ) : (
                  <div className="h-14 w-20 rounded border border-dashed border-neutral-300 dark:border-neutral-700" />
                )}

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium">
                      {project.title.en ||
                        project.title.ru ||
                        project.title.uk ||
                        project.slug}
                    </h3>
                    {!project.is_published && (
                      <span className="rounded border border-neutral-300 dark:border-neutral-700 px-1.5 py-0.5 text-xs text-neutral-500">
                        Черновик
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-xs text-neutral-500">
                    /{project.slug} · sort: {project.sort_order}
                  </p>
                  {project.tags.length > 0 && (
                    <p className="text-xs text-neutral-500">
                      {project.tags.join(", ")}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEditForm(project)}
                  className="inline-flex items-center gap-1 rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-medium hover:bg-neutral-100 dark:hover:bg-neutral-900"
                >
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Редактировать</span>
                </button>
                <button
                  type="button"
                  onClick={() => void handleDelete(project)}
                  className="inline-flex items-center gap-1 rounded-md border border-red-300 dark:border-red-900 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Удалить</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
