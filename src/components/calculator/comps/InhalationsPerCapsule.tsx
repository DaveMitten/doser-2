import React from "react";
import { CalculatorInputs } from "../../../lib/calculator";
import { Input } from "../../ui/input";
import { validateNumberInput } from "../../../lib/utils";

type InhalationsPerCapsuleProps = {
  inputs: CalculatorInputs;
  setInputs: (inputs: CalculatorInputs) => void;
  isVaporizerSelected: boolean;
};

const InhalationsPerCapsule = ({
  inputs,
  setInputs,
  isVaporizerSelected,
}: InhalationsPerCapsuleProps) => {
  return (
    <div className="space-y-2">
      <label className="text-doser-text font-medium">
        Inhalations per Capsule
      </label>
      <Input
        type="text"
        placeholder="8"
        disabled={!isVaporizerSelected}
        value={
          inputs.inhalationsPerCapsule === 0
            ? ""
            : inputs.inhalationsPerCapsule.toString()
        }
        onChange={(e) =>
          validateNumberInput(e, "totalSessionInhalations", setInputs, inputs)
        }
        className="bg-doser-surface border-doser-border text-doser-text placeholder-gray-400"
      />
    </div>
  );
};

export default InhalationsPerCapsule;
