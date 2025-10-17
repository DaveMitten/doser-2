"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { TrialService } from "@/lib/trial-service";

export function TrialExpirationHandler() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    const checkAndUpdateTrialStatus = async () => {
      try {
        const trialStatus = await TrialService.checkTrialStatusClient(user.id);

        // If trial is expired, update the status and redirect
        if (
          trialStatus.isExpired &&
          trialStatus.subscriptionStatus !== "expired"
        ) {
          // Update trial status in the database
          await TrialService.updateTrialStatus(user.id, true);

          // Redirect to pricing page
          router.push("/pricing?trial_expired=true");
        }
      } catch (error) {
        console.error("Error checking trial expiration:", error);
      }
    };

    // Check trial status on component mount
    checkAndUpdateTrialStatus();

    // Set up interval to check trial status every hour
    const interval = setInterval(checkAndUpdateTrialStatus, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user, router]);

  return null; // This component doesn't render anything
}
