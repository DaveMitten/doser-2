"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { SessionFormData } from "../../../lib/sessionService";
import { UseFormReturn } from "react-hook-form";
import { SessionFormSchema } from "@/lib/validation-schemas";

type FormActionsProps = {
  formData: SessionFormData;
  selectedEffects: string[];
  isSubmitting: boolean;
  form: UseFormReturn<SessionFormSchema>;
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  onSaveAsDraft: () => void;
};

const FormActions = ({
  isSubmitting,
  onSaveAsDraft,
  form,
  handleSubmit,
}: FormActionsProps) => {
  const handleSubmitClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // First validate the form using React Hook Form
    const isValid = await form.trigger();

    if (!isValid) {
      // If validation fails, don't submit and return early
      console.log("Form validation failed");
      return;
    }
    console.log("Form is valid, submitting...");
    console.log(form.getValues());
    // If validation passes, call the parent form's handleSubmit function
    // This will trigger the onSubmit function with the validated data
    await handleSubmit();
  };

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
          type="button"
          size="sm"
          className="flex-1 bg-doser-primary hover:bg-doser-primary-hover text-white border-0 font-medium"
          disabled={isSubmitting}
          onClick={handleSubmitClick}
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
    </>
  );
};

export default FormActions;
