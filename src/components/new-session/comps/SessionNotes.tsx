"use client";

import React from "react";
import { SessionFormData } from "../../../lib/sessionService";
import { FieldErrors } from "react-hook-form";
import { SessionFormSchema } from "../../../lib/validation-schemas";

type SessionNotesProps = {
  formData: SessionFormData;
  handleInputChange: (
    field: keyof SessionFormSchema,
    value: string | boolean
  ) => void;
  errors: FieldErrors<SessionFormSchema>;
};

const SessionNotes = ({
  formData,
  handleInputChange,
  errors,
}: SessionNotesProps) => {
  return (
    <div>
      <h3 className="text-doser-primary font-semibold mb-4">Session Notes</h3>
      <div>
        <label className="block text-sm font-medium text-doser-text mb-2">
          Additional Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleInputChange("notes", e.target.value)}
          placeholder="Perfect evening session. Great for relaxation after work. The vaporizer provided smooth, flavorful vapor. Effects kicked in around 5 minutes and lasted about 45 minutes total."
          className={`w-full p-3 bg-doser-surface-hover border rounded-lg text-doser-text placeholder:text-doser-text-muted focus:ring-2 focus:ring-doser-primary/20 resize-none ${
            errors.notes
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
              : "border-doser-border focus:border-doser-primary"
          }`}
          rows={4}
        />
        {errors.notes && (
          <p className="text-red-500 text-xs mt-1">{errors.notes.message}</p>
        )}
        <p className="text-xs text-doser-text-muted mt-1">
          Record any additional observations about this session
        </p>
      </div>
    </div>
  );
};

export default SessionNotes;
