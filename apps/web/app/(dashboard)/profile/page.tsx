"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type RecentMatch = {
  id: string;
  winner_id: string | null;
  player1: { id: string } | null;
  player2: { id: string } | null;
};

export default function ProfilePage() {
  const router = useRouter();
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
  const { data: availability } = trpc.player.getAvailability.useQuery(
    { player_id: profile?.id ?? "" },
    { enabled: !!profile?.id }
  );
  const { data: recentMatches } = trpc.match.getMyMatches.useQuery(
    { status: "completed", limit: 10 },
    { enabled: !!profile?.id }
  );

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
    !profile.city && { key: "city", label: "City" },
    !profile.home_club && { key: "home_club", label: "Home club" },
    !profile.bio && { key: "bio", label: "Bio" },
  ].filter(Boolean) as { key: string; label: string }[];

  const recentForm = recentMatches
    ? (recentMatches as unknown as RecentMatch[]).slice(0, 5).map((m) => m.winner_id === profile.id)
    : [];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile completeness banner */}
      {!bannerDismissed && missingFields.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 rounded-xl p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                Complete your profile to be found by more players
              </p>
              <ul className="mt-2 space-y-1">
                {missingFields.map((field) => (
                  <li key={field.key} className="text-sm text-amber-600 dark:text-amber-500">
                    · Missing: <span className="font-medium">{field.label}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/profile/edit"
                className="inline-block mt-3 text-sm font-medium text-amber-700 dark:text-amber-400 underline underline-offset-2 hover:text-amber-800 dark:hover:text-amber-300"
              >
                Complete profile →
              </Link>
            </div>
            <button
              onClick={handleDismissBanner}
              aria-label="Dismiss"
              className="text-amber-400 dark:text-amber-600 hover:text-amber-700 dark:hover:text-amber-300 shrink-0 text-lg leading-none"
            >
              ✕
            </button>
          </div>
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
            Edit Profile
          </Link>
        </div>

        {profile.bio && (
          <p className="text-gray-600 dark:text-slate-400 mt-4 text-sm">{profile.bio}</p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-gray-100 dark:border-slate-700">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">
              {myRank?.rank ? `#${myRank.rank}` : "–"}
            </p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Global Rank</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{profile.matches_played}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Matches</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{winRate}%</p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Win Rate</p>
          </div>
        </div>
      </div>

      {/* Recent Form */}
      {recentMatches && recentMatches.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Recent Form</h2>
            {winRate > 0 && (
              <span className="text-sm font-medium bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-3 py-1 rounded-full">
                {winRate}% win rate
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {recentForm.map((won, i) => (
              <div
                key={i}
                title={won ? "Win" : "Loss"}
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
            Last {recentForm.length} completed {recentForm.length === 1 ? "match" : "matches"}
          </p>
        </div>
      )}

      {/* Availability */}
      {availability && availability.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Availability</h2>
            <Link href="/profile/edit" className="text-sm text-green-600 hover:underline">
              Edit
            </Link>
          </div>
          <div className="space-y-2">
            {availability.map((slot) => (
              <div key={slot.id} className="flex items-center gap-3">
                <span className="w-24 text-sm font-medium text-gray-600 dark:text-slate-300">
                  {DAY_NAMES[slot.day_of_week]}
                </span>
                <span className="text-sm text-gray-500 dark:text-slate-400">
                  {slot.start_time} – {slot.end_time}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sign out */}
      <div className="text-center">
        <button
          onClick={handleSignOut}
          className="text-sm text-red-500 hover:text-red-700 hover:underline"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
