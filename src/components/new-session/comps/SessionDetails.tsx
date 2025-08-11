"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { SessionFormData } from "../../../lib/sessionService";

type SessionDetailsProps = {
  formData: SessionFormData;
  handleInputChange: (field: string, value: string | boolean) => void;
};

const SessionDetails = ({
  formData,
  handleInputChange,
}: SessionDetailsProps) => {
  return (
    <div>
      <h3 className="text-doser-primary font-semibold mb-4">Session Details</h3>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-doser-text mb-2">
            Date <span className="text-red-400">*</span>
          </label>
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange("date", e.target.value)}
            className="bg-doser-surface-hover border-doser-border text-doser-text"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-doser-text mb-2">
            Time <span className="text-red-400">*</span>
          </label>
          <Input
            type="time"
            value={formData.time}
            onChange={(e) => handleInputChange("time", e.target.value)}
            className="bg-doser-surface-hover border-doser-border text-doser-text"
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-doser-text mb-2">
          Duration <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <Input
            type="number"
            placeholder="45"
            value={formData.duration}
            onChange={(e) => handleInputChange("duration", e.target.value)}
            className="bg-doser-surface-hover border-doser-border text-doser-text pr-20"
            min="1"
            max="300"
            required
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-doser-text-muted text-sm">
            minutes
          </span>
        </div>
        <p className="text-xs text-doser-text-muted mt-1">
          How long did the effects last?
        </p>
      </div>
    </div>
  );
};

export default SessionDetails;
