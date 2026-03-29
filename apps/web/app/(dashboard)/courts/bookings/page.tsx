"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";

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

// Surface → court image fallback
const SURFACE_IMAGES: Record<string, string> = {
  clay:    "https://api.courtiplay.com/storage/v1/render/image/public/banners/33a4b992-23df-4ca8-90f6-80645fed4f92/IMG_1742.jpeg?height=600&resize=contain",
  hard:    "https://api.courtiplay.com/storage/v1/render/image/public/banners/707f60ba-39f4-4a67-9f9d-52b7dc25428b/1000005826.jpg?height=600&resize=contain",
  grass:   "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80",
  indoor:  "https://api.courtiplay.com/storage/v1/render/image/public/banners/a4c78234-1eda-4d6c-b950-b5e3da099e6f/Screenshot%202025-10-26%20at%2015.34.33.png?height=600&resize=contain",
  default: "https://images.unsplash.com/photo-1530915365347-e35b749a0381?w=800&q=80",
};

function courtImage(surface: string, is_indoor: boolean): string {
  if (is_indoor) return SURFACE_IMAGES.indoor;
  return SURFACE_IMAGES[surface] ?? SURFACE_IMAGES.default;
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function surfaceLabel(surface: string, is_indoor: boolean) {
  if (is_indoor) return "Indoor";
  return surface.charAt(0).toUpperCase() + surface.slice(1) + " Court";
}

export default function MyMatchesPage() {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const utils = trpc.useUtils();

  // Mobile: single query based on tab
  const { data: mobileData, isLoading: mobileLoading } = trpc.courts.getMyBookings.useQuery(
    { upcoming: tab === "upcoming" },
  );

  // Desktop: both queries always running
  const { data: upcomingData, isLoading: upcomingLoading } = trpc.courts.getMyBookings.useQuery({ upcoming: true });
  const { data: pastData, isLoading: pastLoading } = trpc.courts.getMyBookings.useQuery({ upcoming: false });

  const cancelBooking = trpc.courts.cancelBooking.useMutation({
    onSuccess: () => utils.courts.getMyBookings.invalidate(),
  });

  const handleCancel = async (id: string) => {
    await cancelBooking.mutateAsync({ booking_id: id });
  };

  // Mobile list
  const mobileList = (mobileData ?? []) as unknown as Booking[];
  const mobileFeatured = mobileList[0] ?? null;
  const mobileRest = mobileList.slice(1);

  // Desktop lists
  const upcomingList = (upcomingData ?? []) as unknown as Booking[];
  const pastList = (pastData ?? []) as unknown as Booking[];
  const desktopLoading = upcomingLoading || pastLoading;

  return (
    <div className="min-h-screen" style={{ background: "#131313", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ── Hero header ── */}
      <div className="px-5 pt-6 pb-2 lg:px-8 lg:pt-10">
        {/* Mobile header */}
        <div className="lg:hidden">
          <h1 className="text-3xl font-black text-white leading-tight">My Matches</h1>
        </div>
        {/* Desktop header */}
        <div className="hidden lg:flex items-end justify-between mb-8">
          <div>
            <p className="text-[#4be277] text-xs font-bold uppercase tracking-[0.2em] mb-2">Player Dashboard</p>
            <h1 className="text-6xl font-black text-white leading-none">My</h1>
            <h1 className="text-6xl font-black leading-none" style={{ color: "#4be277" }}>Matches.</h1>
          </div>
        </div>
      </div>

      {/* ── Mobile tabs ── */}
      <div className="lg:hidden px-5 mt-4 mb-5">
        <div className="flex rounded-2xl p-1" style={{ background: "#1b1c1c" }}>
          {(["upcoming", "past"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 px-5 py-2 rounded-xl text-sm font-bold capitalize transition-all"
              style={tab === t
                ? { background: "#4be277", color: "#003915" }
                : { color: "rgba(188,203,185,0.45)" }
              }
            >
              {t === "upcoming" ? "Upcoming" : "Past"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Mobile content ── */}
      <div className="lg:hidden">
        {mobileLoading ? (
          <div className="px-5 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-3xl animate-pulse" style={{ background: "#1b1c1c", height: 280 }} />
            ))}
          </div>
        ) : tab === "upcoming" ? (
          <div className="px-5 space-y-4">
            {mobileList.length === 0 ? (
              <div className="pt-10 text-center">
                <p className="font-black text-white text-lg mb-1">No upcoming matches</p>
                <p className="text-sm mb-5" style={{ color: "#6b7280" }}>Book a court to get started</p>
                <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-black text-sm"
                  style={{ background: "linear-gradient(135deg, #4be277, #22c55e)" }}>
                  Find a court
                </Link>
              </div>
            ) : (
              <>
                {mobileFeatured && (
                  <FeaturedCard booking={mobileFeatured} onCancel={handleCancel} cancelling={cancelBooking.isPending} />
                )}
                {mobileRest.map((b) => (
                  <CompactCard key={b.id} booking={b} tab="upcoming" onCancel={handleCancel} cancelling={cancelBooking.isPending} />
                ))}
              </>
            )}
          </div>
        ) : (
          <div className="px-5">
            {mobileList.length === 0 ? (
              <div className="pt-10 text-center">
                <p className="font-black text-white text-lg mb-1">No past matches</p>
              </div>
            ) : (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "#6b7280" }}>Recent History</p>
                  <Link href="/courts/bookings/history" className="text-xs font-semibold hover:text-white transition-colors"
                    style={{ color: "rgba(188,203,185,0.4)" }}>
                    View All →
                  </Link>
                </div>
                <div className="space-y-3">
                  {mobileList.map((b) => <HistoryRow key={b.id} booking={b} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Desktop content: upcoming + history side by side ── */}
      <div className="hidden lg:grid lg:grid-cols-[1fr_380px] lg:gap-6 lg:px-8 lg:items-start">

        {/* Left: upcoming */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "#4be277" }}>Upcoming Matches</h2>
          {desktopLoading ? (
            [...Array(2)].map((_, i) => (
              <div key={i} className="rounded-3xl animate-pulse" style={{ background: "#1b1c1c", height: 280 }} />
            ))
          ) : upcomingList.length === 0 ? (
            <div className="rounded-3xl p-10 text-center" style={{ background: "#1b1c1c" }}>
              <p className="font-black text-white text-lg mb-1">No upcoming matches</p>
              <p className="text-sm mb-5" style={{ color: "#6b7280" }}>Book a court to get started</p>
              <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-black text-sm"
                style={{ background: "linear-gradient(135deg, #4be277, #22c55e)" }}>
                Find a court
              </Link>
            </div>
          ) : (
            <>
              <FeaturedCard booking={upcomingList[0]} onCancel={handleCancel} cancelling={cancelBooking.isPending} />
              {upcomingList.slice(1).map((b) => (
                <CompactCard key={b.id} booking={b} tab="upcoming" onCancel={handleCancel} cancelling={cancelBooking.isPending} />
              ))}
            </>
          )}
        </div>

        {/* Right: history */}
        <div className="sticky top-24">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "#4be277" }}>History</h2>
            {pastList.length > 0 && (
              <Link href="/courts/bookings/history" className="text-xs font-semibold hover:text-white transition-colors"
                style={{ color: "rgba(188,203,185,0.4)" }}>
                View All →
              </Link>
            )}
          </div>
          {desktopLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="h-16 rounded-2xl animate-pulse mb-2" style={{ background: "#1b1c1c" }} />
            ))
          ) : pastList.length === 0 ? (
            <p className="text-sm" style={{ color: "rgba(188,203,185,0.4)" }}>No past matches yet</p>
          ) : (
            <div className="rounded-2xl overflow-hidden" style={{ background: "#1b1c1c" }}>
              {pastList.slice(0, 5).map((b) => <HistoryRow key={b.id} booking={b} />)}
            </div>
          )}
        </div>

      </div>


    </div>
  );
}

// ── Featured card (large, with court image hero) ──────────────────────────────

function FeaturedCard({ booking, onCancel, cancelling }: {
  booking: Booking;
  onCancel: (id: string) => void;
  cancelling: boolean;
}) {
  const [showCancel, setShowCancel] = useState(false);
  const court = booking.court;
  const venue = court?.venue;
  const img = courtImage(court?.surface ?? "default", court?.is_indoor ?? false);

  return (
    <>
    {showCancel && (
      <CancelModal
        booking={booking}
        onConfirm={() => { onCancel(booking.id); setShowCancel(false); }}
        onClose={() => setShowCancel(false)}
        confirming={cancelling}
      />
    )}
    <div className="rounded-3xl overflow-hidden" style={{ background: "#1b1c1c" }}>
      {/* Hero image */}
      <div className="relative h-44 sm:h-52 overflow-hidden">
        <img src={img} alt={venue?.name ?? "Court"} className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #1b1c1c 0%, rgba(0,0,0,0.3) 60%, transparent 100%)" }} />
        <div className="absolute top-3 left-3">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
            style={{ background: "rgba(75,226,119,0.15)", color: "#4be277", border: "1px solid rgba(75,226,119,0.3)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#4be277] animate-pulse" />
            Confirmed
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-3 pb-4 space-y-3">
        <div>
          <h2 className="text-xl font-black text-white leading-tight">{venue?.name ?? "Venue"}</h2>
          <p className="text-sm font-semibold mt-0.5" style={{ color: "#4be277" }}>
            {court?.name} · {surfaceLabel(court?.surface ?? "", court?.is_indoor ?? false)}
          </p>
        </div>

        {/* Date + time row */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(75,226,119,0.12)" }}>
              <svg className="w-3.5 h-3.5" style={{ color: "#4be277" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "rgba(188,203,185,0.4)" }}>Date</p>
              <p className="text-sm font-bold text-white">{fmtDate(booking.starts_at)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(75,226,119,0.12)" }}>
              <svg className="w-3.5 h-3.5" style={{ color: "#4be277" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "rgba(188,203,185,0.4)" }}>Time</p>
              <p className="text-sm font-bold text-white">{fmtTime(booking.starts_at)} – {fmtTime(booking.ends_at)}</p>
            </div>
          </div>
        </div>

        {booking.notes && (
          <p className="text-xs px-3 py-2 rounded-xl" style={{ background: "#202020", color: "rgba(188,203,185,0.5)" }}>
            {booking.notes}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => setShowCancel(true)}
            className="flex-1 py-3 rounded-2xl font-bold text-sm transition-all"
            style={{ background: "linear-gradient(135deg, #4be277, #22c55e)", color: "#003915" }}
          >
            Manage Booking
          </button>
        </div>
      </div>
    </div>
    </>
  );
}

// ── Compact upcoming card ─────────────────────────────────────────────────────

function CompactCard({ booking, tab, onCancel, cancelling }: {
  booking: Booking;
  tab: "upcoming" | "past";
  onCancel: (id: string) => void;
  cancelling: boolean;
}) {
  const [showCancel, setShowCancel] = useState(false);
  const court = booking.court;
  const venue = court?.venue;
  const img = courtImage(court?.surface ?? "default", court?.is_indoor ?? false);
  const cancelled = booking.status === "cancelled";

  return (
    <>
      {showCancel && (
        <CancelModal
          booking={booking}
          onConfirm={() => { onCancel(booking.id); setShowCancel(false); }}
          onClose={() => setShowCancel(false)}
          confirming={cancelling}
        />
      )}
      <div className="rounded-3xl overflow-hidden" style={{ background: "#1b1c1c", opacity: cancelled ? 0.55 : 1 }}>
        {/* Small image strip */}
        <div className="relative h-28 overflow-hidden">
          <img src={img} alt={venue?.name ?? "Court"} className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #1b1c1c 0%, rgba(0,0,0,0.2) 100%)" }} />
          <div className="absolute top-2.5 left-3">
            <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest"
              style={cancelled
                ? { background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)" }
                : { background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.1)" }
              }>
              {cancelled ? "Cancelled" : "Upcoming"}
            </span>
          </div>
        </div>

        <div className="px-4 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-black text-white text-base truncate">{venue?.name ?? "Venue"}</p>
            <p className="text-xs mt-0.5 truncate" style={{ color: "rgba(188,203,185,0.5)" }}>
              {court?.name} · {surfaceLabel(court?.surface ?? "", court?.is_indoor ?? false)}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs font-bold" style={{ color: "#4be277" }}>{fmtDate(booking.starts_at)}</p>
            <p className="text-xs font-semibold tabular-nums" style={{ color: "rgba(188,203,185,0.6)" }}>
              {fmtTime(booking.starts_at)} – {fmtTime(booking.ends_at)}
            </p>
          </div>
        </div>

        {tab === "upcoming" && !cancelled && (
          <div className="px-4 pb-4">
            <button
              onClick={() => setShowCancel(true)}
              disabled={cancelling}
              className="w-full py-2.5 rounded-2xl font-bold text-sm transition-all"
              style={{ background: "#202020", color: "rgba(188,203,185,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              Manage Booking
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ── History card ──────────────────────────────────────────────────────────────

function HistoryRow({ booking }: { booking: Booking }) {
  const venue = booking.court?.venue;
  const cancelled = booking.status === "cancelled";

  return (
    <div className="rounded-2xl p-4" style={{ background: "#202020" }}>
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <span
          className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest"
          style={cancelled
            ? { background: "rgba(239,68,68,0.15)", color: "#ef4444" }
            : { background: "rgba(75,226,119,0.15)", color: "#4be277" }
          }
        >
          {cancelled ? "Cancelled" : "Completed"}
        </span>
        <span className="text-[10px] shrink-0 tabular-nums" style={{ color: "rgba(188,203,185,0.35)" }}>
          {fmtDate(booking.starts_at)}
        </span>
      </div>

      <p className="font-black text-white text-sm leading-tight">{venue?.name ?? "Venue"}</p>
      <p className="text-xs mt-0.5" style={{ color: "rgba(188,203,185,0.4)" }}>
        {booking.court?.name} · {fmtTime(booking.starts_at)}–{fmtTime(booking.ends_at)}
      </p>

    </div>
  );
}

// ── Cancel modal ──────────────────────────────────────────────────────────────

function CancelModal({ booking, onConfirm, onClose, confirming }: {
  booking: Booking;
  onConfirm: () => void;
  onClose: () => void;
  confirming: boolean;
}) {
  const venue = booking.court?.venue;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-0"
      style={{ background: "rgba(0,0,0,0.7)" }} onClick={onClose}>
      <div className="w-full max-w-sm rounded-3xl p-6" style={{ background: "#1b1c1c" }}
        onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-black text-white mb-1">Cancel booking?</h3>
        <p className="text-sm mb-1 font-semibold" style={{ color: "rgba(188,203,185,0.6)" }}>
          {venue?.name ?? "Venue"}
        </p>
        <p className="text-xs mb-6" style={{ color: "rgba(188,203,185,0.4)" }}>
          {fmtDate(booking.starts_at)} · {fmtTime(booking.starts_at)}–{fmtTime(booking.ends_at)}
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl font-bold text-sm"
            style={{ background: "#202020", color: "rgba(188,203,185,0.6)" }}>
            Keep it
          </button>
          <button onClick={onConfirm} disabled={confirming}
            className="flex-1 py-3 rounded-2xl font-bold text-sm transition-opacity"
            style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
            {confirming ? "Cancelling…" : "Yes, cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Momentum panel (desktop sidebar) ─────────────────────────────────────────

