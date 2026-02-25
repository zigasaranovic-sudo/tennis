"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";

const SURFACE_LABELS: Record<string, string> = {
  clay: "Clay",
  hard: "Hard",
  grass: "Grass",
  indoor: "Indoor",
};

const SURFACE_COLORS: Record<string, string> = {
  clay: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  hard: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  grass: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  indoor: "bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300",
};

function mapsEmbedUrl(name: string, address: string): string {
  const q = encodeURIComponent(`${name}, ${address}`);
  return `https://maps.google.com/maps?q=${q}&output=embed`;
}

function mapsDirectionsUrl(name: string, address: string): string {
  const q = encodeURIComponent(`${name}, ${address}`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

export default function CourtsPage() {
  const [cityFilter, setCityFilter] = useState("");
  const [surfaceFilter, setSurfaceFilter] = useState("");
  const [expandedMap, setExpandedMap] = useState<string | null>(null);

  const { data: venues, isLoading } = trpc.courts.getVenues.useQuery({
    city: cityFilter || undefined,
  });

  const filtered = (venues ?? []).filter((v) => {
    if (!surfaceFilter) return true;
    const surfaces = (v as { surfaces?: string[] }).surfaces ?? [];
    return surfaces.includes(surfaceFilter);
  });

  const allCities = [...new Set((venues ?? []).map((v) => v.city))].sort();
  const allSurfaces = [...new Set((venues ?? []).flatMap((v) => (v as { surfaces?: string[] }).surfaces ?? []))].sort();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Tennis Venues</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Tennis courts and venues across Slovenia</p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 space-y-4">
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-2 uppercase tracking-wide">City</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCityFilter("")}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${cityFilter === "" ? "bg-green-600 text-white" : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600"}`}
            >
              All
            </button>
            {allCities.map((city) => (
              <button
                key={city}
                onClick={() => setCityFilter(city === cityFilter ? "" : city)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${cityFilter === city ? "bg-green-600 text-white" : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600"}`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {allSurfaces.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Surface</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSurfaceFilter("")}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${surfaceFilter === "" ? "bg-green-600 text-white" : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600"}`}
              >
                All
              </button>
              {allSurfaces.map((surface) => (
                <button
                  key={surface}
                  onClick={() => setSurfaceFilter(surface === surfaceFilter ? "" : surface)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${surfaceFilter === surface ? "bg-green-600 text-white" : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600"}`}
                >
                  {SURFACE_LABELS[surface] ?? surface}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 animate-pulse">
              <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-32 mb-3" />
              <div className="h-4 bg-gray-100 dark:bg-slate-700 rounded w-48 mb-2" />
              <div className="h-4 bg-gray-100 dark:bg-slate-700 rounded w-24" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-dashed border-gray-300 dark:border-slate-600 p-12 text-center">
          <p className="text-4xl mb-4">🏟️</p>
          <p className="font-medium text-gray-900 dark:text-slate-100">No venues found</p>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            {(cityFilter || surfaceFilter) ? "Try clearing the filters" : "No venues in the database yet"}
          </p>
          {(cityFilter || surfaceFilter) && (
            <button
              onClick={() => { setCityFilter(""); setSurfaceFilter(""); }}
              className="mt-4 px-4 py-2 text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            {filtered.length} venue{filtered.length !== 1 ? "s" : ""}
            {(cityFilter || surfaceFilter) ? " matching filters" : ""}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((venue) => {
              const surfaces = (venue as { surfaces?: string[] }).surfaces ?? [];
              const address = (venue as { address?: string }).address ?? "";
              const isExpanded = expandedMap === venue.id;

              return (
                <div key={venue.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <h2 className="font-semibold text-gray-900 dark:text-slate-100 truncate">{venue.name}</h2>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 font-medium">
                            📍 {venue.city}
                          </span>
                          {surfaces.map((s: string) => (
                            <span key={s} className={`text-xs px-2 py-0.5 rounded-full font-medium ${SURFACE_COLORS[s] ?? "bg-gray-100 text-gray-600"}`}>
                              {SURFACE_LABELS[s] ?? s}
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className="text-2xl flex-shrink-0">🏟️</span>
                    </div>

                    {address && (
                      <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">{address}</p>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setExpandedMap(isExpanded ? null : venue.id)}
                        className="flex-1 text-center px-3 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                      >
                        {isExpanded ? "Hide map" : "Show map"}
                      </button>
                      <a
                        href={mapsDirectionsUrl(venue.name, address)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors whitespace-nowrap"
                      >
                        Directions ↗
                      </a>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-gray-200 dark:border-slate-700">
                      <iframe
                        src={mapsEmbedUrl(venue.name, address)}
                        width="100%"
                        height="240"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="block"
                        title={`Map for ${venue.name}`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
