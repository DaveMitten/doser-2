"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { useSubscription } from "@/lib/useSubscription";

export default function BillingSuccessPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { subscription, refetch } = useSubscription();
  const router = useRouter();

  useEffect(() => {
    // Refetch subscription status after payment
    const checkSubscription = async () => {
      try {
        await refetch();
        setIsLoading(false);
      } catch (err) {
        setError("Failed to verify subscription status");
        setIsLoading(false);
      }
    };

    checkSubscription();
  }, [refetch]);

  const handleContinue = () => {
    router.push("/dashboard");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-doser-primary mb-4" />
            <h2 className="text-xl font-semibold text-doser-text mb-2">
              Verifying Payment
            </h2>
            <p className="text-doser-text-muted text-center">
              Please wait while we confirm your subscription...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-red-600 text-xl">!</span>
            </div>
            <h2 className="text-xl font-semibold text-doser-text mb-2">
              Verification Failed
            </h2>
            <p className="text-doser-text-muted text-center mb-6">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isActive =
    subscription?.status === "active" || subscription?.status === "trialing";
  const isTrialing = subscription?.status === "trialing";

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-doser-text">
            {isActive ? "Payment Successful!" : "Payment Processing"}
          </h1>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {isActive ? (
            <>
              <p className="text-doser-text-muted">
                {isTrialing
                  ? `Your ${subscription.planId} trial has started! You have 7 days to explore all features.`
                  : `Welcome to ${subscription.planId}! Your subscription is now active.`}
              </p>
              <div className="bg-doser-surface rounded-lg p-4">
                <h3 className="font-semibold text-doser-text mb-2">
                  What's Next?
                </h3>
                <ul className="text-sm text-doser-text-muted space-y-1">
                  <li>• Access your dashboard</li>
                  <li>• Start tracking sessions</li>
                  <li>• Explore advanced features</li>
                </ul>
              </div>
            </>
          ) : (
            <p className="text-doser-text-muted">
              Your payment is being processed. You'll receive an email
              confirmation shortly.
            </p>
          )}

          <Button
            onClick={handleContinue}
            className="w-full bg-doser-primary hover:bg-doser-primary-hover text-doser-text"
          >
            Continue to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
