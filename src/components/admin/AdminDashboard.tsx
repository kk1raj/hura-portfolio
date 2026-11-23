"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { CvTab } from "./CvTab";
import { ProjectsTab } from "./ProjectsTab";
import { SettingsTab } from "./SettingsTab";

type AdminTab = "design" | "websites" | "cv" | "settings";

const ADMIN_TABS: ReadonlyArray<{ id: AdminTab; label: string }> = [
  { id: "design", label: "Design" },
  { id: "websites", label: "Websites" },
  { id: "cv", label: "CV" },
  { id: "settings", label: "Settings" },
];

export function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>("design");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <div className="space-y-1">
          <p className="font-mono text-xs uppercase tracking-widest text-neutral-500">
            /admin
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">Admin Panel</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className="rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-900"
          >
            На сайт
          </Link>
          <button
            type="button"
            disabled={isLoggingOut}
            onClick={() => void handleLogout()}
            className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-900 disabled:opacity-50"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{isLoggingOut ? "Выход..." : "Выйти"}</span>
          </button>
        </div>
      </header>

      <nav
        aria-label="Разделы админ-панели"
        className="flex flex-wrap gap-1 rounded-md border border-neutral-200 dark:border-neutral-800 p-1 w-fit"
      >
        {ADMIN_TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? "rounded px-3.5 py-1.5 text-sm font-medium bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                  : "rounded px-3.5 py-1.5 text-sm font-medium text-neutral-600 hover:text-foreground dark:text-neutral-400 dark:hover:text-foreground"
              }
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      <main>
        {(activeTab === "design" || activeTab === "websites") && (
          <ProjectsTab key={activeTab} section={activeTab} />
        )}
        {activeTab === "cv" && <CvTab />}
        {activeTab === "settings" && <SettingsTab />}
      </main>
    </div>
  );
}
