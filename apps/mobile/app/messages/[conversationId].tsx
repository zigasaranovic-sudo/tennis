import { useState, useEffect, useRef } from "react";
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  KeyboardAvoidingView, Platform, ActivityIndicator, useColorScheme,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { trpc } from "@/lib/trpc";
import { supabase } from "@/lib/supabase";

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
};

export default function ChatScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);

  const { data, isLoading } = trpc.messaging.getMessages.useQuery(
    { conversation_id: conversationId, limit: 50 },
    { enabled: !!conversationId }
  );
  const { data: profile } = trpc.player.getProfile.useQuery();
  const sendMessage = trpc.messaging.sendMessage.useMutation();
  const markRead = trpc.messaging.markRead.useMutation();
  const utils = trpc.useUtils();

  const myId = profile?.id;

  const bg = isDark ? "#0f172a" : "#f9fafb";
  const inputBg = isDark ? "#1e293b" : "#ffffff";
  const border = isDark ? "#334155" : "#e5e7eb";
  const inputText = isDark ? "#f1f5f9" : "#111827";
  const placeholder = isDark ? "#64748b" : "#9ca3af";
  const otherBubbleBg = isDark ? "#1e293b" : "#ffffff";
  const otherBubbleBorder = isDark ? "#334155" : "#e5e7eb";
  const otherBubbleText = isDark ? "#f1f5f9" : "#111827";
  const timestampOther = isDark ? "#64748b" : "#9ca3af";
  const emptyText = isDark ? "#64748b" : "#9ca3af";

  useEffect(() => {
    if (data?.messages) {
      setMessages([...(data.messages as Message[])].reverse());
      markRead.mutate({ conversation_id: conversationId });
    }
  }, [data]);

  // Supabase Realtime subscription
  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          setMessages((prev) => {
            const newMsg = payload.new as Message;
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
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

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: bg }}>
        <ActivityIndicator color="#16a34a" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: bg }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 8 }}
        ListEmptyComponent={
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60 }}>
            <Text style={{ color: emptyText, fontSize: 14 }}>No messages yet. Say hi! 👋</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isMe = item.sender_id === myId;
          const time = new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          return (
            <View style={{ alignItems: isMe ? "flex-end" : "flex-start" }}>
              <View style={{
                maxWidth: "75%",
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 18,
                borderBottomRightRadius: isMe ? 4 : 18,
                borderBottomLeftRadius: isMe ? 18 : 4,
                backgroundColor: isMe ? "#16a34a" : otherBubbleBg,
                borderWidth: isMe ? 0 : 1,
                borderColor: otherBubbleBorder,
              }}>
                <Text style={{ color: isMe ? "#ffffff" : otherBubbleText, fontSize: 15, lineHeight: 20 }}>
                  {item.content}
                </Text>
                <Text style={{
                  fontSize: 10,
                  marginTop: 2,
                  color: isMe ? "#bbf7d0" : timestampOther,
                  textAlign: isMe ? "right" : "left",
                }}>
                  {time}
                </Text>
              </View>
            </View>
          );
        }}
      />

      {/* Input area */}
      <View style={{
        flexDirection: "row",
        alignItems: "flex-end",
        padding: 12,
        gap: 8,
        borderTopWidth: 1,
        borderTopColor: border,
        backgroundColor: inputBg,
      }}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Message..."
          placeholderTextColor={placeholder}
          multiline
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: border,
            borderRadius: 20,
            paddingHorizontal: 14,
            paddingVertical: 8,
            fontSize: 15,
            color: inputText,
            backgroundColor: isDark ? "#0f172a" : "#f9fafb",
            maxHeight: 100,
          }}
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={!text.trim() || sending}
          style={{
            backgroundColor: !text.trim() || sending ? "#86efac" : "#16a34a",
            borderRadius: 20,
            paddingHorizontal: 16,
            paddingVertical: 10,
          }}
        >
          <Text style={{ color: "#ffffff", fontWeight: "700", fontSize: 14 }}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
