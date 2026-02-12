"use client";

import { FeaturesSection } from "@/components/features-section";
import { HowItWorksSection } from "@/components/how-it-works-section";
import Image from "next/image";
import { CTAButton } from "@/components/CTAButton";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PricingCard } from "@/components/subscription/PricingCard";
import { PlanService } from "@/lib/plan-service";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isYearly, setIsYearly] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  return (
    <>
      {/* Main Content */}
      <main className="relative z-10">
        {/* Hero Section */}
        <div className="bg-doser-background relative overflow-hidden">
          {/* Green Aura Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-doser-primary/5 via-doser-primary/3 to-transparent"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-doser-primary/8 rounded-full blur-3xl"></div>

          <div className="container mx-auto px-6 py-16 lg:py-24 flex items-center relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
              {/* Left Column - Content */}
              <div className="space-y-8">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-doser-primary/10 border border-doser-primary/20 text-doser-primary text-sm font-medium">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-doser-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-doser-primary"></span>
                  </span>
                  Now in early access
                </div>

                {/* Main Headline */}
                <h1 className="text-4xl lg:text-6xl font-bold text-doser-text leading-tight">
                  <span className="text-doser-primary">Dosing</span> is hard,<br />
                  we make it easy.
                </h1>

                {/* Description */}
                <p className="text-xl text-doser-text-muted leading-relaxed max-w-lg">
                  Take precise control of your cannabis prescription. Track effects, optimize dosage, and learn how to get the most out of your therapy with data-driven insights.
                </p>

                {/* CTA Buttons */}
                <div className="mt-8">
                  <CTAButton />
                </div>

                {/* Beta Users Badge */}
                <div className="flex items-center gap-4 text-doser-text-muted text-sm pt-4">

                  <p><span className="font-semibold text-doser-text">4</span> beta testers <span className="text-doser-text-subtle">|</span> Medical cannabis patients</p>
                </div>
              </div>

              {/* Right Column - Dashboard Screenshot */}
              <div className="flex justify-center lg:justify-end">
                <div className="relative">
                  {/* Dashboard Screenshot */}
                  <div className="w-full max-w-2xl">
                    <Image
                      src="/dashboard-macbook-screenshot.svg"
                      alt="Doser Dashboard - Cannabis Dosing App"
                      width={800}
                      height={600}
                      className="w-full h-auto rounded-lg shadow-2xl"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <HowItWorksSection />

        {/* Features Section */}
        <FeaturesSection />

        {/* Pricing Section */}
        <div className="bg-doser-background relative overflow-hidden py-16 lg:py-24">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.1),transparent_50%)]"></div>

          <div className="relative z-10">
            <div className="container mx-auto px-6">
              <div className="text-center mb-12">
                <h2 className="text-4xl lg:text-5xl font-bold text-doser-text mb-4">
                  Choose Your Plan
                </h2>
                <p className="text-xl text-doser-text-muted mb-8">
                  Start with a 7-day free trial on all paid plans
                </p>

                {/* Billing Toggle */}
                <div className="flex items-center justify-center space-x-4 mb-8">
                  <span
                    className={`text-sm font-medium ${!isYearly ? "text-doser-text" : "text-doser-text-muted"
                      }`}
                  >
                    Monthly
                  </span>
                  <button
                    onClick={() => setIsYearly(!isYearly)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isYearly ? "bg-doser-primary" : "bg-gray-200"
                      }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isYearly ? "translate-x-6" : "translate-x-1"
                        }`}
                    />
                  </button>
                  <span
                    className={`text-sm font-medium ${isYearly ? "text-doser-text" : "text-doser-text-muted"
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
                {PlanService.getAllPlans(isYearly).map((plan) => {
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
                <h3 className="text-2xl font-bold text-doser-text mb-8">
                  All Plans Include
                </h3>
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
                    <h4 className="font-semibold text-doser-text mb-2">
                      Session Tracking
                    </h4>
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
                    <h4 className="font-semibold text-doser-text mb-2">
                      Dose Calculator
                    </h4>
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
                    <h4 className="font-semibold text-doser-text mb-2">
                      Progress Insights
                    </h4>
                    <p className="text-doser-text-muted text-sm">
                      Get insights into your cannabis usage patterns
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
