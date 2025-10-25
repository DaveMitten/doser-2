"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface EmailConfirmationModalProps {
  title: string;
  message: string;
  email: string;
  secondaryMessage?: string;
  resendMessage?: string | null;
  isResending?: boolean;
  resendCooldown?: number;
  onResend: () => void;
  onReset: () => void;
  resetButtonText?: string;
}

export function EmailConfirmationModal({
  title,
  message,
  email,
  secondaryMessage,
  resendMessage,
  isResending = false,
  resendCooldown = 0,
  onResend,
  onReset,
  resetButtonText = "Back to Sign In",
}: EmailConfirmationModalProps) {
  return (
    <Card className="w-full max-w-md mx-auto p-6 bg-doser-card border-doser-border">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-doser-text mb-4">{title}</h2>
        <p className="text-doser-text-muted mb-4">
          {message} <strong>{email}</strong>
        </p>
        {secondaryMessage && (
          <p className="text-doser-text-muted mb-6">{secondaryMessage}</p>
        )}

        {resendMessage && (
          <div
            className={`text-sm mb-4 p-3 rounded-md ${
              resendMessage.includes("sent") ||
              resendMessage.includes("successfully")
                ? "text-green-600 bg-green-50 border border-green-200"
                : "text-red-600 bg-red-50 border border-red-200"
            }`}
          >
            {resendMessage}
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={onResend}
            variant="outline"
            disabled={isResending || resendCooldown > 0}
            className="w-full"
          >
            {isResending
              ? "Sending..."
              : resendCooldown > 0
              ? `Resend in ${resendCooldown}s`
              : "Resend Verification Email"}
          </Button>
          <Button onClick={onReset} variant="doser" className="w-full">
            {resetButtonText}
          </Button>
        </div>
      </div>
    </Card>
  );
}
