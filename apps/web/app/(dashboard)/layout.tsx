"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationBell } from "@/components/notification-bell";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useT } from "@/lib/i18n/context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useT();
  const [initial, setInitial] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace("/login");
      } else {
        setInitial(user.email?.[0]?.toUpperCase() ?? "P");
      }
    });
  }, [router]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const isHome = pathname === "/";

  const navLinks = [
    { href: "/", label: t.nav.home },
    { href: "/matches", label: t.nav.matches, base: "/matches" },
    { href: "/tournaments", label: t.nav.tournaments },
    { href: "/messages", label: t.nav.messages },
  ];

  const bottomNavItems = [
    { href: "/", icon: HomeIcon, label: t.nav.home },
    { href: "/matches", icon: TennisIcon, label: t.nav.matches },
    { href: "/tournaments", icon: TrophyIcon, label: t.nav.tournaments },
    { href: "/messages", icon: MessagesIcon, label: t.nav.messages },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">

      {/* ── Top navigation ── */}
      <nav className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 gap-3">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-md shadow-green-500/30">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" strokeWidth="2"/>
                  <path strokeWidth="1.5" d="M12 3 C8 6.5 8 17.5 12 21 M12 3 C16 6.5 16 17.5 12 21"/>
                </svg>
              </div>
              <span className="font-black text-slate-900 dark:text-white text-base tracking-tight">
                Play<span className="text-green-500">mate</span>
              </span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
              {navLinks.map((link) => {
                const base = link.base ?? link.href.split("?")[0];
                const active = base === "/" ? pathname === "/" : pathname.startsWith(base);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
                      active
                        ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-1 shrink-0">
              <LanguageSwitcher />
              <ThemeToggle />
              <NotificationBell />

              {initial !== null && (
                <div className="relative ml-1" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen((v) => !v)}
                    className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-sm font-black shadow-md shadow-green-500/30 hover:shadow-lg hover:shadow-green-500/40 transition-all"
                  >
                    {initial}
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 top-10 w-52 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-2xl shadow-slate-200/80 dark:shadow-black/60 py-2 z-50">
                      <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white rounded-xl mx-1 transition-colors"
                      >
                        <span className="w-7 h-7 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-sm">👤</span>
                        {t.nav.home === "Home" ? "Profile" : "Profil"}
                      </Link>
                      <Link
                        href="/ranking"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white rounded-xl mx-1 transition-colors"
                      >
                        <span className="w-7 h-7 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-sm">🏆</span>
                        {t.profilePage.ranking}
                      </Link>
                      <div className="border-t border-slate-100 dark:border-slate-700 my-1.5 mx-2" />
                      <button
                        onClick={() => { setDropdownOpen(false); void handleSignOut(); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl mx-1 transition-colors"
                        style={{ width: "calc(100% - 8px)" }}
                      >
                        <span className="w-7 h-7 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center text-sm">🚪</span>
                        {t.profilePage.signOut}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 lg:pb-8 ${isHome ? "py-0" : "py-6"}`}>
        {children}
      </main>

      {/* ── Bottom nav for mobile ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 lg:hidden z-40">
        <div className="grid grid-cols-4 h-16 max-w-lg mx-auto px-2">
          {bottomNavItems.map((item) => {
            const base = item.href.split("?")[0];
            const active = base === "/" ? pathname === "/" : pathname.startsWith(base);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center gap-0.5 transition-all"
              >
                <div className={`w-10 h-7 flex items-center justify-center rounded-full transition-all ${
                  active
                    ? "text-green-500 dark:text-green-400"
                    : "text-slate-400 dark:text-slate-500"
                }`}>
                  <Icon active={active} />
                </div>
                <span className={`text-[10px] font-semibold leading-none transition-colors ${
                  active
                    ? "text-green-500 dark:text-green-400"
                    : "text-slate-400 dark:text-slate-500"
                }`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── SVG Icon components ──────────────────────────────────────────────────────

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg className="w-5 h-5" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12L12 4l9 8" stroke="currentColor" strokeWidth="2" fill="none" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" />
    </svg>
  );
}

function TennisIcon({ active }: { active: boolean }) {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" d="M12 3C8.5 6.5 8.5 17.5 12 21M12 3C15.5 6.5 15.5 17.5 12 21" />
    </svg>
  );
}

function TrophyIcon({ active }: { active: boolean }) {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8M12 17v4M17 4H7v7a5 5 0 0010 0V4zM7 6H4a2 2 0 000 4h3M17 6h3a2 2 0 010 4h-3" />
    </svg>
  );
}

function MessagesIcon({ active }: { active: boolean }) {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}
