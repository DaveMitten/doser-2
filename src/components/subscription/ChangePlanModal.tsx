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
import { Mail, User, CreditCard, ArrowRight, Copy, Check } from "lucide-react";

interface ChangePlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan: string;
  targetPlan: string;
  userEmail?: string;
  userName?: string;
}

export function ChangePlanModal({
  open,
  onOpenChange,
  currentPlan,
  targetPlan,
  userEmail = "",
  userName = "",
}: ChangePlanModalProps) {
  const [copied, setCopied] = useState(false);

  const emailSubject = `Plan Change Request - ${userName}`;
  const emailBody = `Hi Doser Support Team,

I would like to request a plan change with the following details:

Name: ${userName}
Email: ${userEmail}
Current Plan: ${currentPlan}
Requested Plan: ${targetPlan}

Please let me know the next steps and if you need any additional information.

Thank you!
${userName}`;

  const handleEmailClick = () => {
    const mailtoLink = `mailto:support@doserapp.com?subject=${encodeURIComponent(
      emailSubject
    )}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoLink;
  };

  const handleCopyInfo = async () => {
    const copyText = `Email: support@doserapp.com
Subject: ${emailSubject}

${emailBody}`;

    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setCopied(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px] bg-doser-surface border-doser-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-doser-text flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-doser-primary" />
            Request Plan Change
          </DialogTitle>
          <DialogDescription className="text-doser-text-muted pt-2">
            Contact our support team to change your subscription plan
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Contact Information */}
          <div className="bg-doser-background rounded-lg p-4 border border-doser-border space-y-3">
            <p className="whitespace-pre-line text-doser-text">
              {`I would like to request a plan change with the following details;

  Email: ${userEmail}
  Current Plan: ${currentPlan}
  Requested Plan: ${targetPlan}

Please let me know the next steps and if you need any
additional information.

Thank you!`}
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 rounded-lg p-4">
            <p className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed">
              <strong className="font-semibold">Next Steps:</strong> Copy the
              information to send manually.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCopyInfo}
            className="w-full sm:w-auto border-doser-border text-doser-text hover:bg-doser-background"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy Info
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
