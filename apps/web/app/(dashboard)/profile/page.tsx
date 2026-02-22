"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function ProfilePage() {
  const router = useRouter();
  const { data: profile, isLoading } = trpc.player.getProfile.useQuery();
  const { data: eloHistory } = trpc.player.getEloHistory.useQuery(
    { player_id: profile?.id ?? "" },
    { enabled: !!profile?.id }
  );
  const { data: myRank } = trpc.ranking.getPlayerRank.useQuery();
  const { data: availability } = trpc.player.getAvailability.useQuery(
    { player_id: profile?.id ?? "" },
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
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
              <h1 className="text-2xl font-bold text-gray-900">{profile.full_name}</h1>
              <p className="text-gray-500">@{profile.username}</p>
              {profile.city && (
                <p className="text-sm text-gray-400 mt-1">📍 {profile.city}, {profile.country}</p>
              )}
            </div>
          </div>
          <Link
            href="/profile/edit"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Edit Profile
          </Link>
        </div>

        {profile.bio && (
          <p className="text-gray-600 mt-4 text-sm">{profile.bio}</p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6 pt-5 border-t border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {profile.elo_rating}
              {profile.elo_provisional && (
                <span className="text-sm text-gray-400 font-normal ml-0.5">*</span>
              )}
            </p>
            <p className="text-xs text-gray-500 mt-1">ELO Rating</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {myRank?.rank ? `#${myRank.rank}` : "–"}
            </p>
            <p className="text-xs text-gray-500 mt-1">Global Rank</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{profile.matches_played}</p>
            <p className="text-xs text-gray-500 mt-1">Matches</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{winRate}%</p>
            <p className="text-xs text-gray-500 mt-1">Win Rate</p>
          </div>
        </div>
      </div>

      {/* ELO Progress */}
      {eloHistory && eloHistory.length > 1 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">ELO Progress</h2>
          <div className="h-32 flex items-end gap-1">
            {eloHistory.slice(-30).map((point, i) => {
              const values = eloHistory.slice(-30).map((p) => p.elo_after);
              const min = Math.min(...values);
              const max = Math.max(...values);
              const range = max - min || 1;
              const height = ((point.elo_after - min) / range) * 100;
              return (
                <div
                  key={i}
                  className={`flex-1 rounded-t ${point.elo_delta > 0 ? "bg-green-400" : "bg-red-400"}`}
                  style={{ height: `${Math.max(height, 3)}%` }}
                  title={`${point.elo_after} (${point.elo_delta > 0 ? "+" : ""}${point.elo_delta})`}
                />
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Earlier</span>
            <span>
              Current: {eloHistory[eloHistory.length - 1]?.elo_after} ELO
            </span>
          </div>
          {profile.elo_provisional && (
            <p className="text-xs text-gray-400 mt-2">
              * Provisional rating — play {10 - profile.matches_played} more matches to establish your ELO
            </p>
          )}
        </div>
      )}

      {/* Availability */}
      {availability && availability.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Availability</h2>
            <Link href="/profile/edit" className="text-sm text-green-600 hover:underline">
              Edit
            </Link>
          </div>
          <div className="space-y-2">
            {availability.map((slot) => (
              <div key={slot.id} className="flex items-center gap-3">
                <span className="w-24 text-sm font-medium text-gray-600">
                  {DAY_NAMES[slot.day_of_week]}
                </span>
                <span className="text-sm text-gray-500">
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
