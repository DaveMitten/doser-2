import React from "react";
import { Button } from "../../ui/button";
import { Vaporizer } from "../../../context/data-types";
import { CalculatorInputs } from "../../../lib/calculator";

type MeasurementMethodProps = {
  inputs: CalculatorInputs;
  setInputs: (inputs: CalculatorInputs) => void;
  selectedVaporizer: Vaporizer | null;
  isVaporizerSelected: boolean;
  isKnownVaporizer: boolean;
};

const MeasurementMethod = ({
  inputs,
  setInputs,
  selectedVaporizer,
  isVaporizerSelected,
  isKnownVaporizer,
}: MeasurementMethodProps) => {
  return (
    <div className="space-y-2">
      <label className="text-doser-text font-medium">Measurement Method</label>
      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          className={
            inputs.measurementMethod === "capsule"
              ? "bg-doser-primary-light border-doser-primary/20 text-doser-primary"
              : "bg-doser-surface border-doser-border text-doser-text-muted hover:bg-doser-surface-hover hover:text-doser-text"
          }
          disabled={
            !isVaporizerSelected ||
            (isKnownVaporizer &&
              selectedVaporizer &&
              !selectedVaporizer.capsuleOption) ||
            inputs.vaporizer === "other"
          }
          onClick={() => setInputs({ ...inputs, measurementMethod: "capsule" })}
        >
          Capsule
        </Button>
        <Button
          type="button"
          variant={
            inputs.measurementMethod === "chamber" ? "default" : "outline"
          }
          className={
            inputs.measurementMethod === "chamber"
              ? "bg-doser-primary-light border-doser-primary/20 text-doser-primary"
              : "bg-doser-surface border-doser-border text-doser-text-muted hover:bg-doser-surface-hover hover:text-doser-text"
          }
          disabled={!isVaporizerSelected}
          onClick={() => {
            setInputs({ ...inputs, measurementMethod: "chamber" });
          }}
        >
          Chamber
        </Button>
      </div>
    </div>
  );
};

export default MeasurementMethod;
