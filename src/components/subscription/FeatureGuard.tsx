"use client";

import { useSubscription } from "@/lib/useSubscription";
import { ReactNode } from "react";

interface FeatureGuardProps {
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
  requireActiveSubscription?: boolean;
}

export function FeatureGuard({
  feature,
  children,
  fallback,
  requireActiveSubscription = true,
}: FeatureGuardProps) {
  const { hasFeatureAccess, hasActiveSubscription, isLoading } =
    useSubscription();

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-doser-surface rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-doser-surface rounded w-1/2"></div>
      </div>
    );
  }

  // Check if user has active subscription (if required)
  if (requireActiveSubscription && !hasActiveSubscription) {
    return (
      fallback || (
        <div className="text-center py-8">
          <div className="bg-doser-surface border border-doser-border rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-doser-text mb-2">
              Subscription Required
            </h3>
            <p className="text-doser-text-muted mb-4">
              This feature requires an active subscription.
            </p>
            <a
              href="/pricing"
              className="inline-block bg-doser-primary hover:bg-doser-primary-hover text-doser-text px-4 py-2 rounded-md text-sm font-medium"
            >
              View Plans
            </a>
          </div>
        </div>
      )
    );
  }

  // Check if user has access to the specific feature
  if (!hasFeatureAccess(feature)) {
    return (
      fallback || (
        <div className="text-center py-8">
          <div className="bg-doser-surface border border-doser-border rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-doser-text mb-2">
              Feature Not Available
            </h3>
            <p className="text-doser-text-muted mb-4">
              This feature is not included in your current plan.
            </p>
            <a
              href="/pricing"
              className="inline-block bg-doser-primary hover:bg-doser-primary-hover text-doser-text px-4 py-2 rounded-md text-sm font-medium"
            >
              Upgrade Plan
            </a>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}
