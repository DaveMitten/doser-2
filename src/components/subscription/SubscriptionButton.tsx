"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/lib/useSubscription";
import { PlanService } from "../../lib/plan-service";
import { subscriptionIdToName } from "../../lib/utils";

interface SubscriptionButtonProps {
  planId: string;
  isYearly?: boolean;
  className?: string;
  onSuccess?: (checkoutUrl: string) => void;
  onError?: (error: string) => void;
  onClick?: () => void;
}

export function SubscriptionButton({
  planId,
  isYearly = false,
  className,
  onSuccess,
  onError,
  onClick,
}: SubscriptionButtonProps) {
  console.log("plan key", planId);
  const [isLoading, setIsLoading] = useState(false);
  const { subscription, createSubscription } = useSubscription();

  const isCurrentPlan = subscription?.plan_id === planId;
  const isActive = subscription?.status === "active";

  const plan = PlanService.getPlanDetails(planId, isYearly);

  const handleClick = async () => {
    // Call the external onClick handler first
    onClick?.();

    console.log("handleClick", { isCurrentPlan, isActive, planId });
    if (isCurrentPlan && isActive) {
      console.log("Already subscribed to this plan, returning");
      return; // Already subscribed to this plan
    }

    setIsLoading(true);
    console.log("Creating subscription", {
      planId,
      trialDays: plan?.trialDays,
    });
    try {
      const result = await createSubscription(
        planId,
        plan?.trialDays,
        isYearly
      );
      console.log("createSubscription result:", result);

      if (result.success) {
        if (result.checkoutUrl) {
          console.log("Redirecting to checkout URL:", result.checkoutUrl);
          // Redirect to Dodo Payments checkout
          window.location.href = result.checkoutUrl;
          onSuccess?.(result.checkoutUrl);
        } else {
          console.log("Free plan - no checkout needed");
          // Free plan - no checkout needed
          onSuccess?.("");
        }
      } else {
        console.error("Subscription creation failed:", result.error);
        onError?.(result.error || "Failed to create subscription");
      }
    } catch (error) {
      console.error("Error in handleClick:", error);
      onError?.(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonText = () => {
    if (isCurrentPlan && isActive) {
      return "Current Plan";
    }

    if (plan?.trialDays && plan.trialDays > 0) {
      return `Start ${plan?.trialDays}-Day Trial`;
    }

    return `Start ${plan?.trialDays}-Day Trial`;
  };

  const getButtonVariant = () => {
    if (isCurrentPlan && isActive) {
      return "secondary";
    }

    if (subscriptionIdToName[planId] === "Track") {
      return "default"; // Primary for Track plan
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
