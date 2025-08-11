import React from "react";
import { Button } from "../../ui/button";
import { CalculatorInputs } from "../../../lib/calculator";

type CalculateButtonProps = {
  inputs: CalculatorInputs;
  isVaporizerSelected: boolean;
  handleCalculate: () => void;
};

const CalculateButton = ({
  inputs,
  isVaporizerSelected,
  handleCalculate,
}: CalculateButtonProps) => {
  const isDisabled =
    !isVaporizerSelected ||
    (inputs.desiredDoseType === "thc" && inputs.thcPercentage === 0) ||
    (inputs.desiredDoseType === "cbd" && inputs.cbdPercentage === 0);

  const buttonText = !isVaporizerSelected
    ? "Select a Vaporizer First"
    : "Calculate Dosage";

  return (
    <Button
      onClick={handleCalculate}
      disabled={isDisabled}
      className="w-full bg-doser-primary hover:bg-doser-primary-hover text-doser-text disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {buttonText}
    </Button>
  );
};

export default CalculateButton;
