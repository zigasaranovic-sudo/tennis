"use client";

import { useT } from "@/lib/i18n/context";
import type { Locale } from "@/lib/i18n/translations";

export function LanguageSwitcher() {
  const { locale, setLocale } = useT();

  const toggle = (l: Locale) => {
    if (l !== locale) setLocale(l);
  };

  return (
    <div className="flex items-center gap-1 rounded-lg border border-gray-200 dark:border-slate-700 p-0.5 text-sm font-medium">
      <button
        onClick={() => toggle("en")}
        className={`px-2.5 py-1 rounded-md transition-colors ${
          locale === "en"
            ? "bg-green-600 text-white"
            : "text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200"
        }`}
        aria-label="Switch to English"
      >
        EN
      </button>
      <button
        onClick={() => toggle("sl")}
        className={`px-2.5 py-1 rounded-md transition-colors ${
          locale === "sl"
            ? "bg-green-600 text-white"
            : "text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200"
        }`}
        aria-label="Preklopi na slovenščino"
      >
        SL
      </button>
    </div>
  );
}
