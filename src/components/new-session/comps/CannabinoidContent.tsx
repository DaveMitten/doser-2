"use client";

import React from "react";
import { SessionFormData } from "../../../lib/sessionService";
import { Input } from "../../ui/input";
import { getUnitLabel } from "../../../lib/new-session";
import { calculateConsumedAmount } from "../../../lib/calculator";

type CannabinoidContentProps = {
  formData: SessionFormData;
  handleInputChange: (field: string, value: string | boolean) => void;
};

const CannabinoidContent = ({
  formData,
  handleInputChange,
}: CannabinoidContentProps) => {
  return (
    <div>
      <h3 className="text-doser-primary font-semibold mb-4">
        Cannabinoid Content
      </h3>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-doser-text mb-2">
            THC Percentage <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <Input
              type="number"
              step="0.1"
              placeholder="18.5"
              value={formData.thcPercentage}
              onChange={(e) =>
                handleInputChange("thcPercentage", e.target.value)
              }
              className="bg-doser-surface-hover border-doser-border text-doser-text pr-16"
              min="0"
              max="100"
              required
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-doser-text-muted text-sm">
              %
            </span>
          </div>
          <p className="text-xs text-doser-text-muted mt-1">
            THC content percentage of your material
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-doser-text mb-2">
            CBD Percentage <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <Input
              type="number"
              step="0.1"
              placeholder="2.1"
              value={formData.cbdPercentage}
              onChange={(e) =>
                handleInputChange("cbdPercentage", e.target.value)
              }
              className="bg-doser-surface-hover border-doser-border text-doser-text pr-16"
              min="0"
              max="100"
              required
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-doser-text-muted text-sm">
              %
            </span>
          </div>
          <p className="text-xs text-doser-text-muted mt-1">
            CBD content percentage of your material
          </p>
        </div>
      </div>

      {/* Inhalations Summary Display */}
      {formData.higherAccuracy &&
        formData.totalSessionInhalations &&
        formData.unitAmount && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
            <h4 className="text-blue-600 font-medium text-sm mb-3">
              📈 Inhalations Analysis
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-blue-600 mb-1">
                  Per{" "}
                  {formData.unit.includes("capsule") ? "Capsule" : "Chamber"}
                </label>
                <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg px-2 py-1 text-doser-text font-mono text-center text-sm">
                  {formData.inhalationsPerCapsule} inhalations
                </div>
                <p className="text-xs text-blue-600/80 mt-1">
                  Maximum possible
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-blue-600 mb-1">
                  Total Possible
                </label>
                <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg px-2 py-1 text-doser-text font-mono text-center text-sm">
                  {formData.inhalationsPerCapsule && formData.unitAmount
                    ? (
                        parseFloat(formData.inhalationsPerCapsule) *
                        parseFloat(formData.unitAmount)
                      ).toString()
                    : "0"}{" "}
                  inhalations
                </div>
                <p className="text-xs text-blue-600/80 mt-1">
                  Across all {getUnitLabel(formData)}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-blue-600 mb-1">
                  Efficiency
                </label>
                <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg px-2 py-1 text-doser-text font-mono text-center text-sm">
                  {formData.totalSessionInhalations &&
                  formData.inhalationsPerCapsule &&
                  formData.unitAmount
                    ? Math.round(
                        (parseFloat(formData.totalSessionInhalations) /
                          parseFloat(formData.inhalationsPerCapsule)) *
                          100
                      )
                    : "0"}
                  %
                </div>
                <p className="text-xs text-blue-600/80 mt-1">Of max per unit</p>
              </div>
            </div>
            <div className="mt-3 p-2 bg-blue-500/5 border border-blue-500/20 rounded-lg">
              <p className="text-xs text-blue-600/80">
                💡 This shows your inhalation efficiency and helps calculate
                actual material consumption. Higher efficiency means you&apos;re
                extracting more cannabinoids from each unit.
              </p>
            </div>
          </div>
        )}

      {/* Enhanced Material Consumption Display */}
      {formData.higherAccuracy &&
        formData.totalSessionInhalations &&
        formData.inhalationsPerCapsule &&
        formData.unitAmount && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-4">
            <h4 className="text-amber-600 font-medium text-sm mb-3">
              📊 Enhanced Material Consumption Analysis
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-amber-600 mb-1">
                  Material Consumed
                </label>
                <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg px-2 py-1 text-doser-text font-mono text-center text-sm">
                  {calculateConsumedAmount(formData)?.consumedAmount || "0.00"}{" "}
                  {getUnitLabel(formData)}
                </div>
                <p className="text-xs text-amber-600/80 mt-1">
                  Based on actual inhalations
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-amber-600 mb-1">
                  Consumption Rate
                </label>
                <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg px-2 py-1 text-doser-text font-mono text-center text-sm">
                  {calculateConsumedAmount(formData)?.consumedRatio || "0.0"}%
                </div>
                <p className="text-xs text-amber-600/80 mt-1">
                  Of total material used
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-amber-600 mb-1">
                  Remaining Material
                </label>
                <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg px-2 py-1 text-doser-text font-mono text-center text-sm">
                  {calculateConsumedAmount(formData)?.remainingAmount || "0.00"}{" "}
                  {getUnitLabel(formData)}
                </div>
                <p className="text-xs text-amber-600/80 mt-1">
                  Potentially reusable
                </p>
              </div>
            </div>
            <div className="mt-3 p-2 bg-amber-500/5 border border-amber-500/20 rounded-lg">
              <p className="text-xs text-amber-600/80">
                💡 This analysis shows how much material you actually consumed
                based on your inhalations, providing more accurate dosing
                calculations than simply counting capsules/chambers.
              </p>
            </div>
          </div>
        )}
    </div>
  );
};

export default CannabinoidContent;
