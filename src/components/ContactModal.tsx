"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";

export const OPEN_CONTACT_MODAL_EVENT = "open-contact-modal";

interface ContactModalProps {
  availableForWork: boolean;
}

export function ContactModal({ availableForWork }: ContactModalProps) {
  const tContact = useTranslations("contact");
  const tCommon = useTranslations("common");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function handleOpen() {
      setIsOpen(true);
    }
    window.addEventListener(OPEN_CONTACT_MODAL_EVENT, handleOpen);
    return () => {
      window.removeEventListener(OPEN_CONTACT_MODAL_EVENT, handleOpen);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-modal-title"
      onClick={() => setIsOpen(false)}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-2xl"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="liquid-glass relative w-full max-w-lg rounded-[36px] p-6 sm:p-8 text-white"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-medium text-white/90">
              <span
                className={`h-2 w-2 rounded-full ${
                  availableForWork ? "bg-emerald-400" : "bg-amber-400"
                }`}
                aria-hidden="true"
              />
              <span>
                {availableForWork
                  ? tCommon("availableForWork")
                  : tCommon("unavailableForWork")}
              </span>
            </span>
            <h2
              id="contact-modal-title"
              className="text-2xl font-semibold tracking-tight"
            >
              {tContact("title")}
            </h2>
            <p className="text-xs text-white/65">{tContact("subtitle")}</p>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label={tContact("closeButton")}
            className="liquid-pill flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition-transform hover:scale-105 active:scale-95"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <ContactForm onNavigatePrivacy={() => setIsOpen(false)} />
      </div>
    </div>
  );
}
