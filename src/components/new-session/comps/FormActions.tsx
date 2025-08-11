"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { SessionFormData } from "../../../lib/sessionService";
import {
  isFormValid,
  isDrawsValid,
  getMaxDraws,
} from "../../../lib/new-session";

type FormActionsProps = {
  formData: SessionFormData;
  selectedEffects: string[];
  isSubmitting: boolean;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onSaveAsDraft: () => void;
};

const FormActions = ({
  formData,
  selectedEffects,
  isSubmitting,
  handleSubmit,
  onSaveAsDraft,
}: FormActionsProps) => {
  return (
    <>
      {/* Form Actions */}
      <div className="flex gap-3 pt-6 border-t border-doser-border">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1 bg-doser-surface border-doser-border text-doser-text-muted hover:text-doser-text hover:bg-doser-surface-hover"
          onClick={onSaveAsDraft}
          disabled={isSubmitting}
        >
          <span className="mr-2">📋</span>
          Save as Draft
        </Button>
        <Button
          type="submit"
          size="sm"
          className="flex-1 bg-doser-primary hover:bg-doser-primary-hover text-white border-0 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!isFormValid(formData, selectedEffects) || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="mr-2 animate-spin">⏳</span>
              Saving...
            </>
          ) : (
            <>
              <span className="mr-2">💾</span>
              Log Session
            </>
          )}
        </Button>
      </div>

      {/* Validation Helper */}
      {!isFormValid(formData, selectedEffects) && (
        <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <p className="text-xs text-amber-500 font-medium mb-2">
            ⚠️ Please complete all required fields to log your session
          </p>
          <div className="text-xs text-amber-500/80 space-y-1">
            {!formData.device && <div>• Select a device</div>}
            {!formData.material && (
              <div>• Choose capsule or chamber method</div>
            )}
            {!formData.materialAmount && <div>• Enter amount used</div>}
            {!formData.thcPercentage && <div>• Enter THC percentage</div>}
            {!formData.cbdPercentage && <div>• Enter CBD percentage</div>}
            {formData.higherAccuracy && !formData.inhalationsPerCapsule && (
              <div>• Enter inhalations per capsule</div>
            )}
            {!formData.date && <div>• Select date</div>}
            {!formData.time && <div>• Enter time</div>}
            {!formData.duration && <div>• Enter session duration</div>}
            {formData.higherAccuracy && !formData.totalSessionInhalations && (
              <div>• Enter number of inhalations (higher accuracy mode)</div>
            )}
            {formData.higherAccuracy &&
              formData.totalSessionInhalations &&
              !isDrawsValid(formData) && (
                <div>
                  • Reduce inhalations to {getMaxDraws(formData)} or less
                  (higher accuracy mode)
                </div>
              )}
            {selectedEffects.length === 0 && (
              <div>• Select at least one effect</div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default FormActions;
