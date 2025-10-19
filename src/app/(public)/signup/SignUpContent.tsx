"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

export default function SignUpContent() {
  const router = useRouter();

  const handleStartTrial = () => {
    router.push("/auth?signup=true");
  };

  return (
    <div className="min-h-screen bg-doser-background">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.1),transparent_50%)]"></div>

      <div className="relative z-10">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl lg:text-5xl font-bold text-doser-text mb-4">
                Start Your Free 7-Day Trial
              </h1>
              <p className="text-xl text-doser-text-muted mb-8">
                Track your cannabis dosing, analyze your sessions, and optimize
                your experience—no credit card required.
              </p>
            </div>

            <Card className="bg-doser-card border-doser-border p-8 mb-8">
              <h2 className="text-2xl font-semibold text-doser-text mb-6 text-center">
                What&apos;s included in your trial:
              </h2>
              <div className="grid gap-4 mb-8">
                {[
                  "Unlimited dosage calculations",
                  "Session tracking & history",
                  "Detailed analytics & insights",
                  "Weekly progress reports",
                  "Device & strain profiles",
                  "Export your data anytime",
                ].map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <Check className="w-6 h-6 text-doser-primary flex-shrink-0 mt-0.5" />
                    <span className="text-doser-text text-lg">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <Button
                  onClick={handleStartTrial}
                  className="bg-doser-primary hover:bg-doser-primary-hover text-doser-text text-lg px-8 py-6 h-auto"
                >
                  Start Your Free Trial
                </Button>
                <p className="text-doser-text-muted text-sm mt-4">
                  No credit card required • Cancel anytime
                </p>
              </div>
            </Card>

            <div className="text-center text-doser-text-muted">
              <p>
                After your trial, choose a plan that fits your needs or continue
                with limited features.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
