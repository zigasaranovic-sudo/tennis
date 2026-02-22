"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc/client";

export default function MessagesPage() {
  const { data: conversations, isLoading } = trpc.messaging.getConversations.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
              <div className="w-12 h-12 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32" />
                <div className="h-3 bg-gray-100 rounded w-48" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Messages</h1>

      {conversations && conversations.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {conversations.map((conv) => (
            <Link
              key={conv.id}
              href={`/messages/${conv.id}`}
              className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-semibold text-lg flex-shrink-0 overflow-hidden">
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
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">
                  {conv.other_player?.full_name ?? "Unknown Player"}
                </p>
                <p className="text-sm text-gray-400">@{conv.other_player?.username}</p>
              </div>
              {conv.last_message_at && (
                <p className="text-xs text-gray-400 flex-shrink-0">
                  {new Date(conv.last_message_at).toLocaleDateString()}
                </p>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-4xl mb-4">💬</p>
          <p className="font-medium text-gray-900">No conversations yet</p>
          <p className="text-sm text-gray-500 mt-1">
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
