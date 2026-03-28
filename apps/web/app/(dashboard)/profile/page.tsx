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
  player1: { id: string; full_name: string } | null;
  player2: { id: string; full_name: string } | null;
  played_at: string | null;
  score_detail: { p1: number; p2: number }[] | null;
};

type Booking = {
  id: string;
  starts_at: string;
  ends_at: string;
  court: {
    id: string;
    name: string;
    surface: string;
    venue: { id: string; name: string; city: string } | null;
  } | null;
};

const VENUE_IMAGES = [
  "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=200&q=70",
  "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=200&q=70",
  "https://images.unsplash.com/photo-1530915365347-e35b749a0381?w=200&q=70",
];

export default function ProfilePage() {
  const router = useRouter();
  const { t } = useT();

  const { data: profile, isLoading } = trpc.player.getProfile.useQuery();
  const { data: myRank } = trpc.ranking.getPlayerRank.useQuery();
  const { data: recentMatches } = trpc.match.getMyMatches.useQuery(
    { status: "completed", limit: 5 },
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

  const winRate = profile.matches_played > 0
    ? Math.round((profile.matches_won / profile.matches_played) * 100) : 0;

  const matches = (recentMatches ?? []) as unknown as RecentMatch[];
  const bookings = (upcomingBookings ?? []) as unknown as Booking[];

  // Derive activity feed from recent matches
  const activities = matches.slice(0, 5).map((m) => {
    const isP1 = m.player1?.id === profile.id;
    const opponent = isP1 ? m.player2 : m.player1;
    const won = m.winner_id === profile.id;
    const scoreStr = m.score_detail?.map(s => isP1 ? `${s.p1}-${s.p2}` : `${s.p2}-${s.p1}`).join(", ") ?? "";
    const daysAgo = m.played_at
      ? Math.floor((Date.now() - new Date(m.played_at).getTime()) / 86400000) : null;
    const timeLabel = daysAgo === null ? "" : daysAgo === 0 ? "TODAY" : daysAgo === 1 ? "1D AGO" : `${daysAgo}D AGO`;
    return { won, opponent: opponent?.full_name, scoreStr, timeLabel };
  });

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 min-h-screen bg-[#0a0a0a] pb-32">

      {/* Header */}
      <div className="px-4 sm:px-6 pt-6 pb-5">
        {/* Member label */}
        <p className="text-[#22c55e] text-xs font-bold uppercase tracking-widest mb-2">
          {myRank?.rank ? "RANKED MEMBER" : "MEMBER"}
        </p>

        {/* Name + rank pill */}
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="flex-1">
            <h1 className="text-4xl font-black text-white leading-tight">{profile.full_name}</h1>
          </div>
          {myRank?.rank && (
            <div className="bg-[#141414] border border-[#222] rounded-2xl px-4 py-3 text-center shrink-0">
              <p className="text-[10px] font-bold text-[#6b7280] uppercase tracking-widest">RANK</p>
              <p className="text-2xl font-black text-[#22c55e] leading-tight">#{myRank.rank}</p>
            </div>
          )}
        </div>

        {profile.city && (
          <div className="flex items-center gap-1.5 text-[#6b7280]">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <span className="text-sm">{profile.city}, {profile.country}</span>
          </div>
        )}
      </div>

      {/* Stats grid — 2×2 like Figma */}
      <div className="px-4 sm:px-6 mb-6">
        <div className="grid grid-cols-2 gap-3">
          {/* Matches played */}
          <div className="bg-[#141414] rounded-3xl border border-[#222] p-5">
            <div className="w-10 h-10 bg-[#1e1e1e] rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" strokeWidth={2}/>
                <path strokeLinecap="round" d="M12 3C8.5 6.5 8.5 17.5 12 21M12 3C15.5 6.5 15.5 17.5 12 21" strokeWidth={1.5}/>
              </svg>
            </div>
            <p className="text-4xl font-black text-white leading-none mb-1">{profile.matches_played}</p>
            <p className="text-xs font-bold text-[#6b7280] uppercase tracking-widest">MATCHES PLAYED</p>
          </div>

          {/* Court hours */}
          <div className="bg-[#141414] rounded-3xl border border-[#222] p-5">
            <div className="w-10 h-10 bg-[#1e1e1e] rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-[#9ca3af]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" strokeWidth={2}/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 7v5l3 3"/>
              </svg>
            </div>
            <p className="text-4xl font-black text-white leading-none mb-1">
              {bookings.reduce((acc, b) => {
                const h = (new Date(b.ends_at).getTime() - new Date(b.starts_at).getTime()) / 3600000;
                return acc + h;
              }, 0).toFixed(0)}
            </p>
            <p className="text-xs font-bold text-[#6b7280] uppercase tracking-widest">COURT HOURS</p>
          </div>

          {/* Win rate — full width green card like Figma */}
          <div className="col-span-2 bg-[#0d2010] rounded-3xl border border-[#22c55e]/20 p-5 flex items-center justify-between">
            <div>
              <p className="text-5xl font-black text-[#22c55e] leading-none mb-1">{winRate}%</p>
              <p className="text-xs font-bold text-[#22c55e]/60 uppercase tracking-widest">WIN RATE</p>
            </div>
            <div className="w-16 h-16 relative">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" stroke="#1a3520" strokeWidth="3" />
                <circle cx="18" cy="18" r="15" fill="none" stroke="#22c55e" strokeWidth="3"
                  strokeDasharray={`${(winRate / 100) * 94.25} 94.25`}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-black text-[#22c55e]">{winRate}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming bookings */}
      {bookings.length > 0 && (
        <div className="px-4 sm:px-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-black text-white">Upcoming</h2>
            <p className="text-xs text-[#6b7280]">Next appearances on court</p>
            <Link href="/courts/bookings" className="text-xs font-bold text-[#22c55e] hover:text-green-400 uppercase tracking-wide">
              VIEW ALL
            </Link>
          </div>
          <div className="space-y-2">
            {bookings.slice(0, 3).map((b, idx) => {
              const start = new Date(b.starts_at);
              const dateLabel = start.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" }).toUpperCase();
              const timeLabel = start.toLocaleTimeString("sl-SI", { hour: "2-digit", minute: "2-digit" });
              return (
                <div key={b.id} className="flex items-center gap-3 bg-[#141414] rounded-2xl border border-[#222] p-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0">
                    <img src={VENUE_IMAGES[idx % VENUE_IMAGES.length]} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-black text-[#22c55e] bg-[#22c55e]/10 border border-[#22c55e]/20 px-2 py-0.5 rounded-full">{dateLabel}</span>
                      <span className="text-[10px] font-bold text-[#9ca3af]">{timeLabel}</span>
                    </div>
                    <p className="font-black text-white text-sm truncate">{b.court?.venue?.name ?? "Court"}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <svg className="w-3 h-3 text-[#4b5563]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth={2}/>
                      </svg>
                      <p className="text-[11px] text-[#6b7280] uppercase tracking-wide">{b.court?.name} ({b.court?.surface})</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {activities.length > 0 && (
        <div className="px-4 sm:px-6 mb-6">
          <h2 className="text-lg font-black text-white mb-3">Recent Activity</h2>
          <div className="space-y-0">
            {activities.map((a, i) => (
              <div key={i} className="flex items-center gap-3 py-4 border-b border-[#141414]">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${a.won ? "bg-[#22c55e]" : "bg-[#1e1e1e]"}`}>
                  {a.won ? (
                    <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-[#6b7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm">{a.won ? "Won Singles Match" : "Lost Singles Match"}</p>
                  <p className="text-xs text-[#6b7280]">{a.won ? "Defeated" : "Vs."} {a.opponent}{a.scoreStr ? ` · ${a.scoreStr}` : ""}</p>
                </div>
                {a.timeLabel && (
                  <span className="text-[10px] font-bold text-[#4b5563] uppercase tracking-wide shrink-0">{a.timeLabel}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit + Sign out */}
      <div className="px-4 sm:px-6 space-y-3">
        <Link href="/profile/edit"
          className="flex items-center justify-center w-full py-3.5 bg-[#141414] border border-[#222] rounded-2xl text-white font-bold hover:border-[#333] transition-colors">
          {t.profilePage.editProfile}
        </Link>
        <button onClick={handleSignOut}
          className="w-full py-3.5 text-red-400 font-bold text-sm hover:text-red-300 transition-colors">
          {t.profilePage.signOut}
        </button>
      </div>
    </div>
  );
}
