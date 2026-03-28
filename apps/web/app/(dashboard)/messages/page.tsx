"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { useT } from "@/lib/i18n/context";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "NOW";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return new Date(dateStr).toLocaleDateString("en-US", { weekday: "short" });
  return new Date(dateStr).toLocaleDateString("sl-SI", { month: "short", day: "numeric" });
}

export default function MessagesPage() {
  const { t } = useT();
  const { data: conversations, isLoading } = trpc.messaging.getConversations.useQuery();

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 min-h-screen bg-[#0a0a0a]">
      <div className="px-4 sm:px-6 pt-6 pb-4 flex items-center justify-between">
        <h1 className="text-2xl font-black text-white">{t.messages.title}</h1>
        <button className="w-9 h-9 bg-[#141414] border border-[#222] rounded-xl flex items-center justify-center text-[#22c55e] hover:bg-[#1a1a1a] transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
          </svg>
        </button>
      </div>

      {/* Search */}
      <div className="px-4 sm:px-6 mb-5">
        <div className="flex items-center gap-3 bg-[#141414] border border-[#222] rounded-2xl px-4 py-3 focus-within:border-[#22c55e]/30 transition-colors">
          <svg className="w-4 h-4 text-[#4b5563] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            type="text"
            placeholder="Search players or groups..."
            className="flex-1 bg-transparent text-sm text-white placeholder-[#4b5563] outline-none"
          />
        </div>
      </div>

      {/* Conversation list */}
      {isLoading ? (
        <div className="px-4 sm:px-6 space-y-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-4 animate-pulse">
              <div className="w-12 h-12 rounded-full bg-[#1a1a1a] shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-[#1a1a1a] rounded w-32" />
                <div className="h-3 bg-[#141414] rounded w-48" />
              </div>
            </div>
          ))}
        </div>
      ) : conversations && conversations.length > 0 ? (
        <div className="px-4 sm:px-6 space-y-1">
          {conversations.map((conv) => {
            const hasUnread = (conv as { unread_count?: number }).unread_count ?? 0;
            const timeStr = conv.last_message_at ? timeAgo(conv.last_message_at) : "";
            const isNow = timeStr === "NOW";
            return (
              <Link
                key={conv.id}
                href={`/messages/${conv.id}`}
                className={`flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-[#141414] transition-colors ${hasUnread > 0 ? "bg-[#141414]" : ""}`}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full bg-[#22c55e]/20 flex items-center justify-center text-[#22c55e] font-black text-lg overflow-hidden border-2 border-[#1a1a1a]">
                    {conv.other_player?.avatar_url ? (
                      <img src={conv.other_player.avatar_url} alt={conv.other_player.full_name} className="w-full h-full object-cover" />
                    ) : (
                      (conv.other_player?.full_name?.[0] ?? "?").toUpperCase()
                    )}
                  </div>
                  {hasUnread > 0 && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#22c55e] rounded-full border-2 border-[#0a0a0a] flex items-center justify-center">
                      {hasUnread > 9 ? (
                        <span className="text-[8px] text-black font-black">9+</span>
                      ) : (
                        <span className="text-[8px] text-black font-black">{hasUnread}</span>
                      )}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className={`font-bold truncate ${hasUnread > 0 ? "text-white" : "text-[#d1d5db]"}`}>
                      {conv.other_player?.full_name ?? "Unknown Player"}
                    </p>
                    <p className={`text-xs shrink-0 font-semibold ${isNow ? "text-[#22c55e]" : "text-[#4b5563]"}`}>
                      {timeStr}
                    </p>
                  </div>
                  <p className={`text-sm truncate ${hasUnread > 0 ? "text-[#22c55e]" : "text-[#6b7280]"}`}>
                    @{conv.other_player?.username}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="px-4 sm:px-6 pt-8 text-center">
          <div className="w-16 h-16 bg-[#141414] rounded-3xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#4b5563]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
          </div>
          <p className="font-black text-white text-lg mb-1">{t.messages.noConversations}</p>
          <p className="text-sm text-[#6b7280] mb-5">{t.messages.noConversationsHint}</p>
          <Link
            href="/players"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#22c55e] text-black font-bold rounded-2xl hover:bg-[#16a34a] transition-colors text-sm shadow-lg shadow-green-500/20"
          >
            {t.messages.findPlayers}
          </Link>
        </div>
      )}

      {/* FAB */}
      <button className="fixed bottom-24 right-5 w-14 h-14 bg-[#22c55e] rounded-full flex items-center justify-center shadow-xl shadow-green-500/30 hover:bg-[#16a34a] transition-colors z-30 lg:hidden">
        <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/>
        </svg>
      </button>
    </div>
  );
}
