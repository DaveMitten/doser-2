import { useState, useEffect } from "react";
import { UserSubscription } from "./dodo-types";

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
}

export function useSubscription(): UseSubscriptionReturn {
  const [subscription, setSubscription] = useState<UserSubscription | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hasActiveSubscription = subscription
    ? ["active", "trialing"].includes(subscription.status)
    : false;

  const fetchSubscription = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/subscriptions/status");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch subscription");
      }

      setSubscription(data.subscription);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      console.error("Error fetching subscription:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const createSubscription = async (
    planId: string,
    trialDays?: number,
    isYearly?: boolean
  ) => {
    try {
      console.log("Making API call to create subscription", {
        planId,
        trialDays,
        isYearly,
      });
      const response = await fetch("/api/subscriptions/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planId, trialDays, isYearly }),
      });

      console.log("API response status:", response.status);
      const data = await response.json();
      console.log("createSubscription data", data);

      if (!response.ok) {
        console.error("API error:", data);
        return {
          success: false,
          error: data.error || "Failed to create subscription",
        };
      }

      // If successful, refetch subscription status
      if (data.success) {
        await fetchSubscription();
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

      // Refetch subscription status after cancellation
      await fetchSubscription();

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
    if (subscription.planId === "learn") {
      return [
        "basic_calculator",
        "safety_guidelines",
        "session_tracking",
        "30_days_session_history",
      ].includes(feature);
    }

    // Track plan features
    if (subscription.planId === "track") {
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
    if (subscription.planId === "optimize") {
      return true;
    }

    return false;
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  return {
    subscription,
    hasActiveSubscription,
    isLoading,
    error,
    createSubscription,
    cancelSubscription,
    hasFeatureAccess,
    refetch: fetchSubscription,
  };
}
