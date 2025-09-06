import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../../components/ui/card";
import { InnerCard } from "../../../../components/ui/inner-card";
import {
  CalculatorInputs,
  CalculatorOutputs,
  calculateDosePerUnitDisplay,
} from "../../../../lib/calculator";
import { type Vaporizer } from "../../../../context/data-types";

export default function CalculationDetails({
  results,
  inputs,
  selectedVaporizer,
}: {
  results: CalculatorOutputs | null;
  inputs: CalculatorInputs;
  selectedVaporizer: Vaporizer | null;
}) {
  // Calculate dose per unit using the reusable function
  const dosePerUnit = calculateDosePerUnitDisplay(inputs, selectedVaporizer);

  return (
    <Card className="bg-doser-surface border-doser-border w-full">
      <CardHeader>
        <CardTitle className="text-doser-text">Calculation Details</CardTitle>
      </CardHeader>
      <CardContent noTopPadding className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Max Doses per Unit */}
          <InnerCard>
            <div className="text-doser-text-muted text-xs font-medium uppercase tracking-wide">
              Max Doses per{" "}
              {inputs.measurementMethod === "capsule" ? "Capsule" : "Chamber"}
            </div>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="text-center">
                <div className="text-doser-text font-semibold text-lg">
                  {dosePerUnit.thc.toFixed(1)}
                </div>
                <div className="text-doser-text-muted text-xs">mg THC</div>
              </div>
              <div className="text-center">
                <div className="text-doser-text font-semibold text-lg">
                  {dosePerUnit.cbd.toFixed(1)}
                </div>
                <div className="text-doser-text-muted text-xs">mg CBD</div>
              </div>
            </div>
            <div className="text-doser-text-muted text-xs text-center mt-2">
              Based on {dosePerUnit.efficiency}% efficiency
            </div>
          </InnerCard>

          {/* Max Dose for All Units */}
          <InnerCard>
            <div className="text-doser-text-muted text-xs font-medium uppercase tracking-wide">
              Max Dose for All{" "}
              {inputs.measurementMethod === "capsule" ? "Capsules" : "Chambers"}
            </div>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="text-center">
                <div className="text-doser-text font-semibold text-lg">
                  {(
                    dosePerUnit.thc *
                    (inputs.measurementMethod === "capsule"
                      ? results?.capsulesNeeded || 0
                      : results?.chambersNeeded || 0)
                  ).toFixed(1)}
                </div>
                <div className="text-doser-text-muted text-xs">
                  mg THC Total
                </div>
              </div>
              <div className="text-center">
                <div className="text-doser-text font-semibold text-lg">
                  {(
                    dosePerUnit.cbd *
                    (inputs.measurementMethod === "capsule"
                      ? results?.capsulesNeeded || 0
                      : results?.chambersNeeded || 0)
                  ).toFixed(1)}
                </div>
                <div className="text-doser-text-muted text-xs">
                  mg CBD Total
                </div>
              </div>
            </div>
            <div className="text-doser-text-muted text-xs text-center mt-2">
              {inputs.measurementMethod === "capsule"
                ? `${results?.capsulesNeeded || 0} capsules × max per capsule`
                : `${results?.chambersNeeded || 0} chambers × max per chamber`}
            </div>
          </InnerCard>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {inputs.higherAccuracy && (
            <InnerCard>
              <div className="flex justify-between text-sm">
                <span className="text-doser-text-muted">
                  Inhalations needed:
                </span>
                <span className="text-doser-text font-medium">
                  {results ? results.inhalationsNeeded : 0}
                </span>
              </div>
            </InnerCard>
          )}
          {(inputs.measurementMethod === "capsule" ||
            inputs.measurementMethod === "chamber") && (
            <InnerCard>
              <div className="flex justify-between text-sm">
                <span className="text-doser-text-muted">
                  {inputs.measurementMethod === "capsule"
                    ? "Capsules"
                    : "Chambers"}{" "}
                  needed:
                </span>
                <span className="text-doser-text font-medium">
                  {results
                    ? inputs.measurementMethod === "capsule"
                      ? results.capsulesNeeded
                      : results.chambersNeeded
                    : 0}
                </span>
              </div>
            </InnerCard>
          )}
        </div>

        {results?.warnings && results.warnings.length > 0 && (
          <div className="mt-3 p-2 bg-yellow-100 rounded text-yellow-800 text-xs">
            {results.warnings.join(", ")}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
