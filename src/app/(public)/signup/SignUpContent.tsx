"use client";

import { useRouter } from "next/navigation";
import { PricingCard } from "@/components/subscription/PricingCard";
import { PlanService } from "@/lib/plan-service";

export default function SignUpContent() {
  const router = useRouter();
  //we want to change passing a boolean to something more human readable
  const plans = PlanService.getAllPlans(false); // Get monthly plans

  const handleSubscriptionOnClick = (plan: string) => {
    router.push(`/auth?signup=true&&plan=${plan}`);
  };

  return (
    <div className="min-h-screen bg-doser-background">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.1),transparent_50%)]"></div>

      <div className="relative z-10">
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
            {plans.map((plan) => {
              const planKey = plan.name.toLowerCase();
              return (
                <div
                  key={plan.id}
                  className={`relative cursor-pointer transition-all duration-200 hover:transform hover:scale-102`}
                >
                  <PricingCard
                    plan={plan}
                    isYearly={false}
                    isPopular={PlanService.isPopularPlan(planKey)}
                    isAuthenticated={false}
                    onClick={() => handleSubscriptionOnClick(plan.name)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
