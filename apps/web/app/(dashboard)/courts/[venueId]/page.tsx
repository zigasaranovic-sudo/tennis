"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { useT } from "@/lib/i18n/context";

// ── Constants ─────────────────────────────────────────────────────────────────

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

const START_HOUR = 7;
const END_HOUR = 22;
const HOUR_H = 56; // px per hour
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

function venueSlug(name: string): string {
  return name.toLowerCase()
    .replace(/[čćžšđ]/g, (c) => ({ č: "c", ć: "c", ž: "z", š: "s", đ: "d" }[c] ?? c))
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
function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

type VenueCourt = { id: string; name: string; surface: string; is_indoor: boolean; price_per_hour: number | null };
type Venue = { id: string; name: string; city: string; address: string | null; phone?: string | null; website?: string | null; surfaces?: string[]; courts: VenueCourt[] };
type Booking = { starts_at: string; ends_at: string; player?: { full_name?: string } };
type Selection = { courtId: string; startMin: number; endMin: number } | null;

// ── Main page ─────────────────────────────────────────────────────────────────

export default function VenueDetailPage() {
  const { venueId } = useParams<{ venueId: string }>();
  const { t } = useT();
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [selection, setSelection] = useState<Selection>(null);
  const [notes, setNotes] = useState("");
  const [booked, setBooked] = useState(false);

  const { data: venueRaw, isLoading } = trpc.courts.getVenue.useQuery({ id: venueId }, { enabled: !!venueId });
  const venue = venueRaw as Venue | undefined;

  const bookMutation = trpc.courts.bookCourt.useMutation({ onSuccess: () => setBooked(true) });

  const changeDate = (d: string) => { setDate(d); setSelection(null); setBooked(false); setNotes(""); };

  // Day strip: always show 6 days starting from whichever week contains `date`
  // Compute the window start: snap to the nearest group of 6 from today
  const dayOffset = Math.max(0, Math.floor(
    (new Date(date + "T00:00:00").getTime() - new Date(today + "T00:00:00").getTime()) / (86400000 * 6)
  ) * 6);
  const windowStart = addDays(today, dayOffset);
  const dayButtons = Array.from({ length: 6 }, (_, i) => addDays(windowStart, i));

  const weekdayShort = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("sl-SI", { weekday: "short" }).toUpperCase().slice(0, 3);
  const dayNum = (d: string) => new Date(d + "T00:00:00").getDate();
  const monthShort = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("sl-SI", { month: "short" }).toUpperCase();

  const heroImg = getVenueImage(venue?.name ?? "", venue?.surfaces ?? []);
  const selectedCourt = venue?.courts.find(c => c.id === selection?.courtId);
  const durationMins = selection ? selection.endMin - selection.startMin : 0;
  const price = selectedCourt?.price_per_hour != null && durationMins > 0
    ? (selectedCourt.price_per_hour / 100) * (durationMins / 60) : null;

  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const nowPx = date === today && nowMin >= toMin(START_HOUR) && nowMin <= toMin(END_HOUR)
    ? ((nowMin - toMin(START_HOUR)) / 60) * HOUR_H : null;

  const canGoPrev = date > today;
  const canGoNext = true;

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 min-h-screen bg-slate-50 dark:bg-slate-950">

      {/* Hero */}
      <div className="relative h-44 sm:h-56 overflow-hidden">
        {venue
          ? <img src={heroImg} alt={venue.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full bg-slate-200 dark:bg-slate-800 animate-pulse" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute top-4 left-4 sm:left-6">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-black/40 hover:bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            {t.common.back}
          </Link>
        </div>
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 pb-4">
          {venue
            ? <h1 className="text-2xl sm:text-3xl font-black text-white drop-shadow-lg">{venue.name}</h1>
            : <div className="h-8 w-48 bg-white/20 rounded-lg animate-pulse" />}
        </div>
      </div>

      {/* Body */}
      <div className="px-4 sm:px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-5 items-start">

          {/* ── Booking panel ── */}
          <div className="flex-1 min-w-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">

            {/* Day strip */}
            <div className="flex items-center gap-2 px-3 py-3 border-b border-slate-100 dark:border-slate-800">
              <button
                onClick={() => changeDate(addDays(date, -1))}
                disabled={!canGoPrev}
                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20 transition-colors shrink-0"
              >
                <svg className="w-4 h-4 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
              </button>

              <div className="flex gap-1 flex-1 overflow-x-auto scrollbar-none">
                {dayButtons.map((d) => {
                  const isActive = d === date;
                  const isT = d === today;
                  return (
                    <button
                      key={d}
                      onClick={() => changeDate(d)}
                      className={`flex flex-col items-center px-2.5 py-1.5 rounded-xl min-w-[46px] transition-all shrink-0 border ${
                        isActive
                          ? "bg-sky-500 border-sky-500 text-white shadow-md shadow-sky-500/25"
                          : "border-transparent hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <span className={`text-[9px] font-bold tracking-widest ${
                        isActive ? "text-sky-100" : isT ? "text-sky-500 dark:text-sky-400" : "text-slate-400 dark:text-slate-500"
                      }`}>
                        {isT && !isActive ? "DANES" : weekdayShort(d)}
                      </span>
                      <span className={`text-base font-black leading-tight ${isActive ? "text-white" : "text-slate-800 dark:text-slate-200"}`}>
                        {dayNum(d)}
                      </span>
                      <span className={`text-[9px] font-semibold ${isActive ? "text-sky-100" : "text-slate-400 dark:text-slate-500"}`}>
                        {monthShort(d)}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => changeDate(addDays(date, 1))}
                disabled={!canGoNext}
                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20 transition-colors shrink-0"
              >
                <svg className="w-4 h-4 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
              </button>

              {/* Calendar icon — opens date picker */}
              <label className="cursor-pointer shrink-0">
                <div className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors border border-slate-200 dark:border-slate-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth={2}/>
                    <line x1="16" y1="2" x2="16" y2="6" strokeWidth={2}/>
                    <line x1="8" y1="2" x2="8" y2="6" strokeWidth={2}/>
                    <line x1="3" y1="10" x2="21" y2="10" strokeWidth={2}/>
                  </svg>
                </div>
                <input
                  type="date"
                  value={date}
                  min={today}
                  onChange={(e) => { if (e.target.value) changeDate(e.target.value); }}
                  className="sr-only"
                />
              </label>
            </div>

            {/* Sport tag row */}
            <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[11px] font-bold px-3 py-1 rounded-full">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" strokeWidth="2"/>
                  <path strokeLinecap="round" strokeWidth="1.5" d="M12 3C8.5 6.5 8.5 17.5 12 21M12 3C15.5 6.5 15.5 17.5 12 21"/>
                </svg>
                Tennis
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {new Date(date + "T00:00:00").toLocaleDateString("sl-SI", { weekday: "long", day: "numeric", month: "long" })}
              </span>
            </div>

            {/* Grid */}
            {isLoading ? (
              <div className="p-4 space-y-2 animate-pulse">
                {[...Array(10)].map((_, i) => <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800 rounded-xl" />)}
              </div>
            ) : !venue || venue.courts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-3xl mb-2">🎾</p>
                <p className="text-slate-500 dark:text-slate-400 font-semibold">{t.courts.noVenues}</p>
              </div>
            ) : (
              <CourtGrid
                courts={venue.courts}
                date={date}
                today={today}
                nowPx={nowPx}
                selection={selection}
                onSelect={(sel) => { setSelection(sel); setBooked(false); setNotes(""); }}
              />
            )}

            {/* Booking bar */}
            {selection && !booked && (
              <div className="border-t-2 border-green-400/40 bg-green-50 dark:bg-green-500/10 px-4 py-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-green-500 flex items-center justify-center shrink-0 shadow shadow-green-500/30">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{selectedCourt?.name}</p>
                      <p className="text-xs text-green-600 dark:text-green-400 font-semibold tabular-nums">
                        {fmtTime(selection.startMin)} – {fmtTime(selection.endMin)}
                        {price != null && <span className="text-slate-400 font-normal ml-1">· €{price.toFixed(2)}</span>}
                      </p>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t.courts.notesPlaceholder}
                    className="text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-green-400 w-full sm:w-48 transition-all"
                  />
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => setSelection(null)} className="px-3 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
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
                      className="px-5 py-2 bg-green-500 hover:bg-green-400 active:bg-green-600 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors shadow shadow-green-500/20"
                    >
                      {bookMutation.isPending ? t.courts.booking : t.courts.book}
                    </button>
                  </div>
                </div>
                {bookMutation.error && <p className="text-xs text-red-500 mt-2">{bookMutation.error.message}</p>}
              </div>
            )}

            {booked && selection && (
              <div className="border-t border-green-400/30 bg-green-500 px-4 py-3 flex items-center gap-3">
                <svg className="w-5 h-5 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                <div className="flex-1">
                  <p className="text-white font-bold text-sm">{t.courts.bookingConfirmed}</p>
                  <p className="text-white/70 text-xs">{selectedCourt?.name} · {fmtTime(selection.startMin)}–{fmtTime(selection.endMin)}</p>
                </div>
                <button onClick={() => { setBooked(false); setSelection(null); }} className="text-xs text-white/80 hover:text-white underline">
                  {t.courts.newBooking}
                </button>
              </div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="w-full lg:w-60 shrink-0 space-y-4">

            {/* Quick slots */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">{t.courts.quickBook}</h3>
              </div>
              <p className="text-xs text-slate-400 mb-2">{t.courts.availableSlots}</p>
              {venue?.courts.length
                ? <QuickSlots courtId={venue.courts[0].id} date={date} today={today} />
                : <p className="text-xs text-slate-400">—</p>}
            </div>

            {/* Pricing */}
            {venue?.courts.some(c => c.price_per_hour != null) && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2" strokeWidth={2}/><line x1="2" y1="10" x2="22" y2="10" strokeWidth={2}/></svg>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">{t.courts.pricing}</h3>
                </div>
                {venue.courts.filter(c => c.price_per_hour != null).slice(0, 1).map(c => (
                  <div key={c.id} className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">08:00 – 22:00</span>
                    <span className="font-bold text-slate-900 dark:text-white">{(c.price_per_hour! / 100).toFixed(0)} €/h</span>
                  </div>
                ))}
              </div>
            )}

            {/* Location */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">{t.courts.location}</h3>
              </div>
              {venue
                ? (
                  <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <p>{venue.city}{venue.address ? `, ${venue.address}` : ""}</p>
                    {venue.phone && <a href={`tel:${venue.phone}`} className="block hover:text-sky-600 dark:hover:text-sky-400 transition-colors">{venue.phone}</a>}
                    {venue.website && <a href={venue.website} target="_blank" rel="noopener noreferrer" className="block hover:text-sky-600 dark:hover:text-sky-400 transition-colors truncate">{venue.website.replace(/^https?:\/\//, "")}</a>}
                  </div>
                )
                : <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />}
            </div>

            {/* Surfaces */}
            {venue?.surfaces && venue.surfaces.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{t.courts.surfaces}</p>
                <div className="flex flex-wrap gap-1.5">
                  {venue.surfaces.map((s) => (
                    <span key={s} className={`text-xs px-2 py-1 rounded-full font-semibold border ${SURFACE_COLORS[s] ?? "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"}`}>
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

// ── CourtGrid ─────────────────────────────────────────────────────────────────
// Renders the full time grid for all courts.
// Fetches bookings once per court (not per cell).

function CourtGrid({
  courts, date, today, nowPx, selection, onSelect,
}: {
  courts: VenueCourt[];
  date: string;
  today: string;
  nowPx: number | null;
  selection: Selection;
  onSelect: (sel: Selection) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth: `${56 + courts.length * 140}px` }}>

        {/* Court headers */}
        <div className="flex sticky top-0 z-10 bg-slate-50 dark:bg-slate-900/90 border-b-2 border-slate-200 dark:border-slate-700 backdrop-blur-sm">
          <div className="w-14 shrink-0" />
          {courts.map((court) => (
            <div key={court.id} className="flex-1 min-w-[140px] border-l border-slate-200 dark:border-slate-700 px-2 py-2.5 text-center">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide truncate">{court.name}</p>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold border ${SURFACE_COLORS[court.surface] ?? "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600"}`}>
                  {court.surface}
                </span>
                {court.price_per_hour != null && (
                  <span className="text-[9px] font-bold text-green-600 dark:text-green-400">{(court.price_per_hour / 100).toFixed(0)}€/h</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Time + court columns */}
        <div className="relative">
          {/* "Now" red line */}
          {nowPx !== null && (
            <div className="absolute left-0 right-0 z-20 pointer-events-none flex items-center" style={{ top: nowPx }}>
              <div className="w-2 h-2 rounded-full bg-red-500 ml-[46px] shrink-0" />
              <div className="flex-1 h-px bg-red-500" />
            </div>
          )}

          {HOURS.map((hour) => (
            <div key={hour} className="flex" style={{ height: HOUR_H }}>
              {/* Hour label */}
              <div className="w-14 shrink-0 flex items-start justify-end pr-2.5 pt-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium tabular-nums">{String(hour).padStart(2, "0")}:00</span>
              </div>
              {/* Per-court hour cell */}
              {courts.map((court) => (
                <CourtHourCell
                  key={court.id}
                  court={court}
                  hour={hour}
                  date={date}
                  today={today}
                  selection={selection}
                  onSelect={onSelect}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── CourtHourCell ─────────────────────────────────────────────────────────────
// One hour block for one court. Fetches data once per court (query is shared/cached).

function CourtHourCell({
  court, hour, date, today, selection, onSelect,
}: {
  court: VenueCourt;
  hour: number;
  date: string;
  today: string;
  selection: Selection;
  onSelect: (sel: Selection) => void;
}) {
  const { data: bookings } = trpc.courts.getCourtAvailability.useQuery(
    { court_id: court.id, date },
    { enabled: !!court.id && !!date }
  );

  const slotStart = toMin(hour);
  const slotEnd = slotStart + 60;

  // Find bookings that START within this hour (to draw the block)
  const bookingsInSlot = useMemo(() => {
    if (!bookings) return [];
    return (bookings as Booking[]).filter(b => {
      const bs = new Date(b.starts_at).getHours() * 60 + new Date(b.starts_at).getMinutes();
      const be = new Date(b.ends_at).getHours() * 60 + new Date(b.ends_at).getMinutes();
      // starts within this hour
      return bs >= slotStart && bs < slotEnd && be > bs;
    });
  }, [bookings, slotStart, slotEnd]);

  // Is this hour fully covered by a booking that started before?
  const coveredByPrev = useMemo(() => {
    if (!bookings) return false;
    return (bookings as Booking[]).some(b => {
      const bs = new Date(b.starts_at).getHours() * 60 + new Date(b.starts_at).getMinutes();
      const be = new Date(b.ends_at).getHours() * 60 + new Date(b.ends_at).getMinutes();
      return bs < slotStart && be > slotStart;
    });
  }, [bookings, slotStart]);

  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const isPast = date === today && slotEnd <= nowMin;

  const isSelected = selection?.courtId === court.id
    && slotStart >= selection.startMin && slotEnd <= selection.endMin;

  const isFullyBooked = coveredByPrev || bookingsInSlot.length > 0;

  const handleClick = () => {
    if (isPast || isFullyBooked) return;
    if (isSelected) { onSelect(null); return; }
    onSelect({ courtId: court.id, startMin: slotStart, endMin: slotEnd });
  };

  const base = "flex-1 min-w-[140px] border-l border-b border-slate-200 dark:border-slate-700 relative overflow-hidden transition-colors";

  // Booked — grey striped, like Courtiplay
  if (isFullyBooked) {
    const firstBooking = bookingsInSlot[0];
    const name = firstBooking?.player?.full_name;
    return (
      <div className={`${base} cursor-default`} style={{ height: HOUR_H }}>
        {/* Stripe background */}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: "rgb(226 232 240 / 0.6)",
            backgroundImage: "repeating-linear-gradient(135deg, transparent, transparent 5px, rgba(203,213,225,0.5) 5px, rgba(203,213,225,0.5) 6px)",
          }}
        />
        {/* Show name only if booking starts here */}
        {firstBooking && !coveredByPrev && (
          <div className="absolute inset-0 flex flex-col justify-center px-2 py-1">
            {name && <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate">{name}</span>}
            <span className="text-[9px] text-slate-400 dark:text-slate-500 tabular-nums">
              {fmtTime(new Date(firstBooking.starts_at).getHours() * 60 + new Date(firstBooking.starts_at).getMinutes())}
              –{fmtTime(new Date(firstBooking.ends_at).getHours() * 60 + new Date(firstBooking.ends_at).getMinutes())}
            </span>
          </div>
        )}
      </div>
    );
  }

  // Past — muted
  if (isPast) {
    return (
      <div className={`${base} bg-slate-50 dark:bg-slate-800/30 cursor-default`} style={{ height: HOUR_H }} />
    );
  }

  // Selected — green
  if (isSelected) {
    return (
      <div
        className={`${base} bg-green-500 hover:bg-green-400 cursor-pointer`}
        style={{ height: HOUR_H }}
        onClick={handleClick}
      >
        <div className="absolute inset-0 flex items-center justify-center gap-1">
          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          <span className="text-xs text-white font-bold tabular-nums">{fmtTime(slotStart)}</span>
        </div>
      </div>
    );
  }

  // Free — white, green on hover
  return (
    <div
      className={`${base} bg-white dark:bg-slate-900 hover:bg-green-50 dark:hover:bg-green-500/10 cursor-pointer group`}
      style={{ height: HOUR_H }}
      onClick={handleClick}
    >
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-[11px] text-green-600 dark:text-green-400 font-semibold bg-green-100 dark:bg-green-500/20 px-2 py-0.5 rounded-lg tabular-nums">
          {fmtTime(slotStart)}
        </span>
      </div>
    </div>
  );
}

// ── QuickSlots ────────────────────────────────────────────────────────────────

function QuickSlots({ courtId, date, today }: { courtId: string; date: string; today: string }) {
  const { data: bookings } = trpc.courts.getCourtAvailability.useQuery(
    { court_id: courtId, date },
    { enabled: !!courtId && !!date }
  );
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes();

  const freeHours = useMemo(() => {
    if (!bookings) return null;
    return HOURS.filter(hour => {
      const s = toMin(hour), e = s + 60;
      if (date === today && e <= nowMin) return false;
      return !(bookings as Booking[]).some(b => {
        const bs = new Date(b.starts_at).getHours() * 60 + new Date(b.starts_at).getMinutes();
        const be = new Date(b.ends_at).getHours() * 60 + new Date(b.ends_at).getMinutes();
        return s < be && e > bs;
      });
    }).slice(0, 4);
  }, [bookings, date, today, nowMin]);

  if (!freeHours) return (
    <div className="flex flex-wrap gap-2">
      {[...Array(3)].map((_, i) => <div key={i} className="w-14 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />)}
    </div>
  );

  return freeHours.length === 0
    ? <p className="text-xs text-slate-400">—</p>
    : (
      <div className="flex flex-wrap gap-1.5">
        {freeHours.map(hour => (
          <span key={hour} className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 tabular-nums">
            {String(hour).padStart(2, "0")}:00
          </span>
        ))}
      </div>
    );
}
