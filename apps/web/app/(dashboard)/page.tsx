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

// ── Gradient placeholder colors by surface ───────────────────────────────────

const SURFACE_GRADIENT: Record<string, string> = {
  clay:    "from-[#3d1f0a] to-[#5c2e12]",
  hard:    "from-[#0a1a3d] to-[#122b5c]",
  grass:   "from-[#0a2e14] to-[#12472a]",
  indoor:  "from-[#1b1c1c] to-[#242626]",
  default: "from-[#1b1c1c] to-[#202020]",
};

function placeholderGradient(surfaces: string[]) {
  return SURFACE_GRADIENT[surfaces[0] ?? "default"] ?? SURFACE_GRADIENT.default;
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
          <div className="space-y-8 pt-2">
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
  const gradientClasses = placeholderGradient(surfaces);

  return (
    <Link href={`/courts/${venue.id}`} className="block group">
      {/* Image area */}
      <div className="relative aspect-[4/5] rounded-3xl overflow-hidden mb-4">
        {/* Placeholder gradient background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradientClasses}`} />

        {/* Subtle tennis court lines overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-x-[10%] top-[20%] bottom-[20%] border border-white/40 rounded-sm" />
          <div className="absolute left-1/2 top-[20%] bottom-[20%] w-px bg-white/40 -translate-x-px" />
          <div className="absolute inset-x-[10%] top-1/2 h-px bg-white/40 -translate-y-px" />
          <div className="absolute inset-x-[10%] top-[20%] h-[18%] border-b border-white/30" />
          <div className="absolute inset-x-[10%] bottom-[20%] h-[18%] border-t border-white/30" />
        </div>

        {/* Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#131313]/90 via-transparent to-transparent" />

        {/* Court count badge — top right */}
        <div className="absolute top-3 right-3">
          <div className="bg-[#131313]/60 backdrop-blur-md border border-white/10 text-white text-[10px] font-extrabold uppercase tracking-[0.15em] px-3 py-1.5 rounded-full">
            {courtCount} COURTS
          </div>
        </div>

        {/* Available now — bottom left */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#4be277] shadow-lg shadow-[#4be277]/60 animate-pulse" />
          <span className="text-[#4be277] text-[10px] font-extrabold uppercase tracking-[0.18em]">
            AVAILABLE NOW
          </span>
        </div>
      </div>

      {/* Venue info below image */}
      <h2 className="text-[1.35rem] font-extrabold text-[#e5e2e1] leading-tight mb-1.5 group-hover:text-[#4be277] transition-colors">
        {venue.name}
      </h2>

      <div className="flex items-center justify-between gap-3">
        {/* Location */}
        <div className="flex items-center gap-1.5 min-w-0">
          <svg className="w-3.5 h-3.5 text-[#e5e2e1]/30 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <span className="text-sm text-[#e5e2e1]/40 truncate">
            {venue.city}
            {venue.address ? ` · ${venue.address}` : ""}
          </span>
        </div>

        {/* Surface tags + price */}
        <div className="flex items-center gap-1.5 shrink-0">
          {surfaces.slice(0, 2).map((s) => (
            <span
              key={s}
              className="text-[10px] font-bold uppercase tracking-wide text-[#e5e2e1]/40 bg-[#202020] px-2.5 py-1 rounded-lg"
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
