"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { useT } from "@/lib/i18n/context";

const SURFACE_COLORS: Record<string, string> = {
  clay: "bg-orange-500/20 text-orange-300 border border-orange-500/30",
  hard: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  grass: "bg-green-500/20 text-green-300 border border-green-500/30",
  indoor: "bg-purple-500/20 text-purple-300 border border-purple-500/30",
};


// Venue photos: Courtiplay CDN for venues on Courtiplay, curated Unsplash for others
const VENUE_PHOTOS: Record<string, string> = {
  // Ljubljana clubs (not on Courtiplay) — verified Unsplash tennis court photos
  "tc-fuzine":        "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600&q=80",
  "tk-ilirija":       "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=600&q=80",
  "tk-olimpija":      "https://images.unsplash.com/photo-1530915365347-e35b749a0381?w=600&q=80",
  "tc-smarna-gora":   "https://images.unsplash.com/photo-1530915365347-e35b749a0381?w=600&q=80",
  "tenis-center-btc": "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600&q=80",
  "tk-tivoli":        "https://images.unsplash.com/photo-1530915365347-e35b749a0381?w=600&q=80",
  // On Courtiplay
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

const SURFACE_IMAGES: Record<string, string> = {
  clay:    "https://api.courtiplay.com/storage/v1/render/image/public/banners/33a4b992-23df-4ca8-90f6-80645fed4f92/IMG_1742.jpeg?height=600&resize=contain",
  hard:    "https://api.courtiplay.com/storage/v1/render/image/public/banners/707f60ba-39f4-4a67-9f9d-52b7dc25428b/1000005826.jpg?height=600&resize=contain",
  grass:   "https://api.courtiplay.com/storage/v1/render/image/public/banners/6c6ac6f3-1dfb-43f3-af77-e92a5c62852d/13_1678487216.jpeg?height=600&resize=contain",
  indoor:  "https://api.courtiplay.com/storage/v1/render/image/public/banners/a4c78234-1eda-4d6c-b950-b5e3da099e6f/Screenshot%202025-10-26%20at%2015.34.33.png?height=600&resize=contain",
  default: "https://api.courtiplay.com/storage/v1/render/image/public/banners/d7e43b12-9b33-4e1e-8bbe-b6c897d37b1b/Rimski_igrisce_1515.jpg?height=600&resize=contain",
};

function venueSlug(name: string): string {
  return name.toLowerCase()
    .replace(/[čćžšđ]/g, (c) => ({č:"c",ć:"c",ž:"z",š:"s",đ:"d"}[c]??c))
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function getVenueImage(name: string, surfaces: string[]): string {
  const slug = venueSlug(name);
  return VENUE_PHOTOS[slug] ?? SURFACE_IMAGES[surfaces[0] ?? "default"] ?? SURFACE_IMAGES.default;
}

const HOURS = Array.from({ length: 30 }, (_, i) => {
  const h = Math.floor(i / 2) + 7;
  const m = i % 2 === 0 ? "00" : "30";
  return `${String(h).padStart(2, "0")}:${m}`;
});

export default function VenueDetailPage() {
  const { venueId } = useParams<{ venueId: string }>();
  const { t } = useT();
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);

  const { data: venue, isLoading } = trpc.courts.getVenue.useQuery(
    { id: venueId },
    { enabled: !!venueId }
  );

  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const isToday = date === today;
  const isTomorrow = date === tomorrow;
  const dateObj = new Date(date + "T00:00:00");
  const displayDate = isToday
    ? t.home.today
    : isTomorrow
    ? t.home.tomorrow
    : dateObj.toLocaleDateString("sl-SI", { weekday: "long", day: "2-digit", month: "2-digit" });

  const prevDay = () => {
    const d = new Date(date + "T00:00:00");
    d.setDate(d.getDate() - 1);
    if (d.toISOString().slice(0, 10) >= today) setDate(d.toISOString().slice(0, 10));
  };
  const nextDay = () => {
    const d = new Date(date + "T00:00:00");
    d.setDate(d.getDate() + 1);
    setDate(d.toISOString().slice(0, 10));
  };

  const venueSurfaces = (venue as { surfaces?: string[] } | undefined)?.surfaces ?? [];
  const heroImg = getVenueImage(venue?.name ?? "", venueSurfaces);

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 min-h-screen bg-slate-950">

      {/* ── Hero with photo ── */}
      <div className="relative h-64 sm:h-80 overflow-hidden">
        {venue ? (
          <img src={heroImg} alt={venue.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-slate-800 animate-pulse" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-black/40 to-black/20" />

        {/* Back button */}
        <div className="absolute top-4 left-4 sm:left-6 lg:left-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-black/40 hover:bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t.common.back}
          </Link>
        </div>

        {/* Venue info on hero */}
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 lg:px-8 pb-6">
          <div className="max-w-3xl mx-auto">
            {isLoading ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-8 bg-white/20 rounded w-56" />
                <div className="h-4 bg-white/10 rounded w-40" />
              </div>
            ) : venue ? (
              <>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {((venue as { surfaces?: string[] }).surfaces ?? []).map((s) => (
                    <span key={s} className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide backdrop-blur-sm ${SURFACE_COLORS[s] ?? "bg-white/10 text-white border border-white/20"}`}>
                      {t.surfaces[s as keyof typeof t.surfaces] ?? s}
                    </span>
                  ))}
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white">{venue.name}</h1>
                <div className="flex flex-wrap items-center gap-3 mt-1.5">
                  <span className="text-white/70 text-sm flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {venue.city}{venue.address && `, ${venue.address}`}
                  </span>
                  {(venue as { phone?: string | null }).phone && (
                    <a href={`tel:${(venue as { phone?: string }).phone}`} className="text-green-400 text-sm flex items-center gap-1 hover:text-green-300 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {(venue as { phone?: string }).phone}
                    </a>
                  )}
                  {venue.courts.length > 0 && (
                    <span className="text-slate-400 text-sm">{venue.courts.length} igrišča</span>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* ── Date selector ── */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <svg className="w-4 h-4 text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth={2} />
            <line x1="16" y1="2" x2="16" y2="6" strokeWidth={2} />
            <line x1="8" y1="2" x2="8" y2="6" strokeWidth={2} />
            <line x1="3" y1="10" x2="21" y2="10" strokeWidth={2} />
          </svg>
          <span className="text-sm font-semibold text-white flex-1 capitalize">{displayDate}</span>
          <div className="flex items-center gap-0.5">
            <button onClick={prevDay} disabled={date <= today} className="p-1.5 rounded-lg hover:bg-slate-800 disabled:opacity-30 transition-colors">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <label className="cursor-pointer">
              <span className="text-xs text-green-400 font-semibold px-2 py-1 hover:bg-green-500/10 rounded-lg transition-colors">{t.common.edit}</span>
              <input type="date" value={date} min={today} onChange={(e) => setDate(e.target.value)} className="sr-only" />
            </label>
            <button onClick={nextDay} className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Court list ── */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="h-36 bg-slate-800 rounded-2xl animate-pulse border border-slate-700" />
            ))
          ) : !venue ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-3">🏟️</p>
              <p className="font-black text-white">{t.courts.noVenues}</p>
            </div>
          ) : venue.courts.length === 0 ? (
            <p className="text-center text-slate-500 py-10">{t.courts.noVenues}</p>
          ) : (
            venue.courts.map((court) => (
              <CourtRow key={court.id} court={court} date={date} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ── CourtRow ──────────────────────────────────────────────────────────────────

function CourtRow({
  court,
  date,
}: {
  court: { id: string; name: string; surface: string; is_indoor: boolean; price_per_hour: number | null };
  date: string;
}) {
  const { t } = useT();
  const [startSlot, setStartSlot] = useState<string | null>(null);
  const [endSlot, setEndSlot] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [booked, setBooked] = useState(false);

  const { data: bookings } = trpc.courts.getCourtAvailability.useQuery(
    { court_id: court.id, date },
    { enabled: !!court.id && !!date }
  );

  const bookMutation = trpc.courts.bookCourt.useMutation({
    onSuccess: () => setBooked(true),
  });

  const slotToMin = (slot: string) => {
    const [h, m] = slot.split(":").map(Number);
    return h * 60 + m;
  };

  const isSlotBooked = (slot: string) => {
    if (!bookings) return false;
    const slotMin = slotToMin(slot);
    return bookings.some((b) => {
      const startMin = new Date(b.starts_at).getHours() * 60 + new Date(b.starts_at).getMinutes();
      const endMin = new Date(b.ends_at).getHours() * 60 + new Date(b.ends_at).getMinutes();
      return slotMin >= startMin && slotMin < endMin;
    });
  };

  const handleSlotClick = (slot: string) => {
    if (isSlotBooked(slot)) return;
    if (!startSlot) {
      setStartSlot(slot);
      setEndSlot(null);
      setBooked(false);
    } else if (!endSlot && slot !== startSlot) {
      if (slotToMin(slot) > slotToMin(startSlot)) {
        const start = slotToMin(startSlot);
        const end = slotToMin(slot);
        const conflict = HOURS.some((s) => {
          const m = slotToMin(s);
          return m >= start && m < end && isSlotBooked(s);
        });
        if (!conflict) setEndSlot(slot);
      } else {
        setStartSlot(slot);
        setEndSlot(null);
      }
    } else {
      setStartSlot(slot);
      setEndSlot(null);
      setBooked(false);
    }
  };

  const durationMins = startSlot && endSlot ? slotToMin(endSlot) - slotToMin(startSlot) : 0;
  const price = court.price_per_hour != null ? (court.price_per_hour / 100) * (durationMins / 60) : null;

  const getSlotClass = (slot: string) => {
    if (isSlotBooked(slot))
      return "bg-slate-700/50 text-slate-600 cursor-not-allowed line-through";
    const sMin = slotToMin(slot);
    const selStart = startSlot ? slotToMin(startSlot) : null;
    const selEnd = endSlot ? slotToMin(endSlot) : null;
    if (selStart !== null && selEnd !== null && sMin >= selStart && sMin < selEnd)
      return "bg-green-500 text-black font-black shadow-lg shadow-green-500/20";
    if (slot === startSlot)
      return "bg-green-500 text-black font-black ring-2 ring-green-300 ring-offset-1 ring-offset-slate-800";
    return "bg-slate-700 text-slate-300 hover:bg-green-500/20 hover:text-green-300 border border-slate-600 cursor-pointer";
  };

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
      {/* Court header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
            court.is_indoor ? "bg-purple-500/10" : "bg-yellow-500/10"
          }`}>
            {court.is_indoor ? "🏠" : "☀️"}
          </div>
          <div>
            <p className="font-bold text-white">{court.name}</p>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${SURFACE_COLORS[court.surface] ?? "bg-slate-700 text-slate-400"}`}>
              {t.surfaces[court.surface as keyof typeof t.surfaces] ?? court.surface}
            </span>
          </div>
        </div>
        {court.price_per_hour != null && (
          <div className="text-right">
            <p className="text-xl font-black text-green-400">€{(court.price_per_hour / 100).toFixed(0)}</p>
            <p className="text-xs text-slate-500">/ uro</p>
          </div>
        )}
      </div>

      {/* Slot pills */}
      <div className="px-5 py-4">
        <p className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-widest">
          {!startSlot ? "Izberi začetek" : !endSlot ? "Izberi konec" : `${startSlot} – ${endSlot}`}
        </p>
        <div className="overflow-x-auto -mx-1 px-1">
          <div className="flex gap-1.5 min-w-max pb-1">
            {HOURS.map((slot) => (
              <button
                key={slot}
                onClick={() => handleSlotClick(slot)}
                disabled={isSlotBooked(slot)}
                className={`px-2.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${getSlotClass(slot)}`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Booking confirmation */}
      {startSlot && endSlot && !booked && (
        <div className="mx-5 mb-5">
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="font-black text-green-400 text-base">{startSlot} – {endSlot}</p>
                <p className="text-sm text-slate-400 mt-0.5">
                  {durationMins} min{price != null && <span className="text-green-400 font-bold ml-1">· €{price.toFixed(2)}</span>}
                </p>
              </div>
              <button onClick={() => { setStartSlot(null); setEndSlot(null); }} className="text-slate-500 hover:text-slate-300 text-xl leading-none transition-colors">×</button>
            </div>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Opomba (neobvezno)…"
              className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-600 bg-slate-800 text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-green-500 mb-3"
            />
            <button
              onClick={() => {
                if (!startSlot || !endSlot) return;
                bookMutation.mutate({
                  court_id: court.id,
                  starts_at: new Date(`${date}T${startSlot}:00`).toISOString(),
                  ends_at: new Date(`${date}T${endSlot}:00`).toISOString(),
                  notes: notes || undefined,
                });
              }}
              disabled={bookMutation.isPending}
              className="w-full py-3 bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black text-sm font-black rounded-xl transition-colors shadow-lg shadow-green-500/20"
            >
              {bookMutation.isPending ? "Rezerviram…" : `Rezerviraj · ${startSlot}–${endSlot}${price != null ? ` · €${price.toFixed(2)}` : ""}`}
            </button>
            {bookMutation.error && <p className="text-xs text-red-400 mt-2 text-center">{bookMutation.error.message}</p>}
          </div>
        </div>
      )}

      {/* Success */}
      {booked && (
        <div className="mx-5 mb-5">
          <div className="bg-green-500 rounded-2xl p-5 text-center shadow-lg shadow-green-500/20">
            <div className="w-12 h-12 bg-black/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-black font-black text-base">Rezervacija potrjena!</p>
            <p className="text-black/70 text-sm mt-1">{court.name} · {startSlot}–{endSlot}</p>
            <button
              onClick={() => { setBooked(false); setStartSlot(null); setEndSlot(null); setNotes(""); }}
              className="mt-3 text-xs text-black/60 hover:text-black underline transition-colors"
            >
              Nova rezervacija
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
