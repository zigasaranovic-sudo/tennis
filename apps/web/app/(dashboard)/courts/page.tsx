"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";

const SURFACE_LABELS: Record<string, string> = {
  clay: "Clay",
  hard: "Hard",
  grass: "Grass",
  carpet: "Carpet",
};

export default function CourtsPage() {
  const [city, setCity] = useState("");

  const { data: venues, isLoading } = trpc.courts.getVenues.useQuery({
    city: city || undefined,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Tennis Courts</h1>
        <Link
          href="/courts/bookings"
          className="text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
        >
          My Bookings
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
        <div className="max-w-sm">
          <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Filter by city</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Ljubljana, Zagreb..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-500"
          />
        </div>
      </div>

      {/* Venues grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 animate-pulse">
              <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-100 dark:bg-slate-700 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : venues && venues.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {venues.map((venue) => (
            <Link
              key={venue.id}
              href={`/courts/${venue.id}`}
              className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 hover:border-green-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-slate-100">{venue.name}</p>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">📍 {venue.city}</p>
                </div>
                <span className="text-2xl">🏟️</span>
              </div>
              {venue.surfaces && venue.surfaces.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {venue.surfaces.map((s) => (
                    <span
                      key={s}
                      className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-medium capitalize"
                    >
                      {SURFACE_LABELS[s] ?? s}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-dashed border-gray-300 dark:border-slate-600 p-12 text-center">
          <p className="text-4xl mb-4">🏟️</p>
          <p className="font-medium text-gray-900 dark:text-slate-100">No venues found</p>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Try adjusting the city filter</p>
        </div>
      )}
    </div>
  );
}
