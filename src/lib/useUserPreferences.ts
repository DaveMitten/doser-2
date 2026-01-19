import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { createSupabaseBrowserClient } from "./supabase-browser";

export interface UserPreferences {
  id: string;
  user_id: string;
  default_vape_type: string | null;
  inhalations_per_capsule: number | null;
  preferred_dose_unit: string | null;
  temperature_unit: "celsius" | "fahrenheit";
  created_at: string;
  updated_at: string;
}

export function useUserPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize the Supabase client to avoid recreating it on every render
  const supabase = useMemo(() => createSupabaseBrowserClient() as any, []);

  useEffect(() => {
    if (!user) {
      setPreferences(null);
      setLoading(false);
      return;
    }

    const fetchPreferences = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from("user_preferences")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (fetchError) {
          if (fetchError.code === "PGRST116") {
            // No preferences found, create default ones
            const { data: newPrefs, error: createError } = await supabase
              .from("user_preferences")
              .insert({
                user_id: user.id,
                temperature_unit: "celsius",
                preferred_dose_unit: "mg",
                inhalations_per_capsule: 8,
              })
              .select()
              .single();

            if (createError) {
              throw createError;
            }

            setPreferences(newPrefs);
          } else {
            throw fetchError;
          }
        } else {
          setPreferences(data);
        }
      } catch (err) {
        console.error("Error fetching user preferences:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch preferences"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [user, supabase]);

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!user || !preferences) return;

    try {
      setError(null);

      const { data, error: updateError } = await supabase
        .from("user_preferences")
        .update(updates)
        .eq("user_id", user.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      setPreferences(data);
      return data;
    } catch (err) {
      console.error("Error updating user preferences:", err);
      setError(
        err instanceof Error ? err.message : "Failed to update preferences"
      );
      throw err;
    }
  };

  const updateTemperatureUnit = async (unit: "celsius" | "fahrenheit") => {
    return updatePreferences({ temperature_unit: unit });
  };

  return {
    preferences,
    loading,
    error,
    updatePreferences,
    updateTemperatureUnit,
  };
}
