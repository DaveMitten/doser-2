"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/lib/useSubscription";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const {
    subscription,
    isLoading: subscriptionLoading,
    isTrialExpired,
  } = useSubscription();
  const router = useRouter();

  // #region agent log
  useEffect(() => {
    console.log('ProtectedRoute render', {
      hasUser: !!user,
      authLoading,
      userId: user?.id,
      email: user?.email,
      hypothesisId: 'E',
    });
  }, [user, authLoading]);
  // #endregion

  useEffect(() => {
    if (!authLoading && !user) {
      // #region agent log
      console.warn('Redirecting to auth (no user)', { authLoading, hasUser: !!user, hypothesisId: 'E' });
      // #endregion
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-doser-background flex items-center justify-center">
        <div className="text-doser-text">Loading...</div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return null; // Will redirect
  }

  // Show loading state while checking subscription (first time only)
  if (subscriptionLoading && !subscription) {
    return (
      <div className="min-h-screen bg-doser-background flex items-center justify-center">
        <div className="text-doser-text">Loading...</div>
      </div>
    );
  }

  // Block access if trial is expired - show full-page modal
  if (isTrialExpired) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Trial Expired</h2>
              <p className="text-sm text-gray-500">Your free trial has ended</p>
            </div>
          </div>

          <p className="text-gray-700">
            Your 7-day free trial has ended. Upgrade to a paid plan to continue
            using Doser and access all features.
          </p>

          <div className="flex flex-col space-y-2">
            <Button
              onClick={() => router.push("/pricing")}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              View Pricing Plans
            </Button>
            <Button
              onClick={() => {
                // Log out and redirect to home
                router.push("/auth");
              }}
              variant="outline"
              className="w-full"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // If no subscription exists at all, redirect to pricing
  if (!subscriptionLoading && !subscription) {
    router.push("/pricing?no_subscription=true");
    return null;
  }

  return <>{children}</>;
}
