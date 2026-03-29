"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";

// ── Surface filter config ─────────────────────────────────────────────────────

const SURFACE_FILTERS = [
  { key: "", label: "All Venues" },
  { key: "clay", label: "Clay" },
  { key: "hard", label: "Hard" },
  { key: "grass", label: "Grass" },
  { key: "indoor", label: "Indoor" },
];

// Deterministic court count from venue id to avoid hydration mismatch
function courtCountFromId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xffffffff;
  return (Math.abs(h) % 8) + 2;
}

type Venue = {
  id: string;
  name: string;
  city: string;
  country: string;
  address: string | null;
  surfaces?: string[];
};

// ── Venue images ─────────────────────────────────────────────────────────────

const VENUE_PHOTOS: Record<string, string> = {
  // Legacy Ljubljana venues (not on Courtiplay) — distinct Unsplash tennis photos
  "tc-fuzine":            "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600&q=80",
  "tk-ilirija":           "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=600&q=80",
  "tk-olimpija":          "https://images.unsplash.com/photo-1530915365347-e35b749a0381?w=600&q=80",
  "tc-smarna-gora":       "https://images.unsplash.com/photo-1595435742656-5272d0b3fa82?w=600&q=80",
  "tenis-center-btc":     "https://images.unsplash.com/photo-1460881680858-30d872d5b530?w=600&q=80",
  "tk-tivoli":            "https://images.unsplash.com/photo-1531315396756-905d68d21b56?w=600&q=80",
  // Courtiplay venues (slugs match venueSlug(venue.name) from DB)
  "tenis-klub-kamnik":        "https://api.courtiplay.com/storage/v1/render/image/public/banners/33a4b992-23df-4ca8-90f6-80645fed4f92/IMG_1742.jpeg?height=600&resize=contain",
  "tk-strazisce":             "https://api.courtiplay.com/storage/v1/render/image/public/banners/707f60ba-39f4-4a67-9f9d-52b7dc25428b/1000005826.jpg?height=600&resize=contain",
  "tenis-ruski-car":          "https://api.courtiplay.com/storage/v1/render/image/public/banners/7f4b2f5d-72bb-49fa-9971-b3f308e5e89b/7e0a35a4-3bab-4685-8343-ed54867d1d4a-1024x768.jpg?height=600&resize=contain",
  "tk-menges":                "https://api.courtiplay.com/storage/v1/render/image/public/banners/8b90f4f8-3860-426b-95ed-9a7ae1e7d005/IMG_20240224_190336.jpg?height=600&resize=contain",
  "tk-duplica":               "https://api.courtiplay.com/storage/v1/render/image/public/banners/88ededf0-92b4-4bbe-ab00-401b7ff7f963/IMG_4317.jpeg?height=600&resize=contain",
  "tk-radlje":                "https://api.courtiplay.com/storage/v1/render/image/public/banners/f47a157b-e0f7-4c15-af29-a17b2d9c3d1e/tk%20radlje.jpeg?height=600&resize=contain",
  "sobec":                    "https://api.courtiplay.com/storage/v1/render/image/public/banners/6c6ac6f3-1dfb-43f3-af77-e92a5c62852d/13_1678487216.jpeg?height=600&resize=contain",
  "tenis-kamp-danica":        "https://api.courtiplay.com/storage/v1/render/image/public/banners/4f5629d5-8b60-41bd-8988-1e381bc6d7d2/Image%2023.%207.%2024%20at%2009.50.jpeg?height=600&resize=contain",
  "bernardi":                 "https://api.courtiplay.com/storage/v1/render/image/public/banners/b84559a9-d3c4-425a-8bab-1fd3acb6ebcf/Putr%20avgust24%20edited-66.jpg?height=600&resize=contain",
  "tenisko-drustvo-dovce":    "https://api.courtiplay.com/storage/v1/render/image/public/banners/240f0bc1-c9f1-4adf-b61c-e9aab7fbd861/40_1556566401.jpeg?height=600&resize=contain",
  "tenis-gust-bar":           "https://api.courtiplay.com/storage/v1/render/image/public/banners/27dee8f7-c1cb-4c8e-8a20-3229cbc31f99/485341474_2897361857122781_7367172855721233389_n.jpg?height=600&resize=contain",
  "tenis-hala-gokop":         "https://api.courtiplay.com/storage/v1/render/image/public/banners/a4c78234-1eda-4d6c-b950-b5e3da099e6f/Screenshot%202025-10-26%20at%2015.34.33.png?height=600&resize=contain",
  "cokan-tennis-academy":     "https://api.courtiplay.com/storage/v1/render/image/public/banners/4b3997df-f2b9-46d7-9af7-9f84e0501644/teniska-sola-celje-z-okolico-cokan-tennis-academy-sportna-akademija-d-o-o_5-1024x1024-.png?height=600&resize=contain",
  "teniski-klub-murska-sobota":"https://api.courtiplay.com/storage/v1/render/image/public/banners/f297ccbc-c39f-49a1-995b-f71226271996/received_311205469980915-scaled.jpeg?height=600&resize=contain",
  "tenis-padel-smartno":      "https://api.courtiplay.com/storage/v1/render/image/public/banners/20524ba5-f937-401e-8dc1-f8383db87c23/1000008160.jpg?height=600&resize=contain",
  "tenis-center-murko":       "https://api.courtiplay.com/storage/v1/render/image/public/banners/02b43766-01d2-41e5-9178-7d4f3ff70782/32519417qCE816CBDB99047000AC87D99C3117782_1200.webp?height=600&resize=contain",
  "tenis-portoroz":           "https://api.courtiplay.com/storage/v1/render/image/public/banners/a8e8ea59-3403-4ff5-ad74-afacf5923add/270620241719495595_tennis-portoroz.jpg?height=600&resize=contain",
  "tenis-in-padel-koroska":   "https://api.courtiplay.com/storage/v1/render/image/public/banners/edf0b7bb-9b00-44d0-81f8-fc386c6aa243/Koroska.jpg?height=600&resize=contain",
  "sport-park-krsnik":        "https://api.courtiplay.com/storage/v1/render/image/public/banners/761ffce5-c2bb-4355-a9c6-80bf01a85cb4/d9f433_215fbfabdedb44b8b58c154eeef93c1a_mv2.avif?height=600&resize=contain",
  "rimski-vrelec":            "https://api.courtiplay.com/storage/v1/render/image/public/banners/d7e43b12-9b33-4e1e-8bbe-b6c897d37b1b/Rimski_igrisce_1515.jpg?height=600&resize=contain",
};

const SURFACE_IMAGES: Record<string, string> = {
  clay:    "https://api.courtiplay.com/storage/v1/render/image/public/banners/33a4b992-23df-4ca8-90f6-80645fed4f92/IMG_1742.jpeg?height=600&resize=contain",
  hard:    "https://api.courtiplay.com/storage/v1/render/image/public/banners/707f60ba-39f4-4a67-9f9d-52b7dc25428b/1000005826.jpg?height=600&resize=contain",
  grass:   "https://api.courtiplay.com/storage/v1/render/image/public/banners/6c6ac6f3-1dfb-43f3-af77-e92a5c62852d/13_1678487216.jpeg?height=600&resize=contain",
  indoor:  "https://api.courtiplay.com/storage/v1/render/image/public/banners/a4c78234-1eda-4d6c-b950-b5e3da099e6f/Screenshot%202025-10-26%20at%2015.34.33.png?height=600&resize=contain",
  default: "https://api.courtiplay.com/storage/v1/render/image/public/banners/d7e43b12-9b33-4e1e-8bbe-b6c897d37b1b/Rimski_igrisce_1515.jpg?height=600&resize=contain",
};

// ── Display name translations ─────────────────────────────────────────────────
// Maps DB-stored name → display name with correct diacritics.
// Only entries that differ from the DB value need to be listed.
// All routing, image lookup, and slug logic uses the original venue.name.

const VENUE_DISPLAY_NAMES: Record<string, string> = {
  // Legacy Ljubljana clubs
  "TC Fuzine":                      "TC Fužine",
  "TC Smarna Gora":                 "TC Šmarna Gora",
  // Courtiplay venues — both ASCII (if stored without diacritics) and correct form
  "TK Strazisce":                   "TK Stražišče",
  "TK Strazisc":                    "TK Stražišče",
  "Sobec":                          "Šobec",
  "TK Menges":                      "TK Mengeš",
  "Tenis Padel Smartno":            "Tenis Padel Šmartno",
  "Tenis Portoroz":                 "Tenis Portorož",
  "Tenis in Padel Koroska":         "Tenis in Padel Koroška",
  "Sport park Krsnik":              "Šport park Krsnik",
  "Tenisko drustvo Dovce":          "Teniško društvo Dovce",
  "Tenis Gust Bar":                 "Tenis Gušt Bar",
  "Teniski klub Murska Sobota":     "Teniški klub Murska Sobota",
};

function venueDisplayName(name: string): string {
  return VENUE_DISPLAY_NAMES[name] ?? name;
}

function venueSlug(name: string): string {
  return name.toLowerCase()
    .replace(/[čćžšđ]/g, (c: string) => ({ č: "c", ć: "c", ž: "z", š: "s", đ: "d" }[c] ?? c))
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function venueImage(id: string, name: string, surfaces: string[]): string {
  const slug = venueSlug(name);
  return VENUE_PHOTOS[slug] ?? VENUE_PHOTOS[id] ?? SURFACE_IMAGES[surfaces[0] ?? "default"] ?? SURFACE_IMAGES.default;
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [surfaceFilter, setSurfaceFilter] = useState("");

  const { data: venuesData, isLoading } = trpc.courts.getVenues.useQuery({ city: undefined });

  const venues = (venuesData ?? []) as unknown as Venue[];

  const filtered = venues.filter((v) => {
    const matchesSearch =
      !search ||
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.city.toLowerCase().includes(search.toLowerCase());
    const matchesSurface =
      !surfaceFilter || (v.surfaces ?? []).includes(surfaceFilter);
    return matchesSearch && matchesSurface;
  });

  return (
    <div className="min-h-screen bg-[#131313] -mx-4 sm:-mx-6 lg:-mx-8">

      {/* ── Top section ── */}
      <div className="px-5 pt-10 pb-4">
        {/* Premium label */}
        <p className="text-[#4be277] text-[10px] font-extrabold uppercase tracking-[0.25em] mb-3">
          PREMIUM DISCOVERY
        </p>

        {/* Heading */}
        <h1 className="text-[2.6rem] leading-[1.1] font-extrabold text-white mb-0.5">
          Find your
        </h1>
        <h1
          className="text-[2.6rem] leading-[1.1] font-extrabold mb-6"
          style={{
            background: "linear-gradient(135deg, #4be277 0%, #22c55e 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Perfect Court.
        </h1>

        {/* ── Filter pills ── */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1 mb-5 -mx-1 px-1">
          {SURFACE_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setSurfaceFilter(f.key)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                surfaceFilter === f.key
                  ? "text-[#131313] font-bold"
                  : "bg-[#202020] text-[#e5e2e1]/60 hover:text-[#e5e2e1]"
              }`}
              style={
                surfaceFilter === f.key
                  ? { background: "linear-gradient(135deg, #4be277 0%, #22c55e 100%)" }
                  : undefined
              }
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* ── Search bar ── */}
        <div className="flex items-center gap-3 bg-[#1b1c1c] border-b border-[#3d4a3d]/20 px-4 py-3.5 rounded-2xl">
          {/* Location pin */}
          <svg
            className="w-4 h-4 text-[#4be277] shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by venue or city…"
            className="flex-1 bg-transparent text-sm text-[#e5e2e1] placeholder-[#e5e2e1]/30 outline-none"
          />

          {search && (
            <button
              onClick={() => setSearch("")}
              className="w-5 h-5 rounded-full bg-[#202020] text-[#e5e2e1]/40 hover:text-[#e5e2e1] flex items-center justify-center text-xs transition-colors"
            >
              ×
            </button>
          )}

          {/* Tune / filter icon */}
          <button className="w-8 h-8 bg-[#202020] rounded-xl flex items-center justify-center text-[#e5e2e1]/40 hover:text-[#4be277] transition-colors shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Venue list ── */}
      <div className="px-5 pb-36">
        {isLoading ? (
          <div className="space-y-6 pt-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/5] rounded-3xl bg-[#1b1c1c] mb-3" />
                <div className="h-5 bg-[#1b1c1c] rounded w-3/5 mb-2" />
                <div className="h-3.5 bg-[#1b1c1c] rounded w-2/5" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-28">
            <p className="text-[#e5e2e1]/20 text-5xl mb-4">🏟</p>
            <p className="font-bold text-[#e5e2e1] text-lg mb-1">No venues found</p>
            <p className="text-sm text-[#e5e2e1]/40">
              {search || surfaceFilter ? "Try clearing your filters" : "No venues in database yet"}
            </p>
            {(search || surfaceFilter) && (
              <button
                onClick={() => { setSearch(""); setSurfaceFilter(""); }}
                className="mt-5 px-5 py-2.5 rounded-full text-[#131313] text-sm font-bold transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #4be277 0%, #22c55e 100%)" }}
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
            {filtered.map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        )}
      </div>

      {/* ── FAB: Map ── */}
      <div className="fixed bottom-28 right-6 z-50">
        <button
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl shadow-[#4be277]/20 active:scale-95 transition-transform"
          style={{ background: "linear-gradient(135deg, #4be277 0%, #22c55e 100%)" }}
          aria-label="View map"
        >
          <svg className="w-6 h-6 text-[#131313]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── VenueCard ─────────────────────────────────────────────────────────────────

function VenueCard({ venue }: { venue: Venue }) {
  const surfaces = venue.surfaces ?? [];
  const courtCount = courtCountFromId(venue.id);
  const imgSrc = venueImage(venue.id, venue.name, surfaces);

  return (
    <Link href={`/courts/${venue.id}`} className="block group">
      {/* Image area */}
      <div className="relative aspect-[3/2] sm:aspect-[4/3] rounded-2xl overflow-hidden mb-3 bg-[#1b1c1c]">
        <img
          src={imgSrc}
          alt={venueDisplayName(venue.name)}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#131313]/80 via-transparent to-transparent" />

        {/* Court count badge — top right */}
        <div className="absolute top-3 right-3">
          <div className="bg-[#131313]/60 backdrop-blur-md border border-white/10 text-white text-[10px] font-extrabold uppercase tracking-[0.15em] px-2.5 py-1 rounded-full">
            {courtCount} COURTS
          </div>
        </div>

        {/* Available now — bottom left */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4be277] shadow-lg shadow-[#4be277]/60 animate-pulse" />
          <span className="text-[#4be277] text-[9px] font-extrabold uppercase tracking-[0.18em]">
            AVAILABLE NOW
          </span>
        </div>
      </div>

      {/* Venue info */}
      <h2 className="text-base font-extrabold text-[#e5e2e1] leading-tight mb-1 group-hover:text-[#4be277] transition-colors truncate">
        {venueDisplayName(venue.name)}
      </h2>

      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-[#e5e2e1]/40 truncate">
          {venue.city}{venue.address ? ` · ${venue.address}` : ""}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {surfaces.slice(0, 1).map((s) => (
            <span key={s} className="text-[9px] font-bold uppercase text-[#e5e2e1]/40 bg-[#202020] px-2 py-0.5 rounded">
              {s}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
