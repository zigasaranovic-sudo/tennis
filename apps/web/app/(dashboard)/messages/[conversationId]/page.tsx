"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { createClient } from "@/lib/supabase/client";

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
};

export default function ConversationPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const router = useRouter();
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = trpc.messaging.getMessages.useQuery(
    { conversation_id: conversationId, limit: 50 },
    { enabled: !!conversationId }
  );

  const { data: conversations } = trpc.messaging.getConversations.useQuery();
  const sendMessage = trpc.messaging.sendMessage.useMutation();
  const markRead = trpc.messaging.markRead.useMutation();
  const utils = trpc.useUtils();

  const conv = conversations?.find((c) => c.id === conversationId);

  // Load initial messages
  useEffect(() => {
    if (data?.messages) {
      setMessages(data.messages as Message[]);
      markRead.mutate({ conversation_id: conversationId });
    }
  }, [data]);

  // Supabase Realtime subscription
  useEffect(() => {
    if (!conversationId) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => {
            const newMsg = payload.new as Message;
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const content = text.trim();
    if (!content || sending) return;
    setSending(true);
    setText("");
    try {
      await sendMessage.mutateAsync({ conversation_id: conversationId, content });
      utils.messaging.getConversations.invalidate();
    } catch {
      setText(content);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // We need current user id — derive from messages (sender_id)
  // We'll use a simpler approach: messages the user sent have sender_id from ctx
  // Just use profile query
  const { data: profile } = trpc.player.getProfile.useQuery();
  const myId = profile?.id;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
        <button
          onClick={() => router.back()}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          ←
        </button>
        {conv?.other_player && (
          <Link href={`/players/${conv.other_player.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-semibold overflow-hidden">
              {conv.other_player.avatar_url ? (
                <img src={conv.other_player.avatar_url} alt={conv.other_player.full_name} className="w-full h-full object-cover" />
              ) : (
                conv.other_player.full_name[0]
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{conv.other_player.full_name}</p>
              <p className="text-xs text-gray-400">@{conv.other_player.username}</p>
            </div>
          </Link>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3">
        {isLoading ? (
          <div className="text-center text-gray-400 py-8">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">No messages yet. Say hi!</div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === myId;
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${
                    isMe
                      ? "bg-green-600 text-white rounded-br-sm"
                      : "bg-white border border-gray-200 text-gray-900 rounded-bl-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${isMe ? "text-green-100" : "text-gray-400"}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex gap-3 items-end">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Enter to send)"
            rows={1}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-2xl text-sm text-gray-900 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-green-500 max-h-32"
            style={{ fieldSizing: "content" } as React.CSSProperties}
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className="px-5 py-3 bg-green-600 text-white text-sm font-semibold rounded-2xl hover:bg-green-700 disabled:opacity-40 transition-colors flex-shrink-0"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
