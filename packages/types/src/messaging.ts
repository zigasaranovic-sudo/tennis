import { z } from "zod";

export const GetOrCreateConversationSchema = z.object({
  player_id: z.string().uuid(),
});

export const GetMessagesSchema = z.object({
  conversation_id: z.string().uuid(),
  limit: z.number().min(1).max(100).default(50),
  cursor: z.string().uuid().optional(),
});

export const SendMessageSchema = z.object({
  conversation_id: z.string().uuid(),
  content: z.string().min(1).max(1000),
});

export const MarkReadSchema = z.object({
  conversation_id: z.string().uuid(),
});
