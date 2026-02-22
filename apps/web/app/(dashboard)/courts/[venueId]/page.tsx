"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { trpc } from "@/lib/trpc/client";

const SURFACE_LABELS: Record<string, string> = {
  clay: "Clay",
  hard: "Hard",
  grass: "Grass",
  carpet: "Carpet",
};

const SURFACE_COLORS: Record<string, string> = {
  clay: "bg-orange-50 text-orange-700",
  hard: "bg-blue-50 text-blue-700",
  grass: "bg-green-50 text-green-700",
  carpet: "bg-purple-50 text-purple-700",
};

export default function VenuePage() {
  const { venueId } = useParams<{ venueId: string }>();
  const { data: venue, isLoading } = trpc.courts.getVenue.useQuery({ id: venueId });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 h-40" />
          ))}
        </div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Venue not found</p>
        <Link href="/courts" className="mt-4 inline-block text-green-600 hover:underline text-sm">
          Back to courts
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/courts" className="hover:text-gray-900 transition-colors">Courts</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{venue.name}</span>
      </div>

      {/* Venue header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{venue.name}</h1>
            <p className="text-gray-500 mt-1">📍 {venue.city}, {venue.country}</p>
            {venue.address && <p className="text-sm text-gray-400 mt-0.5">{venue.address}</p>}
          </div>
          <span className="text-4xl">🏟️</span>
        </div>
        <div className="flex flex-wrap gap-4 mt-4">
          {venue.phone && (
            <a href={`tel:${venue.phone}`} className="text-sm text-gray-500 hover:text-gray-900">
              📞 {venue.phone}
            </a>
          )}
          {venue.website && (
            <a href={venue.website} target="_blank" rel="noopener noreferrer" className="text-sm text-green-600 hover:text-green-700">
              🌐 Website
            </a>
          )}
        </div>
      </div>

      {/* Courts */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Courts</h2>
        {venue.courts.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-10 text-center">
            <p className="text-gray-500">No courts listed for this venue</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {venue.courts.map((court) => (
              <Link
                key={court.id}
                href={`/courts/${venueId}/${court.id}`}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:border-green-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <p className="font-semibold text-gray-900">{court.name}</p>
                  <span className="text-xl">{court.is_indoor ? "🏠" : "☀️"}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${SURFACE_COLORS[court.surface] ?? "bg-gray-100 text-gray-700"}`}>
                    {SURFACE_LABELS[court.surface] ?? court.surface}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    {court.is_indoor ? "Indoor" : "Outdoor"}
                  </span>
                </div>
                {court.price_per_hour != null ? (
                  <p className="mt-3 text-sm font-semibold text-gray-900">
                    €{(court.price_per_hour / 100).toFixed(2)}/hr
                  </p>
                ) : (
                  <p className="mt-3 text-sm text-gray-400">Contact for pricing</p>
                )}
                <p className="mt-3 text-xs text-green-600 font-medium">Book →</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
