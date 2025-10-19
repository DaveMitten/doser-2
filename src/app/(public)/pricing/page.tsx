"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { PricingCard } from "@/components/subscription/PricingCard";
import { PlanService } from "@/lib/plan-service";
import { TrialStatusBanner } from "@/components/trial/TrialStatusBanner";
import { Card } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);
  const searchParams = useSearchParams();
  const trialExpired = searchParams.get("trial_expired") === "true";

  const plans = PlanService.getAllPlans(isYearly);

  return (
    <div className="min-h-screen bg-doser-background">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.1),transparent_50%)]"></div>

      <div className="relative z-10">
        <div className="container mx-auto px-6 py-16">
          {/* Trial Expired Banner */}
          {trialExpired && (
            <Card className="bg-red-50 border-red-200 mb-8">
              <div className="flex items-center space-x-3 p-6">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <div>
                  <h2 className="text-red-800 font-bold text-xl">
                    Your Free Trial Has Expired
                  </h2>
                  <p className="text-red-600 mt-1">
                    Choose a plan below to continue using Doser and unlock all
                    features.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Trial Status Banner */}
          <TrialStatusBanner className="mb-8" />

          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-doser-text mb-4">
              Choose Your Plan
            </h1>
            <p className="text-xl text-doser-text-muted mb-8">
              Start with a 7-day free trial on all paid plans
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <span
                className={`text-sm font-medium ${
                  !isYearly ? "text-doser-text" : "text-doser-text-muted"
                }`}
              >
                Monthly
              </span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isYearly ? "bg-doser-primary" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isYearly ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
              <span
                className={`text-sm font-medium ${
                  isYearly ? "text-doser-text" : "text-doser-text-muted"
                }`}
              >
                Yearly
              </span>
              {isYearly && (
                <span className="bg-doser-primary text-doser-text px-2 py-1 rounded-full text-xs font-medium">
                  Save 20%
                </span>
              )}
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => {
              const planKey = plan.name.toLowerCase();
              return (
                <div
                  key={plan.id}
                  className={`relative cursor-pointer transition-all duration-200 hover:transform hover:scale-102`}
                >
                  <PricingCard
                    plan={plan}
                    isYearly={isYearly}
                    isPopular={PlanService.isPopularPlan(planKey)}
                    isAuthenticated={false}
                    onClick={() => {
                      // Redirect to signup for free trial
                      window.location.href = "/auth?signup=true";
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Features Section */}
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold text-doser-text mb-8">
              All Plans Include
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-12 h-12 bg-doser-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-doser-primary"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-doser-text mb-2">
                  Session Tracking
                </h3>
                <p className="text-doser-text-muted text-sm">
                  Track your cannabis sessions with detailed analytics
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-doser-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-doser-primary"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-doser-text mb-2">
                  Dose Calculator
                </h3>
                <p className="text-doser-text-muted text-sm">
                  Calculate optimal doses based on your preferences
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-doser-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-doser-primary"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-doser-text mb-2">
                  Progress Insights
                </h3>
                <p className="text-doser-text-muted text-sm">
                  Get insights into your cannabis usage patterns
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
