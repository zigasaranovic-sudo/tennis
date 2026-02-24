"use client";

import { useState } from "react";

type Surface = "clay" | "hard" | "indoor";

interface Venue {
  id: number;
  name: string;
  city: string;
  address: string;
  surface: Surface;
  courts_count: number;
  google_maps_url: string;
}

const VENUES: Venue[] = [
  {
    id: 1,
    name: "TC Ljubljana",
    city: "Ljubljana",
    address: "Leskoškova cesta 9C, 1000 Ljubljana",
    surface: "clay",
    courts_count: 8,
    google_maps_url: "https://maps.google.com/maps?q=TC+Ljubljana+Leskoškova&output=embed",
  },
  {
    id: 2,
    name: "TC Tivoli",
    city: "Ljubljana",
    address: "Celovška cesta 25, 1000 Ljubljana",
    surface: "indoor",
    courts_count: 6,
    google_maps_url: "https://maps.google.com/maps?q=TC+Tivoli+Ljubljana&output=embed",
  },
  {
    id: 3,
    name: "ŠRC Stožice",
    city: "Ljubljana",
    address: "Stožiška ulica 3, 1000 Ljubljana",
    surface: "hard",
    courts_count: 4,
    google_maps_url: "https://maps.google.com/maps?q=ŠRC+Stožice+Ljubljana&output=embed",
  },
  {
    id: 4,
    name: "TC Šmarna Gora",
    city: "Ljubljana",
    address: "Pot na Šmarno Goro 2, 1000 Ljubljana",
    surface: "clay",
    courts_count: 5,
    google_maps_url: "https://maps.google.com/maps?q=TC+Šmarna+Gora+Ljubljana&output=embed",
  },
  {
    id: 5,
    name: "TC Portorož",
    city: "Portorož",
    address: "Obala 33, 6320 Portorož",
    surface: "clay",
    courts_count: 10,
    google_maps_url: "https://maps.google.com/maps?q=TC+Portorož&output=embed",
  },
  {
    id: 6,
    name: "TC Maribor",
    city: "Maribor",
    address: "Koroška cesta 160, 2000 Maribor",
    surface: "clay",
    courts_count: 7,
    google_maps_url: "https://maps.google.com/maps?q=TC+Maribor+Koroška&output=embed",
  },
  {
    id: 7,
    name: "TC Kranj",
    city: "Kranj",
    address: "Ulica Mirka Vadnova 1, 4000 Kranj",
    surface: "clay",
    courts_count: 6,
    google_maps_url: "https://maps.google.com/maps?q=TC+Kranj&output=embed",
  },
  {
    id: 8,
    name: "TC Celje",
    city: "Celje",
    address: "Pot v Ložo 5, 3000 Celje",
    surface: "hard",
    courts_count: 4,
    google_maps_url: "https://maps.google.com/maps?q=TC+Celje&output=embed",
  },
  {
    id: 9,
    name: "TC Koper",
    city: "Koper",
    address: "Ferrarska ulica 8, 6000 Koper",
    surface: "clay",
    courts_count: 5,
    google_maps_url: "https://maps.google.com/maps?q=TC+Koper&output=embed",
  },
  {
    id: 10,
    name: "TC Bled",
    city: "Bled",
    address: "Cesta svobode 15, 4260 Bled",
    surface: "clay",
    courts_count: 6,
    google_maps_url: "https://maps.google.com/maps?q=TC+Bled&output=embed",
  },
];

const SURFACE_LABELS: Record<Surface, string> = {
  clay: "Clay",
  hard: "Hard",
  indoor: "Indoor",
};

const SURFACE_COLORS: Record<Surface, string> = {
  clay: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  hard: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  indoor: "bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300",
};

const ALL_CITIES = [...new Set(VENUES.map((v) => v.city))].sort();
const ALL_SURFACES: Surface[] = ["clay", "hard", "indoor"];

export default function CourtsPage() {
  const [cityFilter, setCityFilter] = useState<string | null>(null);
  const [surfaceFilter, setSurfaceFilter] = useState<Surface | null>(null);
  const [expandedMap, setExpandedMap] = useState<number | null>(null);

  const filtered = VENUES.filter((v) => {
    if (cityFilter && v.city !== cityFilter) return false;
    if (surfaceFilter && v.surface !== surfaceFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Tennis Venues</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          Tennis courts and venues across Slovenia
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 space-y-4">
        {/* City filter */}
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
            City
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCityFilter(null)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                cityFilter === null
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600"
              }`}
            >
              All
            </button>
            {ALL_CITIES.map((city) => (
              <button
                key={city}
                onClick={() => setCityFilter(city === cityFilter ? null : city)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  cityFilter === city
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* Surface filter */}
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
            Surface
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSurfaceFilter(null)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                surfaceFilter === null
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600"
              }`}
            >
              All
            </button>
            {ALL_SURFACES.map((surface) => (
              <button
                key={surface}
                onClick={() => setSurfaceFilter(surface === surfaceFilter ? null : surface)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  surfaceFilter === surface
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                }`}
              >
                {SURFACE_LABELS[surface]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500 dark:text-slate-400">
        {filtered.length} venue{filtered.length !== 1 ? "s" : ""}
        {cityFilter || surfaceFilter ? " matching filters" : " in Slovenia"}
      </p>

      {/* Venue cards grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((venue) => (
            <div
              key={venue.id}
              className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden"
            >
              {/* Card body */}
              <div className="p-5">
                {/* Name + badges */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-gray-900 dark:text-slate-100 truncate">
                      {venue.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-1.5">
                      {/* City badge */}
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 font-medium">
                        📍 {venue.city}
                      </span>
                      {/* Surface badge */}
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${SURFACE_COLORS[venue.surface]}`}
                      >
                        {SURFACE_LABELS[venue.surface]}
                      </span>
                    </div>
                  </div>
                  <span className="text-2xl flex-shrink-0">🏟️</span>
                </div>

                {/* Address */}
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-3">
                  {venue.address}
                </p>

                {/* Court count */}
                <p className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-4">
                  🎾 {venue.courts_count} court{venue.courts_count !== 1 ? "s" : ""}
                </p>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                  <a
                    href={venue.google_maps_url.replace("&output=embed", "")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center px-3 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                  >
                    View on Map
                  </a>
                  <button
                    onClick={() =>
                      setExpandedMap(expandedMap === venue.id ? null : venue.id)
                    }
                    className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                  >
                    {expandedMap === venue.id ? "Hide map" : "Show map"}
                  </button>
                </div>
              </div>

              {/* Collapsible map */}
              {expandedMap === venue.id && (
                <div className="border-t border-gray-200 dark:border-slate-700">
                  <iframe
                    src={venue.google_maps_url}
                    width="100%"
                    height="220"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="block"
                    title={`Map for ${venue.name}`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-dashed border-gray-300 dark:border-slate-600 p-12 text-center">
          <p className="text-4xl mb-4">🏟️</p>
          <p className="font-medium text-gray-900 dark:text-slate-100">No venues match your filters</p>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Try clearing the city or surface filter
          </p>
          <button
            onClick={() => {
              setCityFilter(null);
              setSurfaceFilter(null);
            }}
            className="mt-4 px-4 py-2 text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
