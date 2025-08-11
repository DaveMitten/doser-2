"use client";

import React from "react";
import { SessionFormData } from "../../../lib/sessionService";

type SessionNotesProps = {
  formData: SessionFormData;
  handleInputChange: (field: string, value: string | boolean) => void;
};

const SessionNotes = ({ formData, handleInputChange }: SessionNotesProps) => {
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
          className="w-full p-3 bg-doser-surface-hover border border-doser-border rounded-lg text-doser-text placeholder:text-doser-text-muted focus:border-doser-primary focus:ring-2 focus:ring-doser-primary/20 resize-none"
          rows={4}
        />
        <p className="text-xs text-doser-text-muted mt-1">
          Record any additional observations about this session
        </p>
      </div>
    </div>
  );
};

export default SessionNotes;
