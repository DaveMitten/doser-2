import React from "react";
import { Input } from "../../ui/input";
import { CalculatorInputs } from "../../../lib/calculator";

type DesiredDoseProps = {
  inputs: CalculatorInputs;
  setInputs: (inputs: CalculatorInputs) => void;
  isVaporizerSelected: boolean;
  validateNumberInput: (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof CalculatorInputs,
    setInputs: (inputs: CalculatorInputs) => void,
    inputs: CalculatorInputs
  ) => void;
};

const DesiredDose = ({
  inputs,
  setInputs,
  isVaporizerSelected,
  validateNumberInput,
}: DesiredDoseProps) => {
  return (
    <div className="space-y-2">
      <label className="text-doser-text font-medium">Desired Dose (mg)</label>
      <Input
        type="text"
        placeholder="5"
        disabled={!isVaporizerSelected}
        value={inputs.desiredDose === 0 ? "" : inputs.desiredDose.toString()}
        onChange={(e) =>
          validateNumberInput(e, "desiredDose", setInputs, inputs)
        }
        className="bg-doser-surface border-doser-border text-doser-text placeholder-gray-400"
      />
    </div>
  );
};

export default DesiredDose;
