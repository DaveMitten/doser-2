import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SubscriptionButton } from "@/components/subscription/SubscriptionButton";
import { ChangePlanModal } from "@/components/subscription/ChangePlanModal";
import { PlanDetails } from "@/lib/plan-service";
import { SUBSCRIPTION_PLANS } from "@/lib/dodo-types";

interface PricingCardProps {
  plan: PlanDetails;
  isYearly: boolean;
  isPopular?: boolean;
  isAuthenticated?: boolean;
  onClick?: () => void;
  onSuccess?: (checkoutUrl: string) => void;
  onError?: (error: string) => void;
  currentUserPlanId?: string;
  hasActiveSubscription?: boolean;
  userEmail?: string;
  userName?: string;
}

export function PricingCard({
  plan,
  isYearly,
  isPopular = false,
  isAuthenticated = false,
  onClick,
  onSuccess,
  onError,
  currentUserPlanId,
  hasActiveSubscription = false,
  userEmail,
  userName,
}: PricingCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get the current plan name from the plan ID
  const currentPlanName = currentUserPlanId
    ? SUBSCRIPTION_PLANS.find((p) => p.id === currentUserPlanId)?.name ||
      currentUserPlanId
    : "";

  return (
    <>
      <Card
        className={`bg-doser-surface border-doser-border flex flex-col ${
          isPopular ? "border-2 border-doser-primary relative" : ""
        }`}
      >
        {isPopular && (
          <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-doser-primary text-doser-text">
            Most Popular
          </Badge>
        )}
        <CardHeader className="text-center">
          <h3 className="text-2xl font-bold text-doser-text">{plan.name}</h3>
          <p className="text-doser-text-muted">{plan.description}</p>
          <div className="mt-4">
            <span className="text-4xl font-bold text-doser-primary">
              {plan.currency === "GBP" ? "£" : "€"}
              {plan.price}
            </span>
            <span className="text-doser-text-muted">/{plan.interval}</span>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col flex-grow space-y-4">
          <div className="space-y-3 flex-grow">
            {plan.features.map((feature, featureIndex) => (
              <div key={featureIndex} className="flex items-center space-x-3">
                <svg
                  className="w-5 h-5 text-doser-primary"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-doser-text">{feature}</span>
              </div>
            ))}
          </div>
          {isAuthenticated ? (
            <SubscriptionButton
              planId={plan.id}
              isYearly={isYearly}
              className={
                "w-full bg-doser-surface hover:bg-doser-surface-hover text-doser-text border border-doser-border"
              }
              onClick={onClick}
              onSuccess={onSuccess}
              onError={onError}
              hasActiveSubscription={hasActiveSubscription}
              onChangePlanClick={() => setIsModalOpen(true)}
            />
          ) : (
            <Button
              className={`w-full ${
                isPopular
                  ? "bg-doser-primary hover:bg-doser-primary-hover text-doser-text"
                  : "bg-doser-surface hover:bg-doser-surface-hover text-doser-text border border-doser-border"
              }`}
              onClick={onClick}
            >
              Start 7-Day Free Trial
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Change Plan Modal */}
      {isAuthenticated && currentUserPlanId && (
        <ChangePlanModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          currentPlanId={currentUserPlanId}
          targetPlanId={plan.id}
          userEmail={userEmail}
          userName={userName}
        />
      )}
    </>
  );
}
