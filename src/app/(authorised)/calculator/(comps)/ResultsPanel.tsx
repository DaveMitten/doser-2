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

export default function ResultsPanel({
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
    <Card className="bg-doser-surface border-doser-border">
      <CardHeader>
        <CardTitle className="text-doser-text">Quick Results</CardTitle>
      </CardHeader>
      <CardContent noTopPadding className="space-y-4">
        {/* Recommended Dose */}
        <InnerCard>
          <div className="text-doser-text-muted text-xs font-medium uppercase tracking-wide">
            Recommended Dose
          </div>
          <div className="text-center mt-2">
            <div className="text-doser-text font-semibold text-2xl">
              {results ? results.recommendedDose.toFixed(1) : "0.0"}
            </div>
            <div className="text-doser-text-muted text-sm">
              mg {inputs.desiredDoseType.toUpperCase()}
            </div>
          </div>
        </InnerCard>

        {/* Confidence Level */}
        <InnerCard>
          <div className="text-doser-text-muted text-xs font-medium uppercase tracking-wide">
            Confidence Level
          </div>
          <div className="text-center mt-2">
            <div className="text-doser-text font-semibold text-xl">
              {results ? results.confidence.toFixed(0) : "0"}%
            </div>
            <div className="text-doser-text-muted text-xs">
              Based on your inputs
            </div>
          </div>
        </InnerCard>

        {/* Quick Summary */}
        <InnerCard>
          <div className="text-doser-text-muted text-xs font-medium uppercase tracking-wide">
            Quick Summary
          </div>
          <div className="space-y-2 mt-2 text-sm">
            <div className="flex justify-between">
              <span className="text-doser-text-muted">Method:</span>
              <span className="text-doser-text capitalize">
                {inputs.measurementMethod}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-doser-text-muted">Vaporizer:</span>
              <span className="text-doser-text">
                {selectedVaporizer?.name || "Not selected"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-doser-text-muted">Efficiency:</span>
              <span className="text-doser-text">{dosePerUnit.efficiency}%</span>
            </div>
          </div>
        </InnerCard>
      </CardContent>
    </Card>
  );
}
