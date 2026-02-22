"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 07:00 – 20:00

function formatHour(h: number) {
  return `${String(h).padStart(2, "0")}:00`;
}

function toLocalISO(date: string, hour: number) {
  return `${date}T${formatHour(hour)}:00:00`;
}

export default function CourtBookingPage() {
  const { venueId, courtId } = useParams<{ venueId: string; courtId: string }>();
  const router = useRouter();

  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [startHour, setStartHour] = useState<number | null>(null);
  const [endHour, setEndHour] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { data: venue } = trpc.courts.getVenue.useQuery({ id: venueId });
  const court = venue?.courts.find((c) => c.id === courtId);

  const { data: bookings, refetch: refetchAvail } = trpc.courts.getCourtAvailability.useQuery(
    { court_id: courtId, date },
    { enabled: !!courtId && !!date }
  );

  const bookCourt = trpc.courts.bookCourt.useMutation();

  const isBooked = (hour: number) => {
    if (!bookings) return false;
    return bookings.some((b) => {
      const start = new Date(b.starts_at).getHours();
      const end = new Date(b.ends_at).getHours();
      return hour >= start && hour < end;
    });
  };

  const handleSlotClick = (hour: number) => {
    if (isBooked(hour)) return;
    if (startHour === null) {
      setStartHour(hour);
      setEndHour(null);
    } else if (endHour === null && hour > startHour) {
      // Check no booked slot in range
      const hasConflict = Array.from({ length: hour - startHour }, (_, i) => startHour + i).some(isBooked);
      if (hasConflict) {
        setError("Selection contains a booked slot");
        return;
      }
      setEndHour(hour);
      setError(null);
    } else {
      setStartHour(hour);
      setEndHour(null);
      setError(null);
    }
  };

  const handleBook = async () => {
    if (startHour === null || endHour === null) return;
    setError(null);
    try {
      await bookCourt.mutateAsync({
        court_id: courtId,
        starts_at: toLocalISO(date, startHour),
        ends_at: toLocalISO(date, endHour),
        notes: notes || undefined,
      });
      setSuccess(true);
      setStartHour(null);
      setEndHour(null);
      setNotes("");
      refetchAvail();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed");
    }
  };

  if (!court && venue) {
    return <div className="text-center py-20 text-gray-500 dark:text-slate-400">Court not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
        <Link href="/courts" className="hover:text-gray-900 dark:hover:text-slate-100">Courts</Link>
        <span>/</span>
        <Link href={`/courts/${venueId}`} className="hover:text-gray-900 dark:hover:text-slate-100">{venue?.name ?? "Venue"}</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-slate-100 font-medium">{court?.name ?? "Court"}</span>
      </div>

      {/* Court info */}
      {court && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">{court.name}</h1>
              <p className="text-gray-500 dark:text-slate-400 mt-1 capitalize">{court.surface} · {court.is_indoor ? "Indoor" : "Outdoor"}</p>
            </div>
            <div className="text-right">
              {court.price_per_hour != null ? (
                <p className="text-xl font-bold text-gray-900 dark:text-slate-100">€{(court.price_per_hour / 100).toFixed(2)}/hr</p>
              ) : (
                <p className="text-sm text-gray-400 dark:text-slate-600">Contact for pricing</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Date picker */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Select date</label>
        <input
          type="date"
          value={date}
          min={today}
          onChange={(e) => {
            setDate(e.target.value);
            setStartHour(null);
            setEndHour(null);
            setError(null);
            setSuccess(false);
          }}
          className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:text-slate-100"
        />
      </div>

      {/* Time slot grid */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
        <h2 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-4">
          Select time — click start, then click end
        </h2>
        <div className="overflow-x-auto -mx-1 px-1">
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 min-w-[280px]">
          {HOURS.map((h) => {
            const booked = isBooked(h);
            const isStart = startHour === h;
            const isEnd = endHour === h;
            const inRange = startHour !== null && endHour !== null && h > startHour && h < endHour;
            const isSelected = isStart || isEnd || inRange;

            return (
              <button
                key={h}
                onClick={() => handleSlotClick(h)}
                disabled={booked}
                className={`py-2 rounded-lg text-xs font-medium transition-colors ${
                  booked
                    ? "bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500 cursor-not-allowed"
                    : isSelected
                    ? "bg-green-600 text-white"
                    : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:border-green-400 hover:text-green-700"
                }`}
              >
                {formatHour(h)}
              </button>
            );
          })}
        </div>
        </div>

        {startHour !== null && (
          <p className="mt-4 text-sm text-gray-600 dark:text-slate-400">
            {endHour !== null
              ? `Selected: ${formatHour(startHour)} – ${formatHour(endHour)} (${endHour - startHour}h)`
              : `Start: ${formatHour(startHour)} — now click end time`}
          </p>
        )}
      </div>

      {/* Notes + confirm */}
      {startHour !== null && endHour !== null && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Notes (optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Practice session"
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-500"
            />
          </div>
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
          )}
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              Booked! <Link href="/courts/bookings" className="underline font-medium">View my bookings</Link>
            </div>
          )}
          <button
            onClick={handleBook}
            disabled={bookCourt.isPending}
            className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {bookCourt.isPending
              ? "Booking..."
              : `Confirm — ${formatHour(startHour)} to ${formatHour(endHour)}`}
          </button>
        </div>
      )}

      {/* Legend */}
      <div className="flex gap-4 text-xs text-gray-500 dark:text-slate-400">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-100 dark:bg-slate-700 inline-block" /> Booked</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-600 inline-block" /> Selected</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded border border-gray-200 dark:border-slate-700 inline-block" /> Available</span>
      </div>
    </div>
  );
}
