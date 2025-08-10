import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../../components/ui/card";
import {
  CalculatorInputs,
  CalculatorOutputs,
} from "../../../../lib/calculator";
import { type Vaporizer } from "../../../../context/data-types";

export default function ResultsPanel({
  results,
  inputs,
  selectedVaporizer,
}: {
  results: CalculatorOutputs;
  inputs: CalculatorInputs;
  selectedVaporizer: Vaporizer | null;
}) {
  return (
    <div className="lg:col-span-1 xl:col-span-1 space-y-6">
      {/* Safety Guidelines */}
      <Card className="bg-doser-surface border-doser-border">
        <CardHeader>
          <CardTitle className="text-doser-text">Safety Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start space-x-3">
            <svg
              className="w-5 h-5 text-doser-primary mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-doser-text text-sm">
              Start with half the recommended dose
            </span>
          </div>
          <div className="flex items-start space-x-3">
            <svg
              className="w-5 h-5 text-doser-primary mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-doser-text text-sm">
              Wait 15-30 minutes before consuming more
            </span>
          </div>
          <div className="flex items-start space-x-3">
            <svg
              className="w-5 h-5 text-doser-primary mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-doser-text text-sm">
              Consume in a safe, comfortable environment
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Calculation Details */}
      <Card className="bg-doser-surface border-doser-border">
        <CardHeader>
          <CardTitle className="text-doser-text">Calculation Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {/* Max Doses per Unit */}
          {results && (
            <div className="space-y-3 p-3 bg-doser-surface-hover rounded-lg">
              <div className="text-doser-text-muted text-xs font-medium uppercase tracking-wide">
                Max Doses per{" "}
                {inputs.measurementMethod === "capsule" ? "Capsule" : "Chamber"}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <div className="text-doser-text font-semibold text-lg">
                    {(() => {
                      const weight =
                        inputs.measurementMethod === "capsule"
                          ? selectedVaporizer?.dosingCapsuleCapacity || 0.15
                          : inputs.chamberWeight;
                      const efficiency =
                        selectedVaporizer?.extractionEfficiency || 65;
                      const dosePerUnit =
                        (inputs.thcPercentage / 100) *
                        1000 *
                        weight *
                        (efficiency / 100);
                      return dosePerUnit.toFixed(1);
                    })()}
                  </div>
                  <div className="text-doser-text-muted text-xs">mg THC</div>
                </div>
                <div className="text-center">
                  <div className="text-doser-text font-semibold text-lg">
                    {(() => {
                      const weight =
                        inputs.measurementMethod === "capsule"
                          ? selectedVaporizer?.dosingCapsuleCapacity || 0.15
                          : inputs.chamberWeight;
                      const efficiency =
                        selectedVaporizer?.extractionEfficiency || 65;
                      const dosePerUnit =
                        (inputs.cbdPercentage / 100) *
                        1000 *
                        weight *
                        (efficiency / 100);
                      return dosePerUnit.toFixed(1);
                    })()}
                  </div>
                  <div className="text-doser-text-muted text-xs">mg CBD</div>
                </div>
              </div>
              <div className="text-doser-text-muted text-xs text-center">
                Based on {selectedVaporizer?.extractionEfficiency || 65}%
                efficiency
              </div>
            </div>
          )}

          {/* Max Dose for All Units */}
          {results && (
            <div className="space-y-3 p-3 bg-doser-surface-hover rounded-lg">
              <div className="text-doser-text-muted text-xs font-medium uppercase tracking-wide">
                Max Dose for All{" "}
                {inputs.measurementMethod === "capsule"
                  ? "Capsules"
                  : "Chambers"}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <div className="text-doser-text font-semibold text-lg">
                    {(() => {
                      const weight =
                        inputs.measurementMethod === "capsule"
                          ? selectedVaporizer?.dosingCapsuleCapacity || 0.15
                          : inputs.chamberWeight;
                      const efficiency =
                        selectedVaporizer?.extractionEfficiency || 65;
                      const dosePerUnit =
                        (inputs.thcPercentage / 100) *
                        1000 *
                        weight *
                        (efficiency / 100);
                      const totalDose =
                        dosePerUnit *
                        (inputs.measurementMethod === "capsule"
                          ? results.capsulesNeeded
                          : results.chambersNeeded);
                      return totalDose.toFixed(1);
                    })()}
                  </div>
                  <div className="text-doser-text-muted text-xs">
                    mg THC Total
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-doser-text font-semibold text-lg">
                    {(() => {
                      const weight =
                        inputs.measurementMethod === "capsule"
                          ? selectedVaporizer?.dosingCapsuleCapacity || 0.15
                          : inputs.chamberWeight;
                      const efficiency =
                        selectedVaporizer?.extractionEfficiency || 65;
                      const dosePerUnit =
                        (inputs.cbdPercentage / 100) *
                        1000 *
                        weight *
                        (efficiency / 100);
                      const totalDose =
                        dosePerUnit *
                        (inputs.measurementMethod === "capsule"
                          ? results.capsulesNeeded
                          : results.chambersNeeded);
                      return totalDose.toFixed(1);
                    })()}
                  </div>
                  <div className="text-doser-text-muted text-xs">
                    mg CBD Total
                  </div>
                </div>
              </div>
              <div className="text-doser-text-muted text-xs text-center">
                {inputs.measurementMethod === "capsule"
                  ? `${results.capsulesNeeded} capsules × max per capsule`
                  : `${results.chambersNeeded} chambers × max per chamber`}
              </div>
            </div>
          )}

          {inputs.higherAccuracy && (
            <div className="flex justify-between text-sm">
              <span className="text-doser-text-muted">Inhalations needed:</span>
              <span className="text-doser-text font-medium">
                {results ? results.inhalationsNeeded : 0}
              </span>
            </div>
          )}
          {inputs.measurementMethod === "capsule" && (
            <div className="flex justify-between text-sm">
              <span className="text-doser-text-muted">Capsules needed:</span>
              <span className="text-doser-text font-medium">
                {results ? results.capsulesNeeded : 0}
              </span>
            </div>
          )}
          {inputs.measurementMethod === "chamber" && (
            <div className="flex justify-between text-sm">
              <span className="text-doser-text-muted">Chambers needed:</span>
              <span className="text-doser-text font-medium">
                {results ? results.chambersNeeded : 0}
              </span>
            </div>
          )}
          {results && results.warnings && results.warnings.length > 0 && (
            <div className="mt-3 p-2 bg-yellow-100 rounded text-yellow-800 text-xs">
              {results.warnings.join(", ")}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
