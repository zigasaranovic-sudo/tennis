"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc/client";

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
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function MessagesPage() {
  const { data: conversations, isLoading } = trpc.messaging.getConversations.useQuery();

  const activeNow = conversations?.slice(0, 5) ?? [];

  return (
    <div className="min-h-screen bg-[#131313]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        {/* Left: avatar + title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#4be277]/20 border-2 border-[#4be277]/40 flex items-center justify-center text-[#4be277] font-bold text-sm">
            P
          </div>
          <span className="text-[#4be277] font-extrabold italic text-xl tracking-tight">PLAYMATE</span>
        </div>
        {/* Right: search icon */}
        <button className="w-9 h-9 flex items-center justify-center text-[#9ca3af] hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>

      {/* Search bar */}
      <div className="bg-[#1b1c1c] border-b border-[#3d4a3d]/20 px-5 py-3 flex items-center gap-3">
        <svg className="w-4 h-4 text-[#6b7280] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search players or groups"
          className="flex-1 bg-transparent text-sm text-white placeholder-[#6b7280] outline-none"
        />
      </div>

      {/* ACTIVE NOW section */}
      <div className="mt-6 mb-2 px-5 flex items-center justify-between">
        <span className="text-[#4be277] text-xs font-bold uppercase tracking-widest">Active Now</span>
        <span className="text-[#6b7280] text-xs font-medium">24 Online</span>
      </div>

      {/* Horizontal scroll strip */}
      <div className="px-5 overflow-x-auto">
        <div className="flex gap-4 pb-3" style={{ minWidth: "max-content" }}>
          {isLoading
            ? [...Array(5)].map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 animate-pulse">
                  <div className="w-14 h-14 rounded-full bg-[#1b1c1c]" />
                  <div className="h-2.5 w-10 bg-[#1b1c1c] rounded" />
                </div>
              ))
            : activeNow.length > 0
            ? activeNow.map((conv) => {
                const name = conv.other_player?.full_name ?? "Player";
                const initials = getInitials(name);
                const firstName = name.split(" ")[0];
                return (
                  <Link key={conv.id} href={`/messages/${conv.id}`} className="flex flex-col items-center gap-1.5">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full bg-[#4be277]/20 border-2 border-[#4be277] flex items-center justify-center text-[#4be277] font-bold text-base overflow-hidden">
                        {conv.other_player?.avatar_url ? (
                          <img
                            src={conv.other_player.avatar_url}
                            alt={name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          initials
                        )}
                      </div>
                      {/* Online dot */}
                      <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-[#4be277] rounded-full border-2 border-[#131313]" />
                    </div>
                    <span className="text-[#d1d5db] text-xs font-medium max-w-[56px] truncate text-center">
                      {firstName}
                    </span>
                  </Link>
                );
              })
            : (
                <p className="text-[#6b7280] text-sm py-2">No active players</p>
              )}
        </div>
      </div>

      {/* MESSAGES section label */}
      <div className="mt-5 mb-3 px-5">
        <span className="text-[#4be277] text-xs font-bold uppercase tracking-widest">Messages</span>
      </div>

      {/* Conversation list */}
      {isLoading ? (
        <div className="px-5 space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3 animate-pulse">
              <div className="w-14 h-14 rounded-full bg-[#1b1c1c] shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-[#1b1c1c] rounded w-32" />
                <div className="h-3 bg-[#1b1c1c] rounded w-48" />
              </div>
            </div>
          ))}
        </div>
      ) : conversations && conversations.length > 0 ? (
        <div className="px-3 space-y-1 pb-36">
          {conversations.map((conv) => {
            const unread = (conv as { unread_count?: number }).unread_count ?? 0;
            const timeStr = conv.last_message_at ? timeAgo(conv.last_message_at) : "";
            const isRecent = timeStr === "NOW" || timeStr.endsWith("m") || timeStr.endsWith("h");
            const name = conv.other_player?.full_name ?? "Unknown Player";
            const initials = getInitials(name);

            return (
              <Link
                key={conv.id}
                href={`/messages/${conv.id}`}
                className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-colors hover:bg-[#1b1c1c] ${
                  unread > 0 ? "bg-[#1b1c1c]" : ""
                }`}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-14 h-14 rounded-full bg-[#4be277]/20 flex items-center justify-center text-[#4be277] font-bold text-lg overflow-hidden">
                    {conv.other_player?.avatar_url ? (
                      <img
                        src={conv.other_player.avatar_url}
                        alt={name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </div>
                  {/* Unread badge */}
                  {unread > 0 && (
                    <span
                      className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#131313]"
                      style={{
                        background: "linear-gradient(135deg, #4be277, #22c55e)",
                      }}
                    >
                      <span className="text-[9px] text-black font-black leading-none">
                        {unread > 9 ? "9+" : unread}
                      </span>
                    </span>
                  )}
                </div>

                {/* Text info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className={`font-bold text-sm truncate ${unread > 0 ? "text-white" : "text-[#d1d5db]"}`}>
                      {name}
                    </p>
                    <p
                      className={`text-xs shrink-0 font-semibold ${
                        isRecent ? "text-[#4be277]" : "text-[#6b7280]"
                      }`}
                    >
                      {timeStr}
                    </p>
                  </div>
                  <p className={`text-sm truncate ${unread > 0 ? "text-[#9ca3af]" : "text-[#6b7280]"}`}>
                    @{conv.other_player?.username ?? "unknown"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="px-5 pt-10 text-center pb-36">
          <div className="w-16 h-16 bg-[#1b1c1c] rounded-3xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#6b7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <p className="font-black text-white text-lg mb-1">No conversations yet</p>
          <p className="text-sm text-[#6b7280] mb-5">Find players and start chatting</p>
          <Link
            href="/players"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-black font-bold rounded-2xl text-sm transition-colors"
            style={{
              background: "linear-gradient(135deg, #4be277, #22c55e)",
              boxShadow: "0 10px 30px rgba(75,226,119,0.3)",
            }}
          >
            Find Players
          </Link>
        </div>
      )}

      {/* FAB */}
      <button
        className="fixed bottom-28 right-6 w-16 h-16 rounded-full flex items-center justify-center z-30 lg:hidden"
        style={{
          background: "linear-gradient(135deg, #4be277, #22c55e)",
          boxShadow: "0 10px 30px rgba(75,226,119,0.3)",
        }}
        aria-label="New message"
      >
        {/* add_comment icon */}
        <svg className="w-7 h-7 text-black" fill="currentColor" viewBox="0 0 24 24">
          <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zM17 11h-4v4h-2v-4H7V9h4V5h2v4h4v2z" />
        </svg>
      </button>
    </div>
  );
}
