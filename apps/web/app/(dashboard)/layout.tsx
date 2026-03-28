"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [userInitial, setUserInitial] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.replace("/login");
      else setUserInitial(user.email?.[0]?.toUpperCase() ?? "P");
    });
  }, [router]);

  const bottomNav = [
    { href: "/", label: "Courts", icon: CourtsIcon },
    { href: "/messages", label: "Chat", icon: ChatIcon },
    { href: "/tournaments", label: "Tourney", icon: TourneyIcon },
    { href: "/profile", label: "Profile", icon: ProfileIcon },
  ];

  return (
    <div className="min-h-screen bg-[#131313] text-[#e5e2e1]">

      {/* ── Top Nav ── */}
      <header className="fixed top-0 w-full z-50 bg-[#1b1c1c]/80 backdrop-blur-xl border-b border-white/5 shadow-[0_10px_30px_rgba(255,255,255,0.06)]">
        <div className="flex items-center justify-between px-6 h-16 max-w-7xl mx-auto">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#4be277]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" strokeWidth="2"/>
              <path strokeWidth="1.5" d="M12 3 C8 6.5 8 17.5 12 21 M12 3 C16 6.5 16 17.5 12 21"/>
            </svg>
            <span className="text-2xl font-black italic tracking-tighter text-[#4be277]">PLAYMATE</span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-8">
            {[
              { href: "/", label: "Courts", base: "/" },
              { href: "/courts/bookings", label: "Bookings", base: "/courts/bookings" },
              { href: "/tournaments", label: "Tournaments", base: "/tournaments" },
              { href: "/messages", label: "Chat", base: "/messages" },
            ].map((link) => {
              const active = link.base === "/" ? pathname === "/" : pathname.startsWith(link.base);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-bold tracking-tight text-sm transition-all duration-300 ${
                    active
                      ? "text-[#4be277] border-b-2 border-[#4be277] pb-0.5"
                      : "text-[#6b7280] hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Notification */}
            <button className="p-2 hover:bg-white/5 rounded-full transition-all active:scale-95 text-[#6b7280] hover:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
            </button>

            {/* Avatar */}
            {userInitial !== null && (
              <Link href="/profile">
                <div className="w-9 h-9 rounded-full bg-[#202020] border-2 border-[#4be277]/30 flex items-center justify-center text-[#4be277] text-sm font-black hover:border-[#4be277] transition-colors">
                  {userInitial}
                </div>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-28 lg:pb-8">
        {children}
      </main>

      {/* ── Mobile bottom nav ── */}
      <nav className="fixed bottom-0 left-0 right-0 lg:hidden z-50 bg-[#202020]/90 backdrop-blur-xl rounded-t-[2rem] shadow-2xl border-t border-white/5">
        <div className="flex justify-around items-center px-4 pb-6 pt-3">
          {bottomNav.map((item) => {
            const base = item.href === "/" ? "/" : item.href;
            const active = base === "/" ? pathname === "/" : pathname.startsWith(base);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 transition-all active:scale-90 ${
                  active
                    ? "text-[#4be277] bg-[#4be277]/10 rounded-full px-4 py-1"
                    : "text-white/40 hover:text-[#4be277]/80 px-4 py-1"
                }`}
              >
                <Icon active={active} />
                <span className="text-[10px] font-bold uppercase tracking-widest mt-0.5">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function CourtsIcon({ active }: { active: boolean }) {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16"/>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M9 21V12h6v9"/>
    </svg>
  );
}
function ChatIcon({ active }: { active: boolean }) {
  return (
    <svg className="w-5 h-5" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
    </svg>
  );
}
function TourneyIcon({ active }: { active: boolean }) {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8M12 17v4M17 4H7v7a5 5 0 0010 0V4zM7 6H4a2 2 0 000 4h3M17 6h3a2 2 0 010 4h-3"/>
    </svg>
  );
}
function ProfileIcon({ active }: { active: boolean }) {
  return (
    <svg className="w-5 h-5" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
    </svg>
  );
}
