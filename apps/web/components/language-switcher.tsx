"use client";

import { useT } from "@/lib/i18n/context";
import type { Locale } from "@/lib/i18n/translations";

export function LanguageSwitcher() {
  const { locale, setLocale } = useT();

  const toggle = (l: Locale) => {
    if (l !== locale) setLocale(l);
  };

  return (
    <div className="flex items-center gap-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-bold">
      <button
        onClick={() => toggle("en")}
        className={`px-2.5 py-1.5 rounded-lg transition-all ${
          locale === "en"
            ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
            : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
        }`}
        aria-label="Switch to English"
      >
        EN
      </button>
      <button
        onClick={() => toggle("sl")}
        className={`px-2.5 py-1.5 rounded-lg transition-all ${
          locale === "sl"
            ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
            : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
        }`}
        aria-label="Preklopi na slovenščino"
      >
        SL
      </button>
    </div>
  );
}
