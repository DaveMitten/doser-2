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
  const { user, loading } = useAuth();
  const { isTrialExpired } = useSubscription();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }
  }, [user, loading, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-doser-background flex items-center justify-center">
        <div className="text-doser-text">Loading...</div>
      </div>
    );
  }

  // Not authenticated - will redirect
  if (!user) {
    return null;
  }

  // Show trial expired modal (non-blocking for subscription load)
  if (isTrialExpired) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
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
              onClick={() => router.push("/auth")}
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

  // Authenticated - render children
  return <>{children}</>;
}
