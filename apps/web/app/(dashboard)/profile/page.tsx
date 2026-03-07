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
        <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full" />
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
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile completeness notice */}
      {!bannerDismissed && missingFields.length > 0 && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm">
          <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400">
            <span className="text-base">📋</span>
            <span>
              {t.profilePage.incomplete} —{" "}
              <span className="text-gray-700 dark:text-slate-300">
                {missingFields.map((f) => f.label).join(", ")} {t.profilePage.missingFields}
              </span>
            </span>
            <Link href="/profile/edit" className="text-green-600 dark:text-green-400 font-medium hover:underline ml-1">
              {t.profilePage.fixIt}
            </Link>
          </div>
          <button
            onClick={handleDismissBanner}
            aria-label="Dismiss"
            className="text-gray-400 dark:text-slate-600 hover:text-gray-600 dark:hover:text-slate-400 shrink-0"
          >
            ✕
          </button>
        </div>
      )}

      {/* Profile header */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-3xl overflow-hidden">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                profile.full_name[0]
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">{profile.full_name}</h1>
              <p className="text-gray-500 dark:text-slate-400">@{profile.username}</p>
              {profile.city && (
                <p className="text-sm text-gray-400 dark:text-slate-600 mt-1">📍 {profile.city}, {profile.country}</p>
              )}
            </div>
          </div>
          <Link
            href="/profile/edit"
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors text-sm font-medium"
          >
            {t.profilePage.editProfile}
          </Link>
        </div>

        {profile.bio && (
          <p className="text-gray-600 dark:text-slate-400 mt-4 text-sm">{profile.bio}</p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-gray-100 dark:border-slate-700">
          <Link href="/ranking" className="text-center hover:opacity-75 transition-opacity">
            <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">
              {myRank?.rank ? `#${myRank.rank}` : "–"}
            </p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{t.profilePage.globalRank}</p>
          </Link>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{profile.matches_played}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{t.profile.matches}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{winRate}%</p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{t.profile.winRate}</p>
          </div>
        </div>
      </div>

      {/* Recent Form */}
      {recentMatches && recentMatches.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">{t.profilePage.recentForm}</h2>
            {winRate > 0 && (
              <span className="text-sm font-medium bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-3 py-1 rounded-full">
                {winRate}% {t.ranking.winRate}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {recentForm.map((won, i) => (
              <div
                key={i}
                title={won ? t.profilePage.win : t.profilePage.loss}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                  won ? "bg-green-500 dark:bg-green-600" : "bg-red-400 dark:bg-red-600"
                }`}
              >
                {won ? "W" : "L"}
              </div>
            ))}
            {recentForm.length < 5 &&
              Array.from({ length: 5 - recentForm.length }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 border border-dashed border-gray-300 dark:border-slate-600"
                />
              ))}
          </div>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-3">
            {t.profilePage.lastMatches
            .replace("{n}", String(recentForm.length))
            .replace("{match}", recentForm.length === 1 ? t.nav.matches.toLowerCase() : t.nav.matches.toLowerCase())}
          </p>
        </div>
      )}

      {/* Upcoming Bookings */}
      <div id="bookings" className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">{t.profilePage.upcomingBookings}</h2>
          <Link
            href="/matches?tab=bookings"
            className="text-sm text-green-600 dark:text-green-400 font-medium hover:underline"
          >
            {t.profilePage.seeAllBookings}
          </Link>
        </div>
        {upcomingBookings && upcomingBookings.length > 0 ? (
          <div className="space-y-3">
            {(upcomingBookings as unknown as Booking[]).slice(0, 3).map((booking) => {
              const court = booking.court;
              const venue = court?.venue;
              const start = new Date(booking.starts_at);
              const end = new Date(booking.ends_at);
              const hours = (end.getTime() - start.getTime()) / 3_600_000;
              return (
                <div key={booking.id} className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-slate-700 last:border-0">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                    🎾
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">
                      {court?.name ?? "Court"} · {venue?.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      {start.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}{" "}
                      {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}–{end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      <span className="text-gray-400 dark:text-slate-600 ml-1">({hours}h)</span>
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-slate-500 flex-shrink-0">📍 {venue?.city}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-gray-500 dark:text-slate-400">{t.profilePage.noUpcomingBookings}</p>
            <Link
              href="/matches?tab=courts"
              className="mt-2 inline-block text-sm text-green-600 dark:text-green-400 font-medium hover:underline"
            >
              {t.matches.bookCourt} →
            </Link>
          </div>
        )}
      </div>

      {/* Sign out */}
      <div className="text-center">
        <button
          onClick={handleSignOut}
          className="text-sm text-red-500 hover:text-red-700 hover:underline"
        >
          {t.profilePage.signOut}
        </button>
      </div>
    </div>
  );
}
