"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/lib/useSubscription";
import { SUBSCRIPTION_PLANS, ANNUAL_PLANS } from "@/lib/mollie-types";

interface SubscriptionButtonProps {
  planId: string;
  isYearly?: boolean;
  className?: string;
  onSuccess?: (checkoutUrl: string) => void;
  onError?: (error: string) => void;
}

export function SubscriptionButton({
  planId,
  isYearly = false,
  className,
  onSuccess,
  onError,
}: SubscriptionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { subscription, createSubscription } = useSubscription();

  const plan = isYearly ? ANNUAL_PLANS[planId] : SUBSCRIPTION_PLANS[planId];

  if (!plan) {
    return null;
  }

  const isCurrentPlan = subscription?.planId === planId;
  const isFreePlan = plan.price === 0;
  const isActive =
    subscription?.status === "active" || subscription?.status === "trialing";

  const handleClick = async () => {
    console.log("handleClick", isCurrentPlan, isActive);
    if (isCurrentPlan && isActive) {
      return; // Already subscribed to this plan
    }

    setIsLoading(true);
    console.log("createSubscription", planId, plan.trialDays);
    try {
      const result = await createSubscription(planId, plan.trialDays);

      if (result.success) {
        if (result.checkoutUrl) {
          // Redirect to Mollie checkout
          window.location.href = result.checkoutUrl;
          onSuccess?.(result.checkoutUrl);
        } else {
          // Free plan - no checkout needed
          onSuccess?.("");
        }
      } else {
        onError?.(result.error || "Failed to create subscription");
      }
    } catch (error) {
      onError?.(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonText = () => {
    if (isCurrentPlan && isActive) {
      return "Current Plan";
    }

    if (isFreePlan) {
      return "Get Started Free";
    }

    if (plan.trialDays && plan.trialDays > 0) {
      return `Start ${plan.trialDays}-Day Trial`;
    }

    return `Subscribe to ${plan.name}`;
  };

  const getButtonVariant = () => {
    if (isCurrentPlan && isActive) {
      return "secondary";
    }

    if (planId === "pro") {
      return "default"; // Primary for Pro plan
    }

    return "outline";
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading || (isCurrentPlan && isActive)}
      className={className}
      variant={getButtonVariant()}
    >
      {isLoading ? "Processing..." : getButtonText()}
    </Button>
  );
}
