import { UserSubscription } from "./dodo-types";
import { subscriptionIdToName } from "./utils";
import { useUserData } from "@/context/UserDataContext";
import * as Sentry from "@sentry/nextjs";

const { logger } = Sentry;

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

  // Check if subscription is truly active (not expired)
  const hasActiveSubscription = (() => {
    if (!subscription) return false;

    const now = new Date();

    // Check status field
    if (!["active", "trialing"].includes(subscription.status)) {
      return false;
    }

    // For trialing subscriptions, check trial_end
    if (subscription.status === "trialing") {
      if (subscription.trial_end) {
        const trialEnd = new Date(subscription.trial_end);
        const isExpired = trialEnd <= now;

        if (isExpired) {
          logger.warn("Trial subscription expired (client-side check)", {
            userId: subscription.user_id,
            subscriptionId: subscription.id,
            trialEnd: subscription.trial_end,
            status: subscription.status,
            daysExpired: Math.floor((now.getTime() - trialEnd.getTime()) / (1000 * 60 * 60 * 24))
          });
        }

        return !isExpired;
      }
    }

    // For active subscriptions, check current_period_end
    if (subscription.status === "active") {
      if (subscription.current_period_end) {
        const periodEnd = new Date(subscription.current_period_end);
        const isExpired = periodEnd <= now;

        if (isExpired) {
          logger.warn("Active subscription expired (client-side check)", {
            userId: subscription.user_id,
            subscriptionId: subscription.id,
            currentPeriodEnd: subscription.current_period_end,
            status: subscription.status,
            daysExpired: Math.floor((now.getTime() - periodEnd.getTime()) / (1000 * 60 * 60 * 24))
          });
        }

        return !isExpired;
      }
    }

    // Default to status field if no dates available
    return true;
  })();

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
