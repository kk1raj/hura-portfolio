"use client";

import { Printer } from "lucide-react";

interface PrintCvButtonProps {
  label: string;
}

export function PrintCvButton({ label }: PrintCvButtonProps) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="print:hidden inline-flex items-center gap-2 rounded-md border border-neutral-900 dark:border-neutral-200 px-3.5 py-2 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
    >
      <Printer className="h-4 w-4" aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}
