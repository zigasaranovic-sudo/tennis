/**
 * Auto-generated Supabase types.
 * Regenerate with: pnpm db:generate
 * Run: supabase gen types typescript --local > packages/db/src/database.types.ts
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          full_name: string;
          avatar_url: string | null;
          bio: string | null;
          skill_level: "beginner" | "intermediate" | "advanced" | "professional";
          elo_rating: number;
          elo_provisional: boolean;
          matches_played: number;
          matches_won: number;
          matches_lost: number;
          city: string | null;
          country: string;
          home_club: string | null;
          latitude: number | null;
          longitude: number | null;
          preferred_surface: string[] | null;
          is_public: boolean;
          is_active: boolean;
          last_active_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          full_name: string;
          avatar_url?: string | null;
          bio?: string | null;
          skill_level?: "beginner" | "intermediate" | "advanced" | "professional";
          city?: string | null;
          country?: string;
          home_club?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          preferred_surface?: string[] | null;
          is_public?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      player_availability: {
        Row: {
          id: string;
          player_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_recurring: boolean;
          valid_from: string | null;
          valid_until: string | null;
          created_at: string;
        };
        Insert: {
          player_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_recurring?: boolean;
          valid_from?: string | null;
          valid_until?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["player_availability"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "player_availability_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      matches: {
        Row: {
          id: string;
          player1_id: string;
          player2_id: string;
          status: "pending" | "accepted" | "pending_confirmation" | "completed" | "cancelled" | "disputed";
          format: "best_of_1" | "best_of_3" | "best_of_5";
          scheduled_at: string | null;
          played_at: string | null;
          location_name: string | null;
          location_city: string | null;
          location_lat: number | null;
          location_lng: number | null;
          player1_sets_won: number | null;
          player2_sets_won: number | null;
          score_detail: Json | null;
          winner_id: string | null;
          loser_id: string | null;
          player1_elo_before: number | null;
          player2_elo_before: number | null;
          player1_elo_after: number | null;
          player2_elo_after: number | null;
          player1_elo_delta: number | null;
          player2_elo_delta: number | null;
          result_submitted_by: string | null;
          result_confirmed_by: string | null;
          result_confirmed_at: string | null;
          notes: string | null;
          is_ranked: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          player1_id: string;
          player2_id: string;
          status?: "pending" | "accepted" | "pending_confirmation" | "completed" | "cancelled" | "disputed";
          format: "best_of_1" | "best_of_3" | "best_of_5";
          scheduled_at?: string | null;
          played_at?: string | null;
          location_name?: string | null;
          location_city?: string | null;
          location_lat?: number | null;
          location_lng?: number | null;
          player1_sets_won?: number | null;
          player2_sets_won?: number | null;
          score_detail?: Json | null;
          winner_id?: string | null;
          loser_id?: string | null;
          player1_elo_before?: number | null;
          player2_elo_before?: number | null;
          player1_elo_after?: number | null;
          player2_elo_after?: number | null;
          player1_elo_delta?: number | null;
          player2_elo_delta?: number | null;
          result_submitted_by?: string | null;
          result_confirmed_by?: string | null;
          result_confirmed_at?: string | null;
          notes?: string | null;
          is_ranked?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["matches"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "matches_player1_id_fkey";
            columns: ["player1_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_player2_id_fkey";
            columns: ["player2_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      match_requests: {
        Row: {
          id: string;
          requester_id: string;
          recipient_id: string;
          status: "pending" | "accepted" | "declined" | "expired" | "withdrawn";
          proposed_at: string;
          proposed_format: "best_of_1" | "best_of_3" | "best_of_5";
          location_name: string | null;
          location_city: string | null;
          message: string | null;
          expires_at: string;
          match_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          requester_id: string;
          recipient_id: string;
          status?: "pending" | "accepted" | "declined" | "expired" | "withdrawn";
          proposed_at?: string;
          proposed_format: "best_of_1" | "best_of_3" | "best_of_5";
          location_name?: string | null;
          location_city?: string | null;
          message?: string | null;
          match_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["match_requests"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "match_requests_requester_id_fkey";
            columns: ["requester_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "match_requests_recipient_id_fkey";
            columns: ["recipient_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      elo_history: {
        Row: {
          id: string;
          player_id: string;
          match_id: string | null;
          elo_before: number;
          elo_after: number;
          elo_delta: number;
          reason: string;
          provisional: boolean;
          recorded_at: string;
        };
        Insert: {
          player_id: string;
          match_id?: string | null;
          elo_before: number;
          elo_after: number;
          elo_delta: number;
          reason: string;
          provisional: boolean;
        };
        Update: never;
        Relationships: [
          {
            foreignKeyName: "elo_history_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      conversations: {
        Row: {
          id: string;
          player1_id: string;
          player2_id: string;
          last_message_at: string | null;
          created_at: string;
        };
        Insert: {
          player1_id: string;
          player2_id: string;
          last_message_at?: string | null;
        };
        Update: {
          last_message_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "conversations_player1_id_fkey";
            columns: ["player1_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "conversations_player2_id_fkey";
            columns: ["player2_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          conversation_id: string;
          sender_id: string;
          content: string;
          read_at?: string | null;
        };
        Update: {
          read_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      venues: {
        Row: {
          id: string;
          name: string;
          city: string;
          country: string;
          address: string | null;
          phone: string | null;
          website: string | null;
          surfaces: string[] | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          name: string;
          city: string;
          country?: string;
          address?: string | null;
          phone?: string | null;
          website?: string | null;
          surfaces?: string[] | null;
          is_active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["venues"]["Insert"]>;
        Relationships: [];
      };
      courts: {
        Row: {
          id: string;
          venue_id: string;
          name: string;
          surface: string;
          is_indoor: boolean;
          price_per_hour: number | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          venue_id: string;
          name: string;
          surface: string;
          is_indoor?: boolean;
          price_per_hour?: number | null;
          is_active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["courts"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "courts_venue_id_fkey";
            columns: ["venue_id"];
            isOneToOne: false;
            referencedRelation: "venues";
            referencedColumns: ["id"];
          }
        ];
      };
      court_bookings: {
        Row: {
          id: string;
          court_id: string;
          booked_by: string;
          match_id: string | null;
          starts_at: string;
          ends_at: string;
          status: "confirmed" | "cancelled";
          notes: string | null;
          created_at: string;
        };
        Insert: {
          court_id: string;
          booked_by: string;
          match_id?: string | null;
          starts_at: string;
          ends_at: string;
          status?: "confirmed" | "cancelled";
          notes?: string | null;
        };
        Update: {
          status?: "confirmed" | "cancelled";
          notes?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "court_bookings_court_id_fkey";
            columns: ["court_id"];
            isOneToOne: false;
            referencedRelation: "courts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "court_bookings_booked_by_fkey";
            columns: ["booked_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      leaderboard: {
        Row: {
          id: string;
          username: string;
          full_name: string;
          avatar_url: string | null;
          elo_rating: number;
          elo_provisional: boolean;
          skill_level: string;
          matches_played: number;
          matches_won: number;
          matches_lost: number;
          city: string | null;
          country: string;
          rank: number;
          country_rank: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      process_match_result: {
        Args: { p_match_id: string };
        Returns: void;
      };
      expire_match_requests: {
        Args: Record<string, never>;
        Returns: number;
      };
    };
    Enums: {
      skill_level: "beginner" | "intermediate" | "advanced" | "professional";
      match_status: "pending" | "accepted" | "pending_confirmation" | "completed" | "cancelled" | "disputed";
      match_format: "best_of_1" | "best_of_3" | "best_of_5";
      request_status: "pending" | "accepted" | "declined" | "expired" | "withdrawn";
    };
    CompositeTypes: Record<string, never>;
  };
};
