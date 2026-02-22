import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import {
  GetOrCreateConversationSchema,
  GetMessagesSchema,
  SendMessageSchema,
  MarkReadSchema,
} from "@tenis/types";

export const messagingRouter = router({
  /** List all conversations for the current user */
  getConversations: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("conversations")
      .select(
        "id, last_message_at, created_at, player1_id, player2_id, player1:player1_id(id, full_name, username, avatar_url), player2:player2_id(id, full_name, username, avatar_url)"
      )
      .or(`player1_id.eq.${ctx.user.id},player2_id.eq.${ctx.user.id}`)
      .order("last_message_at", { ascending: false, nullsFirst: false });

    if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });

    type ConvRow = {
      id: string;
      last_message_at: string | null;
      created_at: string;
      player1_id: string;
      player2_id: string;
      player1: { id: string; full_name: string; username: string; avatar_url: string | null } | null;
      player2: { id: string; full_name: string; username: string; avatar_url: string | null } | null;
    };

    return (data as unknown as ConvRow[]).map((c) => {
      const other = c.player1_id === ctx.user.id ? c.player2 : c.player1;
      return {
        id: c.id,
        last_message_at: c.last_message_at,
        created_at: c.created_at,
        other_player: other,
      };
    });
  }),

  /** Get or create a 1-on-1 conversation with another player */
  getOrCreateConversation: protectedProcedure
    .input(GetOrCreateConversationSchema)
    .mutation(async ({ ctx, input }) => {
      if (input.player_id === ctx.user.id) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot message yourself" });
      }

      const p1 = ctx.user.id < input.player_id ? ctx.user.id : input.player_id;
      const p2 = ctx.user.id < input.player_id ? input.player_id : ctx.user.id;

      // Try to find existing
      const { data: existing } = await ctx.supabase
        .from("conversations")
        .select("id")
        .eq("player1_id", p1)
        .eq("player2_id", p2)
        .single();

      if (existing) return { id: existing.id };

      // Create new
      const { data: created, error } = await ctx.supabase
        .from("conversations")
        .insert({ player1_id: p1, player2_id: p2 })
        .select("id")
        .single();

      if (error || !created) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error?.message ?? "Failed to create conversation" });
      }

      return { id: created.id };
    }),

  /** Get paginated messages for a conversation */
  getMessages: protectedProcedure
    .input(GetMessagesSchema)
    .query(async ({ ctx, input }) => {
      // Verify user is a participant
      const { data: conv } = await ctx.supabase
        .from("conversations")
        .select("id")
        .eq("id", input.conversation_id)
        .or(`player1_id.eq.${ctx.user.id},player2_id.eq.${ctx.user.id}`)
        .single();

      if (!conv) throw new TRPCError({ code: "FORBIDDEN", message: "Not a participant" });

      let query = ctx.supabase
        .from("messages")
        .select("id, conversation_id, sender_id, content, read_at, created_at")
        .eq("conversation_id", input.conversation_id)
        .order("created_at", { ascending: false })
        .limit(input.limit);

      if (input.cursor) {
        const { data: cursorMsg } = await ctx.supabase
          .from("messages")
          .select("created_at")
          .eq("id", input.cursor)
          .single();
        if (cursorMsg) {
          query = query.lt("created_at", cursorMsg.created_at);
        }
      }

      const { data, error } = await query;
      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });

      const messages = (data ?? []).reverse();
      const nextCursor = data && data.length === input.limit ? data[data.length - 1]?.id : undefined;

      return { messages, nextCursor };
    }),

  /** Send a message */
  sendMessage: protectedProcedure
    .input(SendMessageSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify participant
      const { data: conv } = await ctx.supabase
        .from("conversations")
        .select("id")
        .eq("id", input.conversation_id)
        .or(`player1_id.eq.${ctx.user.id},player2_id.eq.${ctx.user.id}`)
        .single();

      if (!conv) throw new TRPCError({ code: "FORBIDDEN", message: "Not a participant" });

      const { data: msg, error } = await ctx.supabase
        .from("messages")
        .insert({
          conversation_id: input.conversation_id,
          sender_id: ctx.user.id,
          content: input.content,
        })
        .select("id, conversation_id, sender_id, content, read_at, created_at")
        .single();

      if (error || !msg) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error?.message ?? "Failed to send" });
      }

      // Update last_message_at on conversation
      await ctx.supabase
        .from("conversations")
        .update({ last_message_at: msg.created_at })
        .eq("id", input.conversation_id);

      return msg;
    }),

  /** Mark all messages in a conversation as read */
  markRead: protectedProcedure
    .input(MarkReadSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("conversation_id", input.conversation_id)
        .neq("sender_id", ctx.user.id)
        .is("read_at", null);

      return { ok: true };
    }),
});
