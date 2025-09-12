"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { PricingCard } from "@/components/subscription/PricingCard";
import { SUBSCRIPTION_PLANS } from "@/lib/gocardless-types";
import { Badge } from "@/components/ui/badge";

export default function SignUpPage() {
  const [selectedPlan, setSelectedPlan] = useState<string>("track");
  const [isSignUp, setIsSignUp] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get plan from URL params if provided
  useEffect(() => {
    const plan = searchParams.get("plan");
    if (plan && ["learn", "track", "optimize"].includes(plan)) {
      setSelectedPlan(plan);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!loading && user) {
      // Store selected plan for after email verification
      localStorage.setItem("selectedPlan", selectedPlan);
      // Redirect to pricing page in authenticated area after signup
      router.push("/pricing");
    }
  }, [user, loading, router, selectedPlan]);

  if (loading) {
    return (
      <div className="min-h-screen bg-doser-background flex items-center justify-center">
        <div className="text-doser-text">Loading...</div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect
  }

  const plans = Object.values(SUBSCRIPTION_PLANS);

  const getPlanDescription = (planId: string) => {
    const descriptions: Record<string, string> = {
      learn: "Perfect for occasional users",
      track: "For regular users",
      optimize: "For everyday and heightened use",
    };
    return descriptions[planId] || "";
  };

  return (
    <div className="min-h-screen bg-doser-background">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.1),transparent_50%)]"></div>

      <div className="relative z-10">
        {!isSignUp ? (
          // Plan Selection Step
          <div className="container mx-auto px-6 py-16">
            <div className="text-center mb-12">
              <h1 className="text-4xl lg:text-5xl font-bold text-doser-text mb-4">
                Start Your Free Trial
              </h1>
              <p className="text-xl text-doser-text-muted mb-8">
                Choose your plan and get 7 days free on all paid plans
              </p>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative cursor-pointer transition-all duration-200 ${
                    selectedPlan === plan.id
                      ? "transform scale-105"
                      : "hover:transform hover:scale-102"
                  }`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  <PricingCard
                    plan={plan}
                    isYearly={false}
                    isPopular={plan.id === "track"}
                    description={getPlanDescription(plan.id)}
                    onPriceChange={(planId) =>
                      SUBSCRIPTION_PLANS[planId]?.price || 0
                    }
                    onIntervalChange={(planId) =>
                      SUBSCRIPTION_PLANS[planId]?.interval || "month"
                    }
                    isAuthenticated={false}
                  />
                  {selectedPlan === plan.id && (
                    <div className="absolute -top-2 -right-2">
                      <Badge className="bg-doser-primary text-doser-text">
                        Selected
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Continue Button */}
            <div className="text-center">
              <button
                onClick={() => setIsSignUp(true)}
                className="bg-doser-primary hover:bg-doser-primary-hover text-doser-text px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
              >
                Continue with {SUBSCRIPTION_PLANS[selectedPlan]?.name} Plan
              </button>
              <p className="text-doser-text-muted mt-4">
                You can change your plan anytime after signing up
              </p>
            </div>
          </div>
        ) : (
          // Sign Up Form Step
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-md">
              {/* Selected Plan Display */}
              <div className="mb-6 p-4 bg-doser-card border border-doser-border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-doser-text">
                      {SUBSCRIPTION_PLANS[selectedPlan]?.name} Plan
                    </h3>
                    <p className="text-sm text-doser-text-muted">
                      {selectedPlan === "learn"
                        ? "Free forever"
                        : "7-day free trial, then £" +
                          SUBSCRIPTION_PLANS[selectedPlan]?.price +
                          "/month"}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsSignUp(false)}
                    className="text-doser-primary hover:text-doser-primary-hover text-sm underline"
                  >
                    Change
                  </button>
                </div>
              </div>

              <SignUpForm
                onToggleMode={() => setIsSignUp(false)}
                selectedPlan={selectedPlan}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
