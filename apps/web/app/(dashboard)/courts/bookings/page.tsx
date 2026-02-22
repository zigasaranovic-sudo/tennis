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

export default function MyBookingsPage() {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const utils = trpc.useUtils();

  const { data: bookings, isLoading } = trpc.courts.getMyBookings.useQuery({
    upcoming: tab === "upcoming",
  });

  const cancelBooking = trpc.courts.cancelBooking.useMutation({
    onSuccess: () => {
      utils.courts.getMyBookings.invalidate();
    },
  });

  const handleCancel = async (id: string) => {
    if (!confirm("Cancel this booking?")) return;
    await cancelBooking.mutateAsync({ booking_id: id });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">My Bookings</h1>
        <Link
          href="/courts"
          className="text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
        >
          Book a court
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(["upcoming", "past"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              tab === t
                ? "bg-green-600 text-white"
                : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:border-gray-300 dark:hover:border-slate-600"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Bookings */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 animate-pulse h-24" />
          ))}
        </div>
      ) : bookings && bookings.length > 0 ? (
        <div className="space-y-3">
          {(bookings as unknown as Booking[]).map((booking) => {
            const court = booking.court;
            const venue = court?.venue;
            const start = new Date(booking.starts_at);
            const end = new Date(booking.ends_at);
            const hours = (end.getTime() - start.getTime()) / 3_600_000;

            return (
              <div
                key={booking.id}
                className={`bg-white dark:bg-slate-800 rounded-xl border p-5 flex items-start justify-between gap-4 ${
                  booking.status === "cancelled"
                    ? "border-gray-200 dark:border-slate-700 opacity-60"
                    : "border-gray-200 dark:border-slate-700"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                    🎾
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-slate-100">
                      {court?.name ?? "Court"} · {venue?.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">📍 {venue?.city}</p>
                    <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                      {start.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}{" "}
                      {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      {" – "}
                      {end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      <span className="text-gray-400 dark:text-slate-600 ml-2">({hours}h)</span>
                    </p>
                    {booking.notes && (
                      <p className="text-xs text-gray-400 dark:text-slate-600 mt-0.5">{booking.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  {booking.status === "cancelled" ? (
                    <span className="text-xs text-red-500 font-medium">Cancelled</span>
                  ) : tab === "upcoming" ? (
                    <button
                      onClick={() => handleCancel(booking.id)}
                      disabled={cancelBooking.isPending}
                      className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  ) : (
                    <span className="text-xs text-green-600 font-medium">Completed</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-dashed border-gray-300 dark:border-slate-600 p-12 text-center">
          <p className="text-4xl mb-4">📅</p>
          <p className="font-medium text-gray-900 dark:text-slate-100">
            {tab === "upcoming" ? "No upcoming bookings" : "No past bookings"}
          </p>
          {tab === "upcoming" && (
            <Link
              href="/courts"
              className="mt-4 inline-block px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              Book a court
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
