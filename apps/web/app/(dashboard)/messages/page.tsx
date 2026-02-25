"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc/client";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function MessagesPage() {
  const { data: conversations, isLoading } = trpc.messaging.getConversations.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Messages</h1>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 divide-y divide-gray-100 dark:divide-slate-700">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-slate-700" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-32" />
                <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded w-48" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Messages</h1>

      {conversations && conversations.length > 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 divide-y divide-gray-100 dark:divide-slate-700">
          {conversations.map((conv) => {
            const hasUnread = (conv as { unread_count?: number }).unread_count ?? 0;
            return (
              <Link
                key={conv.id}
                href={`/messages/${conv.id}`}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-semibold text-lg overflow-hidden">
                    {conv.other_player?.avatar_url ? (
                      <img
                        src={conv.other_player.avatar_url}
                        alt={conv.other_player.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      (conv.other_player?.full_name?.[0] ?? "?")
                    )}
                  </div>
                  {hasUnread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-800" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`font-semibold truncate ${hasUnread > 0 ? "text-gray-900 dark:text-slate-100" : "text-gray-800 dark:text-slate-200"}`}>
                      {conv.other_player?.full_name ?? "Unknown Player"}
                    </p>
                    {conv.last_message_at && (
                      <p className="text-xs text-gray-400 dark:text-slate-500 flex-shrink-0">
                        {timeAgo(conv.last_message_at)}
                      </p>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 dark:text-slate-500 truncate mt-0.5">
                    @{conv.other_player?.username}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-dashed border-gray-300 dark:border-slate-600 p-12 text-center">
          <p className="text-4xl mb-4">💬</p>
          <p className="font-medium text-gray-900 dark:text-slate-100">No conversations yet</p>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Find a player and start a conversation
          </p>
          <Link
            href="/players"
            className="mt-4 inline-block px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            Find Players
          </Link>
        </div>
      )}
    </div>
  );
}
