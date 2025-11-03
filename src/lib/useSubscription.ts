import { UserSubscription } from "./dodo-types";
import { subscriptionIdToName } from "./utils";
import { useUserData } from "@/context/UserDataContext";

interface UseSubscriptionReturn {
  subscription: UserSubscription | null;
  hasActiveSubscription: boolean;
  isLoading: boolean;
  error: string | null;
  createSubscription: (
    planId: string,
    trialDays?: number,
    isYearly?: boolean
  ) => Promise<{ success: boolean; checkoutUrl?: string; error?: string }>;
  cancelSubscription: () => Promise<{ success: boolean; error?: string }>;
  hasFeatureAccess: (feature: string) => boolean;
  refetch: () => Promise<void>;
  // Trial-related helpers
  isTrialActive: boolean;
  isTrialExpired: boolean;
  daysRemaining: number;
  trialEndsAt: Date | null;
}

export function useSubscription(): UseSubscriptionReturn {
  // Get subscription data from context
  const {
    subscription,
    isLoading,
    error,
    refetch: refetchContext,
  } = useUserData();

  const hasActiveSubscription = subscription
    ? ["active", "trialing"].includes(subscription.status)
    : false;

  const createSubscription = async (
    planId: string,
    trialDays?: number,
    isYearly?: boolean
  ) => {
    try {
      // console.log("Making API call to create subscription", {
      //   planId,
      //   trialDays,
      //   isYearly,
      // });
      const response = await fetch("/api/subscriptions/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planId, trialDays, isYearly }),
      });

      // console.log("API response status:", response.status);
      const data = await response.json();
      // console.log("createSubscription data", data);

      if (!response.ok) {
        console.error("API error:", data);
        return {
          success: false,
          error: data.error || "Failed to create subscription",
        };
      }

      // If successful, refetch subscription status from context
      if (data.success) {
        await refetchContext();
      }

      return data;
    } catch (err) {
      console.error("Error in createSubscription:", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }
  };

  const cancelSubscription = async () => {
    try {
      const response = await fetch("/api/subscriptions/cancel", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || "Failed to cancel subscription",
        };
      }

      // Refetch subscription status after cancellation from context
      await refetchContext();

      return data;
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }
  };

  const hasFeatureAccess = (feature: string): boolean => {
    if (!subscription) return false;

    // Learn plan has limited access
    if (subscriptionIdToName[subscription.id] === "Learn") {
      return [
        "basic_calculator",
        "safety_guidelines",
        "session_tracking",
        "30_days_session_history",
      ].includes(feature);
    }

    // Track plan features
    if (subscriptionIdToName[subscription.id] === "Track") {
      const trackFeatures = [
        "basic_calculator",
        "unlimited_calculations",
        "unlimited_session_history",
        "session_tracking",
        "weekly_insights",
      ];
      return trackFeatures.includes(feature);
    }

    // Optimize plan has all features
    if (subscriptionIdToName[subscription.id] === "Optimize") {
      return true;
    }

    return false;
  };

  // Calculate trial status
  const isTrialActive: boolean = (() => {
    if (!subscription) return false;
    if (subscription.status !== "trialing") return false;
    if (!subscription.trial_end) return false;
    return new Date(subscription.trial_end) > new Date();
  })();

  const isTrialExpired: boolean = (() => {
    if (!subscription) return false;
    if (subscription.status !== "trialing") return false;
    if (!subscription.trial_end) return false;
    return new Date(subscription.trial_end) <= new Date();
  })();

  const trialEndsAt: Date | null = subscription?.trial_end
    ? new Date(subscription.trial_end)
    : null;

  const daysRemaining: number = trialEndsAt
    ? Math.max(
        0,
        Math.ceil(
          (trialEndsAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        )
      )
    : 0;

  return {
    subscription,
    hasActiveSubscription,
    isLoading,
    error,
    createSubscription,
    cancelSubscription,
    hasFeatureAccess,
    refetch: refetchContext,
    // Trial helpers
    isTrialActive,
    isTrialExpired,
    daysRemaining,
    trialEndsAt,
  };
}
