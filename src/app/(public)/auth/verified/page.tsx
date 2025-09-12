"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/lib/useSubscription";

export default function EmailVerified() {
  const [countdown, setCountdown] = useState(7);
  const [isCreatingSubscription, setIsCreatingSubscription] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const { user } = useAuth();
  const { createSubscription } = useSubscription();

  useEffect(() => {
    // Create subscription if user is authenticated and has a selected plan
    const createUserSubscription = async () => {
      if (user) {
        const selectedPlan = localStorage.getItem("selectedPlan");
        if (selectedPlan && selectedPlan !== "learn") {
          setIsCreatingSubscription(true);
          try {
            await createSubscription(selectedPlan, 7); // 7-day trial
            localStorage.removeItem("selectedPlan"); // Clean up
          } catch (error) {
            console.error("Error creating subscription:", error);
          } finally {
            setIsCreatingSubscription(false);
          }
        } else if (selectedPlan === "learn") {
          // Create free subscription
          setIsCreatingSubscription(true);
          try {
            await createSubscription("learn", 0);
            localStorage.removeItem("selectedPlan");
          } catch (error) {
            console.error("Error creating free subscription:", error);
          } finally {
            setIsCreatingSubscription(false);
          }
        }
      }
    };

    createUserSubscription();

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push(next);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [next, router, user, createSubscription]);

  return (
    <Card className="w-full max-w-md mx-auto p-6 bg-doser-card border-doser-border">
      <div className="text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-doser-text mb-4">
          Email Verified!
        </h2>
        <p className="text-doser-text-muted mb-4">
          Your account has been successfully verified. You&apos;re now signed
          in!
        </p>
        {isCreatingSubscription && (
          <p className="text-doser-text-muted mb-4">
            Setting up your subscription...
          </p>
        )}
        <p className="text-doser-text-muted mb-6">
          Redirecting to dashboard in {countdown} seconds...
        </p>
        <Button
          onClick={() => router.push(next)}
          variant="doser"
          className="w-full"
        >
          Go to Dashboard Now
        </Button>
      </div>
    </Card>
  );
}
