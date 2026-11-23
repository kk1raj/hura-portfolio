import Link from "next/link";

const ADMIN_TABS = ["Design", "Websites", "CV", "Settings"] as const;

export default function AdminPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-neutral-500">
            /admin
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">Admin Panel</h1>
        </div>
        <Link
          href="/"
          className="rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-900"
        >
          Public Site
        </Link>
      </header>

      <nav
        aria-label="Admin sections"
        className="flex flex-wrap gap-2 border-b border-dashed border-neutral-300 dark:border-neutral-700 pb-4"
      >
        {ADMIN_TABS.map((tab) => (
          <span
            key={tab}
            className="rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-sm font-medium"
          >
            {tab}
          </span>
        ))}
      </nav>

      <section className="rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 p-8 text-sm text-neutral-600 dark:text-neutral-400">
        Wireframe placeholder for `/admin` (not localized by next-intl).
        Authentication and CRUD tabs will be implemented in the admin stage.
      </section>
    </div>
  );
}
