"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface StreamSource {
  id: string;
  name: string;
  emoji: string;
  description: string;
  tournament: string;
  url: string;
  hlsUrl?: string;
  youtubeChannelId?: string;
  free: boolean;
  live: boolean;
}

interface HighlightSource {
  id: string;
  name: string;
  emoji: string;
  description: string;
  url: string;
}

// Tennis Channel live HLS streams from iptv-org via Pluto.tv (free, ad-supported)
const TENNIS_CHANNEL_HLS =
  "https://cfd-v4-service-channel-stitcher-use1-1.prd.pluto.tv/stitch/hls/channel/6870c9333ffa5e0c914e9205/master.m3u8?appName=web&appVersion=9.19.0&deviceDNT=0&deviceId=62b227dc-b436-4646-95c2-26345773df69&deviceMake=firefox&deviceModel=web&deviceType=web&deviceVersion=147.0.0&serverSideAds=false&sid=d0d7f7a1-1f05-450e-bcb6-136b116d4ad7";

const TENNIS_CHANNEL_2_HLS =
  "https://cfd-v4-service-channel-stitcher-use1-1.prd.pluto.tv/stitch/hls/channel/681109b688b9d85d0938c6ba/master.m3u8?appName=web&appVersion=9.19.0&deviceDNT=0&deviceId=affbdbfa-5fa3-48af-8369-57c005daef42&deviceMake=firefox&deviceModel=web&deviceType=web&deviceVersion=147.0.0&serverSideAds=false&sid=7d2214c9-9aea-438e-8722-a430fbb943b4";

// HLS Player using hls.js (dynamically imported to avoid SSR issues)
function HlsPlayer({ src, onError }: { src: string; onError: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cb = useCallback(onError, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let hlsInstance: { destroy: () => void } | null = null;

    (async () => {
      const Hls = (await import("hls.js")).default;
      if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: false });
        hlsInstance = hls;
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, (_: unknown, data: { fatal: boolean }) => {
          if (data.fatal) cb();
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      } else {
        cb();
      }
    })();

    return () => { hlsInstance?.destroy(); };
  }, [src, cb]);

  return (
    <video
      ref={videoRef}
      className="w-full h-full object-contain bg-black"
      controls
      autoPlay
      playsInline
    />
  );
}

const STREAM_SOURCES: StreamSource[] = [
  {
    id: "tennis-channel-live",
    name: "Tennis Channel",
    emoji: "📡",
    description: "Live Tennis Channel stream — full matches, analysis, and coverage. Free via Pluto.tv.",
    tournament: "Live Now",
    url: "https://pluto.tv/en/live-tv/tennis-channel",
    hlsUrl: TENNIS_CHANNEL_HLS,
    free: true,
    live: true,
  },
  {
    id: "tennis-channel-2-live",
    name: "Tennis Channel 2",
    emoji: "📡",
    description: "Overflow and classic match coverage. Free via Pluto.tv.",
    tournament: "Live Now",
    url: "https://pluto.tv/en/live-tv/tennis-channel-2",
    hlsUrl: TENNIS_CHANNEL_2_HLS,
    free: true,
    live: true,
  },
  {
    id: "atp-youtube",
    name: "ATP Tour Official",
    emoji: "🎾",
    description: "Official ATP Tour YouTube channel with live streams and match coverage.",
    tournament: "Live Now",
    url: "https://www.youtube.com/@ATPTour",
    youtubeChannelId: "UCB_RMbkFKkWbr11UCzT9LYg",
    free: true,
    live: true,
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
    live: true,
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
    live: true,
  },
  {
    id: "wimbledon-youtube",
    name: "Wimbledon",
    emoji: "🏆",
    description: "Official Wimbledon YouTube channel — live streams from The Championships.",
    tournament: "Wimbledon 2026",
    url: "https://www.youtube.com/@Wimbledon",
    youtubeChannelId: "UCXRlIK3Cw_aeGIKdR9sVbLg",
    free: true,
    live: false,
  },
  {
    id: "roland-garros-youtube",
    name: "Roland-Garros Official",
    emoji: "🏺",
    description: "Official Roland-Garros YouTube channel for French Open coverage.",
    tournament: "Roland Garros 2026",
    url: "https://www.youtube.com/@rolandgarros",
    youtubeChannelId: "UCd3BHZizTXGIBWX7pn6fq3A",
    free: true,
    live: false,
  },
  {
    id: "us-open-youtube",
    name: "US Open Tennis",
    emoji: "🇺🇸",
    description: "Official US Open YouTube channel with live streams and highlights.",
    tournament: "US Open 2026",
    url: "https://www.youtube.com/@USOpenTennis",
    youtubeChannelId: "UCkMPd8eHRxSiqWqhm40HMHQ",
    free: true,
    live: false,
  },
  {
    id: "tennis-tv",
    name: "Tennis TV",
    emoji: "📺",
    description: "Official ATP streaming platform — free clips and previews available.",
    tournament: "Subscription",
    url: "https://www.tennistv.com",
    free: false,
    live: true,
  },
  {
    id: "eurosport",
    name: "Eurosport",
    emoji: "🌍",
    description: "Eurosport covers all Grand Slams and major ATP/WTA events live.",
    tournament: "Subscription",
    url: "https://www.eurosport.com/tennis/",
    free: false,
    live: true,
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

type EmbedType = "hls" | "youtube" | "error";
interface ActiveEmbed { source: StreamSource; type: EmbedType; }

export default function TVPage() {
  const [activeEmbed, setActiveEmbed] = useState<ActiveEmbed | null>(null);

  const freeStreams = STREAM_SOURCES.filter((s) => s.free);
  const paidStreams = STREAM_SOURCES.filter((s) => !s.free);

  function openStream(source: StreamSource) {
    if (source.hlsUrl) {
      setActiveEmbed({ source, type: "hls" });
    } else if (source.youtubeChannelId) {
      setActiveEmbed({ source, type: "youtube" });
    } else {
      window.open(source.url, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Live Tennis</h1>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-600 text-white animate-pulse">
          ● LIVE
        </span>
      </div>
      <p className="text-sm text-gray-500 dark:text-slate-400 -mt-6">
        Watch Tennis Channel live in-page (HLS) or open official YouTube channels.
        IPTV streams via{" "}
        <a href="https://github.com/iptv-org/iptv" target="_blank" rel="noopener noreferrer" className="underline hover:text-green-600 dark:hover:text-green-400">
          iptv-org
        </a>
        {" "}/ Pluto.tv.
      </p>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-200 mb-4">
          📡 Free Live Channels
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {freeStreams.map((source) => (
            <div
              key={source.id}
              className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 flex flex-col gap-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{source.emoji}</span>
                  <div>
                    <div className="font-semibold text-sm text-gray-900 dark:text-slate-100">{source.name}</div>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 mt-0.5">
                      ● {source.tournament}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">FREE</span>
                  {source.hlsUrl && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">HLS</span>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed flex-1">{source.description}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => openStream(source)}
                  className="flex-1 py-1.5 px-3 text-xs font-medium rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                >
                  {source.hlsUrl ? "▶ Watch Live" : "▶ Embed"}
                </button>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-1.5 px-3 text-xs font-medium rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 text-center transition-colors"
                >
                  Open →
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-200 mb-4">Official Broadcasters</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {paidStreams.map((source) => (
            <div
              key={source.id}
              className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 flex flex-col gap-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{source.emoji}</span>
                  <div>
                    <div className="font-semibold text-sm text-gray-900 dark:text-slate-100">{source.name}</div>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 mt-0.5">
                      {source.tournament}
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">SUB</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed flex-1">{source.description}</p>
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

      <section>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-200 mb-4">📹 Latest Highlights</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {HIGHLIGHT_SOURCES.map((source) => (
            <a
              key={source.id}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 flex items-start gap-3 hover:shadow-md hover:border-green-400 dark:hover:border-green-600 transition-all group"
            >
              <span className="text-2xl shrink-0">{source.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-gray-900 dark:text-slate-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                  {source.name}
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 leading-relaxed">{source.description}</p>
              </div>
              <span className="text-gray-400 dark:text-slate-500 group-hover:text-green-500 transition-colors shrink-0">→</span>
            </a>
          ))}
        </div>
      </section>

      <div className="text-xs text-gray-400 dark:text-slate-500 border-t border-gray-200 dark:border-slate-700 pt-4">
        Tennis Channel streams via{" "}
        <a href="https://github.com/iptv-org/iptv" target="_blank" rel="noopener noreferrer" className="underline">iptv-org</a>
        {" "}/ Pluto.tv (free, ad-supported). Stream availability may vary by region. All YouTube links are official channels.
      </div>

      {activeEmbed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={() => setActiveEmbed(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <span className="text-xl">{activeEmbed.source.emoji}</span>
                <span className="font-semibold text-gray-900 dark:text-slate-100 text-sm">{activeEmbed.source.name}</span>
                {activeEmbed.source.live && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 animate-pulse">● LIVE</span>
                )}
                {activeEmbed.type === "hls" && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">HLS</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <a href={activeEmbed.source.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                  Open site →
                </a>
                <button onClick={() => setActiveEmbed(null)} className="text-gray-400 hover:text-gray-700 dark:hover:text-slate-200 text-2xl leading-none">×</button>
              </div>
            </div>
            <div className="aspect-video w-full bg-black">
              {activeEmbed.type === "hls" ? (
                <HlsPlayer
                  src={activeEmbed.source.hlsUrl!}
                  onError={() => setActiveEmbed({ ...activeEmbed, type: "error" })}
                />
              ) : activeEmbed.type === "youtube" ? (
                <iframe
                  src={`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent("live tennis " + activeEmbed.source.name)}&autoplay=1`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={activeEmbed.source.name}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-white">
                  <span className="text-4xl">📡</span>
                  <p className="text-sm text-gray-300">Stream unavailable in your region.</p>
                  <a
                    href={activeEmbed.source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    Watch on {activeEmbed.source.name} →
                  </a>
                </div>
              )}
            </div>
            <p className="text-[10px] text-gray-400 dark:text-slate-500 px-4 py-2 text-center">
              {activeEmbed.type === "hls"
                ? "Live HLS stream via Pluto.tv (free, ad-supported). If it fails, use Open site."
                : activeEmbed.type === "youtube"
                ? "Embedded YouTube search. Open directly on YouTube for best experience."
                : "Stream could not be loaded."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
