"use client";

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

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function BookingHistoryPage() {
  const { data, isLoading } = trpc.courts.getMyBookings.useQuery({ upcoming: false });
  const list = (data ?? []) as unknown as Booking[];

  return (
    <div className="min-h-screen pb-32" style={{ background: "#131313", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="px-5 pt-6 pb-4 lg:px-8 lg:pt-10">
        <Link href="/courts/bookings" className="inline-flex items-center gap-1.5 text-sm font-semibold mb-5"
          style={{ color: "rgba(188,203,185,0.5)" }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
          </svg>
          Back
        </Link>
        <h1 className="text-3xl font-black text-white">Match History</h1>
        <p className="text-sm mt-1" style={{ color: "rgba(188,203,185,0.4)" }}>All your past court bookings</p>
      </div>

      <div className="px-5 lg:px-8 space-y-3">
        {isLoading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="rounded-2xl animate-pulse" style={{ background: "#1b1c1c", height: 100 }} />
          ))
        ) : list.length === 0 ? (
          <div className="pt-16 text-center">
            <p className="font-black text-white text-lg mb-1">No past matches</p>
            <p className="text-sm" style={{ color: "#6b7280" }}>Your completed bookings will appear here</p>
          </div>
        ) : (
          list.map((b) => <HistoryCard key={b.id} booking={b} />)
        )}
      </div>
    </div>
  );
}

function HistoryCard({ booking }: { booking: Booking }) {
  const venue = booking.court?.venue;
  const cancelled = booking.status === "cancelled";

  return (
    <div className="rounded-2xl p-4" style={{ background: "#1b1c1c" }}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <span
          className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest"
          style={cancelled
            ? { background: "rgba(239,68,68,0.15)", color: "#ef4444" }
            : { background: "rgba(75,226,119,0.15)", color: "#4be277" }
          }
        >
          {cancelled ? "Cancelled" : "Completed"}
        </span>
        <span className="text-xs shrink-0" style={{ color: "rgba(188,203,185,0.4)" }}>{fmtDate(booking.starts_at)}</span>
      </div>
      <p className="font-black text-white text-base">{venue?.name ?? "Venue"}</p>
      <p className="text-xs mt-0.5" style={{ color: "rgba(188,203,185,0.45)" }}>
        {booking.court?.name} · {fmtTime(booking.starts_at)}–{fmtTime(booking.ends_at)}
      </p>
    </div>
  );
}
