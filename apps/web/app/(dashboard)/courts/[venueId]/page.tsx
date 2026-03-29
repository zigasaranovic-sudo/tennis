"use client";

import { useState, useMemo, use } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { useT } from "@/lib/i18n/context";

// ── Constants ──────────────────────────────────────────────────────────────────

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

const START_HOUR = 8;
const END_HOUR = 20;
const SLOT_H = 64; // px per 30-min slot
const SLOTS = Array.from({ length: (END_HOUR - START_HOUR) * 2 }, (_, i) => i);
const PAGE_SIZE = 4;

// Kinetic gradient (used across CTA buttons and selected slots)
const KINETIC_GRADIENT = "linear-gradient(135deg, #4be277 0%, #22c55e 50%, #16a34a 100%)";
const STRIPE_PATTERN = "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 20px)";

// ── Helpers ────────────────────────────────────────────────────────────────────

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
function isoToLocalMin(iso: string): number {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes();
}
function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}
function slotIndexToMin(i: number): number {
  return START_HOUR * 60 + i * 30;
}

// ── Types ──────────────────────────────────────────────────────────────────────

type VenueCourt = { id: string; name: string; surface: string; is_indoor: boolean; price_per_hour: number | null };
type Venue = { id: string; name: string; city: string; address: string | null; phone?: string | null; website?: string | null; surfaces?: string[]; courts: VenueCourt[] };
type Booking = { starts_at: string; ends_at: string; player?: { full_name?: string } };
type Selection = { courtId: string; startMin: number } | null;

// ── Main page ──────────────────────────────────────────────────────────────────

export default function VenueDetailPage({ params }: { params: Promise<{ venueId: string }> }) {
  const { venueId } = use(params);
  const { t } = useT();
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [selection, setSelection] = useState<Selection>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [booked, setBooked] = useState(false);
  const [bookedInfo, setBookedInfo] = useState<{ courtName: string; start: number; end: number } | null>(null);

  const { data: venueRaw, isLoading } = trpc.courts.getVenue.useQuery({ id: venueId }, { enabled: !!venueId });
  const venue = venueRaw as Venue | undefined;

  const utils = trpc.useUtils();
  const bookMutation = trpc.courts.bookCourt.useMutation({
    onSuccess: (_, vars) => {
      utils.courts.getCourtAvailability.invalidate();
      setModalOpen(false);
      setBooked(true);
      const court = venue?.courts.find(c => c.id === vars.court_id);
      setBookedInfo({
        courtName: court?.name ?? "",
        start: isoToLocalMin(vars.starts_at),
        end: isoToLocalMin(vars.ends_at),
      });
      setSelection(null);
    },
  });

  const changeDate = (d: string) => { setDate(d); setSelection(null); setModalOpen(false); setBooked(false); setBookedInfo(null); };
  const openModal = (sel: Selection) => { setSelection(sel); setModalOpen(true); setBooked(false); };

  // Day window: 6 tiles centred on current view
  const dayOffset = Math.max(0, Math.floor(
    (new Date(date + "T00:00:00").getTime() - new Date(today + "T00:00:00").getTime()) / (86400000 * 6)
  ) * 6);
  const windowStart = addDays(today, dayOffset);
  const dayButtons = Array.from({ length: 6 }, (_, i) => addDays(windowStart, i));

  const weekdayShort = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("sl-SI", { weekday: "short" }).toUpperCase().slice(0, 3);
  const dayNum = (d: string) => new Date(d + "T00:00:00").getDate();

  const heroImg = getVenueImage(venue?.name ?? "", venue?.surfaces ?? []);
  const selectedCourt = venue?.courts.find(c => c.id === selection?.courtId);

  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const nowPx = date === today && nowMin >= toMin(START_HOUR) && nowMin <= toMin(END_HOUR)
    ? ((nowMin - toMin(START_HOUR)) / 30) * SLOT_H : null;

  const selectionDateLabel = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("sl-SI", { weekday: "short" }).replace(".", "").toUpperCase();

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 min-h-screen" style={{ background: "#131313" }}>

      {/* ── Hero ── */}
      <div className="relative h-52 sm:h-64 overflow-hidden">
        {venue
          ? <img src={heroImg} alt={venue.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full animate-pulse" style={{ background: "#1b1c1c" }} />}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #131313 0%, rgba(0,0,0,0.55) 50%, transparent 100%)" }} />

        {/* Back button */}
        <div className="absolute top-4 left-4 sm:left-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white backdrop-blur-sm px-3 py-1.5 rounded-full border transition-all"
            style={{ background: "rgba(0,0,0,0.5)", borderColor: "rgba(255,255,255,0.1)" }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t.common.back}
          </Link>
        </div>

        {/* Venue title */}
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 pb-5">
          {venue ? (
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white drop-shadow-lg">{venue.name}</h1>
              <p className="text-sm mt-0.5 flex items-center gap-1" style={{ color: "rgba(188,203,185,0.6)" }}>
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                {venue.city}{venue.address ? `, ${venue.address}` : ""}
              </p>
            </div>
          ) : (
            <div className="h-8 w-48 rounded-lg animate-pulse" style={{ background: "rgba(255,255,255,0.1)" }} />
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-4 sm:px-6 py-5 pb-32">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-5 items-start">

          {/* ── Left: Booking Panel ── */}
          <div className="flex-1 min-w-0 rounded-2xl overflow-hidden border" style={{ background: "#1b1c1c", borderColor: "rgba(255,255,255,0.05)" }}>

            {/* Day strip */}
            <div className="flex items-center gap-2 px-3 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              {/* Prev */}
              <button
                onClick={() => changeDate(addDays(date, -1))}
                disabled={date <= today}
                className="w-9 h-9 flex items-center justify-center rounded-xl transition-colors shrink-0 disabled:opacity-20"
                style={{ color: "#bccbb9" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#252626")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Day tiles */}
              <div className="flex gap-1.5 flex-1 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                {dayButtons.map((d) => {
                  const isActive = d === date;
                  const isT = d === today;
                  return (
                    <button
                      key={d}
                      onClick={() => changeDate(d)}
                      className="flex flex-col items-center justify-center min-w-[60px] h-20 rounded-2xl transition-all shrink-0 border"
                      style={isActive ? {
                        background: "rgba(75,226,119,0.1)",
                        borderColor: "rgba(75,226,119,0.2)",
                      } : {
                        background: "#1b1c1c",
                        borderColor: "rgba(61,74,61,0.1)",
                      }}
                    >
                      <span
                        className="text-[10px] font-bold tracking-widest uppercase"
                        style={{ color: isActive ? "#4be277" : isT ? "#4be277" : "rgba(188,203,185,0.4)" }}
                      >
                        {weekdayShort(d)}
                      </span>
                      <span
                        className="text-xl font-black leading-tight"
                        style={{ color: isActive ? "#4be277" : "#fff" }}
                      >
                        {dayNum(d)}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Next */}
              <button
                onClick={() => changeDate(addDays(date, 1))}
                className="w-9 h-9 flex items-center justify-center rounded-xl transition-colors shrink-0"
                style={{ color: "#bccbb9" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#252626")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Calendar picker */}
              <label className="cursor-pointer shrink-0">
                <div
                  className="w-9 h-9 flex items-center justify-center rounded-xl transition-colors border"
                  style={{ color: "#bccbb9", borderColor: "rgba(61,74,61,0.2)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#252626")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
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

            {/* Grid */}
            {isLoading ? (
              <div className="p-4 space-y-2 animate-pulse">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="h-16 rounded-xl" style={{ background: "#202020" }} />
                ))}
              </div>
            ) : !venue || venue.courts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-3xl mb-2">🎾</p>
                <p className="font-semibold" style={{ color: "rgba(188,203,185,0.4)" }}>{t.courts.noVenues}</p>
              </div>
            ) : (
              <CourtGrid
                courts={venue.courts}
                date={date}
                today={today}
                nowPx={nowPx}
                selection={selection}
                onSelect={(sel) => { if (sel) openModal(sel); else setSelection(null); }}
              />
            )}

            {/* Success banner */}
            {booked && bookedInfo && (
              <div
                className="border-t flex items-center gap-3 px-4 py-3"
                style={{ borderColor: "rgba(75,226,119,0.2)", background: "rgba(75,226,119,0.08)" }}
              >
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#4be277" }}>
                  <svg className="w-4 h-4" fill="none" stroke="#003915" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-white font-bold text-sm">{t.courts.bookingConfirmed}</p>
                  <p className="text-xs" style={{ color: "rgba(188,203,185,0.6)" }}>
                    {bookedInfo.courtName} · {fmtTime(bookedInfo.start)}–{fmtTime(bookedInfo.end)}
                  </p>
                </div>
                <button
                  onClick={() => setBooked(false)}
                  className="text-xs font-semibold transition-opacity hover:opacity-70"
                  style={{ color: "#4be277" }}
                >
                  {t.courts.newBooking}
                </button>
              </div>
            )}
          </div>

          {/* ── Right: Quick Booking Sidebar (desktop) ── */}
          <div className="hidden lg:block w-72 shrink-0">
            <div className="rounded-2xl overflow-hidden sticky top-6 border" style={{ background: "#1b1c1c", borderColor: "rgba(255,255,255,0.05)" }}>

              {/* Venue photo */}
              <div className="relative h-36 overflow-hidden">
                {venue
                  ? <img src={heroImg} alt={venue.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full animate-pulse" style={{ background: "#202020" }} />}
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #1b1c1c 0%, rgba(0,0,0,0.2) 100%)" }} />
              </div>

              <div className="px-4 pt-2 pb-5 space-y-4">

                {/* Header */}
                <div>
                  <p className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: "#4be277" }}>
                    Quick Booking
                  </p>
                  <p className="text-base font-black text-white leading-tight">{venue?.name ?? "—"}</p>
                  {venue && (
                    <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: "rgba(188,203,185,0.5)" }}>
                      <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                      {venue.city}{venue.address ? `, ${venue.address}` : ""}
                    </p>
                  )}
                </div>

                {selection && selectedCourt ? (
                  <>
                    {/* Selection details */}
                    <div className="rounded-xl border p-3 space-y-2" style={{ background: "#202020", borderColor: "rgba(255,255,255,0.05)" }}>
                      <SidebarRow label="Court" value={selectedCourt.name} valueClass="text-white font-bold" />
                      <SidebarRow
                        label="Date"
                        value={new Date(date + "T00:00:00").toLocaleDateString("sl-SI", { day: "numeric", month: "short" })}
                        valueClass="font-semibold"
                        valueStyle={{ color: "rgba(188,203,185,0.7)" }}
                      />
                      <SidebarRow
                        label="Time"
                        value={`${fmtTime(selection.startMin)} – ${fmtTime(selection.startMin + 60)}`}
                        valueClass="font-semibold tabular-nums"
                        valueStyle={{ color: "#4be277" }}
                      />
                    </div>

                    {/* Pricing */}
                    {selectedCourt.price_per_hour != null && (
                      <div className="rounded-xl border p-3" style={{ background: "#202020", borderColor: "rgba(255,255,255,0.05)" }}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(188,203,185,0.4)" }}>Rate / hr</span>
                          <span className="text-sm" style={{ color: "rgba(188,203,185,0.6)" }}>{(selectedCourt.price_per_hour / 100).toFixed(0)} €</span>
                        </div>
                        <div className="flex items-center justify-between border-t pt-2" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                          <span className="text-sm font-bold text-white">Total (1h)</span>
                          <span className="text-lg font-black text-white">{(selectedCourt.price_per_hour / 100).toFixed(0)} €</span>
                        </div>
                      </div>
                    )}

                    {/* Confirm button */}
                    <button
                      onClick={() => openModal(selection)}
                      className="w-full py-3 text-sm font-black rounded-full tracking-wide transition-opacity hover:opacity-90"
                      style={{ background: KINETIC_GRADIENT, color: "#003915" }}
                    >
                      Confirm Booking
                    </button>
                    <p className="text-[10px] text-center uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.12)" }}>
                      Free cancellation up to 24h before
                    </p>
                  </>
                ) : (
                  /* Empty state */
                  <div className="rounded-xl border p-4 text-center" style={{ background: "#202020", borderColor: "rgba(255,255,255,0.05)" }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2" style={{ background: "#252626" }}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "rgba(188,203,185,0.2)" }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                    </div>
                    <p className="text-xs" style={{ color: "rgba(188,203,185,0.3)" }}>Select a slot in the grid</p>
                  </div>
                )}

                {/* Contact */}
                {venue && (venue.phone || venue.website) && (
                  <div className="space-y-1.5 pt-1 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                    {venue.phone && (
                      <a href={`tel:${venue.phone}`} className="flex items-center gap-2 text-xs transition-colors"
                         style={{ color: "rgba(188,203,185,0.4)" }}
                         onMouseEnter={e => (e.currentTarget.style.color = "#4be277")}
                         onMouseLeave={e => (e.currentTarget.style.color = "rgba(188,203,185,0.4)")}>
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                        </svg>
                        {venue.phone}
                      </a>
                    )}
                    {venue.website && (
                      <a href={venue.website} target="_blank" rel="noopener noreferrer"
                         className="flex items-center gap-2 text-xs transition-colors truncate"
                         style={{ color: "rgba(188,203,185,0.4)" }}
                         onMouseEnter={e => (e.currentTarget.style.color = "#4be277")}
                         onMouseLeave={e => (e.currentTarget.style.color = "rgba(188,203,185,0.4)")}>
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9"/>
                        </svg>
                        <span className="truncate">{venue.website.replace(/^https?:\/\//, "")}</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── YOUR SELECTION bottom card (mobile/tablet) ── */}
      {selection && selectedCourt && (
        <div
          className="fixed bottom-0 left-0 right-0 z-40 lg:hidden px-4 py-4"
          style={{ background: "#131313", borderTop: "1px solid rgba(75,226,119,0.1)" }}
        >
          <div className="rounded-2xl p-4 border flex items-center justify-between gap-3" style={{ background: "#202020", borderColor: "rgba(75,226,119,0.1)" }}>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "#4be277" }}>Your Selection</p>
              <p className="text-sm font-bold text-white truncate">
                {selectedCourt.name}
              </p>
              <p className="text-xs tabular-nums" style={{ color: "rgba(188,203,185,0.6)" }}>
                {selectionDateLabel(date)}, {fmtTime(selection.startMin)} – {fmtTime(selection.startMin + 60)}
              </p>
            </div>
            <button
              onClick={() => openModal(selection)}
              className="shrink-0 px-5 py-2.5 text-sm font-black rounded-full transition-opacity hover:opacity-90"
              style={{ background: KINETIC_GRADIENT, color: "#003915" }}
            >
              Book Now
            </button>
          </div>
        </div>
      )}

      {/* ── Booking Modal ── */}
      {modalOpen && selection && selectedCourt && (
        <BookingModal
          court={selectedCourt}
          date={date}
          venueName={venue?.name ?? ""}
          heroImg={heroImg}
          initialStart={selection.startMin}
          onClose={() => { setModalOpen(false); setSelection(null); }}
          onConfirm={(startMin, endMin, notes) => {
            bookMutation.mutate({
              court_id: selection.courtId,
              starts_at: new Date(`${date}T${fmtTime(startMin)}:00`).toISOString(),
              ends_at: new Date(`${date}T${fmtTime(endMin)}:00`).toISOString(),
              notes: notes || undefined,
            });
          }}
          isPending={bookMutation.isPending}
          error={bookMutation.error?.message}
        />
      )}
    </div>
  );
}

// ── SidebarRow (tiny helper) ───────────────────────────────────────────────────

function SidebarRow({
  label, value, valueClass = "", valueStyle,
}: {
  label: string;
  value: string;
  valueClass?: string;
  valueStyle?: React.CSSProperties;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(188,203,185,0.35)" }}>{label}</span>
      <span className={`text-sm ${valueClass}`} style={valueStyle}>{value}</span>
    </div>
  );
}

// ── BookingModal ───────────────────────────────────────────────────────────────

function BookingModal({
  court, date, venueName, initialStart, onClose, onConfirm, isPending, error,
}: {
  court: VenueCourt;
  date: string;
  venueName: string;
  heroImg: string;
  initialStart: number;
  onClose: () => void;
  onConfirm: (startMin: number, endMin: number, notes: string) => void;
  isPending: boolean;
  error?: string;
}) {
  const { data: bookings } = trpc.courts.getCourtAvailability.useQuery(
    { court_id: court.id, date },
    { enabled: !!court.id && !!date }
  );

  const DURATION_OPTIONS = [30, 60, 90, 120];

  const bookedIntervals = useMemo(() => {
    if (!bookings) return [] as { bs: number; be: number }[];
    return (bookings as Booking[]).map(b => ({
      bs: isoToLocalMin(b.starts_at),
      be: isoToLocalMin(b.ends_at),
    }));
  }, [bookings]);

  const firstValidStart = useMemo(() => {
    for (let m = initialStart; m < END_HOUR * 60; m += 30) {
      const blocked = bookedIntervals.some(({ bs, be }) => m >= bs && m < be);
      if (!blocked) return m;
    }
    return initialStart;
  }, [initialStart, bookedIntervals]);

  const [startMin, setStartMin] = useState(firstValidStart);
  const [durationMins, setDurationMins] = useState(60);
  const [notes, setNotes] = useState("");

  const validStarts = useMemo(() => {
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const todayStr = now.toISOString().slice(0, 10);
    const slots: number[] = [];
    for (let m = START_HOUR * 60; m < END_HOUR * 60; m += 30) {
      if (date === todayStr && m <= nowMin) continue;
      const blocked = bookedIntervals.some(({ bs, be }) => m >= bs && m < be);
      if (!blocked) slots.push(m);
    }
    return slots;
  }, [bookedIntervals, date]);

  const maxDuration = useMemo(() => {
    const nexts = bookedIntervals.map(b => b.bs).filter(bs => bs > startMin);
    const wall = nexts.length ? Math.min(...nexts) : END_HOUR * 60;
    return Math.min(wall - startMin, 240);
  }, [startMin, bookedIntervals]);

  const availableDurations = DURATION_OPTIONS.filter(d => d <= maxDuration);
  const effectiveDuration = availableDurations.includes(durationMins)
    ? durationMins
    : availableDurations[availableDurations.length - 1] ?? 30;

  const endMin = startMin + effectiveDuration;
  const price = court.price_per_hour != null
    ? (court.price_per_hour / 100) * (effectiveDuration / 60) : null;

  const today = new Date().toISOString().slice(0, 10);
  const dateTiles = Array.from({ length: 4 }, (_, i) => addDays(date, i - 1)).filter(d => d >= today).slice(0, 4);
  const [selectedDate, setSelectedDate] = useState(date);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ background: "rgba(14,14,14,0.8)" }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="relative w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border"
        style={{ background: "#202020", borderColor: "rgba(255,255,255,0.06)" }}
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full" style={{ background: "#2a2a2a" }} />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-4 pb-4 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          <div>
            <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "#4be277" }}>
              Reservation Details
            </span>
            <h2 className="text-2xl font-black text-white mt-0.5">{court.name}</h2>
            <p className="text-sm flex items-center gap-1 mt-0.5" style={{ color: "rgba(188,203,185,0.5)" }}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              {venueName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl transition-colors mt-1"
            style={{ background: "#2a2a2a", color: "rgba(188,203,185,0.5)" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#333"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#2a2a2a"; e.currentTarget.style.color = "rgba(188,203,185,0.5)"; }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-5 space-y-5 pt-4 pb-5 max-h-[70vh] overflow-y-auto">

          {/* Date tiles */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{ color: "rgba(188,203,185,0.4)" }}>Select Date</p>
            <div className="flex gap-2">
              {dateTiles.map((d) => {
                const isActive = d === selectedDate;
                const wd = new Date(d + "T00:00:00").toLocaleDateString("sl-SI", { weekday: "short" }).toUpperCase().replace(".", "").slice(0, 3);
                const dn = new Date(d + "T00:00:00").getDate();
                return (
                  <button
                    key={d}
                    onClick={() => setSelectedDate(d)}
                    className="flex-1 flex flex-col items-center py-2.5 rounded-xl border transition-all"
                    style={isActive ? {
                      background: "rgba(75,226,119,0.1)",
                      borderColor: "rgba(75,226,119,0.2)",
                    } : {
                      background: "#1b1c1c",
                      borderColor: "rgba(61,74,61,0.1)",
                    }}
                  >
                    <span className="text-[9px] font-bold tracking-widest" style={{ color: isActive ? "#4be277" : "rgba(188,203,185,0.35)" }}>{wd}</span>
                    <span className="text-lg font-black leading-tight text-white">{dn}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Start / End time */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{ color: "rgba(188,203,185,0.4)" }}>Time Slot</p>
            <div className="grid grid-cols-2 gap-3">
              {/* Start */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: "rgba(188,203,185,0.3)" }}>Start Time</p>
                <div className="relative">
                  <select
                    value={startMin}
                    onChange={(e) => setStartMin(Number(e.target.value))}
                    className="w-full appearance-none text-base font-black tabular-nums px-4 py-3.5 pr-8 rounded-xl border text-white outline-none cursor-pointer transition-all"
                    style={{ background: "#1b1c1c", borderColor: "rgba(255,255,255,0.06)" }}
                  >
                    {validStarts.map(s => (
                      <option key={s} value={s} style={{ background: "#202020" }}>{fmtTime(s)}</option>
                    ))}
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "rgba(188,203,185,0.4)" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
              </div>
              {/* End */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: "rgba(188,203,185,0.3)" }}>End Time</p>
                <div
                  className="w-full text-base font-black tabular-nums px-4 py-3.5 rounded-xl border flex items-center"
                  style={{ background: "#1b1c1c", borderColor: "rgba(255,255,255,0.06)", color: "rgba(188,203,185,0.5)" }}
                >
                  {fmtTime(endMin)}
                </div>
              </div>
            </div>
          </div>

          {/* Duration */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(188,203,185,0.4)" }}>Total Duration</p>
              <span className="text-xs font-semibold" style={{ color: "rgba(188,203,185,0.6)" }}>{effectiveDuration} min</span>
            </div>
            <div className="flex gap-2">
              {DURATION_OPTIONS.map(d => {
                const available = d <= maxDuration;
                const active = d === effectiveDuration;
                return (
                  <button
                    key={d}
                    onClick={() => available && setDurationMins(d)}
                    disabled={!available}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all"
                    style={active ? {
                      background: KINETIC_GRADIENT,
                      borderColor: "transparent",
                      color: "#003915",
                    } : available ? {
                      background: "#1b1c1c",
                      borderColor: "rgba(61,74,61,0.15)",
                      color: "rgba(188,203,185,0.6)",
                    } : {
                      background: "rgba(27,28,28,0.4)",
                      borderColor: "rgba(255,255,255,0.03)",
                      color: "rgba(188,203,185,0.15)",
                      cursor: "not-allowed",
                    }}
                  >
                    {d < 60 ? `${d}m` : `${d / 60}h`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(188,203,185,0.4)" }}>
              Note <span className="normal-case font-normal" style={{ color: "rgba(188,203,185,0.2)" }}>(optional)</span>
            </p>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. training, tournament..."
              className="w-full text-sm px-4 py-3 rounded-xl border text-white outline-none transition-all"
              style={{
                background: "#1b1c1c",
                borderColor: "rgba(255,255,255,0.06)",
              }}
              onFocus={e => (e.currentTarget.style.borderColor = "rgba(75,226,119,0.3)")}
              onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)")}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 border" style={{ background: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.2)" }}>
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="#f87171" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p className="text-xs" style={{ color: "#f87171" }}>{error}</p>
            </div>
          )}

          {/* Price card */}
          {price != null && (
            <div className="rounded-xl border p-4" style={{ background: "#1b1c1c", borderColor: "rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-3 mb-3 pb-3 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                {/* Wallet icon */}
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(75,226,119,0.1)" }}>
                  <svg className="w-4 h-4" fill="none" stroke="#4be277" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: "rgba(188,203,185,0.4)" }}>Estimated Cost</p>
                  <p className="text-xs tabular-nums" style={{ color: "rgba(188,203,185,0.6)" }}>
                    {fmtTime(startMin)} – {fmtTime(endMin)} · {effectiveDuration} min
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">Total</span>
                <span className="text-2xl font-black text-white">{price % 1 === 0 ? price.toFixed(0) : price.toFixed(2)} €</span>
              </div>
            </div>
          )}

          {/* Confirm button */}
          <button
            onClick={() => onConfirm(startMin, endMin, notes)}
            disabled={isPending || availableDurations.length === 0}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-full font-black text-base tracking-wide transition-opacity disabled:opacity-50 hover:opacity-90"
            style={{ background: KINETIC_GRADIENT, color: "#003915" }}
          >
            {isPending ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Booking...
              </>
            ) : "Confirm Booking"}
          </button>

          <p className="text-[10px] text-center uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.1)" }}>
            Free Cancellation Up To 24H Before
          </p>
        </div>
      </div>
    </div>
  );
}

// ── CourtGrid ──────────────────────────────────────────────────────────────────

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
  const totalH = SLOTS.length * SLOT_H;
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(courts.length / PAGE_SIZE);
  const visible = courts.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-2 border-b" style={{ background: "#131313", borderColor: "rgba(255,255,255,0.05)" }}>
          <span className="text-xs font-medium" style={{ color: "rgba(188,203,185,0.35)" }}>
            Courts {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, courts.length)} / {courts.length}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(p => p - 1)}
              disabled={page === 0}
              className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors disabled:opacity-30"
              style={{ color: "rgba(188,203,185,0.5)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#202020")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= totalPages - 1}
              className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors disabled:opacity-30"
              style={{ color: "rgba(188,203,185,0.5)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#202020")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Grid container */}
      <div className="m-1 rounded-2xl overflow-hidden border" style={{ background: "#1b1c1c", borderColor: "rgba(255,255,255,0.05)" }}>
        <div className="overflow-x-auto">
          <div style={{ minWidth: `${64 + visible.length * 160}px` }}>

            {/* Court header row */}
            <div className="flex sticky top-0 z-10 border-b" style={{ background: "#1b1c1c", borderColor: "rgba(255,255,255,0.05)" }}>
              <div className="w-16 shrink-0" />
              {visible.map((court, idx) => {
                const isActive = selection?.courtId === court.id;
                return (
                  <div
                    key={court.id}
                    className="flex-1 min-w-[160px] border-l px-2 py-2.5 text-center"
                    style={{ borderColor: "rgba(255,255,255,0.04)" }}
                  >
                    <p
                      className="text-[10px] font-bold uppercase tracking-widest truncate"
                      style={{ color: isActive ? "#4be277" : "rgba(188,203,185,0.45)" }}
                    >
                      {court.name}
                    </p>
                    <p className="text-[9px] mt-0.5 capitalize" style={{ color: "rgba(188,203,185,0.25)" }}>
                      {court.is_indoor ? "Indoor " : "Outdoor "}{court.surface}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Grid body */}
            <div className="relative flex" style={{ height: totalH }}>
              {/* Now line */}
              {nowPx !== null && (
                <div
                  className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
                  style={{ top: nowPx }}
                >
                  <div className="w-2.5 h-2.5 rounded-full shrink-0 ml-[52px]" style={{ background: "#ef4444" }} />
                  <div className="flex-1 h-px" style={{ background: "rgba(239,68,68,0.5)" }} />
                </div>
              )}

              {/* Time axis */}
              <div className="w-16 shrink-0 relative">
                {SLOTS.map((i) => {
                  const isFullHour = i % 2 === 0;
                  const min = slotIndexToMin(i);
                  return (
                    <div
                      key={i}
                      className="absolute right-0 flex justify-end pr-2"
                      style={{ top: i * SLOT_H, height: SLOT_H }}
                    >
                      <span
                        className="tabular-nums mt-1"
                        style={{
                          fontSize: isFullHour ? 10 : 9,
                          fontWeight: isFullHour ? 600 : 400,
                          color: isFullHour ? "rgba(188,203,185,0.35)" : "rgba(188,203,185,0.18)",
                        }}
                      >
                        {fmtTime(min)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {visible.map((court) => (
                <CourtColumn
                  key={court.id}
                  court={court}
                  date={date}
                  today={today}
                  selection={selection}
                  onSelect={onSelect}
                  totalH={totalH}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── CourtColumn ────────────────────────────────────────────────────────────────

function CourtColumn({
  court, date, today, selection, onSelect, totalH,
}: {
  court: VenueCourt;
  date: string;
  today: string;
  selection: Selection;
  onSelect: (sel: Selection) => void;
  totalH: number;
}) {
  const { data: bookings } = trpc.courts.getCourtAvailability.useQuery(
    { court_id: court.id, date },
    { enabled: !!court.id && !!date }
  );

  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const bookedMins = useMemo(() => {
    if (!bookings) return new Set<number>();
    const set = new Set<number>();
    for (const b of bookings as Booking[]) {
      const bs = isoToLocalMin(b.starts_at);
      const be = isoToLocalMin(b.ends_at);
      for (let m = bs; m < be; m += 30) set.add(m);
    }
    return set;
  }, [bookings]);

  const bookingByStart = useMemo(() => {
    if (!bookings) return new Map<number, Booking>();
    const map = new Map<number, Booking>();
    for (const b of bookings as Booking[]) {
      const bs = isoToLocalMin(b.starts_at);
      map.set(bs, b);
    }
    return map;
  }, [bookings]);

  const handleSlotClick = (slotMin: number) => {
    const slotEnd = slotMin + 30;
    if (bookedMins.has(slotMin)) return;
    if (date === today && slotEnd <= nowMin) return;
    if (selection?.courtId === court.id && slotMin === selection.startMin) {
      onSelect(null);
      return;
    }
    onSelect({ courtId: court.id, startMin: slotMin });
  };

  return (
    <div
      className="flex-1 min-w-[150px] border-l relative"
      style={{ height: totalH, borderColor: "rgba(255,255,255,0.04)" }}
    >
      {SLOTS.map((i) => {
        const slotMin = slotIndexToMin(i);
        const slotEnd = slotMin + 30;
        const isBooked = bookedMins.has(slotMin);
        const isPast = date === today && slotEnd <= nowMin;
        const isSelected = selection?.courtId === court.id && slotMin === selection.startMin;

        if (isBooked) return null; // rendered via overlay blocks

        return (
          <div
            key={i}
            className="absolute left-1 right-1 rounded-md transition-colors"
            style={{
              top: i * SLOT_H + 2,
              height: SLOT_H - 4,
              background: isSelected
                ? KINETIC_GRADIENT
                : isPast
                ? "rgba(27,28,28,0.4)"
                : "#202020",
              cursor: isPast ? "default" : "pointer",
            }}
            onClick={() => handleSlotClick(slotMin)}
            onMouseEnter={e => {
              if (!isPast && !isSelected) e.currentTarget.style.background = "#2a2a2a";
            }}
            onMouseLeave={e => {
              if (!isPast && !isSelected) e.currentTarget.style.background = "#202020";
            }}
          >
            {isSelected && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-0.5">
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="#003915" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: "#003915" }}>Selected</span>
                </div>
                <span className="text-[7px] tabular-nums font-semibold" style={{ color: "rgba(0,57,21,0.7)" }}>
                  {fmtTime(slotMin)} – {fmtTime(slotEnd)}
                </span>
              </div>
            )}
          </div>
        );
      })}

      {/* Booked overlay blocks */}
      {(bookings as Booking[] | undefined)?.map((b, bi) => {
        const bs = isoToLocalMin(b.starts_at);
        const be = isoToLocalMin(b.ends_at);
        const topIdx = (bs - START_HOUR * 60) / 30;
        const numSlots = (be - bs) / 30;
        if (topIdx < 0 || numSlots <= 0) return null;

        return (
          <div
            key={bi}
            className="absolute left-1 right-1 z-10 pointer-events-none overflow-hidden rounded-md"
            style={{
              top: topIdx * SLOT_H + 2,
              height: numSlots * SLOT_H - 4,
              background: "rgba(53,53,53,0.2)",
              backgroundImage: STRIPE_PATTERN,
            }}
          >
            <div className="w-full h-full flex flex-col items-center justify-center gap-0.5">
              <span className="text-[8px] font-bold uppercase tracking-widest" style={{ color: "rgba(188,203,185,0.25)" }}>
                Booked
              </span>
              {b.player?.full_name && (
                <span
                  className="text-[8px] font-semibold truncate px-2 max-w-full text-center leading-tight"
                  style={{ color: "rgba(188,203,185,0.35)" }}
                >
                  {b.player.full_name}
                </span>
              )}
            </div>
          </div>
        );
      })}

      {/* Cursor-not-allowed overlay for booked slots */}
      {SLOTS.map((i) => {
        const slotMin = slotIndexToMin(i);
        const isBooked = bookedMins.has(slotMin);
        if (!isBooked) return null;
        return (
          <div
            key={`booked-cursor-${i}`}
            className="absolute left-0 right-0 cursor-not-allowed"
            style={{ top: i * SLOT_H, height: SLOT_H, zIndex: 9 }}
          />
        );
      })}
    </div>
  );
}
