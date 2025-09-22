import { Suspense } from "react";
import SignUpContent from "./SignUpContent";

function SignUpContentFallback() {
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

          {/* Loading State */}
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-doser-text">Loading...</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<SignUpContentFallback />}>
      <SignUpContent />
    </Suspense>
  );
}
