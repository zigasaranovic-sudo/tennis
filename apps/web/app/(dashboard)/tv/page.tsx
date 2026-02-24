"use client";

import { useState } from "react";

interface StreamSource {
  id: string;
  name: string;
  emoji: string;
  description: string;
  tournament: string;
  url: string;
  youtubeChannelId?: string;
  free: boolean;
}

interface HighlightSource {
  id: string;
  name: string;
  emoji: string;
  description: string;
  url: string;
}

const STREAM_SOURCES: StreamSource[] = [
  {
    id: "atp-youtube",
    name: "ATP Tour Official",
    emoji: "🎾",
    description: "Official ATP Tour YouTube channel with live streams and match coverage.",
    tournament: "Live Now",
    url: "https://www.youtube.com/@ATPTour",
    youtubeChannelId: "UCB_RMbkFKkWbr11UCzT9LYg",
    free: true,
  },
  {
    id: "wta-youtube",
    name: "WTA Official",
    emoji: "🎾",
    description: "Official WTA YouTube channel covering women's professional tennis.",
    tournament: "Live Now",
    url: "https://www.youtube.com/@WTA",
    youtubeChannelId: "UC_6JoX5gG2JqWWKGUGJKhHg",
    free: true,
  },
  {
    id: "wimbledon-youtube",
    name: "Wimbledon",
    emoji: "🏆",
    description: "Official Wimbledon YouTube channel — live streams from The Championships.",
    tournament: "Australian Open 2026",
    url: "https://www.youtube.com/@Wimbledon",
    youtubeChannelId: "UCXRlIK3Cw_aeGIKdR9sVbLg",
    free: true,
  },
  {
    id: "roland-garros-youtube",
    name: "Roland-Garros Official",
    emoji: "🏺",
    description: "Official Roland-Garros YouTube channel for French Open coverage.",
    tournament: "Australian Open 2026",
    url: "https://www.youtube.com/@rolandgarros",
    youtubeChannelId: "UCd3BHZizTXGIBWX7pn6fq3A",
    free: true,
  },
  {
    id: "us-open-youtube",
    name: "US Open Tennis",
    emoji: "🇺🇸",
    description: "Official US Open YouTube channel with live streams and highlights.",
    tournament: "Australian Open 2026",
    url: "https://www.youtube.com/@USOpenTennis",
    youtubeChannelId: "UCkMPd8eHRxSiqWqhm40HMHQ",
    free: true,
  },
  {
    id: "australian-open-youtube",
    name: "Australian Open",
    emoji: "🦘",
    description: "Official Australian Open YouTube channel — live courts and highlights.",
    tournament: "Live Now",
    url: "https://www.youtube.com/@australianopen",
    youtubeChannelId: "UC7gWgeFMJZ_P-sGCJr7XE5Q",
    free: true,
  },
  {
    id: "tennis-tv",
    name: "Tennis TV",
    emoji: "📺",
    description: "Official ATP streaming platform — free clips and previews available.",
    tournament: "Australian Open 2026",
    url: "https://www.tennistv.com",
    free: false,
  },
  {
    id: "eurosport",
    name: "Eurosport",
    emoji: "🌍",
    description: "Eurosport covers all Grand Slams and major ATP/WTA events live.",
    tournament: "Australian Open 2026",
    url: "https://www.eurosport.com/tennis/",
    free: false,
  },
];

const HIGHLIGHT_SOURCES: HighlightSource[] = [
  {
    id: "atp-highlights",
    name: "ATP Tour Highlights",
    emoji: "🎾",
    description: "Latest match highlights from ATP Tour events worldwide.",
    url: "https://www.youtube.com/@ATPTour/videos",
  },
  {
    id: "wta-highlights",
    name: "WTA Highlights",
    emoji: "🎾",
    description: "Women's tennis highlights — best points and match recaps.",
    url: "https://www.youtube.com/@WTA/videos",
  },
  {
    id: "wimbledon-highlights",
    name: "Wimbledon Highlights",
    emoji: "🏆",
    description: "Best moments and match highlights from The Championships.",
    url: "https://www.youtube.com/@Wimbledon/videos",
  },
  {
    id: "roland-garros-highlights",
    name: "Roland-Garros Highlights",
    emoji: "🏺",
    description: "Top points and match recaps from the French Open.",
    url: "https://www.youtube.com/@rolandgarros/videos",
  },
  {
    id: "australian-open-highlights",
    name: "Australian Open Highlights",
    emoji: "🦘",
    description: "Daily highlights and top moments from Melbourne Park.",
    url: "https://www.youtube.com/@australianopen/videos",
  },
  {
    id: "us-open-highlights",
    name: "US Open Highlights",
    emoji: "🇺🇸",
    description: "Flushing Meadows highlights — best shots and match summaries.",
    url: "https://www.youtube.com/@USOpenTennis/videos",
  },
];

export default function TVPage() {
  const [embedSource, setEmbedSource] = useState<StreamSource | null>(null);

  const freeStreams = STREAM_SOURCES.filter((s) => s.free);
  const paidStreams = STREAM_SOURCES.filter((s) => !s.free);

  function openEmbed(source: StreamSource) {
    if (source.youtubeChannelId) {
      setEmbedSource(source);
    } else {
      window.open(source.url, "_blank", "noopener,noreferrer");
    }
  }

  function closeEmbed() {
    setEmbedSource(null);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Live Tennis</h1>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-600 text-white animate-pulse">
          ● LIVE
        </span>
      </div>
      <p className="text-sm text-gray-500 dark:text-slate-400 -mt-6">
        Links open official broadcaster websites. Only official YouTube channels and broadcasters are listed.
      </p>

      {/* Free Streams */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-200 mb-4">
          Free Official Channels
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {freeStreams.map((source) => (
            <div
              key={source.id}
              className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 flex flex-col gap-3 hover:shadow-md dark:hover:shadow-slate-700/50 transition-shadow"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{source.emoji}</span>
                  <div>
                    <div className="font-semibold text-sm text-gray-900 dark:text-slate-100">
                      {source.name}
                    </div>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 mt-0.5">
                      ● {source.tournament}
                    </span>
                  </div>
                </div>
                <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                  FREE
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed flex-1">
                {source.description}
              </p>
              <div className="flex gap-2">
                {source.youtubeChannelId && (
                  <button
                    onClick={() => openEmbed(source)}
                    className="flex-1 py-1.5 px-3 text-xs font-medium rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                  >
                    ▶ Embed
                  </button>
                )}
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-1.5 px-3 text-xs font-medium rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 text-center transition-colors"
                >
                  Watch →
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Paid/Subscription Streams */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-200 mb-4">
          Official Broadcasters
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {paidStreams.map((source) => (
            <div
              key={source.id}
              className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 flex flex-col gap-3 hover:shadow-md dark:hover:shadow-slate-700/50 transition-shadow"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{source.emoji}</span>
                  <div>
                    <div className="font-semibold text-sm text-gray-900 dark:text-slate-100">
                      {source.name}
                    </div>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 mt-0.5">
                      {source.tournament}
                    </span>
                  </div>
                </div>
                <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                  SUB
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed flex-1">
                {source.description}
              </p>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="py-1.5 px-3 text-xs font-medium rounded-lg bg-green-600 hover:bg-green-700 text-white text-center transition-colors"
              >
                Visit Website →
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Highlights */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-200 mb-4">
          📹 Latest Highlights
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {HIGHLIGHT_SOURCES.map((source) => (
            <a
              key={source.id}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 flex items-start gap-3 hover:shadow-md dark:hover:shadow-slate-700/50 hover:border-green-400 dark:hover:border-green-600 transition-all group"
            >
              <span className="text-2xl shrink-0">{source.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-gray-900 dark:text-slate-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                  {source.name}
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  {source.description}
                </p>
              </div>
              <span className="text-gray-400 dark:text-slate-500 group-hover:text-green-500 transition-colors shrink-0">
                →
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <div className="text-xs text-gray-400 dark:text-slate-500 border-t border-gray-200 dark:border-slate-700 pt-4">
        All links open official broadcaster websites or official YouTube channels. No unauthorized streams are embedded or linked. Stream availability may vary by region.
      </div>

      {/* Embed Modal */}
      {embedSource && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
          onClick={closeEmbed}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <span className="text-xl">{embedSource.emoji}</span>
                <span className="font-semibold text-gray-900 dark:text-slate-100 text-sm">
                  {embedSource.name}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                  ● LIVE
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={embedSource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Open on YouTube →
                </a>
                <button
                  onClick={closeEmbed}
                  className="text-gray-400 hover:text-gray-700 dark:hover:text-slate-200 text-xl leading-none"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent("live tennis " + embedSource.name)}&autoplay=1`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={embedSource.name}
              />
            </div>
            <p className="text-[10px] text-gray-400 dark:text-slate-500 px-4 py-2 text-center">
              Embedded YouTube search. For the best experience, open directly on YouTube.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
