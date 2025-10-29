export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      subscriptions: {
        Row: {
          id: string
          stripe_subscription_id: string | null
          stripe_customer_id: string | null
          plan_type: string
          status: string
          current_period_start: string | null
          current_period_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          plan_type?: string
          status?: string
          current_period_start?: string | null
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          plan_type?: string
          status?: string
          current_period_start?: string | null
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          subscription_id: string | null
          name: string
          role: string | null
          children: string[]
          email: string
          is_primary_account: boolean
          invited_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          subscription_id?: string | null
          name: string
          role?: string | null
          children?: string[]
          email: string
          is_primary_account?: boolean
          invited_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          subscription_id?: string | null
          name?: string
          role?: string | null
          children?: string[]
          email?: string
          is_primary_account?: boolean
          invited_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          subscription_id: string
          created_by: string
          content: string
          category: string
          tags: string[]
          legal_context: string | null
          images: string[]
          incident_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          subscription_id: string
          created_by: string
          content: string
          category: string
          tags?: string[]
          legal_context?: string | null
          images?: string[]
          incident_date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          subscription_id?: string
          created_by?: string
          content?: string
          category?: string
          tags?: string[]
          legal_context?: string | null
          images?: string[]
          incident_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          subscription_id: string
          created_by: string
          name: string
          mime_type: string
          data: string
          folder: string
          structured_data: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          subscription_id: string
          created_by: string
          name: string
          mime_type: string
          data: string
          folder: string
          structured_data?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          subscription_id?: string
          created_by?: string
          name?: string
          mime_type?: string
          data?: string
          folder?: string
          structured_data?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      incident_templates: {
        Row: {
          id: string
          subscription_id: string
          created_by: string
          title: string
          content: string
          category: string
          tags: string[]
          legal_context: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          subscription_id: string
          created_by: string
          title: string
          content: string
          category: string
          tags?: string[]
          legal_context?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          subscription_id?: string
          created_by?: string
          title?: string
          content?: string
          category?: string
          tags?: string[]
          legal_context?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          subscription_id: string
          sender_id: string
          text: string
          created_at: string
        }
        Insert: {
          id?: string
          subscription_id: string
          sender_id: string
          text: string
          created_at?: string
        }
        Update: {
          id?: string
          subscription_id?: string
          sender_id?: string
          text?: string
          created_at?: string
        }
      }
    }
  }
}

