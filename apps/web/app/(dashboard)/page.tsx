"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { useT } from "@/lib/i18n/context";

// Surface badge: always white text on photo overlay (badges sit on top of the image)
const SURFACE_COLORS: Record<string, string> = {
  clay:   "bg-orange-500/80 text-white border border-orange-400/50",
  hard:   "bg-blue-500/80 text-white border border-blue-400/50",
  grass:  "bg-green-600/80 text-white border border-green-500/50",
  indoor: "bg-purple-600/80 text-white border border-purple-500/50",
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

function venueSlug(name: string): string {
  return name.toLowerCase().replace(/[čćžšđ]/g, (c) => ({č:"c",ć:"c",ž:"z",š:"s",đ:"d"}[c]??c))
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function getVenueImage(name: string, surfaces: string[]): string {
  const slug = venueSlug(name);
  return VENUE_PHOTOS[slug] ?? SURFACE_IMAGES[surfaces[0] ?? "default"] ?? SURFACE_IMAGES.default;
}

type Venue = {
  id: string;
  name: string;
  city: string;
  country: string;
  address: string | null;
  surfaces?: string[];
};

export default function HomePage() {
  const { t } = useT();
  const [search, setSearch] = useState("");

  const { data: venuesData, isLoading } = trpc.courts.getVenues.useQuery({ city: undefined });
  const { data: profile } = trpc.player.getProfile.useQuery();

  const venues = (venuesData ?? []) as unknown as Venue[];

  const filtered = venues.filter((v) =>
    !search ||
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8">

      {/* ── Hero / Search header ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-green-600 via-green-500 to-emerald-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 px-4 sm:px-6 lg:px-8 pt-8 pb-6">
        {/* Decorative blobs */}
        <div className="absolute -top-12 -right-12 w-56 h-56 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-black/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-3xl mx-auto relative">
          {profile && (
            <div className="mb-4">
              <p className="text-white/70 dark:text-slate-400 text-sm font-medium">
                {t.home.welcomeBack},
              </p>
              <h1 className="text-2xl font-black text-white tracking-tight leading-tight">
                {profile.full_name?.split(" ")[0] ?? t.home.player} 👋
              </h1>
            </div>
          )}

          {/* Search bar */}
          <div className="flex items-center gap-3 bg-white/95 dark:bg-slate-800 rounded-2xl px-4 py-3 shadow-xl shadow-black/10 dark:shadow-black/30 focus-within:ring-2 focus-within:ring-white/50 dark:focus-within:ring-green-500/50 transition-all">
            <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.home.searchPlaceholder}
              className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none min-w-0"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-500 flex items-center justify-center text-xs font-bold transition-colors"
              >
                ×
              </button>
            )}
          </div>

          {filtered.length > 0 && !isLoading && (
            <p className="text-white/60 dark:text-slate-500 text-xs mt-2 pl-1">
              {filtered.length} {t.home.available}
            </p>
          )}
        </div>
      </div>

      {/* ── Venue grid ── */}
      <div className="bg-slate-50 dark:bg-slate-950 px-4 sm:px-6 lg:px-8 pt-6 pb-10">
        <div className="max-w-7xl mx-auto">

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden animate-pulse bg-white dark:bg-slate-800 shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-700">
                  <div className="h-44 bg-slate-200 dark:bg-slate-700" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-3/4" />
                    <div className="h-3 bg-slate-100 dark:bg-slate-700/60 rounded-lg w-1/2" />
                  </div>
                </div>
              ))}
            </div>

          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-5xl mb-4">🏟️</p>
              <p className="font-black text-slate-800 dark:text-white text-lg">{t.courts.noVenues}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {search ? t.courts.tryClearing : t.courts.noVenuesDB}
              </p>
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="mt-5 px-5 py-2 rounded-xl bg-green-500 hover:bg-green-400 text-white text-sm font-bold transition-colors shadow-lg shadow-green-500/20"
                >
                  {t.common.clearFilters}
                </button>
              )}
            </div>

          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((venue) => {
                const surfaces = venue.surfaces ?? [];
                const imgUrl = getVenueImage(venue.name, surfaces);
                return (
                  <Link
                    key={venue.id}
                    href={`/courts/${venue.id}`}
                    className="group rounded-2xl overflow-hidden bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 shadow-sm hover:shadow-lg dark:shadow-none dark:hover:shadow-xl dark:hover:shadow-black/30 hover:-translate-y-0.5 transition-all duration-200"
                  >
                    {/* Photo */}
                    <div className="relative h-44 overflow-hidden bg-slate-200 dark:bg-slate-700">
                      <img
                        src={imgUrl}
                        alt={venue.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      {/* Gradient for badge readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      {/* Surface badges */}
                      <div className="absolute bottom-2.5 left-2.5 flex gap-1.5 flex-wrap">
                        {surfaces.slice(0, 2).map((s) => (
                          <span
                            key={s}
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide backdrop-blur-sm ${SURFACE_COLORS[s] ?? "bg-black/50 text-white border border-white/20"}`}
                          >
                            {t.surfaces[s as keyof typeof t.surfaces] ?? s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-3.5">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                        {venue.name}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
