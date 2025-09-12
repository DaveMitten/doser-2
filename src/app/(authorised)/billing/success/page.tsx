"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useSubscription } from "@/lib/useSubscription";

export default function BillingSuccessPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refetch } = useSubscription();

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        // Get the redirect flow ID from URL params
        const redirectFlowId = searchParams.get("redirect_flow_id");

        if (!redirectFlowId) {
          setStatus("error");
          setMessage("No redirect flow ID found. Please try again.");
          return;
        }

        // In a real implementation, you would:
        // 1. Complete the redirect flow with GoCardless
        // 2. Create a mandate from the redirect flow
        // 3. Create a subscription using the mandate
        // 4. Update the database

        // For now, we'll simulate success
        setStatus("success");
        setMessage("Your payment method has been set up successfully!");

        // Refetch subscription data
        await refetch();

        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push("/dashboard");
        }, 3000);
      } catch (error) {
        console.error("Error handling redirect:", error);
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      }
    };

    handleRedirect();
  }, [searchParams, refetch, router]);

  return (
    <div className="min-h-screen bg-doser-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-doser-text">
            Payment Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === "loading" && (
            <>
              <Loader2 className="w-12 h-12 text-doser-primary animate-spin mx-auto" />
              <p className="text-doser-text-muted">
                Setting up your payment method...
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
              <p className="text-doser-text font-medium">{message}</p>
              <p className="text-doser-text-muted text-sm">
                Redirecting to dashboard...
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
              <p className="text-doser-text font-medium">{message}</p>
              <Button
                onClick={() => router.push("/pricing")}
                className="w-full"
              >
                Try Again
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
