"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "@/i18n/navigation";

interface BackButtonProps {
  label: string;
}

export function BackButton({ label }: BackButtonProps) {
  const router = useRouter();

  function handleBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/");
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className="glass-pill inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium text-white transition-all duration-300 hover:border-white/35 active:scale-95"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}
