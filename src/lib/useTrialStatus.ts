"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { TrialService, TrialStatus } from "@/lib/trial-service";

export function useTrialStatus() {
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const checkTrialStatus = async () => {
      try {
        const status = await TrialService.checkTrialStatusClient(user.id);
        setTrialStatus(status);

        // If trial is expired, redirect to pricing page
        if (status.isExpired && status.subscriptionStatus === "expired") {
          router.push("/pricing?trial_expired=true");
        }
      } catch (error) {
        console.error("Error checking trial status:", error);
        setTrialStatus({
          isExpired: true,
          daysRemaining: 0,
          selectedPlan: null,
          subscriptionStatus: "unknown",
          trialStartDate: null,
        });
      } finally {
        setLoading(false);
      }
    };

    checkTrialStatus();
  }, [user, router]);

  return {
    trialStatus,
    loading,
    isTrialExpired: trialStatus?.isExpired ?? false,
    daysRemaining: trialStatus?.daysRemaining ?? 0,
    selectedPlan: trialStatus?.selectedPlan,
    subscriptionStatus: trialStatus?.subscriptionStatus,
  };
}
