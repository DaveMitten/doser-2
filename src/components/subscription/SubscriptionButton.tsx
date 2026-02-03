"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/lib/useSubscription";
import { PlanService } from "../../lib/plan-service";
import { subscriptionIdToName } from "../../lib/utils";
import { useUserData } from "../../context/UserDataContext";

interface SubscriptionButtonProps {
  planId: string;
  isYearly?: boolean;
  className?: string;
  onSuccess?: (checkoutUrl: string) => void;
  onError?: (error: string) => void;
  onClick?: () => void;
  hasActiveSubscription?: boolean;
  onChangePlanClick?: () => void;
}

export function SubscriptionButton({
  planId,
  isYearly = false,
  className,
  onSuccess,
  onError,
  onClick,
  hasActiveSubscription = false,
  onChangePlanClick,
}: SubscriptionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { subscription, createSubscription } = useSubscription();

  const isCurrentPlan = subscription?.plan_id === planId;
  const isActive = subscription?.status === "active";

  const plan = PlanService.getPlanDetails(planId, isYearly);

  const handleClick = async () => {
    setIsLoading(true);

    // If user has active subscription but wants different plan, open modal
    if (hasActiveSubscription && !isCurrentPlan && onChangePlanClick) {
      // console.log("User wants to change plan, opening modal");
      onChangePlanClick();
      setIsLoading(false);
      return;
    }
    // Call the external onClick handler first
    onClick?.();

    // console.log("handleClick", {
    //   isCurrentPlan,
    //   isActive,
    //   planId,
    //   hasActiveSubscription,
    // });

    // If user is on the current plan with active paid subscription, do nothing
    if (isCurrentPlan && isActive) {
      // console.log("Already subscribed to this plan, returning");
      setIsLoading(false);
      return;
    }

    // If user is on trial for current plan, allow conversion to paid
    // (flow continues to create subscription)

    // console.log("Creating subscription", {
    // planId,
    // trialDays: plan?.trialDays,
    // });
    try {
      const result = await createSubscription(
        planId,
        plan?.trialDays,
        isYearly
      );
      // console.log("createSubscription result:", result);

      if (result.success) {
        if (result.checkoutUrl) {
          // console.log("Redirecting to checkout URL:", result.checkoutUrl);
          // Redirect to Dodo Payments checkout
          window.location.href = result.checkoutUrl;
          onSuccess?.(result.checkoutUrl);
        } else {
          // console.log("Free plan - no checkout needed");
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
    const isTrialing = subscription?.status === "trialing";
    const planName = plan?.name || subscriptionIdToName[planId] || "Plan";

    // Current plan with active paid subscription
    if (isCurrentPlan && isActive) {
      return "Current Plan";
    }

    // Current plan during trial - allow early conversion to paid
    if (isCurrentPlan && isTrialing) {
      return "Start Paid Subscription";
    }

    // Different plan while on trial - allow upgrade/downgrade
    if (isTrialing && !isCurrentPlan) {
      return `Upgrade to ${planName}`;
    }

    // Different plan with active paid subscription
    if (hasActiveSubscription && !isCurrentPlan) {
      return "Change Plan";
    }

    // New user or no subscription
    return "Start 7-Day Trial";
  };

  const getButtonVariant = () => {
    const isTrialing = subscription?.status === "trialing";

    // Current plan with active paid subscription
    if (isCurrentPlan && isActive) {
      return "secondary";
    }

    // Current plan during trial - highlight as actionable
    if (isCurrentPlan && isTrialing) {
      return "default";
    }

    // Track plan or upgrade option - use primary styling
    if (subscriptionIdToName[planId] === "Track" || (isTrialing && !isCurrentPlan)) {
      return "default";
    }

    return "outline";
  };

  const isTrialing = subscription?.status === "trialing";

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
