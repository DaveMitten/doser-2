import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { Database } from "./database.types";
import { Vaporizer } from "../context/data-types";

export type Session = Database["public"]["Tables"]["sessions"]["Row"];
type SessionInsert = Database["public"]["Tables"]["sessions"]["Insert"];

export interface SessionFormData {
  date: string;
  time: string;
  duration: string;
  method: string;
  device: string;
  temperature: string;
  totalSessionInhalations: string;
  inhalationsPerCapsule: string;
  unitType: string;
  unitCapacity: string;
  unitAmount: string;
  thcPercentage: string;
  cbdPercentage: string;

  higherAccuracy: boolean;
  totalTHC: string;
  totalCBD: string;
  rating: number;
  notes: string;
}

export interface SessionEffects {
  effects: string[];
}

export interface EnhancedCalculatedTotals {
  thc: number;
  cbd: number;
  originalThc: number;
  originalCbd: number;
  consumedThc: number;
  consumedCbd: number;
  consumptionRatio: number;
  remainingMaterial: number;
}

export class SessionService {
  private supabase: any = createSupabaseBrowserClient();

  /**
   * Create a new session in the database
   */
  async createSession(
    formData: SessionFormData,
    effects: string[],
    calculatedTotals: EnhancedCalculatedTotals | null,
    selectedDevice: Vaporizer,
    temperatureUnit: "celsius" | "fahrenheit"
  ): Promise<{ data: Session | null; error: unknown }> {
    try {
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await this.supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("User not authenticated");
      }

      // Parse form data without validation
      const duration = parseInt(formData.duration);
      const unitAmount = parseInt(formData.unitAmount);
      const thcPercentage = parseFloat(formData.thcPercentage);
      const cbdPercentage = parseFloat(formData.cbdPercentage);

      // Handle total_session_inhalations based on higher_accuracy_mode
      let totalInhalations: number | null = null;
      if (formData.higherAccuracy && formData.totalSessionInhalations) {
        totalInhalations = parseInt(formData.totalSessionInhalations);
      } else if (!formData.higherAccuracy && formData.totalSessionInhalations) {
        totalInhalations = parseInt(formData.totalSessionInhalations);
      }

      // Parse and prepare session data
      const sessionData: SessionInsert = {
        user_id: user.id,
        session_date: formData.date,
        session_time: formData.time,
        duration_minutes: duration,
        device_name: formData.device,
        total_session_inhalations: totalInhalations,
        unit_type: formData.unitType,
        unit_amount: unitAmount,
        unit_capacity_grams: formData.unitType
          ? selectedDevice?.dosingCapsuleCapacity || 0
          : selectedDevice?.chamberCapacity || 0,
        thc_percentage: thcPercentage,
        cbd_percentage: cbdPercentage,
        total_thc_mg: calculatedTotals?.thc || 0,
        total_cbd_mg: calculatedTotals?.cbd || 0,
        higher_accuracy_mode: formData.higherAccuracy,
        inhalations_per_capsule: formData.higherAccuracy
          ? parseInt(formData.inhalationsPerCapsule)
          : null,
        effects: effects,
        rating: formData.rating > 0 ? formData.rating : null,
        notes: formData.notes || null,
      };

      // Store enhanced calculation data in notes if available
      if (calculatedTotals && formData.higherAccuracy) {
        const enhancedData = {
          originalNotes: formData.notes || "",
          enhancedCalculations: {
            originalThc: calculatedTotals.originalThc,
            originalCbd: calculatedTotals.originalCbd,
            consumedThc: calculatedTotals.consumedThc,
            consumedCbd: calculatedTotals.consumedCbd,
            consumptionRatio: calculatedTotals.consumptionRatio,
            remainingMaterial: calculatedTotals.remainingMaterial,
            calculationMethod: "inhalation-based",
            timestamp: new Date().toISOString(),
          },
        };

        // Combine original notes with enhanced data
        sessionData.notes = JSON.stringify(enhancedData);
      }

      // Handle temperature - store in both units if provided
      if (formData.temperature) {
        const tempValue = parseFloat(formData.temperature);
        if (!isNaN(tempValue)) {
          // Store temperature based on the unit the user selected
          if (temperatureUnit === "celsius") {
            // User entered temperature in Celsius
            sessionData.temperature_celsius = tempValue;
            // Convert to Fahrenheit for storage
            sessionData.temperature_fahrenheit = (tempValue * 9) / 5 + 32;
          } else {
            // User entered temperature in Fahrenheit
            sessionData.temperature_fahrenheit = tempValue;
            // Convert to Celsius for storage
            sessionData.temperature_celsius = ((tempValue - 32) * 5) / 9;
          }
        }
      }

      // Insert the session
      const { data, error } = await this.supabase
        .from("sessions")
        .insert(sessionData)
        .select()
        .single();

      if (error) {
        console.error("Error creating session:", error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Error in createSession:", error);
      return { data: null, error };
    }
  }

  /**
   * Parse enhanced calculation data from session notes
   */
  parseEnhancedCalculations(session: Session): {
    hasEnhancedData: boolean;
    originalThc: number | null;
    originalCbd: number | null;
    consumedThc: number | null;
    consumedCbd: number | null;
    consumptionRatio: number | null;
    remainingMaterial: number | null;
    calculationMethod: string | null;
  } {
    try {
      if (!session.notes || !session.higher_accuracy_mode) {
        return {
          hasEnhancedData: false,
          originalThc: null,
          originalCbd: null,
          consumedThc: null,
          consumedCbd: null,
          consumptionRatio: null,
          remainingMaterial: null,
          calculationMethod: null,
        };
      }

      const parsedNotes = JSON.parse(session.notes);
      if (parsedNotes.enhancedCalculations) {
        const enhanced = parsedNotes.enhancedCalculations;
        return {
          hasEnhancedData: true,
          originalThc: enhanced.originalThc || null,
          originalCbd: enhanced.originalCbd || null,
          consumedThc: enhanced.consumedThc || null,
          consumedCbd: enhanced.consumedCbd || null,
          consumptionRatio: enhanced.consumptionRatio || null,
          remainingMaterial: enhanced.remainingMaterial || null,
          calculationMethod: enhanced.calculationMethod || null,
        };
      }
    } catch (error) {
      console.warn("Failed to parse enhanced calculations from notes:", error);
    }

    return {
      hasEnhancedData: false,
      originalThc: null,
      originalCbd: null,
      consumedThc: null,
      consumedCbd: null,
      consumptionRatio: null,
      remainingMaterial: null,
      calculationMethod: null,
    };
  }

  /**
   * Get all sessions for the current user
   */
  async getUserSessions(): Promise<{ data: Session[] | null; error: unknown }> {
    try {
      const {
        data: { user },
        error: userError,
      } = await this.supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await this.supabase
        .from("sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("session_date", { ascending: false })
        .order("session_time", { ascending: false });

      if (error) {
        console.error("Error fetching sessions:", error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Error in getUserSessions:", error);
      return { data: null, error };
    }
  }

  /**
   * Get a single session by ID
   */
  async getSessionById(
    sessionId: string
  ): Promise<{ data: Session | null; error: unknown }> {
    try {
      const {
        data: { user },
        error: userError,
      } = await this.supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await this.supabase
        .from("sessions")
        .select("*")
        .eq("id", sessionId)
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching session:", error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Error in getSessionById:", error);
      return { data: null, error };
    }
  }

  /**
   * Update an existing session
   */
  async updateSession(
    sessionId: string,
    updates: Partial<SessionInsert>
  ): Promise<{ data: Session | null; error: unknown }> {
    try {
      const {
        data: { user },
        error: userError,
      } = await this.supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await this.supabase
        .from("sessions")
        .update(updates)
        .eq("id", sessionId)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating session:", error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Error in updateSession:", error);
      return { data: null, error };
    }
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string): Promise<{ error: unknown }> {
    try {
      const {
        data: { user },
        error: userError,
      } = await this.supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("User not authenticated");
      }

      const { error } = await this.supabase
        .from("sessions")
        .delete()
        .eq("id", sessionId)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error deleting session:", error);
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error("Error in deleteSession:", error);
      return { error };
    }
  }
}

// Export a singleton instance
export const sessionService = new SessionService();
