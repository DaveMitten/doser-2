"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { resendVerificationEmail } from "@/app/(public)/auth/actions";
import { EmailConfirmationModal } from "@/components/auth/EmailConfirmationModal";
import { Label } from "@radix-ui/react-select";

const errorMessages = {
  expired_link: {
    title: "Verification Link Expired",
    message:
      "Your verification link has expired. Please enter your email below to receive a new verification link.",
    action: "Resend Verification Email",
    showEmailInput: true,
    showLoginLink: false,
  },
  already_verified: {
    title: "Already Verified",
    message:
      "This email has already been verified. You can now sign in to your account.",
    action: "Go to Sign In",
    showEmailInput: false,
    showLoginLink: true,
  },
  verification_failed: {
    title: "Verification Failed",
    message:
      "We couldn't verify your email. The link may have expired or is invalid. Please request a new verification email.",
    action: "Resend Verification Email",
    showEmailInput: true,
    showLoginLink: false,
  },
  invalid_token: {
    title: "Invalid Link",
    message: "The verification link you used is not valid.",
    action: "Go to Sign Up",
    showEmailInput: false,
    showLoginLink: false,
  },
  rate_limited: {
    title: "Too Many Attempts",
    message:
      "You've made too many verification attempts. Please wait 10 minutes before trying again.",
    action: "Wait and try again",
    showEmailInput: false,
    showLoginLink: true,
  },
  default: {
    title: "Something Went Wrong",
    message: "An unexpected error occurred during verification.",
    action: "Try again",
    showEmailInput: false,
    showLoginLink: true,
  },
};

export default function ErrorContent() {
  const searchParams = useSearchParams();
  const errorType = searchParams.get("error") || "default";
  const canResend = searchParams.get("can_resend") === "true";

  const error =
    errorMessages[errorType as keyof typeof errorMessages] ||
    errorMessages.default;

  const [email, setEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Cooldown timer effect
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleResendVerification = async () => {
    // Validate email
    if (!email) {
      setEmailError("Please enter your email address");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setEmailError(null);
    setIsResending(true);
    setResendMessage(null);

    try {
      await resendVerificationEmail(email);
      setResendMessage(
        "Verification email sent successfully! Please check your inbox."
      );
      setResendSuccess(true);
      // Start 60-second cooldown timer
      setResendCooldown(60);
    } catch (error) {
      console.error("Resend verification error:", error);
      setResendMessage(
        error instanceof Error
          ? error.message
          : "Failed to send verification email. Please try again."
      );
    } finally {
      setIsResending(false);
    }
  };

  const handleResetResend = () => {
    setResendSuccess(false);
    setEmail("");
    setResendMessage(null);
    setResendCooldown(0);
    setEmailError(null);
  };

  // Show success modal if resend was successful
  if (resendSuccess && email) {
    return (
      <EmailConfirmationModal
        title="Verification Email Resent"
        message="We've sent a new confirmation link to"
        email={email}
        secondaryMessage="Please check your inbox and click the link to verify your email."
        resendMessage={resendMessage}
        isResending={isResending}
        resendCooldown={resendCooldown}
        onResend={handleResendVerification}
        onReset={handleResetResend}
        resetButtonText="Back"
      />
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto p-6 bg-doser-card border-doser-border">
      <div className="text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-doser-text mb-4">
          {error.title}
        </h2>
        <p className="text-doser-text-muted mb-6">{error.message}</p>

        {/* Show email input for expired/failed verification */}
        {(error.showEmailInput || canResend) && (
          <div className="mb-6 text-left">
            <Label className="text-doser-text">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError(null);
              }}
              placeholder="your.email@example.com"
              className="mt-2"
              disabled={isResending}
            />
            {emailError && (
              <p className="text-red-500 text-sm mt-2">{emailError}</p>
            )}
            {resendMessage && !resendSuccess && (
              <div
                className={`text-sm mt-3 p-3 rounded-md ${
                  resendMessage.includes("sent") ||
                  resendMessage.includes("successfully")
                    ? "text-green-600 bg-green-50 border border-green-200"
                    : "text-red-600 bg-red-50 border border-red-200"
                }`}
              >
                {resendMessage}
              </div>
            )}
          </div>
        )}

        <div className="space-y-3">
          {(error.showEmailInput || canResend) && (
            <Button
              onClick={handleResendVerification}
              variant="doser"
              disabled={isResending || resendCooldown > 0}
              className="w-full"
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : resendCooldown > 0 ? (
                `Resend in ${resendCooldown}s`
              ) : (
                error.action
              )}
            </Button>
          )}

          {error.showLoginLink && (
            <Link href="/auth">
              <Button variant="doser" className="w-full">
                {errorType === "already_verified"
                  ? "Go to Sign In"
                  : "Back to Sign In"}
              </Button>
            </Link>
          )}

          {errorType === "invalid_token" && (
            <Link href="/auth?signup=true">
              <Button variant="doser" className="w-full">
                {error.action}
              </Button>
            </Link>
          )}

          {!error.showEmailInput &&
            !canResend &&
            !error.showLoginLink &&
            errorType !== "invalid_token" && (
              <Link href="/auth">
                <Button variant="outline" className="w-full">
                  Back to Sign In
                </Button>
              </Link>
            )}
        </div>
      </div>
    </Card>
  );
}
