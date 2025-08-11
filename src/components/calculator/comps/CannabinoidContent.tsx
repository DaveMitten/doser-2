import React from "react";
import { Input } from "../../ui/input";
import { CalculatorInputs } from "../../../lib/calculator";

type CannabinoidContentProps = {
  thcDisplayValue: string;
  cbdDisplayValue: string;
  handleDecimalInput: (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof CalculatorInputs
  ) => void;
  isVaporizerSelected: boolean;
};

const CannabinoidContent = ({
  thcDisplayValue,
  cbdDisplayValue,
  handleDecimalInput,
  isVaporizerSelected,
}: CannabinoidContentProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="text-doser-text font-medium">THC (%)</label>
        <Input
          type="text"
          placeholder="0"
          disabled={!isVaporizerSelected}
          value={thcDisplayValue}
          onChange={(e) => handleDecimalInput(e, "thcPercentage")}
          className="bg-doser-surface border-doser-border text-doser-text placeholder-gray-400"
        />
      </div>

      <div className="space-y-2">
        <label className="text-doser-text font-medium">CBD (%)</label>
        <Input
          type="text"
          placeholder="0"
          disabled={!isVaporizerSelected}
          value={cbdDisplayValue}
          onChange={(e) => handleDecimalInput(e, "cbdPercentage")}
          className="bg-doser-surface border-doser-border text-doser-text placeholder-gray-400"
        />
      </div>
    </div>
  );
};

export default CannabinoidContent;
