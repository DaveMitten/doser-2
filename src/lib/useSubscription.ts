import { useState, useEffect } from "react";
import { UserSubscription } from "./mollie-types";

interface UseSubscriptionReturn {
  subscription: UserSubscription | null;
  hasActiveSubscription: boolean;
  isLoading: boolean;
  error: string | null;
  createSubscription: (
    planId: string,
    trialDays?: number
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

  const createSubscription = async (planId: string, trialDays?: number) => {
    try {
      const response = await fetch("/api/subscriptions/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planId, trialDays }),
      });

      const data = await response.json();
      console.log("createSubscription data", data);
      if (!response.ok) {
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

    // Free plan has limited access
    if (subscription.planId === "starter") {
      return [
        "basic_calculator",
        "safety_guidelines",
        "session_tracking",
        "30_days_session_history",
      ].includes(feature);
    }

    // Pro plan features
    if (subscription.planId === "pro") {
      const proFeatures = [
        "basic_calculator",
        "unlimited_calculations",
        "unlimited_session_history",
        "session_tracking",
        "weekly_insights",
      ];
      return proFeatures.includes(feature);
    }

    // Expert plan has all features
    if (subscription.planId === "expert") {
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
