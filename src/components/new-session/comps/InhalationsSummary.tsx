"use client";

import React from "react";
import { SessionFormData } from "../../../lib/sessionService";
import { getUnitLabel } from "../../../lib/new-session";

type InhalationsSummaryProps = {
  formData: SessionFormData;
};

const InhalationsSummary = ({ formData }: InhalationsSummaryProps) => {
  return (
    <div>
      <h3 className="text-doser-primary font-semibold mb-4">
        Inhalations Summary
      </h3>
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formData.inhalationsPerCapsule}
            </div>
            <div className="text-xs text-blue-600/80">
              Per {formData.unit.includes("capsule") ? "Capsule" : "Chamber"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {formData.unitAmount}
            </div>
            <div className="text-xs text-purple-600/80">
              {getUnitLabel(formData)} Used
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formData.inhalationsPerCapsule && formData.unitAmount
                ? (
                    parseFloat(formData.inhalationsPerCapsule) *
                    parseFloat(formData.unitAmount)
                  ).toString()
                : "0"}
            </div>
            <div className="text-xs text-green-600/80">
              Total Possible Inhalations
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {formData.totalSessionInhalations || "0"}
            </div>
            <div className="text-xs text-orange-600/80">
              Your Actual Inhalations
            </div>
          </div>
        </div>
        <div className="mt-3 p-3 bg-white/5 border border-white/20 rounded-lg">
          <p className="text-xs text-doser-text-muted text-center">
            📊 This summary shows your inhalation efficiency and helps determine
            actual material consumption. The difference between total possible
            and actual inhalations indicates how much material remains.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InhalationsSummary;
