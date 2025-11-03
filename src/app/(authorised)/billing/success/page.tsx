"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  const { refetch } = useSubscription();

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        // Dodo Payments redirects here after successful checkout
        // The webhook will have already created/updated the subscription
        // We just need to refetch the subscription data and show success

        // console.log("Processing Dodo Payments redirect...");

        // Wait a moment for webhooks to process
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Refetch subscription data
        await refetch();

        setStatus("success");
        setMessage("Your subscription has been set up successfully!");

        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push("/dashboard");
        }, 3000);
      } catch (error) {
        console.error("Error handling redirect:", error);
        setStatus("error");
        setMessage(
          "Something went wrong. Please try again or contact support."
        );
      }
    };

    handleRedirect();
  }, [refetch, router]);

  return (
    <div className="min-h-screen bg-doser-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-doser-card border-doser-border">
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
