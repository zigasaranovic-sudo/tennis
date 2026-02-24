"use client";

import { useState } from "react";

interface Channel {
  id: string;
  name: string;
  channelId: string; // YouTube channel ID for live_stream embed
  description: string;
  badge: string;
}

// Only official YouTube channels with real channel IDs
// Embed format: youtube.com/embed/live_stream?channel=CHANNEL_ID
// Shows the channel's current live stream, or an error if nothing is live
const CHANNELS: Channel[] = [
  {
    id: "atp",
    name: "ATP Tour",
    channelId: "UCB_RMbkFKkWbr11UCzT9LYg",
    description: "Official ATP Tour live matches and coverage",
    badge: "🎾",
  },
  {
    id: "wta",
    name: "WTA",
    channelId: "UC_6JoX5gG2JqWWKGUGJKhHg",
    description: "Official WTA women's tennis live streams",
    badge: "🎾",
  },
  {
    id: "ao",
    name: "Australian Open",
    channelId: "UC7gWgeFMJZ_P-sGCJr7XE5Q",
    description: "Australian Open official live courts",
    badge: "🦘",
  },
  {
    id: "wimbledon",
    name: "Wimbledon",
    channelId: "UCXRlIK3Cw_aeGIKdR9sVbLg",
    description: "The Championships live from All England Club",
    badge: "🏆",
  },
  {
    id: "rg",
    name: "Roland-Garros",
    channelId: "UCd3BHZizTXGIBWX7pn6fq3A",
    description: "French Open official live stream",
    badge: "🏺",
  },
  {
    id: "uso",
    name: "US Open",
    channelId: "UCkMPd8eHRxSiqWqhm40HMHQ",
    description: "US Open Tennis official live coverage",
    badge: "🇺🇸",
  },
];

export default function TVPage() {
  const [active, setActive] = useState<Channel>(CHANNELS[0]!);

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Live Tennis TV</h1>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-600 text-white animate-pulse">
          ● LIVE
        </span>
      </div>
      <p className="text-sm text-gray-500 dark:text-slate-400">
        Official YouTube live streams — embedded directly. Select a channel below to watch.
        Streams are only available when a tournament is broadcasting live.
      </p>

      {/* Channel selector */}
      <div className="flex flex-wrap gap-2">
        {CHANNELS.map((ch) => (
          <button
            key={ch.id}
            onClick={() => setActive(ch)}
            className={[
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
              active.id === ch.id
                ? "bg-green-600 text-white"
                : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:border-green-400 dark:hover:border-green-600",
            ].join(" ")}
          >
            <span>{ch.badge}</span>
            <span>{ch.name}</span>
          </button>
        ))}
      </div>

      {/* Main embed player */}
      <div className="bg-black rounded-2xl overflow-hidden shadow-2xl">
        <div className="aspect-video w-full">
          <iframe
            key={active.channelId}
            src={`https://www.youtube.com/embed/live_stream?channel=${active.channelId}&autoplay=1&modestbranding=1&rel=0`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            title={`${active.name} Live`}
          />
        </div>
        <div className="px-4 py-3 flex items-center justify-between bg-slate-900">
          <div className="flex items-center gap-2">
            <span className="text-lg">{active.badge}</span>
            <div>
              <span className="text-white font-semibold text-sm">{active.name}</span>
              <p className="text-slate-400 text-xs">{active.description}</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white animate-pulse">
            ● LIVE
          </span>
        </div>
      </div>

      {/* Other channels grid */}
      <div>
        <h2 className="text-sm font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wide mb-3">
          Other Channels
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {CHANNELS.filter((ch) => ch.id !== active.id).map((ch) => (
            <button
              key={ch.id}
              onClick={() => setActive(ch)}
              className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-3 flex flex-col items-center gap-2 hover:border-green-400 dark:hover:border-green-600 hover:shadow-md transition-all group text-left"
            >
              <div className="w-full aspect-video bg-black rounded-lg overflow-hidden relative">
                <iframe
                  src={`https://www.youtube.com/embed/live_stream?channel=${ch.channelId}&modestbranding=1&rel=0&mute=1`}
                  className="w-full h-full pointer-events-none scale-105"
                  allow="autoplay"
                  title={ch.name}
                />
                <div className="absolute inset-0" /> {/* click interceptor */}
              </div>
              <span className="text-xs font-medium text-gray-700 dark:text-slate-300 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                {ch.badge} {ch.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-400 dark:text-slate-500 border-t border-gray-200 dark:border-slate-700 pt-3">
        All streams are official YouTube channels. Streams are only available during live tournament broadcasts.
        If you see a YouTube error, no match is currently live on that channel.
      </p>
    </div>
  );
}
