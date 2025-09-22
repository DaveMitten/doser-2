"use client";

import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";

const errorMessages = {
  verification_failed: {
    title: "Verification Failed",
    message:
      "We couldn't verify your email. This could be because the link has expired or is invalid.",
    action: "Request a new verification email",
  },
  invalid_token: {
    title: "Invalid Link",
    message: "The verification link you used is not valid or has expired.",
    action: "Sign up again",
  },
  rate_limited: {
    title: "Too Many Attempts",
    message:
      "You've made too many verification attempts. Please wait 10 minutes before trying again.",
    action: "Wait and try again",
  },
  default: {
    title: "Something Went Wrong",
    message: "An unexpected error occurred during verification.",
    action: "Try again",
  },
};

export default function ErrorContent() {
  const searchParams = useSearchParams();
  const errorType = searchParams.get("error") || "default";
  const error =
    errorMessages[errorType as keyof typeof errorMessages] ||
    errorMessages.default;

  return (
    <Card className="w-full max-w-md mx-auto p-6 bg-doser-card border-doser-border">
      <div className="text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-doser-text mb-4">
          {error.title}
        </h2>
        <p className="text-doser-text-muted mb-6">{error.message}</p>
        <div className="space-y-3">
          {errorType === "verification_failed" && (
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {error.action}
            </Button>
          )}
          <Link href="/auth">
            <Button variant="doser" className="w-full">
              Back to Sign In
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
