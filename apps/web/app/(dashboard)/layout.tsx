"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationBell } from "@/components/notification-bell";
import { NavSearch } from "@/components/nav-search";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useT } from "@/lib/i18n/context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { t } = useT();
  const [initial, setInitial] = useState<string | null>(null);

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

  const navLinks = [
    { href: "/players", label: t.nav.findPlayers },
    { href: "/open-matches", label: t.nav.openMatches },
    { href: "/matches", label: t.nav.matches },
    { href: "/messages", label: t.nav.messages },
    { href: "/courts", label: t.nav.courts },
    { href: "/tournaments", label: t.nav.tournaments },
  ];

  const bottomNavItems = [
    { href: "/", icon: "🏠", label: t.nav.home },
    { href: "/players", icon: "🔍", label: t.nav.find },
    { href: "/matches", icon: "🎾", label: t.nav.matches },
    { href: "/messages", icon: "💬", label: t.nav.messages },
    { href: "/courts", icon: "🏟️", label: t.nav.courts },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Top navigation */}
      <nav className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Left: logo + nav links */}
            <div className="flex items-center gap-6 min-w-0">
              <Link href="/" className="text-xl font-bold text-green-600 shrink-0">
                Tenis
              </Link>
              <div className="hidden lg:flex items-center gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-2 shrink-0">
              <NavSearch />
              <LanguageSwitcher />
              <ThemeToggle />
              <NotificationBell />
              {initial !== null && (
                <Link
                  href="/profile"
                  className="w-9 h-9 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-semibold hover:bg-green-700 transition-colors shrink-0"
                >
                  {initial}
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 lg:pb-8">
        {children}
      </main>

      {/* Bottom nav for mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 lg:hidden">
        <div className="grid grid-cols-5 h-16">
          {bottomNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 text-gray-500 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
