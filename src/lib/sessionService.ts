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
  unit: string;
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
  private supabase = createSupabaseBrowserClient();

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

      // Validate required fields
      if (!formData.duration || formData.duration.trim() === "") {
        throw new Error("Duration is required");
      }

      if (!formData.device || formData.device.trim() === "") {
        throw new Error("Device is required");
      }

      if (!formData.unitAmount || formData.unitAmount.trim() === "") {
        throw new Error("Unit amount is required");
      }

      if (!formData.thcPercentage || formData.thcPercentage.trim() === "") {
        throw new Error("THC percentage is required");
      }

      if (!formData.cbdPercentage || formData.cbdPercentage.trim() === "") {
        throw new Error("CBD percentage is required");
      }

      // Validate numeric constraints
      const duration = parseInt(formData.duration);
      if (isNaN(duration) || duration <= 0 || duration > 300) {
        throw new Error("Duration must be between 1 and 300 minutes");
      }

      const unitAmount = parseInt(formData.unitAmount);
      if (isNaN(unitAmount) || unitAmount <= 0 || unitAmount > 10) {
        throw new Error("Unit amount must be between 1 and 10");
      }

      const thcPercentage = parseFloat(formData.thcPercentage);
      if (isNaN(thcPercentage) || thcPercentage < 0 || thcPercentage > 100) {
        throw new Error("THC percentage must be between 0 and 100");
      }

      const cbdPercentage = parseFloat(formData.cbdPercentage);
      if (isNaN(cbdPercentage) || cbdPercentage < 0 || cbdPercentage > 100) {
        throw new Error("CBD percentage must be between 0 and 100");
      }

      // Validate effects array
      if (!effects || effects.length === 0) {
        throw new Error("At least one effect must be selected");
      }

      // Handle total_session_inhalations based on higher_accuracy_mode
      let totalInhalations: number | null = null;
      if (formData.higherAccuracy) {
        // In higher accuracy mode, total_session_inhalations is required and must be 1-50
        if (
          !formData.totalSessionInhalations ||
          formData.totalSessionInhalations.trim() === ""
        ) {
          throw new Error(
            "Total session inhalations is required in higher accuracy mode"
          );
        }

        totalInhalations = parseInt(formData.totalSessionInhalations);
        if (
          isNaN(totalInhalations) ||
          totalInhalations <= 0 ||
          totalInhalations > 50
        ) {
          throw new Error(
            "Total session inhalations must be between 1 and 50 in higher accuracy mode"
          );
        }
      } else {
        // In regular mode, total_session_inhalations is optional and can be null
        if (
          formData.totalSessionInhalations &&
          formData.totalSessionInhalations.trim() !== ""
        ) {
          totalInhalations = parseInt(formData.totalSessionInhalations);
          if (isNaN(totalInhalations) || totalInhalations < 0) {
            throw new Error("Total session inhalations must be 0 or greater");
          }
        }
        // If not provided, totalInhalations remains null (which is correct)
      }

      // Parse and validate form data
      const sessionData: SessionInsert = {
        user_id: user.id,
        session_date: formData.date,
        session_time: formData.time,
        duration_minutes: duration,
        device_name: formData.device,
        total_session_inhalations: totalInhalations,
        unit_type: formData.unit.includes("capsule") ? "capsule" : "chamber",
        unit_amount: unitAmount,
        unit_capacity_grams: formData.unit.includes("capsule")
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
