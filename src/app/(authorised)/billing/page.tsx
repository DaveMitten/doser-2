"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/lib/useSubscription";
import { SUBSCRIPTION_PLANS } from "@/lib/dodo-types";
import { Calendar, CreditCard, AlertCircle, CheckCircle } from "lucide-react";
import * as Sentry from "@sentry/nextjs";

const { logger } = Sentry;

export default function BillingPage() {
  const { subscription, cancelSubscription, isLoading } = useSubscription();
  const [isCanceling, setIsCanceling] = useState(false);

  const handleCancelSubscription = async () => {
    if (!subscription) return;

    setIsCanceling(true);
    try {
      const result = await cancelSubscription();
      if (result.success) {
        // Show success message or redirect
        window.location.reload();
      } else {
        alert(result.error || "Failed to cancel subscription");
      }
    } catch (error) {
      logger.error("Error canceling subscription", { error });
      alert("Failed to cancel subscription. Please try again.");
    } finally {
      setIsCanceling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-doser-surface rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-doser-surface rounded"></div>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-doser-text mb-6">Billing</h1>
        <Card>
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-doser-text-muted mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-doser-text mb-2">
              No Active Subscription
            </h2>
            <p className="text-doser-text-muted mb-6">
              You&apos;re currently on the free plan. Upgrade to unlock more
              features.
            </p>
            <Button
              onClick={() => (window.location.href = "/pricing")}
              className="bg-doser-primary hover:bg-doser-primary-hover text-doser-text"
            >
              View Plans
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const plan =
    subscription.plan_id === "learn"
      ? SUBSCRIPTION_PLANS.find((plan) => plan.id === subscription.plan_id)
      : subscription.plan_id === "track"
      ? SUBSCRIPTION_PLANS.find((plan) => plan.id === subscription.plan_id)
      : SUBSCRIPTION_PLANS.find((plan) => plan.id === subscription.plan_id);

  const isActive =
    subscription.status === "active" || subscription.status === "on_hold";
  const isTrialing = subscription.status === "active";
  const isCanceled = subscription.status === "cancelled";

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-doser-text mb-6">Billing</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Current Plan</span>
              <Badge
                variant={isActive ? "default" : "secondary"}
                className={isActive ? "bg-green-500" : ""}
              >
                {subscription.status === "active"
                  ? "Active"
                  : subscription.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-2xl font-bold text-doser-text">
                {plan?.name}
              </h3>
              <p className="text-doser-text-muted">
                {plan?.price?.monthly === 0
                  ? "Free"
                  : `€${plan?.price}/${plan?.interval}`}
              </p>
            </div>

            {isTrialing && subscription.trial_end && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Trial ends{" "}
                      {new Date(subscription.trial_end).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-blue-700">
                      Your subscription will automatically renew
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isCanceled && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900">
                      Subscription will cancel on{" "}
                      {new Date(
                        subscription.current_period_end
                      ).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-yellow-700">
                      You&apos;ll retain access until the end of your billing
                      period
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <h4 className="font-semibold text-doser-text">Plan Features:</h4>
              <ul className="text-sm text-doser-text-muted space-y-1">
                {plan?.features?.slice(0, 5).map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    {feature}
                  </li>
                ))}
                {plan?.features?.length && plan?.features?.length > 5 && (
                  <li className="text-xs text-doser-text-muted">
                    +{plan?.features?.length - 5} more features
                  </li>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Billing Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Billing Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-doser-text-muted">Current Period</p>
                <p className="font-medium text-doser-text">
                  {new Date(
                    subscription.current_period_start
                  ).toLocaleDateString()}{" "}
                  -{" "}
                  {new Date(
                    subscription.current_period_end
                  ).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-doser-text-muted">Next Billing</p>
                <p className="font-medium text-doser-text">
                  {isCanceled
                    ? "N/A"
                    : new Date(
                        subscription.current_period_end
                      ).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-doser-text-muted">Subscription ID</p>
              <p className="font-mono text-xs text-doser-text bg-doser-surface px-2 py-1 rounded">
                {subscription.id}
              </p>
            </div>

            <div className="pt-4 border-t border-doser-border">
              {!isCanceled &&
                plan?.price?.monthly &&
                plan?.price?.yearly &&
                plan?.price?.monthly > 0 &&
                plan?.price?.yearly > 0 && (
                  <Button
                    variant="outline"
                    onClick={handleCancelSubscription}
                    disabled={isCanceling}
                    className="w-full"
                  >
                    {isCanceling ? "Canceling..." : "Cancel Subscription"}
                  </Button>
                )}

              <Button
                variant="outline"
                onClick={() => (window.location.href = "/pricing")}
                className="w-full mt-2"
              >
                Change Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
