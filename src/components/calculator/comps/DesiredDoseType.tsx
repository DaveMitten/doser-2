import React from "react";
import { Button } from "../../ui/button";
import { CalculatorInputs } from "../../../lib/calculator";

type DesiredDoseTypeProps = {
  inputs: CalculatorInputs;
  setInputs: (inputs: CalculatorInputs) => void;
  isVaporizerSelected: boolean;
};

const DesiredDoseType = ({
  inputs,
  setInputs,
  isVaporizerSelected,
}: DesiredDoseTypeProps) => {
  return (
    <div className="space-y-2">
      <label className="text-doser-text font-medium">Desired Dose Type</label>
      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant={inputs.desiredDoseType === "thc" ? "default" : "outline"}
          className={
            inputs.desiredDoseType === "thc"
              ? "bg-doser-primary-light border-doser-primary/20 text-doser-primary"
              : "bg-doser-surface border-doser-border text-doser-text-muted hover:bg-doser-surface-hover hover:text-doser-text"
          }
          disabled={!isVaporizerSelected}
          onClick={() => setInputs({ ...inputs, desiredDoseType: "thc" })}
        >
          THC
        </Button>
        <Button
          type="button"
          variant={inputs.desiredDoseType === "cbd" ? "default" : "outline"}
          className={
            inputs.desiredDoseType === "cbd"
              ? "bg-doser-primary-light border-doser-primary/20 text-doser-primary"
              : "bg-doser-surface border-doser-border text-doser-text-muted hover:bg-doser-surface-hover hover:text-doser-text"
          }
          disabled={!isVaporizerSelected}
          onClick={() => setInputs({ ...inputs, desiredDoseType: "cbd" })}
        >
          CBD
        </Button>
      </div>
    </div>
  );
};

export default DesiredDoseType;
