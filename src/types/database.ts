export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          plan: "free" | "pro" | "enterprise";
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at" | "updated_at"> & { created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      instagram_accounts: {
        Row: {
          id: string;
          user_id: string;
          ig_user_id: string;
          username: string;
          access_token: string;
          token_expires_at: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["instagram_accounts"]["Row"], "id" | "created_at" | "updated_at"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["instagram_accounts"]["Insert"]>;
      };
      templates: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          preview_url: string | null;
          primary_color: string;
          secondary_color: string;
          accent_color: string | null;
          font_family: string;
          layout_type: "split" | "centered" | "sidebar" | "overlay" | "minimal";
          tags: string[];
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["templates"]["Row"], "created_at"> & { created_at?: string };
        Update: Partial<Database["public"]["Tables"]["templates"]["Insert"]>;
      };
      carousel_posts: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          caption: string | null;
          hashtags: string[];
          template_id: string | null;
          status: "draft" | "pending" | "scheduled" | "published" | "failed" | "cancelled";
          generation_prompt: string | null;
          ai_metadata: Json;
          scheduled_at: string | null;
          published_at: string | null;
          ig_media_id: string | null;
          ig_permalink: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["carousel_posts"]["Row"], "id" | "created_at" | "updated_at"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["carousel_posts"]["Insert"]>;
      };
      carousel_slides: {
        Row: {
          id: string;
          post_id: string;
          position: number;
          slide_type: "cover" | "content" | "cta";
          headline: string | null;
          subheadline: string | null;
          body: string | null;
          cta_text: string | null;
          image_url: string | null;
          render_config: Json;
          rendered_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["carousel_slides"]["Row"], "id" | "created_at"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["carousel_slides"]["Insert"]>;
      };
      media_assets: {
        Row: {
          id: string;
          user_id: string;
          filename: string;
          original_url: string;
          cdn_url: string;
          mime_type: string;
          size_bytes: number;
          width: number | null;
          height: number | null;
          tags: string[];
          collection: string | null;
          source: "upload" | "generated" | "unsplash";
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["media_assets"]["Row"], "id" | "created_at"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["media_assets"]["Insert"]>;
      };
      scheduled_posts: {
        Row: {
          id: string;
          post_id: string;
          instagram_account_id: string;
          scheduled_at: string;
          status: "pending" | "processing" | "done" | "failed";
          attempts: number;
          last_attempt_at: string | null;
          error_message: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["scheduled_posts"]["Row"], "id" | "created_at"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["scheduled_posts"]["Insert"]>;
      };
      generation_logs: {
        Row: {
          id: string;
          user_id: string;
          post_id: string | null;
          operation: "content" | "template_select" | "render" | "publish";
          model: string | null;
          prompt_tokens: number | null;
          completion_tokens: number | null;
          duration_ms: number | null;
          status: "success" | "error";
          error: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["generation_logs"]["Row"], "id" | "created_at"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["generation_logs"]["Insert"]>;
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          entity: string;
          entity_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["audit_logs"]["Row"], "id" | "created_at"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["audit_logs"]["Insert"]>;
      };
      settings: {
        Row: {
          user_id: string;
          default_template_id: string | null;
          default_timezone: string;
          ig_account_id: string | null;
          ai_tone: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["settings"]["Row"]> & { user_id: string };
        Update: Partial<Database["public"]["Tables"]["settings"]["Row"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// Convenience type aliases
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type InstagramAccount = Database["public"]["Tables"]["instagram_accounts"]["Row"];
export type Template = Database["public"]["Tables"]["templates"]["Row"];
export type CarouselPost = Database["public"]["Tables"]["carousel_posts"]["Row"];
export type CarouselSlide = Database["public"]["Tables"]["carousel_slides"]["Row"];
export type MediaAsset = Database["public"]["Tables"]["media_assets"]["Row"];
export type ScheduledPost = Database["public"]["Tables"]["scheduled_posts"]["Row"];
export type GenerationLog = Database["public"]["Tables"]["generation_logs"]["Row"];
export type AuditLog = Database["public"]["Tables"]["audit_logs"]["Row"];
export type Settings = Database["public"]["Tables"]["settings"]["Row"];

export type PostStatus = CarouselPost["status"];
export type SlideType = CarouselSlide["slide_type"];
export type MediaSource = MediaAsset["source"];
export type LayoutType = Template["layout_type"];
