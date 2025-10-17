import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export interface TrialStatus {
  isExpired: boolean;
  daysRemaining: number;
  selectedPlan: string | null;
  subscriptionStatus: string;
  trialStartDate: string | null;
}

export class TrialService {
  /**
   * Check if a user's trial has expired (client-side)
   */
  static async checkTrialStatus(userId: string): Promise<TrialStatus> {
    return this.checkTrialStatusClient(userId);
  }

  /**
   * Check trial status on the client side
   */
  static async checkTrialStatusClient(userId: string): Promise<TrialStatus> {
    const supabase = createSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("profiles")
      .select(
        "selected_plan, trial_start_date, trial_expired, subscription_status"
      )
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error checking trial status:", error);
      return {
        isExpired: true,
        daysRemaining: 0,
        selectedPlan: null,
        subscriptionStatus: "unknown",
        trialStartDate: null,
      };
    }

    const trialStartDate = data.trial_start_date
      ? new Date(data.trial_start_date)
      : null;
    const now = new Date();

    let daysRemaining = 0;
    let isExpired = data.trial_expired;

    if (trialStartDate && !isExpired) {
      const daysSinceStart = Math.floor(
        (now.getTime() - trialStartDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      daysRemaining = Math.max(0, 7 - daysSinceStart);
      isExpired = daysRemaining <= 0;
    }

    return {
      isExpired,
      daysRemaining,
      selectedPlan: data.selected_plan,
      subscriptionStatus: data.subscription_status,
      trialStartDate: data.trial_start_date,
    };
  }

  /**
   * Get trial expiration date for a user
   */
  static getTrialExpirationDate(trialStartDate: string | null): Date | null {
    if (!trialStartDate) return null;

    const startDate = new Date(trialStartDate);
    const expirationDate = new Date(
      startDate.getTime() + 7 * 24 * 60 * 60 * 1000
    ); // Add 7 days
    return expirationDate;
  }

  /**
   * Format trial status for display
   */
  static formatTrialStatus(status: TrialStatus): string {
    if (status.isExpired) {
      return "Trial expired";
    }

    if (status.daysRemaining === 0) {
      return "Trial expires today";
    }

    if (status.daysRemaining === 1) {
      return "Trial expires tomorrow";
    }

    return `${status.daysRemaining} days remaining`;
  }
}
