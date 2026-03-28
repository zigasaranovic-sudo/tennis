"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useT } from "@/lib/i18n/context";

type RecentMatch = {
  id: string;
  winner_id: string | null;
  player1: { id: string } | null;
  player2: { id: string } | null;
};

type Booking = {
  id: string;
  starts_at: string;
  ends_at: string;
  status: "confirmed" | "cancelled";
  notes: string | null;
  court: {
    id: string;
    name: string;
    surface: string;
    is_indoor: boolean;
    venue: { id: string; name: string; city: string } | null;
  } | null;
};

export default function ProfilePage() {
  const router = useRouter();
  const { t } = useT();
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("profile-banner-dismissed") === "true") {
      setBannerDismissed(true);
    }
  }, []);

  const handleDismissBanner = () => {
    localStorage.setItem("profile-banner-dismissed", "true");
    setBannerDismissed(true);
  };

  const { data: profile, isLoading } = trpc.player.getProfile.useQuery();
  const { data: myRank } = trpc.ranking.getPlayerRank.useQuery();
  const { data: recentMatches } = trpc.match.getMyMatches.useQuery(
    { status: "completed", limit: 10 },
    { enabled: !!profile?.id }
  );
  const { data: upcomingBookings } = trpc.courts.getMyBookings.useQuery({ upcoming: true });

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-[#22c55e] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!profile) return null;

  const winRate =
    profile.matches_played > 0
      ? Math.round((profile.matches_won / profile.matches_played) * 100)
      : 0;

  const missingFields = [
    !profile.city && { key: "city", label: t.profile.city },
    !profile.home_club && { key: "home_club", label: t.profile.homeClub },
    !profile.bio && { key: "bio", label: t.profile.bio },
  ].filter(Boolean) as { key: string; label: string }[];

  const recentForm = recentMatches
    ? (recentMatches as unknown as RecentMatch[]).slice(0, 5).map((m) => m.winner_id === profile.id)
    : [];

  return (
    <div className="max-w-2xl mx-auto space-y-4">

      {/* Profile completeness notice */}
      {!bannerDismissed && missingFields.length > 0 && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-sm">
          <div className="flex items-center gap-2 text-[#6b7280]">
            <span className="text-base">📋</span>
            <span>
              {t.profilePage.incomplete} —{" "}
              <span className="text-[#9ca3af]">
                {missingFields.map((f) => f.label).join(", ")} {t.profilePage.missingFields}
              </span>
            </span>
            <Link href="/profile/edit" className="text-[#22c55e] font-semibold hover:text-green-400 ml-1 transition-colors">
              {t.profilePage.fixIt}
            </Link>
          </div>
          <button
            onClick={handleDismissBanner}
            aria-label="Dismiss"
            className="text-[#4b5563] hover:text-[#9ca3af] transition-colors shrink-0"
          >
            ✕
          </button>
        </div>
      )}

      {/* Profile header */}
      <div className="bg-[#111111] rounded-2xl border border-[#1e1e1e] overflow-hidden">
        {/* Cover gradient */}
        <div className="h-20 bg-gradient-to-r from-[#22c55e]/20 via-[#16a34a]/10 to-transparent" />

        <div className="px-5 pb-5 -mt-10">
          <div className="flex items-end justify-between mb-4">
            <div className="w-20 h-20 rounded-2xl bg-[#22c55e] flex items-center justify-center text-white font-black text-2xl overflow-hidden border-4 border-[#111111] shadow-xl shadow-green-500/20">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                profile.full_name[0]
              )}
            </div>
            <Link
              href="/profile/edit"
              className="px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] text-[#9ca3af] hover:text-white hover:border-[#3a3a3a] rounded-xl text-sm font-semibold transition-colors"
            >
              {t.profilePage.editProfile}
            </Link>
          </div>

          <h1 className="text-xl font-black text-white">{profile.full_name}</h1>
          <p className="text-sm text-[#6b7280]">@{profile.username}</p>
          {profile.city && (
            <p className="text-sm text-[#4b5563] mt-1 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              {profile.city}, {profile.country}
            </p>
          )}

          {profile.bio && (
            <p className="text-sm text-[#9ca3af] mt-3 leading-relaxed">{profile.bio}</p>
          )}

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-[#1e1e1e]">
            <Link href="/ranking" className="text-center bg-[#1a1a1a] rounded-xl p-3 border border-[#2a2a2a] hover:border-[#22c55e]/40 transition-colors">
              <p className="text-xl font-black text-white">
                {myRank?.rank ? `#${myRank.rank}` : "–"}
              </p>
              <p className="text-[10px] text-[#4b5563] mt-0.5 uppercase tracking-wide font-semibold">{t.profilePage.globalRank}</p>
            </Link>
            <div className="text-center bg-[#1a1a1a] rounded-xl p-3 border border-[#2a2a2a]">
              <p className="text-xl font-black text-white">{profile.matches_played}</p>
              <p className="text-[10px] text-[#4b5563] mt-0.5 uppercase tracking-wide font-semibold">{t.profile.matches}</p>
            </div>
            <div className="text-center bg-[#1a1a1a] rounded-xl p-3 border border-[#2a2a2a]">
              <p className="text-xl font-black text-white">{winRate}%</p>
              <p className="text-[10px] text-[#4b5563] mt-0.5 uppercase tracking-wide font-semibold">{t.profile.winRate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Form */}
      {recentMatches && recentMatches.length > 0 && (
        <div className="bg-[#111111] rounded-2xl border border-[#1e1e1e] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wide">{t.profilePage.recentForm}</h2>
            {winRate > 0 && (
              <span className="text-xs font-bold text-[#22c55e] bg-[#22c55e]/10 border border-[#22c55e]/20 px-2.5 py-1 rounded-full">
                {winRate}% {t.ranking.winRate}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {recentForm.map((won, i) => (
              <div
                key={i}
                title={won ? t.profilePage.win : t.profilePage.loss}
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-black shadow-lg ${
                  won ? "bg-[#22c55e] shadow-green-500/20" : "bg-red-500/80 shadow-red-500/20"
                }`}
              >
                {won ? "W" : "L"}
              </div>
            ))}
            {recentForm.length < 5 &&
              Array.from({ length: 5 - recentForm.length }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="w-9 h-9 rounded-xl bg-[#1a1a1a] border border-dashed border-[#2a2a2a]"
                />
              ))}
          </div>
          <p className="text-xs text-[#4b5563] mt-3">
            {t.profilePage.lastMatches
            .replace("{n}", String(recentForm.length))
            .replace("{match}", t.nav.matches.toLowerCase())}
          </p>
        </div>
      )}

      {/* Upcoming Bookings */}
      <div id="bookings" className="bg-[#111111] rounded-2xl border border-[#1e1e1e] p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wide">{t.profilePage.upcomingBookings}</h2>
          <Link
            href="/courts/bookings"
            className="text-xs text-[#22c55e] hover:text-green-400 font-semibold transition-colors"
          >
            {t.profilePage.seeAllBookings} →
          </Link>
        </div>
        {upcomingBookings && upcomingBookings.length > 0 ? (
          <div className="space-y-2">
            {(upcomingBookings as unknown as Booking[]).slice(0, 3).map((booking) => {
              const court = booking.court;
              const venue = court?.venue;
              const start = new Date(booking.starts_at);
              const end = new Date(booking.ends_at);
              const hours = (end.getTime() - start.getTime()) / 3_600_000;
              return (
                <div key={booking.id} className="flex items-center gap-3 bg-[#1a1a1a] rounded-xl p-3 border border-[#2a2a2a]">
                  <div className="w-9 h-9 bg-[#22c55e]/10 rounded-xl flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth={2}/>
                      <line x1="16" y1="2" x2="16" y2="6" strokeWidth={2}/>
                      <line x1="8" y1="2" x2="8" y2="6" strokeWidth={2}/>
                      <line x1="3" y1="10" x2="21" y2="10" strokeWidth={2}/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">
                      {court?.name ?? "Court"} · {venue?.name}
                    </p>
                    <p className="text-xs text-[#6b7280]">
                      {start.toLocaleDateString("sl-SI", { weekday: "short", month: "short", day: "numeric" })}{" "}
                      · {start.toLocaleTimeString("sl-SI", { hour: "2-digit", minute: "2-digit" })}–{end.toLocaleTimeString("sl-SI", { hour: "2-digit", minute: "2-digit" })}
                      <span className="text-[#4b5563] ml-1">({hours}h)</span>
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-[#22c55e] bg-[#22c55e]/10 border border-[#22c55e]/20 px-2 py-1 rounded-full whitespace-nowrap">
                    Confirmed
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-[#1a1a1a] rounded-2xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-[#4b5563]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth={2}/>
                <line x1="16" y1="2" x2="16" y2="6" strokeWidth={2}/>
                <line x1="8" y1="2" x2="8" y2="6" strokeWidth={2}/>
                <line x1="3" y1="10" x2="21" y2="10" strokeWidth={2}/>
              </svg>
            </div>
            <p className="text-sm text-[#6b7280]">{t.profilePage.noUpcomingBookings}</p>
            <Link
              href="/"
              className="mt-2 inline-block text-sm text-[#22c55e] hover:text-green-400 font-semibold transition-colors"
            >
              Rezerviraj igrišče →
            </Link>
          </div>
        )}
      </div>

      {/* Sign out */}
      <div className="text-center pb-4">
        <button
          onClick={handleSignOut}
          className="text-sm text-red-400 hover:text-red-300 font-semibold transition-colors"
        >
          {t.profilePage.signOut}
        </button>
      </div>
    </div>
  );
}
