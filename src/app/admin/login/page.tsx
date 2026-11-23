"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        setError(data.error || "Authentication failed");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Network error while signing in");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-12">
      <div className="space-y-6 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6">
        <div className="space-y-1">
          <p className="font-mono text-xs uppercase tracking-widest text-neutral-500">
            /admin/login
          </p>
          <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
            <Lock className="h-4 w-4" aria-hidden="true" />
            <span>Admin Access</span>
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Enter your admin password to manage projects, CV, and site settings.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label
              htmlFor="admin-password"
              className="block text-sm font-medium"
            >
              Password
            </label>
            <input
              id="admin-password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-background px-3 py-2 text-sm"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-md border border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950/40 px-3 py-2 text-sm text-red-700 dark:text-red-300"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || password.length === 0}
            className="w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4 text-xs text-neutral-500">
          <Link href="/" className="underline underline-offset-4 hover:text-foreground">
            Back to public portfolio
          </Link>
        </div>
      </div>
    </div>
  );
}
