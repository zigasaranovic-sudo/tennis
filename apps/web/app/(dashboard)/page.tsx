"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { useT } from "@/lib/i18n/context";

const SURFACE_COLORS: Record<string, string> = {
  clay:   "bg-orange-500/20 text-orange-400 border-orange-500/30",
  hard:   "bg-blue-500/20 text-blue-400 border-blue-500/30",
  grass:  "bg-green-500/20 text-green-400 border-green-500/30",
  indoor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

const VENUE_PHOTOS: Record<string, string> = {
  "tc-fuzine":        "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600&q=80",
  "tk-ilirija":       "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=600&q=80",
  "tk-olimpija":      "https://images.unsplash.com/photo-1530915365347-e35b749a0381?w=600&q=80",
  "tc-smarna-gora":   "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600&q=80",
  "tenis-center-btc": "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=600&q=80",
  "tk-tivoli":        "https://images.unsplash.com/photo-1530915365347-e35b749a0381?w=600&q=80",
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

function venueSlug(name: string) {
  return name.toLowerCase().replace(/[čćžšđ]/g, (c) => ({č:"c",ć:"c",ž:"z",š:"s",đ:"d"}[c]??c))
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function getVenueImage(name: string, surfaces: string[]) {
  const slug = venueSlug(name);
  return VENUE_PHOTOS[slug] ?? SURFACE_IMAGES[surfaces[0] ?? "default"] ?? SURFACE_IMAGES.default;
}

type Venue = { id: string; name: string; city: string; country: string; address: string | null; surfaces?: string[] };

export default function HomePage() {
  const { t } = useT();
  const [search, setSearch] = useState("");
  const { data: venuesData, isLoading } = trpc.courts.getVenues.useQuery({ city: undefined });
  const { data: profile } = trpc.player.getProfile.useQuery();
  const { data: bookingsData } = trpc.courts.getMyBookings.useQuery({ upcoming: true });

  const venues = (venuesData ?? []) as unknown as Venue[];
  const bookings = (bookingsData ?? []) as unknown as { id: string; starts_at: string; ends_at: string; court?: { name: string; venue?: { name: string } } }[];

  const filtered = venues.filter((v) =>
    !search || v.name.toLowerCase().includes(search.toLowerCase()) || v.city.toLowerCase().includes(search.toLowerCase())
  );

  const upcomingBookings = bookings
    .filter(b => new Date(b.starts_at) > new Date())
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
    .slice(0, 2);

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 min-h-screen bg-[#0d0d0d]">

      {/* ── Hero ── */}
      <div className="px-4 sm:px-6 lg:px-8 pt-7 pb-6 bg-[#0d0d0d]">
        <div className="max-w-7xl mx-auto">

          {/* Welcome + upcoming bookings row */}
          <div className="flex flex-col lg:flex-row gap-5 mb-7">

            {/* Welcome */}
            <div className="flex-1">
              {profile && (
                <div className="mb-5">
                  <p className="text-[#6b7280] text-sm font-medium mb-0.5">Dobrodošel nazaj,</p>
                  <h1 className="text-2xl font-black text-white tracking-tight">
                    {profile.full_name?.split(" ")[0] ?? "Igralec"} 👋
                  </h1>
                </div>
              )}

              {/* Search */}
              <div className="flex items-center gap-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl px-4 py-3 focus-within:border-[#22c55e]/50 transition-colors">
                <svg className="w-4 h-4 text-[#6b7280] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t.home.searchPlaceholder}
                  className="flex-1 bg-transparent text-sm text-white placeholder-[#4b5563] outline-none"
                />
                {search && (
                  <button onClick={() => setSearch("")}
                    className="w-5 h-5 rounded-full bg-[#2a2a2a] text-[#6b7280] hover:bg-[#333] flex items-center justify-center text-xs font-bold transition-colors">
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Upcoming bookings widget */}
            {upcomingBookings.length > 0 && (
              <div className="lg:w-80 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-[#6b7280] uppercase tracking-wider">Prihajajoče rezervacije</p>
                  <Link href="/courts/bookings" className="text-xs text-[#22c55e] hover:text-green-400 font-semibold transition-colors">
                    Vse →
                  </Link>
                </div>
                <div className="space-y-2">
                  {upcomingBookings.map(b => {
                    const start = new Date(b.starts_at);
                    const end = new Date(b.ends_at);
                    const dateStr = start.toLocaleDateString("sl-SI", { weekday: "short", day: "numeric", month: "short" });
                    const timeStr = `${start.toLocaleTimeString("sl-SI", { hour: "2-digit", minute: "2-digit" })} – ${end.toLocaleTimeString("sl-SI", { hour: "2-digit", minute: "2-digit" })}`;
                    return (
                      <div key={b.id} className="flex items-center gap-3 bg-[#111111] rounded-xl p-3 border border-[#2a2a2a]">
                        <div className="w-9 h-9 bg-[#22c55e]/10 rounded-xl flex items-center justify-center shrink-0">
                          <svg className="w-4 h-4 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth={2}/>
                            <line x1="16" y1="2" x2="16" y2="6" strokeWidth={2}/>
                            <line x1="8" y1="2" x2="8" y2="6" strokeWidth={2}/>
                            <line x1="3" y1="10" x2="21" y2="10" strokeWidth={2}/>
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-white truncate">{b.court?.venue?.name ?? b.court?.name ?? "Igrišče"}</p>
                          <p className="text-xs text-[#6b7280]">{dateStr} · {timeStr}</p>
                        </div>
                        <span className="text-[10px] font-bold text-[#22c55e] bg-[#22c55e]/10 px-2 py-1 rounded-full border border-[#22c55e]/20 whitespace-nowrap">
                          Confirmed
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Section header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-white">Igrišča</h2>
            {!isLoading && filtered.length > 0 && (
              <span className="text-sm text-[#6b7280]">{filtered.length} lokacij</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Venue grid ── */}
      <div className="bg-[#0d0d0d] px-4 sm:px-6 lg:px-8 pb-10">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden animate-pulse bg-[#1a1a1a] border border-[#2a2a2a]">
                  <div className="h-44 bg-[#222222]" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-[#222222] rounded-lg w-3/4" />
                    <div className="h-3 bg-[#1e1e1e] rounded-lg w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-5xl mb-4">🏟️</p>
              <p className="font-black text-white text-lg">{t.courts.noVenues}</p>
              <p className="text-sm text-[#6b7280] mt-1">{search ? t.courts.tryClearing : t.courts.noVenuesDB}</p>
              {search && (
                <button onClick={() => setSearch("")}
                  className="mt-5 px-5 py-2 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-white text-sm font-bold transition-colors">
                  {t.common.clearFilters}
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((venue) => {
                const surfaces = venue.surfaces ?? [];
                const imgUrl = getVenueImage(venue.name, surfaces);
                return (
                  <Link key={venue.id} href={`/courts/${venue.id}`}
                    className="group rounded-2xl overflow-hidden bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#22c55e]/40 hover:-translate-y-0.5 transition-all duration-200">
                    <div className="relative h-44 overflow-hidden bg-[#222222]">
                      <img src={imgUrl} alt={venue.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-2.5 left-2.5 flex gap-1.5 flex-wrap">
                        {surfaces.slice(0, 2).map((s) => (
                          <span key={s} className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border backdrop-blur-sm ${SURFACE_COLORS[s] ?? "bg-black/50 text-white border-white/20"}`}>
                            {t.surfaces[s as keyof typeof t.surfaces] ?? s}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="p-3.5">
                      <p className="text-sm font-bold text-white truncate group-hover:text-[#22c55e] transition-colors">
                        {venue.name}
                      </p>
                      <p className="text-xs text-[#6b7280] mt-1 flex items-center gap-1">
                        <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {venue.city}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
