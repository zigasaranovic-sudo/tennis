"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { createClient } from "@/lib/supabase/client";
import { useT } from "@/lib/i18n/context";

/* ─── Local types ─────────────────────────────────────────────────────────── */

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

/* ─── Gradient colours for booking thumbnails ─────────────────────────────── */
const THUMB_GRADIENTS = [
  "from-[#0d2010] via-[#193520] to-[#0a1a0c]",
  "from-[#111827] via-[#1f2937] to-[#0f172a]",
  "from-[#1a1204] via-[#2d2008] to-[#120d03]",
];

/* ════════════════════════════════════════════════════════════════════════════ */

export default function ProfilePage() {
  const router = useRouter();
  const { t } = useT();

  /* ── Data ── */
  const { data: profile, isLoading } = trpc.player.getProfile.useQuery();
  const { data: myRank } = trpc.ranking.getPlayerRank.useQuery();
  const { data: recentMatches } = trpc.match.getMyMatches.useQuery(
    { status: "completed", limit: 5 },
    { enabled: !!profile?.id }
  );
  const { data: upcomingBookings } = trpc.courts.getMyBookings.useQuery({
    upcoming: true,
  });

  /* ── Sign-out ── */
  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  /* ── Loading skeleton ── */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-[#4be277] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!profile) return null;

  /* ── Derived values ── */
  const winRate =
    profile.matches_played > 0
      ? Math.round((profile.matches_won / profile.matches_played) * 100)
      : 0;

  const totalCourtHours = ((upcomingBookings ?? []) as unknown as Booking[])
    .reduce((acc, b) => {
      return (
        acc +
        (new Date(b.ends_at).getTime() - new Date(b.starts_at).getTime()) /
          3_600_000
      );
    }, 0)
    .toFixed(0);

  const matches = (recentMatches ?? []) as unknown as RecentMatch[];
  const bookings = (upcomingBookings ?? []) as unknown as Booking[];

  /* Activity feed derived from recent matches */
  const activities = matches.slice(0, 5).map((m) => {
    const isP1 = m.player1?.id === profile.id;
    const opponent = isP1 ? m.player2 : m.player1;
    const won = m.winner_id === profile.id;
    const scoreStr =
      m.score_detail
        ?.map((s) => (isP1 ? `${s.p1}-${s.p2}` : `${s.p2}-${s.p1}`))
        .join(", ") ?? "";
    const daysAgo = m.played_at
      ? Math.floor(
          (Date.now() - new Date(m.played_at).getTime()) / 86_400_000
        )
      : null;
    const timeLabel =
      daysAgo === null
        ? ""
        : daysAgo === 0
        ? "TODAY"
        : daysAgo === 1
        ? "1D AGO"
        : `${daysAgo}D AGO`;
    return { won, opponent: opponent?.full_name ?? "Unknown", scoreStr, timeLabel };
  });

  /* Name split for 2-line hero heading */
  const nameParts = (profile.full_name ?? "Player").split(" ");
  const heroFirst = nameParts[0] ?? "";
  const heroLast = nameParts.slice(1).join(" ");

  /* ── NTRP / skill level display ── */
  const skillDisplay = profile.skill_level
    ? Number(profile.skill_level).toFixed(1)
    : "—";

  /* ════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-[#131313] pb-32">

      {/* ── Hero section ─────────────────────────────────────────────────── */}
      <div className="relative px-4 sm:px-6 pt-6 pb-6">

        {/* ELITE MEMBER label */}
        <p className="text-[#4be277] text-[10px] font-bold uppercase tracking-widest mb-3">
          {myRank?.rank ? "RANKED MEMBER" : "ELITE MEMBER"}
        </p>

        {/* Name heading + skill badge side-by-side */}
        <div className="flex items-start justify-between gap-4">

          {/* Name (2 lines) */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold tracking-tight text-white leading-tight">
              {heroFirst}
              {heroLast && (
                <>
                  <br />
                  {heroLast}
                </>
              )}
            </h1>
          </div>

          {/* Skill badge — glass card top-right */}
          <div className="bg-[#202020]/60 backdrop-blur border border-white/5 rounded-2xl px-4 py-3 text-center shrink-0">
            <p className="text-[9px] font-bold text-[#6b7280] uppercase tracking-widest mb-0.5">
              LEVEL
            </p>
            <p className="text-3xl font-black italic text-[#4be277] leading-none">
              {skillDisplay}
            </p>
            <p className="text-[9px] font-bold text-[#6b7280] uppercase tracking-widest mt-0.5">
              NTRP
            </p>
          </div>
        </div>

        {/* Location row */}
        {(profile.city || profile.country) && (
          <div className="flex items-center gap-1.5 text-[#6b7280] mt-3">
            {/* pin icon */}
            <svg
              className="w-3.5 h-3.5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="text-sm">
              {[profile.city, profile.country].filter(Boolean).join(", ")}
            </span>
          </div>
        )}
      </div>

      {/* ── Bento stats grid ─────────────────────────────────────────────── */}
      <div className="px-4 sm:px-6 mb-6">
        <div className="grid grid-cols-2 gap-3">

          {/* Col 1: Matches played — full height */}
          <div className="bg-[#202020] rounded-3xl border border-white/5 p-5 flex flex-col justify-between row-span-2 min-h-[176px]">
            {/* Tennis-ball SVG icon */}
            <div className="w-10 h-10 bg-[#2a2a2a] rounded-2xl flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-[#4be277]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="9" strokeWidth={2} />
                <path
                  strokeLinecap="round"
                  strokeWidth={1.5}
                  d="M12 3C8.5 6.5 8.5 17.5 12 21M12 3C15.5 6.5 15.5 17.5 12 21"
                />
              </svg>
            </div>
            <div>
              <p className="text-5xl font-black text-white leading-none mb-1">
                {profile.matches_played}
              </p>
              <p className="text-[10px] font-bold text-[#6b7280] uppercase tracking-widest">
                MATCHES PLAYED
              </p>
            </div>
          </div>

          {/* Col 2 top: Court hours */}
          <div className="bg-[#202020] rounded-3xl border border-white/5 p-4 flex flex-col justify-between">
            <p className="text-[10px] font-bold text-[#6b7280] uppercase tracking-widest mb-1">
              COURT HOURS
            </p>
            <p className="text-3xl font-black text-white leading-none">
              {totalCourtHours}
            </p>
          </div>

          {/* Col 2 bottom: Win rate — green tint */}
          <div className="bg-[#4be277]/10 border border-[#4be277]/10 rounded-3xl p-4 flex flex-col justify-between">
            <p className="text-[10px] font-bold text-[#4be277]/60 uppercase tracking-widest mb-1">
              WIN RATE
            </p>
            <p className="text-3xl font-black text-[#4be277] leading-none">
              {winRate}%
            </p>
          </div>
        </div>
      </div>

      {/* ── Upcoming bookings ─────────────────────────────────────────────── */}
      {bookings.length > 0 && (
        <div className="px-4 sm:px-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Upcoming
            </h2>
            <Link
              href="/courts/bookings"
              className="text-[10px] font-bold text-[#4be277] uppercase tracking-widest hover:text-green-300 transition-colors"
            >
              VIEW ALL
            </Link>
          </div>

          <div className="space-y-2">
            {bookings.slice(0, 3).map((b, idx) => {
              const start = new Date(b.starts_at);
              const dateLabel = start
                .toLocaleDateString("en-US", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })
                .toUpperCase();
              const timeLabel = start.toLocaleTimeString("sl-SI", {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={b.id}
                  className="flex items-center gap-3 bg-[#1b1b1b] rounded-2xl border border-white/5 p-3"
                >
                  {/* Thumbnail — gradient placeholder */}
                  <div
                    className={`w-14 h-14 rounded-xl shrink-0 bg-gradient-to-br ${
                      THUMB_GRADIENTS[idx % THUMB_GRADIENTS.length]
                    } flex items-center justify-center`}
                  >
                    <svg
                      className="w-6 h-6 text-[#4be277]/40"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="12" r="9" strokeWidth={1.5} />
                      <path
                        strokeWidth={1.2}
                        d="M12 3C8.5 6.5 8.5 17.5 12 21M12 3C15.5 6.5 15.5 17.5 12 21"
                      />
                    </svg>
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Date pill + time */}
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-black text-[#4be277] bg-[#4be277]/10 border border-[#4be277]/20 px-2 py-0.5 rounded-full">
                        {dateLabel}
                      </span>
                      <span className="text-[10px] font-bold text-[#9ca3af]">
                        {timeLabel}
                      </span>
                    </div>

                    {/* Venue name */}
                    <p className="font-bold text-white text-sm truncate">
                      {b.court?.venue?.name ?? "Court"}
                    </p>

                    {/* Court type */}
                    <p className="text-[11px] text-[#6b7280] uppercase tracking-wide mt-0.5 truncate">
                      {b.court?.name}
                      {b.court?.surface ? ` · ${b.court.surface}` : ""}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Recent Activity ───────────────────────────────────────────────── */}
      {activities.length > 0 && (
        <div className="px-4 sm:px-6 mb-6">
          <h2 className="text-lg font-bold text-white tracking-tight mb-3">
            Recent Activity
          </h2>

          <div>
            {activities.map((a, i) => (
              <div
                key={i}
                className="flex items-center gap-3 py-4 border-b border-[#202020] last:border-0"
              >
                {/* Circle icon — green (won) or muted (lost) */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    a.won
                      ? "bg-[#4be277]"
                      : "bg-[#202020] border border-white/5"
                  }`}
                >
                  {a.won ? (
                    /* checkmark */
                    <svg
                      className="w-5 h-5 text-black"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    /* X / close */
                    <svg
                      className="w-4 h-4 text-[#6b7280]"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm">
                    {a.won ? "Won Singles Match" : "Lost Singles Match"}
                  </p>
                  <p className="text-xs text-[#6b7280] truncate">
                    {a.won ? "Defeated" : "vs."} {a.opponent}
                    {a.scoreStr ? ` · ${a.scoreStr}` : ""}
                  </p>
                </div>

                {a.timeLabel && (
                  <span className="text-[10px] font-bold text-[#4b5563] uppercase tracking-wide shrink-0">
                    {a.timeLabel}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Edit profile + Sign out ───────────────────────────────────────── */}
      <div className="px-4 sm:px-6 space-y-3">
        <Link
          href="/profile/edit"
          className="flex items-center justify-center w-full py-3.5 bg-[#202020] border border-white/5 rounded-2xl text-white font-bold hover:border-white/10 transition-colors"
        >
          {t.profilePage.editProfile}
        </Link>

        <button
          onClick={handleSignOut}
          className="w-full py-3.5 text-red-400 font-bold text-sm hover:text-red-300 transition-colors"
        >
          {t.profilePage.signOut}
        </button>
      </div>
    </div>
  );
}
