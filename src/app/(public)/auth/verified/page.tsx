"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function EmailVerified() {
  const [countdown, setCountdown] = useState(7);
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push(next);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [next, router]);

  return (
    <Card className="w-full max-w-md mx-auto p-6 bg-doser-card border-doser-border">
      <div className="text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-doser-text mb-4">
          Email Verified!
        </h2>
        <p className="text-doser-text-muted mb-6">
          Your account has been successfully verified. You&apos;re now signed
          in!
        </p>
        <p className="text-doser-text-muted mb-6">
          Redirecting to dashboard in {countdown} seconds...
        </p>
        <Button
          onClick={() => router.push(next)}
          variant="doser"
          className="w-full"
        >
          Go to Dashboard Now
        </Button>
      </div>
    </Card>
  );
}
