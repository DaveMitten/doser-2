"use client";

import React from "react";
import { SessionFormData } from "../../../lib/sessionService";
import { Vaporizer } from "../../../context/data-types";
import { getMaterialUnitLabel } from "../../../lib/new-session";

type DosageBreakdownProps = {
  formData: SessionFormData;
  calculatedTotals: {
    thc: number;
    cbd: number;
    originalThc: number;
    originalCbd: number;
    consumedThc: number;
    consumedCbd: number;
    consumptionRatio: number;
    remainingMaterial: number;
  } | null;
  selectedDevice: Vaporizer | null;
};

const DosageBreakdown = ({
  formData,
  calculatedTotals,
  selectedDevice,
}: DosageBreakdownProps) => {
  const calculateTotalInhalations = (formData: SessionFormData) => {
    if (!formData.totalSessionInhalations || !formData.inhalationsPerCapsule)
      return null;
    return parseFloat(formData.totalSessionInhalations);
  };

  const calculateConsumedMaterialAmount = (formData: SessionFormData) => {
    if (
      !formData.totalSessionInhalations ||
      !formData.inhalationsPerCapsule ||
      !formData.materialAmount
    )
      return null;

    const totalInhalations = parseFloat(formData.totalSessionInhalations);
    const inhalationsPerCapsule = parseFloat(formData.inhalationsPerCapsule);
    const materialAmount = parseFloat(formData.materialAmount);

    const consumedRatio = (totalInhalations / inhalationsPerCapsule) * 100;
    const consumedAmount =
      (totalInhalations / inhalationsPerCapsule) * materialAmount;
    const remainingAmount = materialAmount - consumedAmount;

    return {
      consumedAmount: consumedAmount.toFixed(2),
      consumedRatio: consumedRatio.toFixed(1),
      remainingAmount: remainingAmount.toFixed(2),
    };
  };

  return (
    <div>
      <h3 className="text-doser-primary font-semibold mb-4">
        Dosage Breakdown
      </h3>
      <div className="bg-doser-primary/10 border border-doser-primary/20 rounded-lg p-4">
        <p className="text-doser-primary text-sm mb-3">
          Calculated values based on your session consumption
        </p>

        {/* Primary Display - Shows consumed values for higher accuracy, original for simple mode */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-doser-primary mb-2">
              {formData.higherAccuracy ? "Consumed THC (mg)" : "Total THC (mg)"}
            </label>
            <div className="bg-doser-primary/20 border border-doser-primary/30 rounded-lg px-3 py-2 text-doser-text font-mono text-center">
              {calculatedTotals ? calculatedTotals.thc.toFixed(1) : "0.0"} mg
            </div>
            {formData.higherAccuracy && calculatedTotals && (
              <p className="text-xs text-doser-text-muted mt-1">
                Based on actual inhalations
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-doser-primary mb-2">
              {formData.higherAccuracy ? "Consumed CBD (mg)" : "Total CBD (mg)"}
            </label>
            <div className="bg-doser-primary/20 border border-doser-primary/30 rounded-lg px-3 py-2 text-doser-text font-mono text-center">
              {calculatedTotals ? calculatedTotals.cbd.toFixed(1) : "0.0"} mg
            </div>
            {formData.higherAccuracy && calculatedTotals && (
              <p className="text-xs text-doser-text-muted mt-1">
                Based on actual inhalations
              </p>
            )}
          </div>
        </div>

        {/* Enhanced Calculation Display - Only shown in higher accuracy mode */}
        {formData.higherAccuracy && calculatedTotals && (
          <div className="mb-4 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg">
            <h4 className="text-blue-600 font-medium text-sm mb-3">
              📊 Enhanced Calculation Breakdown
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-blue-600 mb-1">
                  Original THC (mg)
                </label>
                <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg px-2 py-1 text-doser-text font-mono text-center text-sm">
                  {calculatedTotals.originalThc.toFixed(1)} mg
                </div>
                <p className="text-xs text-blue-600/80 mt-1">Total available</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-blue-600 mb-1">
                  Original CBD (mg)
                </label>
                <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg px-2 py-1 text-doser-text font-mono text-center text-sm">
                  {calculatedTotals.originalCbd.toFixed(1)} mg
                </div>
                <p className="text-xs text-blue-600/80 mt-1">Total available</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-purple-600 mb-1">
                  Consumption Rate
                </label>
                <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg px-2 py-1 text-doser-text font-mono text-center text-sm">
                  {(calculatedTotals.consumptionRatio * 100).toFixed(1)}%
                </div>
                <p className="text-xs text-purple-600/80 mt-1">Material used</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-purple-600 mb-1">
                  Remaining Material
                </label>
                <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg px-2 py-1 text-doser-text font-mono text-center text-sm">
                  {calculatedTotals.remainingMaterial.toFixed(2)} g
                </div>
                <p className="text-xs text-purple-600/80 mt-1">
                  Potentially reusable
                </p>
              </div>
            </div>
            <div className="mt-3 p-2 bg-blue-500/5 border border-blue-500/20 rounded-lg">
              <p className="text-xs text-blue-600/80">
                💡 This enhanced calculation shows the difference between what
                you put in (original) and what you actually consumed based on
                your inhalations. The remaining material could potentially be
                reused in future sessions.
              </p>
            </div>
          </div>
        )}

        {calculatedTotals && (
          <div className="mt-3 p-3 bg-doser-primary/5 border border-doser-primary/20 rounded-lg">
            <p className="text-xs text-doser-primary font-medium mb-2">
              Session Summary:
            </p>
            <div className="text-xs text-doser-text-muted space-y-1">
              <div>
                • {formData.materialAmount} {getMaterialUnitLabel(formData)}{" "}
                consumed
              </div>
              <div>
                • {formData.thcPercentage}% THC + {formData.cbdPercentage}% CBD
              </div>
              <div>
                • Total cannabinoids:{" "}
                {(calculatedTotals.thc + calculatedTotals.cbd).toFixed(1)} mg
                {formData.higherAccuracy && (
                  <span className="text-blue-600"> (consumed)</span>
                )}
              </div>
              <div className="pt-1 border-t border-doser-primary/20">
                <div>
                  • Total material weight:{" "}
                  {(() => {
                    if (formData.material.includes("capsule")) {
                      return (
                        parseFloat(formData.materialAmount) *
                        (selectedDevice?.dosingCapsuleCapacity || 0)
                      ).toFixed(2);
                    } else {
                      return (
                        parseFloat(formData.materialAmount) *
                        (selectedDevice?.chamberCapacity || 0)
                      ).toFixed(2);
                    }
                  })()}
                  g
                </div>
              </div>
              {formData.higherAccuracy &&
                formData.totalSessionInhalations &&
                calculateTotalInhalations(formData) && (
                  <>
                    <div className="pt-1 border-t border-doser-primary/20">
                      <div>
                        • Total inhalations:{" "}
                        {calculateTotalInhalations(formData)}
                      </div>
                      <div>
                        • Inhalations per{" "}
                        {formData.material.includes("capsule")
                          ? "capsule"
                          : "chamber"}
                        : {formData.totalSessionInhalations}
                      </div>
                    </div>
                    {calculateConsumedMaterialAmount(formData) && (
                      <div className="pt-1 border-t border-doser-primary/20">
                        <div className="text-amber-600 font-medium">
                          • Enhanced calculation based on actual inhalations:
                        </div>
                        <div className="ml-2">
                          - Material actually consumed:{" "}
                          {
                            calculateConsumedMaterialAmount(formData)
                              ?.consumedAmount
                          }{" "}
                          {getMaterialUnitLabel(formData)}
                        </div>
                        <div className="ml-2">
                          - Consumption rate:{" "}
                          {
                            calculateConsumedMaterialAmount(formData)
                              ?.consumedRatio
                          }
                          %
                        </div>
                        <div className="ml-2">
                          - Remaining material:{" "}
                          {
                            calculateConsumedMaterialAmount(formData)
                              ?.remainingAmount
                          }{" "}
                          {getMaterialUnitLabel(formData)}
                        </div>
                      </div>
                    )}
                  </>
                )}
            </div>
          </div>
        )}
        <p className="text-xs text-doser-text-muted mt-3">
          * Values update in real-time as you change inputs
          {formData.higherAccuracy && (
            <span className="text-blue-600">
              {" "}
              • Higher accuracy mode uses actual inhalation data for precise
              calculations
            </span>
          )}
        </p>
      </div>
    </div>
  );
};

export default DosageBreakdown;
