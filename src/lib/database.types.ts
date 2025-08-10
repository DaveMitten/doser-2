export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      sessions: {
        Row: {
          id: string;
          user_id: string;
          session_date: string;
          session_time: string;
          duration_minutes: number;
          device_name: string;
          temperature_celsius: number | null;
          temperature_fahrenheit: number | null;
          draws_count: number;
          material_type: string;
          material_amount: number;
          material_capacity_grams: number;
          thc_percentage: number;
          cbd_percentage: number;
          total_thc_mg: number;
          total_cbd_mg: number;
          higher_accuracy_mode: boolean;
          inhalations_per_capsule: number | null;
          effects: string[];
          rating: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_date: string;
          session_time: string;
          duration_minutes: number;
          device_name: string;
          temperature_celsius?: number | null;
          temperature_fahrenheit?: number | null;
          draws_count: number;
          material_type: string;
          material_amount: number;
          material_capacity_grams: number;
          thc_percentage: number;
          cbd_percentage: number;
          total_thc_mg: number;
          total_cbd_mg: number;
          higher_accuracy_mode?: boolean;
          inhalations_per_capsule?: number | null;
          effects: string[];
          rating?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          session_date?: string;
          session_time?: string;
          duration_minutes?: number;
          device_name?: string;
          temperature_celsius?: number | null;
          temperature_fahrenheit?: number | null;
          draws_count?: number;
          material_type?: string;
          material_amount?: number;
          material_capacity_grams?: number;
          thc_percentage?: number;
          cbd_percentage?: number;
          total_thc_mg?: number;
          total_cbd_mg?: number;
          higher_accuracy_mode?: boolean;
          inhalations_per_capsule?: number | null;
          effects?: string[];
          rating?: number | null;
          notes?: string | null;
          updated_at?: string;
        };
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          default_vape_type: string | null;
          inhalations_per_capsule: number | null;
          preferred_dose_unit: string | null;
          temperature_unit: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          default_vape_type?: string | null;
          inhalations_per_capsule?: number | null;
          preferred_dose_unit?: string | null;
          temperature_unit?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          default_vape_type?: string | null;
          inhalations_per_capsule?: number | null;
          preferred_dose_unit?: string | null;
          temperature_unit?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
