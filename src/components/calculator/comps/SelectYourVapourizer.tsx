import React from "react";
import { CalculatorInputs } from "../../../lib/calculator";

import { Select, SelectContent, SelectItem } from "../../ui/select";
import { Vaporizer } from "../../../context/data-types";
import { SelectTrigger } from "../../ui/select";
import { SelectValue } from "../../ui/select";
import { dryHerbVaporizers } from "../../../data/vapes";
import { Input } from "../../ui/input";

type SelectYourVapourizerProps = {
  inputs: CalculatorInputs;
  setInputs: (inputs: CalculatorInputs) => void;
  selectedVaporizer: Vaporizer | null;
};

const SelectYourVapourizer = ({
  inputs,
  setInputs,
  selectedVaporizer,
}: SelectYourVapourizerProps) => {
  return (
    <div className="space-y-2">
      <label className="text-doser-text font-medium">Vaporizer</label>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="col-span-1">
          <Select
            value={inputs.vaporizer}
            onValueChange={(value) =>
              setInputs({ ...inputs, vaporizer: value })
            }
          >
            <SelectTrigger className="w-full bg-doser-surface border-doser-border text-doser-text">
              <SelectValue placeholder="Select your vaporizer" />
            </SelectTrigger>
            <SelectContent className="bg-doser-surface border-doser-border">
              {dryHerbVaporizers.map((vaporizer) => (
                <SelectItem
                  key={vaporizer.name}
                  value={vaporizer.name}
                  className="text-doser-text hover:bg-doser-surface-hover"
                >
                  {vaporizer.name}
                </SelectItem>
              ))}
              <SelectItem
                value="other"
                className="text-doser-text hover:bg-doser-surface-hover"
              >
                Other
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Manual Chamber Capacity for "Other" */}
        {inputs.vaporizer === "other" && (
          <div className="bg-doser-surface-hover rounded-lg p-3 text-sm col-span-1">
            <div className="space-y-2">
              <label className="text-doser-text-muted text-xs">
                Chamber Capacity (grams)
              </label>
              <Input
                type="text"
                placeholder="0.5"
                value={
                  inputs.chamberWeight === 0
                    ? ""
                    : inputs.chamberWeight.toString()
                }
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "") {
                    setInputs({
                      ...inputs,
                      chamberWeight: 0,
                    });
                    return;
                  }
                  if (/^0\.?\d*$|^[1-9]\d*\.?\d*$/.test(value)) {
                    const numValue = parseFloat(value) || 0;
                    if (numValue >= 0 && numValue <= 5) {
                      setInputs({
                        ...inputs,
                        chamberWeight: numValue,
                      });
                    }
                  }
                }}
                className="bg-doser-surface border-doser-border text-doser-text text-xs h-7"
              />
            </div>
          </div>
        )}

        {/* Vaporizer Info */}
        {inputs.vaporizer !== "other" && selectedVaporizer && (
          <div className="bg-doser-surface-hover rounded-lg p-3 text-sm col-span-1">
            <div className="space-y-1">
              {selectedVaporizer.chamberCapacity && (
                <div className="flex justify-between">
                  <span className="text-doser-text-muted">Chamber:</span>
                  <span className="text-doser-text font-medium">
                    {selectedVaporizer.chamberCapacity}g
                  </span>
                </div>
              )}
              {selectedVaporizer.dosingCapsuleCapacity && (
                <div className="flex justify-between">
                  <span className="text-doser-text-muted">Capsule:</span>
                  <span className="text-doser-text font-medium">
                    {selectedVaporizer.dosingCapsuleCapacity}g
                  </span>
                </div>
              )}
              {!selectedVaporizer.capsuleOption && (
                <div className="text-doser-text-muted text-xs">
                  No capsule support
                </div>
              )}
              <div className="text-doser-text-muted text-xs capitalize">
                {selectedVaporizer.type}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectYourVapourizer;
