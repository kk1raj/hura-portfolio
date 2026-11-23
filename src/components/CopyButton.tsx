"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

interface CopyButtonProps {
  value: string;
  copyLabel: string;
  copiedLabel: string;
  className?: string;
}

export function CopyButton({
  value,
  copyLabel,
  copiedLabel,
  className = "",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      // Clipboard API unavailable in non-secure context
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      aria-label={`${copied ? copiedLabel : copyLabel}: ${value}`}
      className={`inline-flex items-center gap-1 rounded border border-neutral-300 dark:border-neutral-700 px-2 py-0.5 text-xs font-medium hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors ${className}`.trim()}
    >
      {copied ? (
        <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
      ) : (
        <Copy className="h-3 w-3" aria-hidden="true" />
      )}
      <span>{copied ? copiedLabel : copyLabel}</span>
    </button>
  );
}
