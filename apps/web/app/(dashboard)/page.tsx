"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { useT } from "@/lib/i18n/context";

// ── Venue photo map ────────────────────────────────────────────────────────────

const VENUE_PHOTOS: Record<string, string> = {
  "tc-fuzine":        "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80",
  "tk-ilirija":       "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&q=80",
  "tk-olimpija":      "https://images.unsplash.com/photo-1530915365347-e35b749a0381?w=800&q=80",
  "tc-smarna-gora":   "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80",
  "tenis-center-btc": "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&q=80",
  "tk-tivoli":        "https://images.unsplash.com/photo-1530915365347-e35b749a0381?w=800&q=80",
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
  clay:    "https://images.unsplash.com/photo-1542144582-1ba00456b5e3?w=800&q=80",
  hard:    "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80",
  grass:   "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=800&q=80",
  indoor:  "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&q=80",
  default: "https://images.unsplash.com/photo-1530915365347-e35b749a0381?w=800&q=80",
};

// Surface filter pills config
const SURFACE_FILTERS = [
  { key: "", label: "All Venues" },
  { key: "clay", label: "Clay Court" },
  { key: "hard", label: "Hard Court" },
  { key: "grass", label: "Grass Court" },
  { key: "indoor", label: "Indoor" },
];

function venueSlug(name: string) {
  return name.toLowerCase()
    .replace(/[čćžšđ]/g, (c) => ({ č: "c", ć: "c", ž: "z", š: "s", đ: "d" }[c] ?? c))
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function getVenueImage(name: string, surfaces: string[]) {
  const slug = venueSlug(name);
  return VENUE_PHOTOS[slug] ?? SURFACE_FALLBACK[surfaces[0] ?? "default"] ?? SURFACE_FALLBACK.default;
}

type Venue = {
  id: string;
  name: string;
  city: string;
  country: string;
  address: string | null;
  surfaces?: string[];
};

// ── Main page ──────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { t } = useT();
  const [search, setSearch] = useState("");
  const [surfaceFilter, setSurfaceFilter] = useState("");

  const { data: venuesData, isLoading } = trpc.courts.getVenues.useQuery({ city: undefined });
  const { data: profile } = trpc.player.getProfile.useQuery();

  const venues = (venuesData ?? []) as unknown as Venue[];

  const filtered = venues.filter((v) => {
    const matchesSearch = !search ||
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.city.toLowerCase().includes(search.toLowerCase());
    const matchesSurface = !surfaceFilter ||
      (v.surfaces ?? []).includes(surfaceFilter);
    return matchesSearch && matchesSurface;
  });

  const firstName = profile?.full_name?.split(" ")[0] ?? null;

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 min-h-screen bg-[#0a0a0a]">

      {/* ── Hero ── */}
      <div className="px-4 sm:px-6 pt-8 pb-6">
        <p className="text-[#22c55e] text-xs font-bold uppercase tracking-[0.2em] mb-2">
          PREMIUM DISCOVERY
        </p>
        <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-1">
          {firstName ? `Pozdravljeni, ${firstName}.` : "Najdi svoje"}
        </h1>
        <h1 className="text-4xl sm:text-5xl font-black text-[#22c55e] leading-tight mb-6">
          {firstName ? "Rezerviraj igrišče." : "Igrišče."}
        </h1>

        {/* Filter pills */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1 mb-5">
          {SURFACE_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setSurfaceFilter(f.key)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap border transition-all ${
                surfaceFilter === f.key
                  ? "bg-[#22c55e] border-[#22c55e] text-white shadow-lg shadow-green-500/30"
                  : "bg-transparent border-[#2a2a2a] text-[#6b7280] hover:border-[#22c55e]/50 hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-3 bg-[#141414] border border-[#222] rounded-2xl px-4 py-3.5 focus-within:border-[#22c55e]/40 transition-colors">
          <svg className="w-4 h-4 text-[#4b5563] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.home.searchPlaceholder}
            className="flex-1 bg-transparent text-sm text-white placeholder-[#4b5563] outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="w-6 h-6 rounded-full bg-[#222] text-[#6b7280] hover:text-white flex items-center justify-center text-sm transition-colors"
            >
              ×
            </button>
          )}
          <button className="w-8 h-8 bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl flex items-center justify-center text-[#6b7280] hover:text-white transition-colors shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── Venue list ── */}
      <div className="px-4 sm:px-6 pb-32">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-56 bg-[#141414] rounded-3xl mb-3" />
                <div className="h-4 bg-[#141414] rounded w-2/3 mb-2" />
                <div className="h-3 bg-[#141414] rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">🏟️</p>
            <p className="font-black text-white text-lg">{t.courts.noVenues}</p>
            <p className="text-sm text-[#6b7280] mt-1">{search || surfaceFilter ? t.courts.tryClearing : t.courts.noVenuesDB}</p>
            {(search || surfaceFilter) && (
              <button
                onClick={() => { setSearch(""); setSurfaceFilter(""); }}
                className="mt-5 px-5 py-2.5 rounded-2xl bg-[#22c55e] hover:bg-[#16a34a] text-white text-sm font-bold transition-colors"
              >
                {t.common.clearFilters}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {filtered.map((venue, idx) => (
              <VenueCard key={venue.id} venue={venue} featured={idx === 0 && !search && !surfaceFilter} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── VenueCard ──────────────────────────────────────────────────────────────────

function VenueCard({ venue, featured }: { venue: Venue; featured?: boolean }) {
  const { t } = useT();
  const surfaces = venue.surfaces ?? [];
  const imgUrl = getVenueImage(venue.name, surfaces);
  const courtCount = Math.floor(Math.random() * 8) + 2; // placeholder — replace with real data when available

  if (featured) {
    // Large featured card (first venue) — like "The Grand Slam Club" in Figma
    return (
      <Link href={`/courts/${venue.id}`} className="block group">
        <div className="relative h-64 rounded-3xl overflow-hidden mb-3">
          <img
            src={imgUrl}
            alt={venue.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Court count badge */}
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm border border-white/10 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">
            {courtCount} COURTS
          </div>

          {/* Available now dot */}
          <div className="absolute bottom-4 left-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#22c55e] shadow-lg shadow-green-500/50 animate-pulse" />
              <span className="text-[#22c55e] text-xs font-bold uppercase tracking-widest">AVAILABLE NOW</span>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-black text-white mb-1 group-hover:text-[#22c55e] transition-colors">
          {venue.name}
        </h2>
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#6b7280]">
            {venue.city}{venue.address ? ` · ${venue.address}` : ""}
          </p>
          <div className="flex gap-1.5">
            {surfaces.slice(0, 2).map((s) => (
              <span key={s} className="text-[10px] font-black uppercase tracking-wide text-[#9ca3af] bg-[#141414] border border-[#222] px-2 py-1 rounded-lg">
                {t.surfaces[s as keyof typeof t.surfaces] ?? s}
              </span>
            ))}
          </div>
        </div>
      </Link>
    );
  }

  // Regular card — like "Emerald Lawn Estates" in Figma
  return (
    <Link href={`/courts/${venue.id}`} className="block group">
      <div className="relative h-52 rounded-3xl overflow-hidden mb-3">
        <img
          src={imgUrl}
          alt={venue.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Court count */}
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm border border-white/10 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">
          {courtCount} COURTS
        </div>

        {/* Next available */}
        <div className="absolute bottom-4 left-4">
          <p className="text-white/60 text-[10px] font-semibold uppercase tracking-widest mb-0.5">NEXT AVAILABLE</p>
          <p className="text-white text-sm font-black">{venue.name}</p>
        </div>
      </div>

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm text-[#6b7280] truncate">
            {venue.city}{venue.address ? ` · ${venue.address}` : ""}
          </p>
          <div className="flex gap-1.5 mt-1.5">
            {surfaces.slice(0, 3).map((s) => (
              <span key={s} className="text-[10px] font-black uppercase tracking-wide text-[#9ca3af] bg-[#141414] border border-[#222] px-2 py-1 rounded-lg">
                {t.surfaces[s as keyof typeof t.surfaces] ?? s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
