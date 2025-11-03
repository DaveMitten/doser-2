"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { EmailOtpType } from "@supabase/supabase-js";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

/**
 * This page is used to verify the email address of the user.
 * @returns A page that verifies the email address of the user.
 */
function VerifyPageContent() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get the URL parameters
        const url = new URL(window.location.href);

        // Check if this is a Gmail redirect URL
        const gmailUrl = url.searchParams.get("q");
        if (gmailUrl) {
          // This is a Gmail redirect, extract the actual URL
          const actualUrl = new URL(gmailUrl);
          const token_hash = actualUrl.searchParams.get("token_hash");
          const type = actualUrl.searchParams.get("type");

          if (token_hash && type) {
            const { error } = await supabase.auth.verifyOtp({
              type: type as EmailOtpType,
              token_hash,
            });

            if (error) {
              throw error;
            }

            setStatus("success");
            setMessage(
              "Email verified successfully! Redirecting to dashboard..."
            );

            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
              router.push("/dashboard");
            }, 2000);
            return;
          }
        }

        // Try direct parameters first
        const token_hash = searchParams.get("token_hash");
        const type = searchParams.get("type");

        if (token_hash && type) {
          const { error } = await supabase.auth.verifyOtp({
            type: type as EmailOtpType,
            token_hash,
          });

          if (error) {
            throw error;
          }

          setStatus("success");
          setMessage(
            "Email verified successfully! Redirecting to dashboard..."
          );

          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            router.push("/dashboard");
          }, 2000);
          return;
        }

        // If no valid parameters found
        throw new Error("Invalid verification link");
      } catch (error: unknown) {
        console.error("Verification error:", error);
        setStatus("error");

        if (error instanceof Error) {
          if (error.message?.includes("expired")) {
            setMessage(
              "This verification link has expired. Please request a new one."
            );
          } else if (error.message?.includes("invalid")) {
            setMessage(
              "Invalid verification link. Please check your email for the correct link."
            );
          } else {
            setMessage(
              "Verification failed. Please try again or contact support."
            );
          }
        } else {
          setMessage(
            "Verification failed. Please try again or contact support."
          );
        }
      }
    };

    verifyEmail();
  }, [router, searchParams, supabase.auth]);

  return (
    <div className="min-h-screen bg-doser-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 bg-doser-card border-doser-border">
        <div className="text-center">
          {status === "loading" && (
            <>
              <Loader2 className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
              <h2 className="text-2xl font-bold text-doser-text mb-4">
                Verifying Email...
              </h2>
              <p className="text-doser-text-muted">
                Please wait while we verify your email address.
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-doser-text mb-4">
                Email Verified!
              </h2>
              <p className="text-doser-text-muted mb-6">{message}</p>
              <Button
                onClick={() => router.push("/dashboard")}
                variant="doser"
                className="w-full"
              >
                Go to Dashboard
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-doser-text mb-4">
                Verification Failed
              </h2>
              <p className="text-doser-text-muted mb-6">{message}</p>
              <div className="space-y-3">
                <Button
                  onClick={() => router.push("/auth")}
                  variant="doser"
                  className="w-full"
                >
                  Back to Sign In
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="w-full"
                >
                  Try Again
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-doser-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 bg-doser-card border-doser-border">
            <div className="text-center">
              <Loader2 className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
              <h2 className="text-2xl font-bold text-doser-text mb-4">
                Verifying Email...
              </h2>
              <p className="text-doser-text-muted">
                Please wait while we verify your email address.
              </p>
            </div>
          </Card>
        </div>
      }
    >
      <VerifyPageContent />
    </Suspense>
  );
}
