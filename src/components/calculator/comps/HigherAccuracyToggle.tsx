import React from "react";
import { CalculatorInputs } from "../../../lib/calculator";
import { Switch } from "../../ui/switch";

type HigherAccuracyToggleProps = {
  inputs: CalculatorInputs;
  setInputs: (inputs: CalculatorInputs) => void;
  isVaporizerSelected: boolean;
};

const HigherAccuracyToggle = ({
  inputs,
  setInputs,
  isVaporizerSelected,
}: HigherAccuracyToggleProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-doser-text font-medium">Higher Accuracy</label>
        <Switch
          checked={inputs.higherAccuracy}
          disabled={!isVaporizerSelected}
          onCheckedChange={(checked) =>
            setInputs({ ...inputs, higherAccuracy: checked })
          }
        />
      </div>
      <p className="text-doser-text-muted text-xs">
        Include detailed inhalation calculations for more precise results
      </p>
    </div>
  );
};

export default HigherAccuracyToggle;
