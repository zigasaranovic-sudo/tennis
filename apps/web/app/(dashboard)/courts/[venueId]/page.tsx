"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { useT } from "@/lib/i18n/context";

const SURFACE_COLORS: Record<string, string> = {
  clay:   "bg-orange-100 text-orange-700 border border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-500/30",
  hard:   "bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30",
  grass:  "bg-green-100 text-green-700 border border-green-200 dark:bg-green-500/20 dark:text-green-300 dark:border-green-500/30",
  indoor: "bg-purple-100 text-purple-700 border border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/30",
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

// 7:00–22:00 in 30-min steps
const HOURS = Array.from({ length: 30 }, (_, i) => {
  const h = Math.floor(i / 2) + 7;
  const m = i % 2 === 0 ? "00" : "30";
  return `${String(h).padStart(2, "0")}:${m}`;
});

function venueSlug(name: string): string {
  return name.toLowerCase()
    .replace(/[čćžšđ]/g, (c) => ({ č:"c", ć:"c", ž:"z", š:"s", đ:"d" }[c] ?? c))
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function getVenueImage(name: string, surfaces: string[]): string {
  const slug = venueSlug(name);
  return VENUE_PHOTOS[slug] ?? SURFACE_FALLBACK[surfaces[0] ?? "default"] ?? SURFACE_FALLBACK.default;
}

type VenueCourt = { id: string; name: string; surface: string; is_indoor: boolean; price_per_hour: number | null };
type Venue = {
  id: string; name: string; city: string; address: string | null;
  phone?: string | null; website?: string | null; surfaces?: string[];
  courts: VenueCourt[];
};

// ─────────────────────────────────────────────────────────────────────────────

export default function VenueDetailPage() {
  const { venueId } = useParams<{ venueId: string }>();
  const { t } = useT();
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);

  const { data: venueRaw, isLoading } = trpc.courts.getVenue.useQuery(
    { id: venueId },
    { enabled: !!venueId }
  );
  const venue = venueRaw as Venue | undefined;

  const dateObj = new Date(date + "T00:00:00");
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const isToday = date === today;
  const isTomorrow = date === tomorrow;
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

  const heroImg = getVenueImage(venue?.name ?? "", venue?.surfaces ?? []);

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 min-h-screen bg-slate-50 dark:bg-slate-950">

      {/* ── Full-width hero banner ── */}
      <div className="relative h-52 sm:h-64 overflow-hidden">
        {venue ? (
          <img src={heroImg} alt={venue.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
        )}
        {/* Dark gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />

        {/* Back button */}
        <div className="absolute top-4 left-4 sm:left-6 lg:left-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-black/40 hover:bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t.common.back}
          </Link>
        </div>

        {/* Venue name on photo */}
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 lg:px-8 pb-5">
          {venue ? (
            <h1 className="text-2xl sm:text-3xl font-black text-white drop-shadow-lg">{venue.name}</h1>
          ) : (
            <div className="h-8 w-48 bg-white/20 rounded animate-pulse" />
          )}
        </div>
      </div>

      {/* ── Main content: booking grid + sidebar ── */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 items-start">

          {/* ── Left: Reservations panel ── */}
          <div className="flex-1 min-w-0">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">

              {/* Panel header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth={2}/>
                    <line x1="16" y1="2" x2="16" y2="6" strokeWidth={2}/>
                    <line x1="8" y1="2" x2="8" y2="6" strokeWidth={2}/>
                    <line x1="3" y1="10" x2="21" y2="10" strokeWidth={2}/>
                  </svg>
                  <h2 className="font-bold text-slate-900 dark:text-white text-sm">{t.courts.bookings}</h2>
                </div>

                {/* Date nav */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={prevDay}
                    disabled={date <= today}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
                  >
                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <label className="cursor-pointer">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-green-400 transition-colors">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 capitalize whitespace-nowrap">
                        {displayDate}
                      </span>
                      <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth={2}/>
                        <line x1="16" y1="2" x2="16" y2="6" strokeWidth={2}/>
                        <line x1="8" y1="2" x2="8" y2="6" strokeWidth={2}/>
                        <line x1="3" y1="10" x2="21" y2="10" strokeWidth={2}/>
                      </svg>
                    </div>
                    <input type="date" value={date} min={today} onChange={(e) => setDate(e.target.value)} className="sr-only" />
                  </label>
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

              {/* Sport pill (Tennis) */}
              <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800">
                <span className="inline-flex items-center gap-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="9" strokeWidth="2"/>
                    <path strokeLinecap="round" strokeWidth="1.5" d="M12 3C8.5 6.5 8.5 17.5 12 21M12 3C15.5 6.5 15.5 17.5 12 21"/>
                  </svg>
                  Tennis
                </span>
              </div>

              {/* Courts */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {isLoading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="p-5 space-y-3 animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32" />
                      </div>
                      <div className="flex gap-2">
                        {[...Array(8)].map((_, j) => (
                          <div key={j} className="w-14 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg" />
                        ))}
                      </div>
                    </div>
                  ))
                ) : !venue ? (
                  <div className="text-center py-20">
                    <p className="text-4xl mb-3">🏟️</p>
                    <p className="font-bold text-slate-700 dark:text-white">{t.courts.noVenues}</p>
                  </div>
                ) : venue.courts.length === 0 ? (
                  <p className="text-center text-slate-400 py-10 text-sm">{t.courts.noVenues}</p>
                ) : (
                  venue.courts.map((court) => (
                    <CourtRow key={court.id} court={court} date={date} />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ── Right: Sidebar ── */}
          <div className="w-full lg:w-72 shrink-0 space-y-4">

            {/* Quick booking */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">{t.courts.quickBook}</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{t.courts.availableSlots}</p>
              {venue?.courts && venue.courts.length > 0 ? (
                <QuickSlots courtId={venue.courts[0].id} date={date} />
              ) : (
                <p className="text-xs text-slate-400">—</p>
              )}
            </div>

            {/* Pricing */}
            {venue?.courts && venue.courts.some(c => c.price_per_hour != null) && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="2" y="5" width="20" height="14" rx="2" strokeWidth={2}/>
                    <line x1="2" y1="10" x2="22" y2="10" strokeWidth={2}/>
                  </svg>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">{t.courts.pricing}</h3>
                </div>
                <div className="space-y-2">
                  {venue.courts
                    .filter(c => c.price_per_hour != null)
                    .map((c, i, arr) => {
                      const prev = arr[i - 1];
                      if (prev && prev.price_per_hour === c.price_per_hour) return null;
                      return (
                        <div key={c.id} className="flex items-center justify-between text-sm">
                          <span className="text-slate-500 dark:text-slate-400">
                            {c.is_indoor ? "07:00 – 22:00" : "08:00 – 22:00"}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {(c.price_per_hour! / 100).toFixed(0)}€/h
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Venue info */}
            {venue && (venue.address || venue.phone || venue.website) && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">{t.courts.location}</h3>
                </div>
                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  {venue.address && (
                    <p className="flex items-start gap-2">
                      <span className="mt-0.5 text-slate-400">📍</span>
                      {venue.address}, {venue.city}
                    </p>
                  )}
                  {venue.phone && (
                    <a href={`tel:${venue.phone}`} className="flex items-center gap-2 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                      <span>📞</span>{venue.phone}
                    </a>
                  )}
                  {venue.website && (
                    <a href={venue.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-green-600 dark:hover:text-green-400 transition-colors truncate">
                      <span>🌐</span>{venue.website.replace(/^https?:\/\//, "")}
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Surface tags */}
            {venue?.surfaces && venue.surfaces.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">{t.courts.surfaces}</p>
                <div className="flex flex-wrap gap-2">
                  {venue.surfaces.map((s) => (
                    <span key={s} className={`text-xs px-3 py-1 rounded-full font-semibold ${SURFACE_COLORS[s] ?? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>
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

// ── QuickSlots: first 3 available slots on the first court ───────────────────

function QuickSlots({ courtId, date }: { courtId: string; date: string }) {
  const { data: bookings } = trpc.courts.getCourtAvailability.useQuery(
    { court_id: courtId, date },
    { enabled: !!courtId && !!date }
  );

  const slotToMin = (slot: string) => {
    const [h, m] = slot.split(":").map(Number);
    return h * 60 + m;
  };

  const isBooked = (slot: string) => {
    if (!bookings) return false;
    const sm = slotToMin(slot);
    return bookings.some((b) => {
      const s = new Date(b.starts_at).getHours() * 60 + new Date(b.starts_at).getMinutes();
      const e = new Date(b.ends_at).getHours() * 60 + new Date(b.ends_at).getMinutes();
      return sm >= s && sm < e;
    });
  };

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const freeSlots = HOURS.filter((slot) => {
    if (!isBooked(slot)) {
      if (date === todayStr && slotToMin(slot) <= nowMin) return false;
      return true;
    }
    return false;
  }).slice(0, 3);

  if (!bookings) {
    return (
      <div className="flex gap-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-16 h-9 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (freeSlots.length === 0) {
    return <p className="text-xs text-slate-400">No available slots</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {freeSlots.map((slot) => (
        <span key={slot} className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700">
          {slot}
        </span>
      ))}
    </div>
  );
}

// ── CourtRow ──────────────────────────────────────────────────────────────────

function CourtRow({
  court,
  date,
}: {
  court: VenueCourt;
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
    const sm = slotToMin(slot);
    return bookings.some((b) => {
      const s = new Date(b.starts_at).getHours() * 60 + new Date(b.starts_at).getMinutes();
      const e = new Date(b.ends_at).getHours() * 60 + new Date(b.ends_at).getMinutes();
      return sm >= s && sm < e;
    });
  };

  const handleSlotClick = (slot: string) => {
    if (isSlotBooked(slot)) return;
    if (!startSlot) {
      setStartSlot(slot); setEndSlot(null); setBooked(false);
    } else if (!endSlot && slot !== startSlot) {
      if (slotToMin(slot) > slotToMin(startSlot)) {
        const s = slotToMin(startSlot), e = slotToMin(slot);
        const conflict = HOURS.some((h) => { const m = slotToMin(h); return m >= s && m < e && isSlotBooked(h); });
        if (!conflict) setEndSlot(slot);
      } else {
        setStartSlot(slot); setEndSlot(null);
      }
    } else {
      setStartSlot(slot); setEndSlot(null); setBooked(false);
    }
  };

  const durationMins = startSlot && endSlot ? slotToMin(endSlot) - slotToMin(startSlot) : 0;
  const price = court.price_per_hour != null ? (court.price_per_hour / 100) * (durationMins / 60) : null;

  const getSlotClass = (slot: string) => {
    if (isSlotBooked(slot))
      return "bg-slate-100 dark:bg-slate-800/50 text-slate-300 dark:text-slate-600 cursor-not-allowed line-through border border-transparent";
    const sm = slotToMin(slot);
    const ss = startSlot ? slotToMin(startSlot) : null;
    const se = endSlot ? slotToMin(endSlot) : null;
    if (ss !== null && se !== null && sm >= ss && sm < se)
      return "bg-green-500 text-white font-bold border border-green-400 shadow-sm shadow-green-500/20";
    if (slot === startSlot)
      return "bg-green-500 text-white font-bold border border-green-400 ring-2 ring-green-300 ring-offset-1 ring-offset-white dark:ring-offset-slate-900";
    return "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-green-50 dark:hover:bg-green-500/10 hover:text-green-700 dark:hover:text-green-300 hover:border-green-300 dark:hover:border-green-500/40 border border-slate-200 dark:border-slate-700 cursor-pointer";
  };

  return (
    <div className="p-5">
      {/* Court header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 ${
            court.is_indoor
              ? "bg-purple-50 dark:bg-purple-500/10"
              : "bg-amber-50 dark:bg-amber-500/10"
          }`}>
            {court.is_indoor ? "🏠" : "☀️"}
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white text-sm">{court.name}</p>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide ${SURFACE_COLORS[court.surface] ?? "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"}`}>
              {t.surfaces[court.surface as keyof typeof t.surfaces] ?? court.surface}
            </span>
          </div>
        </div>
        {court.price_per_hour != null && (
          <div className="text-right shrink-0">
            <p className="text-lg font-black text-green-600 dark:text-green-400">
              {(court.price_per_hour / 100).toFixed(0)}€
            </p>
            <p className="text-[10px] text-slate-400">/h</p>
          </div>
        )}
      </div>

      {/* Instruction text */}
      <p className="text-xs text-slate-400 dark:text-slate-500 mb-2.5">
        {!startSlot ? t.courts.selectStart : !endSlot ? t.courts.selectEnd : `${startSlot} – ${endSlot}`}
      </p>

      {/* Slot pills — horizontally scrollable */}
      <div className="overflow-x-auto -mx-1 px-1 pb-1">
        <div className="flex gap-1.5 min-w-max">
          {HOURS.map((slot) => (
            <button
              key={slot}
              onClick={() => handleSlotClick(slot)}
              disabled={isSlotBooked(slot)}
              className={`px-2.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${getSlotClass(slot)}`}
            >
              {slot}
            </button>
          ))}
        </div>
      </div>

      {/* Booking confirmation panel */}
      {startSlot && endSlot && !booked && (
        <div className="mt-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-2xl p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="font-black text-green-700 dark:text-green-400">{startSlot} – {endSlot}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {durationMins} min
                {price != null && <span className="text-green-600 dark:text-green-400 font-bold ml-1.5">· €{price.toFixed(2)}</span>}
              </p>
            </div>
            <button
              onClick={() => { setStartSlot(null); setEndSlot(null); }}
              className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center text-xs hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              ×
            </button>
          </div>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t.courts.notesPlaceholder}
            className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:ring-2 focus:ring-green-400 mb-3 transition-all"
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
            className="w-full py-3 bg-green-500 hover:bg-green-400 active:bg-green-600 disabled:opacity-50 text-white text-sm font-black rounded-xl transition-colors shadow-md shadow-green-500/20"
          >
            {bookMutation.isPending
              ? t.courts.booking
              : `${t.courts.book} · ${startSlot}–${endSlot}${price != null ? ` · €${price.toFixed(2)}` : ""}`}
          </button>
          {bookMutation.error && (
            <p className="text-xs text-red-500 mt-2 text-center">{bookMutation.error.message}</p>
          )}
        </div>
      )}

      {/* Success state */}
      {booked && (
        <div className="mt-4 bg-green-500 rounded-2xl p-5 text-center shadow-lg shadow-green-500/20">
          <div className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-white font-black">{t.courts.bookingConfirmed}</p>
          <p className="text-white/70 text-sm mt-0.5">{court.name} · {startSlot}–{endSlot}</p>
          <button
            onClick={() => { setBooked(false); setStartSlot(null); setEndSlot(null); setNotes(""); }}
            className="mt-3 text-xs text-white/60 hover:text-white underline transition-colors"
          >
            {t.courts.newBooking}
          </button>
        </div>
      )}
    </div>
  );
}
