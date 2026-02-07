"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreditCard, Loader2, Check, AlertCircle } from "lucide-react";
import { PlanService } from "@/lib/plan-service";
import { useUserData } from "@/context/UserDataContext";
import { PlanDetails } from "@/lib/plan-service";

interface CurrentPlanCardProps {
  plan: PlanDetails | null;
  isOnTrial: boolean;
}

function CurrentPlanCard({ plan, isOnTrial }: CurrentPlanCardProps) {
  const hasCurrentPlan = plan?.name && plan?.price;

  return (
    <div className="bg-doser-background rounded-lg p-4 border border-doser-border">
      <p className="text-xs text-doser-text-muted uppercase mb-2">
        Current Plan
      </p>
      {hasCurrentPlan ? (
        <>
          <h3 className="text-lg font-semibold text-doser-text">
            {plan.name}
          </h3>
          <p className="text-2xl font-bold text-doser-text mt-2">
            £{plan.price}
            <span className="text-sm font-normal text-doser-text-muted">
              /month
            </span>
          </p>
        </>
      ) : isOnTrial ? (
        <>
          <h3 className="text-lg font-semibold text-doser-text">Trial</h3>
          <p className="text-sm text-doser-text-muted mt-2">
            You&apos;re currently on a trial
          </p>
        </>
      ) : (
        <>
          <h3 className="text-lg font-semibold text-doser-text">No Plan</h3>
          <p className="text-sm text-doser-text-muted mt-2">
            No active subscription
          </p>
        </>
      )}
    </div>
  );
}

interface ChangePlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlanId: string;
  targetPlanId: string;
  userEmail?: string;
  userName?: string;
}

export function ChangePlanModal({
  open,
  onOpenChange,
  currentPlanId,
  targetPlanId,
  userEmail = "",
  userName = "",
}: ChangePlanModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { refetch, subscription } = useUserData();

  // Get plan details
  const currentPlan = PlanService.getPlanDetails(currentPlanId);
  const targetPlan = PlanService.getPlanDetails(targetPlanId);

  // Check if user is on trial
  const isOnTrial = subscription?.status === "trialing";

  const handleChangePlan = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/subscriptions/change-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newPlanId: targetPlanId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Log full error details for debugging
        console.error("Plan change failed:", {
          status: response.status,
          statusText: response.statusText,
          error: data.error,
          currentPlanId,
          targetPlanId,
        });
        throw new Error(data.error || "Failed to change plan");
      }

      setSuccess(true);
      // Refresh subscription data
      await refetch();

      // Close modal after short delay
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      console.error("Error changing plan:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to change plan. Please try again or contact support.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setError(null);
    setSuccess(false);
  };

  if (success) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[450px] bg-doser-surface border-doser-border">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-green-600 flex items-center gap-2">
              <Check className="w-6 h-6" />
              Plan Changed Successfully!
            </DialogTitle>
            <DialogDescription className="text-doser-text-muted pt-2">
              Your subscription has been updated to {targetPlan?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-doser-text-muted">
              You'll be charged the prorated amount based on your remaining
              billing cycle.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px] bg-doser-surface border-doser-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-doser-text flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-doser-primary" />
            Change Subscription Plan
          </DialogTitle>
          <DialogDescription className="text-doser-text-muted pt-2">
            Review the plan change and confirm
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Plan Comparison */}
          <div className="grid grid-cols-2 gap-4">
            {/* Current Plan */}
            <CurrentPlanCard plan={currentPlan} isOnTrial={isOnTrial} />

            {/* New Plan */}
            <div className="bg-doser-primary/10 rounded-lg p-4 border-2 border-doser-primary">
              <p className="text-xs text-doser-primary uppercase mb-2">
                New Plan
              </p>
              <h3 className="text-lg font-semibold text-doser-text">
                {targetPlan?.name}
              </h3>
              <p className="text-2xl font-bold text-doser-text mt-2">
                £{targetPlan?.price}
                <span className="text-sm font-normal text-doser-text-muted">
                  /month
                </span>
              </p>
            </div>
          </div>

          {/* Prorated Billing Info */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 rounded-lg p-4">
            <p className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed">
              <strong className="font-semibold">Prorated Billing:</strong> You'll
              be charged the difference based on your remaining billing cycle.
              The charge will be processed immediately.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-900 dark:text-red-100">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleChangePlan}
            disabled={isLoading}
            className="bg-doser-primary hover:bg-doser-primary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Changing Plan...
              </>
            ) : (
              <>Confirm Plan Change</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
