"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { SessionFormData } from "../../../lib/sessionService";
import { FieldErrors } from "react-hook-form";
import { SessionFormSchema } from "../../../lib/validation-schemas";

type SessionDetailsProps = {
  formData: SessionFormData;
  handleInputChange: (
    field: keyof SessionFormSchema,
    value: string | boolean
  ) => void;
  errors: FieldErrors<SessionFormSchema>;
};

const SessionDetails = ({
  formData,
  handleInputChange,
  errors,
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
            className={`bg-doser-surface-hover border-doser-border text-doser-text ${
              errors.date ? "border-red-500" : ""
            }`}
            required
          />
          {errors.date && (
            <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-doser-text mb-2">
            Time <span className="text-red-400">*</span>
          </label>
          <Input
            type="time"
            value={formData.time}
            onChange={(e) => handleInputChange("time", e.target.value)}
            className={`bg-doser-surface-hover border-doser-border text-doser-text ${
              errors.time ? "border-red-500" : ""
            }`}
            required
          />
          {errors.time && (
            <p className="text-red-500 text-xs mt-1">{errors.time.message}</p>
          )}
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
            className={`bg-doser-surface-hover border-doser-border text-doser-text pr-20 ${
              errors.duration ? "border-red-500" : ""
            }`}
            min="1"
            max="300"
            required
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-doser-text-muted text-sm">
            minutes
          </span>
        </div>
        {errors.duration && (
          <p className="text-red-500 text-xs mt-1">{errors.duration.message}</p>
        )}
        <p className="text-xs text-doser-text-muted mt-1">
          How long did the effects last?
        </p>
      </div>
    </div>
  );
};

export default SessionDetails;
