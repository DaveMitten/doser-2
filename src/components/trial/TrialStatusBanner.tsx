"use client";

import { useSubscription } from "@/lib/useSubscription";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface TrialStatusBannerProps {
  showUpgradeButton?: boolean;
  className?: string;
}

export function TrialStatusBanner({
  showUpgradeButton = true,
  className = "",
}: TrialStatusBannerProps) {
  const {
    subscription,
    isLoading,
    isTrialExpired,
    isTrialActive,
    daysRemaining,
  } = useSubscription();
  const router = useRouter();

  if (isLoading) {
    return (
      <Card className={`bg-gray-50 border-gray-200 ${className}`}>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3 flex-1">
            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
            <div className="flex-1">
              <div className="h-5 bg-gray-200 rounded w-32 mb-2 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-64 animate-pulse" />
            </div>
          </div>
          {showUpgradeButton && (
            <div className="h-10 bg-gray-200 rounded w-32 animate-pulse" />
          )}
        </div>
      </Card>
    );
  }

  if (!subscription) {
    return null;
  }

  // Don't show banner if user has an active paid subscription
  if (subscription.status === "active") {
    return null;
  }

  const handleUpgrade = () => {
    router.push("/pricing");
  };

  if (isTrialExpired) {
    return (
      <Card className={`bg-red-50 border-red-200 ${className}`}>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <div>
              <h3 className="text-red-800 font-semibold">Trial Expired</h3>
              <p className="text-red-600 text-sm">
                Your 7-day free trial has ended. Upgrade to continue using
                Doser.
              </p>
            </div>
          </div>
          {showUpgradeButton && (
            <Button
              onClick={handleUpgrade}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Upgrade Now
            </Button>
          )}
        </div>
      </Card>
    );
  }

  if (isTrialActive && daysRemaining <= 2 && daysRemaining > 0) {
    return (
      <Card className={`bg-yellow-50 border-yellow-200 ${className}`}>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-yellow-600" />
            <div>
              <h3 className="text-yellow-800 font-semibold">
                Trial Expires Soon
              </h3>
              <p className="text-yellow-600 text-sm">
                {daysRemaining === 1
                  ? "Your trial expires tomorrow"
                  : `${daysRemaining} days remaining in your trial`}
              </p>
            </div>
          </div>
          {showUpgradeButton && (
            <Button
              onClick={handleUpgrade}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              Upgrade Now
            </Button>
          )}
        </div>
      </Card>
    );
  }

  if (isTrialActive && daysRemaining > 2) {
    return (
      <Card className={`bg-green-50 border-green-200 ${className}`}>
        <div className="flex items-center space-x-3 p-4">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <div>
            <h3 className="text-green-800 font-semibold">Free Trial Active</h3>
            <p className="text-green-600 text-sm">
              {daysRemaining} days remaining in your trial
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return null;
}
