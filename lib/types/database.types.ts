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
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          resource_type: string
          resource_id: string | null
          metadata: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          resource_type: string
          resource_id?: string | null
          metadata?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          resource_type?: string
          resource_id?: string | null
          metadata?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
      co_parent_messages: {
        Row: {
          id: string
          user_id: string
          text: string
          sender_id: string
          co_parent_email: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          text: string
          sender_id: string
          co_parent_email?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          text?: string
          sender_id?: string
          co_parent_email?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          user_id: string
          name: string
          mime_type: string
          folder: Database['public']['Enums']['document_folder']
          file_path: string | null
          structured_data: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          mime_type: string
          folder: Database['public']['Enums']['document_folder']
          file_path?: string | null
          structured_data?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          mime_type?: string
          folder?: Database['public']['Enums']['document_folder']
          file_path?: string | null
          structured_data?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      incident_templates: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          category: Database['public']['Enums']['incident_category']
          tags: string[]
          legal_context: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          category: Database['public']['Enums']['incident_category']
          tags?: string[]
          legal_context?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          category?: Database['public']['Enums']['incident_category']
          tags?: string[]
          legal_context?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          role: string | null
          children: string[]
          subscription_tier: Database['public']['Enums']['subscription_tier']
          stripe_customer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          role?: string | null
          children?: string[]
          subscription_tier?: Database['public']['Enums']['subscription_tier']
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: string | null
          children?: string[]
          subscription_tier?: Database['public']['Enums']['subscription_tier']
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          user_id: string
          content: string
          category: Database['public']['Enums']['incident_category']
          tags: string[]
          legal_context: string | null
          images: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          category: Database['public']['Enums']['incident_category']
          tags?: string[]
          legal_context?: string | null
          images?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          category?: Database['public']['Enums']['incident_category']
          tags?: string[]
          legal_context?: string | null
          images?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_subscription_id: string | null
          status: string
          current_period_start: string | null
          current_period_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_subscription_id?: string | null
          status: string
          current_period_start?: string | null
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_subscription_id?: string | null
          status?: string
          current_period_start?: string | null
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      token_usage: {
        Row: {
          id: string
          user_id: string
          used: number
          reset_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          used?: number
          reset_date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          used?: number
          reset_date?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      document_folder: 'Drafted Motions' | 'Forensic Analyses' | 'Evidence Packages' | 'User Uploads'
      incident_category: 'Communication Issue' | 'Scheduling Conflict' | 'Financial Dispute' | 'Missed Visitation' | 'Parental Alienation Concern' | 'Child Wellbeing' | 'Legal Documentation' | 'Other'
      subscription_tier: 'Free' | 'Plus' | 'Pro'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}