"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { useT } from "@/lib/i18n/context";

// ── Constants ─────────────────────────────────────────────────────────────────

const SURFACE_COLORS: Record<string, string> = {
  clay:   "bg-orange-500/20 text-orange-400 border-orange-500/30",
  hard:   "bg-blue-500/20 text-blue-400 border-blue-500/30",
  grass:  "bg-green-500/20 text-green-400 border-green-500/30",
  indoor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
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
const PAGE_SIZE = 4;

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

type VenueCourt = { id: string; name: string; surface: string; is_indoor: boolean; price_per_hour: number | null };
type Venue = { id: string; name: string; city: string; address: string | null; phone?: string | null; website?: string | null; surfaces?: string[]; courts: VenueCourt[] };
type Booking = { starts_at: string; ends_at: string; player?: { full_name?: string } };
type Selection = { courtId: string; startMin: number } | null;

// ── Main page ─────────────────────────────────────────────────────────────────

export default function VenueDetailPage() {
  const { venueId } = useParams<{ venueId: string }>();
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

  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const nowPx = date === today && nowMin >= toMin(START_HOUR) && nowMin <= toMin(END_HOUR)
    ? ((nowMin - toMin(START_HOUR)) / 60) * HOUR_H : null;

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 min-h-screen bg-[#0d0d0d]">

      {/* Hero */}
      <div className="relative h-48 sm:h-60 overflow-hidden">
        {venue
          ? <img src={heroImg} alt={venue.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full bg-[#1a1a1a] animate-pulse" />}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-black/40 to-transparent" />
        <div className="absolute top-4 left-4 sm:left-6">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-black/50 hover:bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            {t.common.back}
          </Link>
        </div>
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 pb-5">
          {venue ? (
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white drop-shadow-lg">{venue.name}</h1>
              <p className="text-sm text-[#9ca3af] mt-0.5 flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-[#6b7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                {venue.city}{venue.address ? `, ${venue.address}` : ""}
              </p>
            </div>
          ) : <div className="h-8 w-48 bg-white/10 rounded-lg animate-pulse" />}
        </div>
      </div>

      {/* Body */}
      <div className="px-4 sm:px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-5 items-start">

          {/* ── Booking panel ── */}
          <div className="flex-1 min-w-0 bg-[#111111] rounded-2xl border border-[#1e1e1e] overflow-hidden">

            {/* Day strip */}
            <div className="flex items-center gap-2 px-3 py-3 border-b border-[#1e1e1e]">
              <button
                onClick={() => changeDate(addDays(date, -1))}
                disabled={date <= today}
                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#1e1e1e] disabled:opacity-20 transition-colors shrink-0"
              >
                <svg className="w-4 h-4 text-[#6b7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
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
                          ? "bg-[#22c55e] border-[#22c55e] text-white shadow-lg shadow-green-500/20"
                          : "border-transparent hover:bg-[#1e1e1e]"
                      }`}
                    >
                      <span className={`text-[9px] font-bold tracking-widest ${
                        isActive ? "text-green-100" : isT ? "text-[#22c55e]" : "text-[#4b5563]"
                      }`}>
                        {isT && !isActive ? "DANES" : weekdayShort(d)}
                      </span>
                      <span className={`text-base font-black leading-tight ${isActive ? "text-white" : "text-white"}`}>
                        {dayNum(d)}
                      </span>
                      <span className={`text-[9px] font-semibold ${isActive ? "text-green-100" : "text-[#4b5563]"}`}>
                        {monthShort(d)}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => changeDate(addDays(date, 1))}
                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#1e1e1e] transition-colors shrink-0"
              >
                <svg className="w-4 h-4 text-[#6b7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
              </button>

              <label className="cursor-pointer shrink-0">
                <div className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#1e1e1e] text-[#6b7280] transition-colors border border-[#2a2a2a]">
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
                {[...Array(10)].map((_, i) => <div key={i} className="h-14 bg-[#1a1a1a] rounded-xl" />)}
              </div>
            ) : !venue || venue.courts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-3xl mb-2">🎾</p>
                <p className="text-[#6b7280] font-semibold">{t.courts.noVenues}</p>
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
              <div className="border-t border-[#22c55e]/20 bg-[#22c55e]/10 px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#22c55e] flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                </div>
                <div className="flex-1">
                  <p className="text-white font-bold text-sm">{t.courts.bookingConfirmed}</p>
                  <p className="text-[#9ca3af] text-xs">{bookedInfo.courtName} · {fmtTime(bookedInfo.start)}–{fmtTime(bookedInfo.end)}</p>
                </div>
                <button onClick={() => setBooked(false)} className="text-xs text-[#22c55e] hover:text-green-400 font-semibold">
                  {t.courts.newBooking}
                </button>
              </div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="w-full lg:w-56 shrink-0 space-y-3">

            {/* Surfaces */}
            {venue?.surfaces && venue.surfaces.length > 0 && (
              <div className="bg-[#111111] rounded-2xl border border-[#1e1e1e] p-4">
                <p className="text-[10px] font-bold text-[#4b5563] uppercase tracking-wider mb-2.5">{t.courts.surfaces}</p>
                <div className="flex flex-wrap gap-1.5">
                  {venue.surfaces.map((s) => (
                    <span key={s} className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${SURFACE_COLORS[s] ?? "bg-[#1e1e1e] text-[#9ca3af] border-[#2a2a2a]"}`}>
                      {t.surfaces[s as keyof typeof t.surfaces] ?? s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Location */}
            <div className="bg-[#111111] rounded-2xl border border-[#1e1e1e] p-4">
              <p className="text-[10px] font-bold text-[#4b5563] uppercase tracking-wider mb-2.5">{t.courts.location}</p>
              {venue ? (
                <div className="space-y-1.5 text-xs text-[#6b7280]">
                  <p className="text-[#9ca3af]">{venue.city}{venue.address ? `, ${venue.address}` : ""}</p>
                  {venue.phone && (
                    <a href={`tel:${venue.phone}`} className="flex items-center gap-1.5 hover:text-[#22c55e] transition-colors">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                      {venue.phone}
                    </a>
                  )}
                  {venue.website && (
                    <a href={venue.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-[#22c55e] transition-colors truncate">
                      <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9"/></svg>
                      <span className="truncate">{venue.website.replace(/^https?:\/\//, "")}</span>
                    </a>
                  )}
                </div>
              ) : <div className="h-4 bg-[#1a1a1a] rounded animate-pulse" />}
            </div>

            {/* Legend */}
            <div className="bg-[#111111] rounded-2xl border border-[#1e1e1e] p-4">
              <p className="text-[10px] font-bold text-[#4b5563] uppercase tracking-wider mb-2.5">Legenda</p>
              <div className="space-y-2">
                {[
                  { color: "bg-[#1a2e1a] border-[#22c55e]/30", label: "Prosto" },
                  { color: "bg-[#1e1e1e] border-[#2a2a2a]", label: "Zasedeno" },
                  { color: "bg-[#22c55e] border-[#22c55e]", label: "Izbrano" },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-md border ${item.color}`} />
                    <span className="text-xs text-[#6b7280]">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking modal */}
      {modalOpen && selection && selectedCourt && (
        <BookingModal
          court={selectedCourt}
          date={date}
          venueName={venue?.name ?? ""}
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

// ── BookingModal ───────────────────────────────────────────────────────────────

function BookingModal({
  court, date, venueName, initialStart, onClose, onConfirm, isPending, error,
}: {
  court: VenueCourt;
  date: string;
  venueName: string;
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

  const dateLabel = new Date(date + "T00:00:00").toLocaleDateString("sl-SI", {
    weekday: "long", day: "numeric", month: "long",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:max-w-md bg-[#111111] rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden border border-[#2a2a2a]">

        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-[#2a2a2a] rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-4 pb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-[#22c55e] bg-[#22c55e]/10 border border-[#22c55e]/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Rezervacija
              </span>
            </div>
            <h2 className="text-xl font-black text-white">{court.name}</h2>
            <p className="text-sm text-[#6b7280] mt-0.5 flex items-center gap-1">
              <svg className="w-3 h-3 text-[#4b5563]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              {venueName}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#1e1e1e] hover:bg-[#2a2a2a] text-[#6b7280] hover:text-white transition-colors mt-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="px-5 space-y-4 pb-5">

          {/* Date row */}
          <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-xl px-3.5 py-2.5 border border-[#2a2a2a]">
            <svg className="w-4 h-4 text-[#6b7280] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth={2}/>
              <line x1="16" y1="2" x2="16" y2="6" strokeWidth={2}/>
              <line x1="8" y1="2" x2="8" y2="6" strokeWidth={2}/>
              <line x1="3" y1="10" x2="21" y2="10" strokeWidth={2}/>
            </svg>
            <span className="text-sm text-white font-semibold capitalize">{dateLabel}</span>
          </div>

          {/* Duration pills */}
          <div>
            <p className="text-[10px] font-bold text-[#4b5563] uppercase tracking-widest mb-2">Trajanje</p>
            <div className="flex gap-2">
              {DURATION_OPTIONS.map(d => {
                const available = d <= maxDuration;
                const active = d === effectiveDuration;
                return (
                  <button
                    key={d}
                    onClick={() => available && setDurationMins(d)}
                    disabled={!available}
                    className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all ${
                      active
                        ? "bg-[#22c55e] border-[#22c55e] text-white shadow-lg shadow-green-500/20"
                        : available
                        ? "bg-[#1a1a1a] border-[#2a2a2a] text-[#9ca3af] hover:border-[#3a3a3a] hover:text-white"
                        : "bg-[#111111] border-[#1a1a1a] text-[#3a3a3a] cursor-not-allowed"
                    }`}
                  >
                    {d < 60 ? `${d}m` : `${d / 60}h`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Start + End */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] font-bold text-[#4b5563] uppercase tracking-widest mb-2">Začetek</p>
              <div className="relative">
                <select
                  value={startMin}
                  onChange={(e) => setStartMin(Number(e.target.value))}
                  className="w-full appearance-none text-sm font-bold tabular-nums px-3 py-2.5 pr-8 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-white outline-none focus:ring-2 focus:ring-[#22c55e]/50 cursor-pointer transition-all"
                >
                  {validStarts.map(s => (
                    <option key={s} value={s}>{fmtTime(s)}</option>
                  ))}
                </select>
                <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6b7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7"/></svg>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#4b5563] uppercase tracking-widest mb-2">Konec</p>
              <div className="w-full text-sm font-bold tabular-nums px-3 py-2.5 rounded-xl bg-[#1a1a1a]/50 border border-[#2a2a2a]/50 text-[#9ca3af] flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-[#4b5563] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                {fmtTime(endMin)}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <p className="text-[10px] font-bold text-[#4b5563] uppercase tracking-widest mb-2">Opomba <span className="normal-case font-normal text-[#3a3a3a]">(neobvezno)</span></p>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="npr. trening, turnir..."
              className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-white placeholder-[#4b5563] outline-none focus:ring-2 focus:ring-[#22c55e]/50 transition-all"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3.5 py-2.5">
              <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}

          <div className="border-t border-[#1e1e1e]" />

          {/* Total + confirm */}
          <div className="flex items-center justify-between">
            <div>
              {price != null ? (
                <>
                  <p className="text-xs text-[#4b5563]">Skupaj</p>
                  <p className="text-2xl font-black text-white">{price % 1 === 0 ? price.toFixed(0) : price.toFixed(2)} €</p>
                </>
              ) : (
                <p className="text-sm text-[#6b7280]">{fmtTime(startMin)} – {fmtTime(endMin)}</p>
              )}
            </div>
            <button
              onClick={() => onConfirm(startMin, endMin, notes)}
              disabled={isPending || availableDurations.length === 0}
              className="flex items-center gap-2 px-6 py-3 bg-[#22c55e] hover:bg-[#16a34a] active:bg-[#15803d] disabled:opacity-50 text-white font-black rounded-xl transition-colors shadow-lg shadow-green-500/20"
            >
              {isPending ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Rezervacija...
                </>
              ) : (
                <>
                  Potrdi
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/></svg>
                </>
              )}
            </button>
          </div>

          <p className="text-[10px] text-[#3a3a3a] text-center">Z rezervacijo sprejemate pravila in pogoje igrišča</p>
        </div>
      </div>
    </div>
  );
}

// ── CourtGrid ─────────────────────────────────────────────────────────────────

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
  const totalH = HOURS.length * HOUR_H;
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(courts.length / PAGE_SIZE);
  const visible = courts.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-[#1e1e1e] bg-[#0d0d0d]">
          <span className="text-xs text-[#4b5563] font-medium">
            Igrišča {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, courts.length)} / {courts.length}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(p => p - 1)}
              disabled={page === 0}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#1e1e1e] disabled:opacity-30 transition-colors"
            >
              <svg className="w-3.5 h-3.5 text-[#6b7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7"/></svg>
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= totalPages - 1}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#1e1e1e] disabled:opacity-30 transition-colors"
            >
              <svg className="w-3.5 h-3.5 text-[#6b7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <div style={{ minWidth: `${56 + visible.length * 160}px` }}>

          {/* Court headers */}
          <div className="flex sticky top-0 z-10 bg-[#111111] border-b border-[#2a2a2a]">
            <div className="w-14 shrink-0" />
            {visible.map((court) => (
              <div key={court.id} className="flex-1 min-w-[160px] border-l border-[#1e1e1e] px-2 py-3 text-center">
                <p className="text-xs font-bold text-white uppercase tracking-wide truncate">{court.name}</p>
                <div className="flex items-center justify-center mt-1">
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${SURFACE_COLORS[court.surface] ?? "bg-[#1e1e1e] text-[#6b7280] border-[#2a2a2a]"}`}>
                    {court.surface}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Grid body */}
          <div className="relative flex" style={{ height: totalH }}>
            {nowPx !== null && (
              <div className="absolute left-0 right-0 z-20 pointer-events-none flex items-center" style={{ top: nowPx }}>
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 ml-[46px] shrink-0" />
                <div className="flex-1 h-px bg-red-500/60" />
              </div>
            )}

            {/* Time axis */}
            <div className="w-14 shrink-0 relative">
              {HOURS.map((hour) => (
                <div key={hour} className="absolute right-0 flex justify-end pr-2.5" style={{ top: (hour - START_HOUR) * HOUR_H, height: HOUR_H }}>
                  <span className="text-[11px] text-[#4b5563] font-medium tabular-nums mt-1">{String(hour).padStart(2, "0")}:00</span>
                </div>
              ))}
              {HOURS.map((hour) => (
                <div key={hour} className="absolute left-0 right-0 border-b border-[#1a1a1a]" style={{ top: (hour - START_HOUR) * HOUR_H + HOUR_H }} />
              ))}
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
  );
}

// ── CourtColumn ───────────────────────────────────────────────────────────────

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

  const handleCellClick = (hour: number) => {
    const slotStart = toMin(hour);
    const slotEnd = slotStart + 60;
    if (bookedMins.has(slotStart) || bookedMins.has(slotStart + 30)) return;
    if (date === today && slotEnd <= nowMin) return;
    if (selection?.courtId === court.id && slotStart === selection.startMin) {
      onSelect(null);
      return;
    }
    onSelect({ courtId: court.id, startMin: slotStart });
  };

  return (
    <div className="flex-1 min-w-[150px] border-l border-[#1e1e1e] relative" style={{ height: totalH }}>

      {HOURS.map((hour) => {
        const slotStart = toMin(hour);
        const slotEnd = slotStart + 60;
        const isBooked = bookedMins.has(slotStart) || bookedMins.has(slotStart + 30);
        const isPast = date === today && slotEnd <= nowMin;
        const isSelected = selection?.courtId === court.id && slotStart === selection.startMin;

        return (
          <div
            key={hour}
            className={[
              "absolute left-0 right-0 border-b border-[#1a1a1a] transition-colors",
              isBooked
                ? "cursor-default bg-[#1a1a1a]"
                : isPast
                ? "bg-[#0f0f0f] cursor-default"
                : isSelected
                ? "bg-[#22c55e] hover:bg-[#16a34a] cursor-pointer"
                : "bg-[#111111] hover:bg-[#1a2e1a] cursor-pointer group",
            ].join(" ")}
            style={{ top: (hour - START_HOUR) * HOUR_H, height: HOUR_H }}
            onClick={() => handleCellClick(hour)}
          >
            {!isBooked && !isPast && !isSelected && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <span className="text-[11px] text-[#22c55e] font-semibold tabular-nums">
                  {fmtTime(slotStart)}
                </span>
              </div>
            )}
            {isSelected && (
              <div className="absolute inset-0 flex items-center justify-center gap-1.5 pointer-events-none">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                <span className="text-sm text-white font-bold tabular-nums">{fmtTime(slotStart)}</span>
              </div>
            )}
          </div>
        );
      })}

      {/* Floating booking cards */}
      {(bookings as Booking[] | undefined)?.map((b, i) => {
        const bs = isoToLocalMin(b.starts_at);
        const be = isoToLocalMin(b.ends_at);
        const top = ((bs - toMin(START_HOUR)) / 60) * HOUR_H;
        const height = ((be - bs) / 60) * HOUR_H;
        if (top < 0 || height <= 0) return null;
        return (
          <div
            key={i}
            className="absolute left-1 right-1 z-10 rounded-xl overflow-hidden pointer-events-none"
            style={{ top: top + 2, height: height - 4 }}
          >
            <div className="w-full h-full flex flex-col justify-center px-3 py-2 rounded-xl bg-[#2a1a1a] border border-red-500/20"
              style={{ backgroundImage: "repeating-linear-gradient(135deg,transparent,transparent 5px,rgba(239,68,68,0.04) 5px,rgba(239,68,68,0.04) 6px)" }}
            >
              {b.player?.full_name && (
                <span className="text-sm font-black text-[#f87171] truncate leading-tight">
                  {b.player.full_name}
                </span>
              )}
              <span className="text-xs font-semibold text-[#9ca3af] tabular-nums">{fmtTime(bs)}–{fmtTime(be)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
