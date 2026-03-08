"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { useT } from "@/lib/i18n/context";

// ── Constants ────────────────────────────────────────────────────────────────

const SURFACE_COLORS: Record<string, string> = {
  clay:   "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-500/30",
  hard:   "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30",
  grass:  "bg-green-100 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-300 dark:border-green-500/30",
  indoor: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/30",
};

const VENUE_PHOTOS: Record<string, string> = {
  "tc-fuzine":        "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1200&q=80",
  "tk-ilirija":       "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=1200&q=80",
  "tk-olimpija":      "https://images.unsplash.com/photo-1530915365347-e35b749a0381?w=1200&q=80",
  "tc-smarna-gora":   "https://images.unsplash.com/photo-1530915365347-e35b749a0381?w=1200&q=80",
  "tenis-center-btc": "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1200&q=80",
  "tk-tivoli":        "https://images.unsplash.com/photo-1530915365347-e35b749a0381?w=1200&q=80",
  "tenis-padel-smartno": "https://api.courtiplay.com/storage/v1/render/image/public/banners/20524ba5-f937-401e-8dc1-f8383db87c23/1000008160.jpg?height=600&resize=contain",
  "tenis-ruski-car":  "https://api.courtiplay.com/storage/v1/render/image/public/banners/7f4b2f5d-72bb-49fa-9971-b3f308e5e89b/7e0a35a4-3bab-4685-8343-ed54867d1d4a-1024x768.jpg?height=600&resize=contain",
  "tk-strazisce":     "https://api.courtiplay.com/storage/v1/render/image/public/banners/707f60ba-39f4-4a67-9f9d-52b7dc25428b/1000005826.jpg?height=600&resize=contain",
  "sobec":            "https://api.courtiplay.com/storage/v1/render/image/public/banners/6c6ac6f3-1dfb-43f3-af77-e92a5c62852d/13_1678487216.jpeg?height=600&resize=contain",
  "tenis-kamp-danica":"https://api.courtiplay.com/storage/v1/render/image/public/banners/4f5629d5-8b60-41bd-8988-1e381bc6d7d2/Image%2023.%207.%2024%20at%2009.50.jpeg?height=600&resize=contain",
  "bernardi":         "https://api.courtiplay.com/storage/v1/render/image/public/banners/b84559a9-d3c4-425a-8bab-1fd3acb6ebcf/Putr%20avgust24%20edited-66.jpg?height=600&resize=contain",
  "tenis-klub-kamnik":"https://api.courtiplay.com/storage/v1/render/image/public/banners/33a4b992-23df-4ca8-90f6-80645fed4f92/IMG_1742.jpeg?height=600&resize=contain",
  "tk-duplica":       "https://api.courtiplay.com/storage/v1/render/image/public/banners/88ededf0-92b4-4bbe-ab00-401b7ff7f963/IMG_4317.jpeg?height=600&resize=contain",
  "rimski-vrelec":    "https://api.courtiplay.com/storage/v1/render/image/public/banners/d7e43b12-9b33-4e1e-8bbe-b6c897d37b1b/Rimski_igrisce_1515.jpg?height=600&resize=contain",
  "tk-menges":        "https://api.courtiplay.com/storage/v1/render/image/public/banners/8b90f4f8-3860-426b-95ed-9a7ae1e7d005/IMG_20240224_190336.jpg?height=600&resize=contain",
  "tenis-portoroz":   "https://api.courtiplay.com/storage/v1/render/image/public/banners/a8e8ea59-3403-4ff5-ad74-afacf5923add/270620241719495595_tennis-portoroz.jpg?height=600&resize=contain",
  "sport-park-krsnik":"https://api.courtiplay.com/storage/v1/render/image/public/banners/761ffce5-c2bb-4355-a9c6-80bf01a85cb4/d9f433_215fbfabdedb44b8b58c154eeef93c1a_mv2.avif?height=600&resize=contain",
  "cokan-tennis-academy": "https://api.courtiplay.com/storage/v1/render/image/public/banners/4b3997df-f2b9-46d7-9af7-9f84e0501644/teniska-sola-celje-z-okolico-cokan-tennis-academy-sportna-akademija-d-o-o_5-1024x1024-.png?height=600&resize=contain",
  "tenis-center-murko": "https://api.courtiplay.com/storage/v1/render/image/public/banners/02b43766-01d2-41e5-9178-7d4f3ff70782/32519417qCE816CBDB99047000AC87D99C3117782_1200.webp?height=600&resize=contain",
  "tenis-in-padel-koroska": "https://api.courtiplay.com/storage/v1/render/image/public/banners/edf0b7bb-9b00-44d0-81f8-fc386c6aa243/Koroska.jpg?height=600&resize=contain",
  "tenis-gust-bar":   "https://api.courtiplay.com/storage/v1/render/image/public/banners/27dee8f7-c1cb-4c8e-8a20-3229cbc31f99/485341474_2897361857122781_7367172855721233389_n.jpg?height=600&resize=contain",
  "tenis-hala-gokop": "https://api.courtiplay.com/storage/v1/render/image/public/banners/a4c78234-1eda-4d6c-b950-b5e3da099e6f/Screenshot%202025-10-26%20at%2015.34.33.png?height=600&resize=contain",
  "teniska-klub-murska-sobota": "https://api.courtiplay.com/storage/v1/render/image/public/banners/f297ccbc-c39f-49a1-995b-f71226271996/received_311205469980915-scaled.jpeg?height=600&resize=contain",
  "tk-radlje":        "https://api.courtiplay.com/storage/v1/render/image/public/banners/f47a157b-e0f7-4c15-af29-a17b2d9c3d1e/tk%20radlje.jpeg?height=600&resize=contain",
  "tenisko-drustvo-dovce": "https://api.courtiplay.com/storage/v1/render/image/public/banners/240f0bc1-c9f1-4adf-b61c-e9aab7fbd861/40_1556566401.jpeg?height=600&resize=contain",
};

const SURFACE_FALLBACK: Record<string, string> = {
  clay:    "https://api.courtiplay.com/storage/v1/render/image/public/banners/33a4b992-23df-4ca8-90f6-80645fed4f92/IMG_1742.jpeg?height=600&resize=contain",
  hard:    "https://api.courtiplay.com/storage/v1/render/image/public/banners/707f60ba-39f4-4a67-9f9d-52b7dc25428b/1000005826.jpg?height=600&resize=contain",
  default: "https://api.courtiplay.com/storage/v1/render/image/public/banners/d7e43b12-9b33-4e1e-8bbe-b6c897d37b1b/Rimski_igrisce_1515.jpg?height=600&resize=contain",
};

// Hours: 7:00–21:00 (each row = 1 hour, 60px tall)
const START_HOUR = 7;
const END_HOUR = 22;
const HOUR_HEIGHT = 56; // px per hour row
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

function venueSlug(name: string): string {
  return name.toLowerCase()
    .replace(/[čćžšđ]/g, (c) => ({ č:"c", ć:"c", ž:"z", š:"s", đ:"d" }[c] ?? c))
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function getVenueImage(name: string, surfaces: string[]): string {
  const slug = venueSlug(name);
  return VENUE_PHOTOS[slug] ?? SURFACE_FALLBACK[surfaces[0] ?? "default"] ?? SURFACE_FALLBACK.default;
}

function toMin(h: number, m = 0) { return h * 60 + m; }
function fmtTime(min: number) {
  return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
}

type VenueCourt = { id: string; name: string; surface: string; is_indoor: boolean; price_per_hour: number | null };
type Venue = {
  id: string; name: string; city: string; address: string | null;
  phone?: string | null; website?: string | null; surfaces?: string[];
  courts: VenueCourt[];
};
type Booking = { starts_at: string; ends_at: string };

// ── Booking state per court ───────────────────────────────────────────────────
type Selection = { courtId: string; startMin: number; endMin: number } | null;

// ── Main page ─────────────────────────────────────────────────────────────────

export default function VenueDetailPage() {
  const { venueId } = useParams<{ venueId: string }>();
  const { t } = useT();
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [selection, setSelection] = useState<Selection>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [booked, setBooked] = useState(false);

  const { data: venueRaw, isLoading } = trpc.courts.getVenue.useQuery(
    { id: venueId },
    { enabled: !!venueId }
  );
  const venue = venueRaw as Venue | undefined;

  const bookMutation = trpc.courts.bookCourt.useMutation({
    onSuccess: () => { setBooked(true); setConfirmOpen(false); },
  });

  // Date display
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const isToday = date === today;
  const isTomorrow = date === tomorrow;
  const dateObj = new Date(date + "T00:00:00");
  const displayDate = isToday ? t.home.today
    : isTomorrow ? t.home.tomorrow
    : dateObj.toLocaleDateString("sl-SI", { weekday: "short", day: "2-digit", month: "2-digit" });

  const prevDay = () => {
    const d = new Date(date + "T00:00:00");
    d.setDate(d.getDate() - 1);
    const s = d.toISOString().slice(0, 10);
    if (s >= today) { setDate(s); setSelection(null); setBooked(false); }
  };
  const nextDay = () => {
    const d = new Date(date + "T00:00:00");
    d.setDate(d.getDate() + 1);
    setDate(d.toISOString().slice(0, 10));
    setSelection(null); setBooked(false);
  };

  const heroImg = getVenueImage(venue?.name ?? "", venue?.surfaces ?? []);

  // Current time indicator
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const nowOffset = isToday ? ((nowMin - toMin(START_HOUR)) / 60) * HOUR_HEIGHT : null;

  const selectedCourt = venue?.courts.find(c => c.id === selection?.courtId);
  const durationMins = selection ? selection.endMin - selection.startMin : 0;
  const price = selectedCourt?.price_per_hour != null && selection
    ? (selectedCourt.price_per_hour / 100) * (durationMins / 60) : null;

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 min-h-screen bg-slate-50 dark:bg-slate-950">

      {/* ── Hero banner ── */}
      <div className="relative h-48 sm:h-60 overflow-hidden">
        {venue ? (
          <img src={heroImg} alt={venue.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
        <div className="absolute top-4 left-4 sm:left-6 lg:left-8">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-black/40 hover:bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t.common.back}
          </Link>
        </div>
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 lg:px-8 pb-4">
          {venue ? (
            <h1 className="text-2xl sm:text-3xl font-black text-white drop-shadow-lg">{venue.name}</h1>
          ) : (
            <div className="h-8 w-48 bg-white/20 rounded animate-pulse" />
          )}
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="px-4 sm:px-6 lg:px-8 py-5">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-5 items-start">

          {/* ── Left: Calendar grid ── */}
          <div className="flex-1 min-w-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">

            {/* Panel header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth={2}/>
                  <line x1="16" y1="2" x2="16" y2="6" strokeWidth={2}/>
                  <line x1="8" y1="2" x2="8" y2="6" strokeWidth={2}/>
                  <line x1="3" y1="10" x2="21" y2="10" strokeWidth={2}/>
                </svg>
                <span className="font-bold text-slate-800 dark:text-white text-sm">{t.courts.bookings}</span>
              </div>

              {/* Date nav */}
              <div className="flex items-center gap-1">
                <button
                  onClick={prevDay}
                  disabled={date <= today}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-25 transition-colors"
                >
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Date button — opens native date picker via hidden input */}
                <div className="relative">
                  <button
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-green-400 dark:hover:border-green-500 transition-colors text-sm font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap"
                    onClick={() => document.getElementById("date-input-picker")?.click()}
                  >
                    {displayDate}
                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth={2}/>
                      <line x1="16" y1="2" x2="16" y2="6" strokeWidth={2}/>
                      <line x1="8" y1="2" x2="8" y2="6" strokeWidth={2}/>
                      <line x1="3" y1="10" x2="21" y2="10" strokeWidth={2}/>
                    </svg>
                  </button>
                  <input
                    id="date-input-picker"
                    type="date"
                    value={date}
                    min={today}
                    onChange={(e) => { if (e.target.value) { setDate(e.target.value); setSelection(null); setBooked(false); } }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    style={{ colorScheme: "light dark" }}
                  />
                </div>

                <button
                  onClick={nextDay}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Sport pill */}
            <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800">
              <span className="inline-flex items-center gap-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" strokeWidth="2"/>
                  <path strokeLinecap="round" strokeWidth="1.5" d="M12 3C8.5 6.5 8.5 17.5 12 21M12 3C15.5 6.5 15.5 17.5 12 21"/>
                </svg>
                Tennis
              </span>
            </div>

            {/* ── Calendar grid ── */}
            {isLoading ? (
              <div className="p-5 space-y-2 animate-pulse">
                {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800 rounded-xl" />)}
              </div>
            ) : !venue || venue.courts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-3xl mb-3">🎾</p>
                <p className="font-bold text-slate-600 dark:text-slate-400">{t.courts.noVenues}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div style={{ minWidth: `${180 + venue.courts.length * 120}px` }}>

                  {/* Court column headers */}
                  <div className="flex border-b border-slate-100 dark:border-slate-800">
                    {/* Time gutter */}
                    <div className="w-[56px] shrink-0" />
                    {venue.courts.map((court) => (
                      <div key={court.id} className="flex-1 min-w-[120px] text-center py-3 px-2 border-l border-slate-100 dark:border-slate-800">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide truncate">{court.name}</p>
                        <span className={`inline-block mt-0.5 text-[9px] px-1.5 py-0.5 rounded-full font-semibold uppercase border ${SURFACE_COLORS[court.surface] ?? "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"}`}>
                          {t.surfaces[court.surface as keyof typeof t.surfaces] ?? court.surface}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Time rows + booking cells */}
                  <div className="relative">
                    {/* Now indicator */}
                    {nowOffset !== null && nowOffset >= 0 && nowOffset <= HOUR_HEIGHT * HOURS.length && (
                      <div
                        className="absolute left-0 right-0 z-10 pointer-events-none flex items-center"
                        style={{ top: nowOffset }}
                      >
                        <div className="w-2 h-2 rounded-full bg-red-500 ml-[48px] shrink-0" />
                        <div className="flex-1 h-px bg-red-500 opacity-70" />
                      </div>
                    )}

                    {HOURS.map((hour) => (
                      <div key={hour} className="flex" style={{ height: HOUR_HEIGHT }}>
                        {/* Time label */}
                        <div className="w-[56px] shrink-0 flex items-start justify-end pr-3 pt-1.5">
                          <span className="text-[11px] text-slate-400 dark:text-slate-600 font-medium tabular-nums">
                            {String(hour).padStart(2, "0")}:00
                          </span>
                        </div>

                        {/* Court cells */}
                        {venue.courts.map((court) => (
                          <CourtCell
                            key={court.id}
                            court={court}
                            hour={hour}
                            date={date}
                            selection={selection}
                            onSelect={(sel) => { setSelection(sel); setConfirmOpen(true); setBooked(false); setNotes(""); }}
                            hourHeight={HOUR_HEIGHT}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Booking confirmation bar ── */}
            {selection && confirmOpen && !booked && (
              <div className="border-t border-slate-100 dark:border-slate-800 bg-green-50 dark:bg-green-500/10 p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="flex-1">
                    <p className="font-black text-green-700 dark:text-green-400 text-sm">
                      {selectedCourt?.name} · {fmtTime(selection.startMin)} – {fmtTime(selection.endMin)}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {durationMins} min
                      {price != null && <span className="text-green-600 dark:text-green-400 font-bold ml-1.5">· €{price.toFixed(2)}</span>}
                    </p>
                  </div>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t.courts.notesPlaceholder}
                    className="flex-1 min-w-0 text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-green-400 transition-all"
                  />
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => { setSelection(null); setConfirmOpen(false); }}
                      className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white font-semibold transition-colors"
                    >
                      {t.common.cancel}
                    </button>
                    <button
                      onClick={() => {
                        if (!selection) return;
                        bookMutation.mutate({
                          court_id: selection.courtId,
                          starts_at: new Date(`${date}T${fmtTime(selection.startMin)}:00`).toISOString(),
                          ends_at: new Date(`${date}T${fmtTime(selection.endMin)}:00`).toISOString(),
                          notes: notes || undefined,
                        });
                      }}
                      disabled={bookMutation.isPending}
                      className="px-4 py-2 bg-green-500 hover:bg-green-400 disabled:opacity-50 text-white text-sm font-black rounded-xl transition-colors shadow-md shadow-green-500/20"
                    >
                      {bookMutation.isPending ? t.courts.booking : t.courts.book}
                    </button>
                  </div>
                </div>
                {bookMutation.error && (
                  <p className="text-xs text-red-500 mt-2">{bookMutation.error.message}</p>
                )}
              </div>
            )}

            {/* Success */}
            {booked && selection && (
              <div className="border-t border-green-200 dark:border-green-500/30 bg-green-500 p-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-white font-black text-sm">{t.courts.bookingConfirmed}</p>
                  <p className="text-white/70 text-xs">{selectedCourt?.name} · {fmtTime(selection.startMin)}–{fmtTime(selection.endMin)}</p>
                </div>
                <button
                  onClick={() => { setBooked(false); setSelection(null); }}
                  className="text-xs text-white/70 hover:text-white underline transition-colors"
                >
                  {t.courts.newBooking}
                </button>
              </div>
            )}
          </div>

          {/* ── Right sidebar ── */}
          <div className="w-full lg:w-64 shrink-0 space-y-4">

            {/* Quick slots */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">{t.courts.quickBook}</h3>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">{t.courts.availableSlots}</p>
              {venue?.courts && venue.courts.length > 0 ? (
                <QuickSlots courtId={venue.courts[0].id} date={date} today={today} />
              ) : (
                <p className="text-xs text-slate-400">—</p>
              )}
            </div>

            {/* Pricing */}
            {venue?.courts.some(c => c.price_per_hour != null) && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="2" y="5" width="20" height="14" rx="2" strokeWidth={2}/>
                    <line x1="2" y1="10" x2="22" y2="10" strokeWidth={2}/>
                  </svg>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">{t.courts.pricing}</h3>
                </div>
                {venue.courts.filter(c => c.price_per_hour != null).slice(0, 1).map(c => (
                  <div key={c.id} className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">08:00 – 22:00</span>
                    <span className="font-black text-slate-900 dark:text-white">{(c.price_per_hour! / 100).toFixed(0)}€/h</span>
                  </div>
                ))}
              </div>
            )}

            {/* Location */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">{t.courts.location}</h3>
              </div>
              {venue ? (
                <div className="space-y-1.5 text-sm text-slate-500 dark:text-slate-400">
                  <p className="flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">📍</span>
                    <span>{venue.city}{venue.address ? `, ${venue.address}` : ""}</span>
                  </p>
                  {venue.phone && (
                    <a href={`tel:${venue.phone}`} className="flex items-center gap-2 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                      <span>📞</span>{venue.phone}
                    </a>
                  )}
                  {venue.website && (
                    <a href={venue.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-green-600 dark:hover:text-green-400 transition-colors truncate">
                      <span>🌐</span><span className="truncate">{venue.website.replace(/^https?:\/\//, "")}</span>
                    </a>
                  )}
                </div>
              ) : (
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
              )}
            </div>

            {/* Surfaces */}
            {venue?.surfaces && venue.surfaces.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t.courts.surfaces}</p>
                <div className="flex flex-wrap gap-2">
                  {venue.surfaces.map((s) => (
                    <span key={s} className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${SURFACE_COLORS[s] ?? "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"}`}>
                      {t.surfaces[s as keyof typeof t.surfaces] ?? s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── CourtCell: one hour cell in the calendar grid ─────────────────────────────

function CourtCell({
  court, hour, date, selection, onSelect, hourHeight,
}: {
  court: VenueCourt;
  hour: number;
  date: string;
  selection: Selection;
  onSelect: (sel: Selection) => void;
  hourHeight: number;
}) {
  const { data: bookings } = trpc.courts.getCourtAvailability.useQuery(
    { court_id: court.id, date },
    { enabled: !!court.id && !!date }
  );

  const startMin = toMin(hour);
  const endMin = startMin + 60;

  const isBooked = useMemo(() => {
    if (!bookings) return false;
    return bookings.some((b: Booking) => {
      const bs = new Date(b.starts_at).getHours() * 60 + new Date(b.starts_at).getMinutes();
      const be = new Date(b.ends_at).getHours() * 60 + new Date(b.ends_at).getMinutes();
      return startMin < be && endMin > bs;
    });
  }, [bookings, startMin, endMin]);

  const bookerName = useMemo(() => {
    if (!bookings) return null;
    const b = bookings.find((b: Booking) => {
      const bs = new Date(b.starts_at).getHours() * 60 + new Date(b.starts_at).getMinutes();
      const be = new Date(b.ends_at).getHours() * 60 + new Date(b.ends_at).getMinutes();
      return startMin < be && endMin > bs;
    });
    return b ? (b as { player?: { full_name?: string } }).player?.full_name ?? null : null;
  }, [bookings, startMin, endMin]);

  const isSelected = selection?.courtId === court.id &&
    selection.startMin === startMin && selection.endMin === endMin;

  const isMine = isSelected;

  const handleClick = () => {
    if (isBooked) return;
    if (isSelected) { onSelect(null); return; }
    onSelect({ courtId: court.id, startMin, endMin });
  };

  let cellClass = "border-l border-b border-slate-100 dark:border-slate-800 flex-1 min-w-[120px] cursor-pointer transition-all relative ";

  if (isBooked) {
    cellClass += "bg-slate-100 dark:bg-slate-800/60 cursor-default";
  } else if (isSelected) {
    cellClass += "bg-green-500 cursor-pointer";
  } else {
    cellClass += "hover:bg-green-50 dark:hover:bg-green-500/10 bg-white dark:bg-slate-900";
  }

  return (
    <div
      className={cellClass}
      style={{ height: hourHeight }}
      onClick={handleClick}
    >
      {isBooked && bookerName && (
        <div className="absolute inset-0 flex items-center justify-center px-2">
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate text-center leading-tight">
            {bookerName}
          </p>
        </div>
      )}
      {isBooked && !bookerName && (
        /* Diagonal stripe pattern for booked cells */
        <div className="absolute inset-0 opacity-30"
          style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(100,116,139,0.3) 4px, rgba(100,116,139,0.3) 5px)" }}
        />
      )}
      {isSelected && (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </div>
  );
}

// ── QuickSlots ────────────────────────────────────────────────────────────────

function QuickSlots({ courtId, date, today }: { courtId: string; date: string; today: string }) {
  const { data: bookings } = trpc.courts.getCourtAvailability.useQuery(
    { court_id: courtId, date },
    { enabled: !!courtId && !!date }
  );

  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const freeHours = useMemo(() => {
    if (!bookings) return null;
    return HOURS.filter((hour) => {
      const startMin = toMin(hour);
      const endMin = startMin + 60;
      if (date === today && startMin <= nowMin) return false;
      return !bookings.some((b: Booking) => {
        const bs = new Date(b.starts_at).getHours() * 60 + new Date(b.starts_at).getMinutes();
        const be = new Date(b.ends_at).getHours() * 60 + new Date(b.ends_at).getMinutes();
        return startMin < be && endMin > bs;
      });
    }).slice(0, 3);
  }, [bookings, date, today, nowMin]);

  if (!freeHours) {
    return (
      <div className="flex gap-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-16 h-9 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (freeHours.length === 0) {
    return <p className="text-xs text-slate-400">—</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {freeHours.map((hour) => (
        <span key={hour} className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 tabular-nums">
          {String(hour).padStart(2, "0")}:00
        </span>
      ))}
    </div>
  );
}
