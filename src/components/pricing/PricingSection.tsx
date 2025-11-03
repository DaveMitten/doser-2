"use client";

import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { PricingCard } from "@/components/subscription/PricingCard";
import { FAQ } from "@/components/FAQ";
import { PlanService } from "@/lib/plan-service";
import { useUserData } from "@/context/UserDataContext";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { useRouter } from "next/navigation";
export type RouteType = "public" | "auth";

interface PricingSectionProps {
  routeType: RouteType;
}

export function PricingSection({ routeType }: PricingSectionProps) {
  // Use Router
  const router = useRouter();

  // Use State
  const [isYearly, setIsYearly] = useState(false);

  // Get user data (only for authenticated users)
  const { subscription } = useUserData();
  const { user } = useAuth();

  const hasActiveSubscription = subscription
    ? ["active", "trialing"].includes(subscription.status)
    : false;

  // Extract user email and name from user object
  const userEmail = user?.email || "";
  const userName =
    user?.user_metadata?.full_name || user?.user_metadata?.name || "";

  // Get plans using PlanService
  const plans = PlanService.getAllPlans(isYearly);
  const faqItems = [
    {
      question: "Is there really a free trial?",
      answer:
        "Yes! We offer a 7-day free trial on all our plans. You can cancel anytime before the trial ends and you won't be charged.",
    },
    // {
    //   value: "item-2",
    //   question: "Can I change plans anytime?",
    //   answer:
    //     "Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate your billing accordingly.",
    // },
    {
      question: "What's included in the free trial?",
      answer:
        "Our 7-day free trial gives you full access to all Pro features, including unlimited calculations, session tracking, and AI recommendations.",
    },
    {
      question: "Is my data private and secure?",
      answer:
        "Your privacy is our top priority. All data is encrypted, stored securely, and never shared with third parties. You can export or delete your data anytime.",
    },
    {
      question: "Do you offer refunds?",
      answer:
        "We offer a 30-day money-back guarantee on all paid plans. If you're not satisfied, contact our support team for a full refund.",
    },
  ];

  const handleCardClick = (planKey: string) => {
    if (routeType === "auth") {
      // For authenticated users, the SubscriptionButton will handle the subscription creation
      // This is just a placeholder - the actual logic is in SubscriptionButton
      // console.log("Plan selected:", planKey);
    } else {
      // we need to redirect to the signup page
      router.push("/signup?plan=" + planKey);
    }
  };

  const handleSubscriptionSuccess = (checkoutUrl: string) => {
    if (checkoutUrl) {
      // console.log("Redirecting to payment...");
      // The SubscriptionButton will handle the redirect
    } else {
      // console.log("Subscription activated successfully!");
    }
  };

  const handleSubscriptionError = (error: string) => {
    // console.error(`Failed to create subscription: ${error}`);
  };

  return (
    <>
      {/* Main Content */}
      <main className="relative z-10">
        {/* Pricing Section */}
        <section className="container mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold text-doser-text mb-4">
              Choose Your Perfect Plan
            </h2>
            <p className="text-xl text-doser-text-muted mb-8">
              Upgrade your experience
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center space-x-4 mb-12">
              <span className="text-doser-text">Monthly</span>
              <Switch
                className="data-[state=checked]:bg-doser-primary"
                checked={isYearly}
                onCheckedChange={setIsYearly}
              />
              <span className="text-doser-text">Yearly</span>
              <Badge variant="secondary" className="bg-orange-500 text-white">
                1 Month Free
              </Badge>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => {
              // Get the plan key from the plan name for routing

              return (
                <PricingCard
                  key={plan.id}
                  plan={plan}
                  isYearly={isYearly}
                  isPopular={PlanService.isPopularPlan(plan.id)}
                  isAuthenticated={routeType === "auth"}
                  onClick={() => handleCardClick(plan.id)}
                  onSuccess={handleSubscriptionSuccess}
                  onError={handleSubscriptionError}
                  currentUserPlanId={subscription?.plan_id}
                  hasActiveSubscription={hasActiveSubscription}
                  userEmail={userEmail}
                  userName={userName}
                />
              );
            })}
          </div>
        </section>

        <FAQ
          title="Frequently Asked Questions"
          subtitle="Everything you need to know about Doser pricing and features"
          items={faqItems}
        />
      </main>
    </>
  );
}
