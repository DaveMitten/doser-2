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
  // TODO: Add recent calculations from the database
  return (
    <div className="lg:col-span-3 xl:col-span-2 space-y-6 min-w-[300px]">
      <Card className="bg-doser-surface border-doser-border">
        <CardHeader>
          <CardTitle className="text-doser-text">Recent Calculations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start justify-between p-3 bg-doser-surface-hover rounded-lg">
              <div className="flex-1 min-w-0">
                <div className="text-doser-text font-medium text-sm truncate">
                  Flower - Vaporizer
                </div>
                <div className="text-doser-text-muted text-xs mt-1">
                  THC: 18% | Medium Tolerance
                </div>
              </div>
              <div className="text-right ml-3">
                <div className="text-doser-text font-semibold">2.1mg</div>
                <div className="text-doser-text-muted text-xs mt-1">
                  2 hours ago
                </div>
              </div>
            </div>
            <div className="flex items-start justify-between p-3 bg-doser-surface-hover rounded-lg">
              <div className="flex-1 min-w-0">
                <div className="text-doser-text font-medium text-sm truncate">
                  Concentrate - Vaporizer
                </div>
                <div className="text-doser-text-muted text-xs mt-1">
                  THC: 75% | High Tolerance
                </div>
              </div>
              <div className="text-right ml-3 flex-shrink-0">
                <div className="text-doser-text font-semibold">5.2mg</div>
                <div className="text-doser-text-muted text-xs mt-1">
                  Yesterday
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
