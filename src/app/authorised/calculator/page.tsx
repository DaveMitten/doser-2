"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect, useMemo } from "react";
import {
  type CalculatorInputs,
  type CalculatorOutputs,
} from "@/lib/calculator";
import { dryHerbVaporizers } from "@/data/vapes";
import { calculateDosage } from "@/lib/calculator";
import ResultsPanel from "./(comps)/ResultsPanel";
import { validateNumberInput, formatDecimalInput } from "../../../lib/utils";
import ResultsCalculations from "./(comps)/ResultsCalculations";

export default function CalculatorPage() {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    vaporizer: "",
    inhalationsPerCapsule: 8, // Default value, should come from user profile
    measurementMethod: "capsule",
    chamberWeight: 0.5, // Default chamber weight
    thcPercentage: 15,
    cbdPercentage: 0,
    desiredDoseType: "thc",
    desiredDose: 5,
    higherAccuracy: false, // Default to simple mode
  });

  const [results, setResults] = useState<CalculatorOutputs | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // Display values for decimal inputs (to handle partial typing)
  const [thcDisplayValue, setThcDisplayValue] = useState("15");
  const [cbdDisplayValue, setCbdDisplayValue] = useState("0");

  // Track the selected vaporizer data
  const selectedVaporizer = useMemo(() => {
    if (inputs.vaporizer === "other") {
      return {
        name: "Other",
        type: "portable" as const,
        chamberCapacity: inputs.chamberWeight,
        capsuleOption: false,
        dosingCapsuleCapacity: 0,
        extractionEfficiency: 65, // Default efficiency for unknown vaporizers
      };
    }
    return dryHerbVaporizers.find((vape) => vape.name === inputs.vaporizer);
  }, [inputs.vaporizer, inputs.chamberWeight]);

  // Check if vaporizer is selected (not empty)
  const isVaporizerSelected = inputs.vaporizer !== "";

  // Check if it's a known vaporizer (not "other")
  const isKnownVaporizer =
    inputs.vaporizer !== "" && inputs.vaporizer !== "other";

  // Handle vaporizer-specific logic
  useEffect(() => {
    if (selectedVaporizer && inputs.vaporizer !== "other") {
      // Update chamber weight if vaporizer has chamber capacity
      if (selectedVaporizer.chamberCapacity) {
        setInputs((prev) => ({
          ...prev,
          chamberWeight: selectedVaporizer.chamberCapacity,
        }));
      }

      // If vaporizer doesn't support capsules, force chamber method
      if (!selectedVaporizer.capsuleOption) {
        setInputs((prev) => ({
          ...prev,
          measurementMethod: "chamber",
        }));
      }
    } else if (inputs.vaporizer === "other") {
      // For "other" vaporizers, force chamber method and set default weight
      setInputs((prev) => ({
        ...prev,
        measurementMethod: "chamber",
        chamberWeight: prev.chamberWeight || 0.5, // Default to 0.5g if not set
      }));
    }
  }, [selectedVaporizer, inputs.vaporizer]);

  // Note: Display values are managed by handleDecimalInput to avoid race conditions

  const handleCalculate = () => {
    console.log("Calculate button clicked!");
    console.log("Calculator inputs:", inputs);
    console.log("Selected vaporizer:", selectedVaporizer);

    try {
      setErrors([]);
      const result = calculateDosage(inputs);
      console.log("Calculation result:", result);
      setResults(result);
    } catch (error) {
      console.error("Calculation error:", error);
      setErrors([
        error instanceof Error ? error.message : "Calculation failed",
      ]);
    }
  };

  const handleDecimalInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof CalculatorInputs
  ) => {
    const value = e.target.value;

    // Prevent multiple decimal points from being entered
    if ((value.match(/\./g) || []).length > 1) {
      return; // Don't allow the input
    }

    // Apply formatting immediately for all cases
    const formattedValue = formatDecimalInput(value);

    // Update display value with formatted result
    if (field === "thcPercentage") {
      setThcDisplayValue(formattedValue);
    } else if (field === "cbdPercentage") {
      setCbdDisplayValue(formattedValue);
    }

    // Allow empty input
    if (value === "") {
      setInputs({
        ...inputs,
        [field]: 0,
      });
      return;
    }

    // Allow decimal point and partial decimal inputs
    if (value === "." || value === "0." || value.endsWith(".")) {
      // Don't update numeric state yet, let user continue typing
      return;
    }

    // Check if it's a valid decimal number
    if (/^\d+\.?\d*$|^\d*\.\d+$|^\d+$/.test(value)) {
      const numValue = parseFloat(formattedValue);

      // Only update if we have a valid number
      if (!isNaN(numValue)) {
        setInputs({
          ...inputs,
          [field]: numValue,
        });
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-doser-text mb-2">
          Dosage Calculator
        </h1>
        <p className="text-doser-text-muted">
          Calculate your optimal cannabis dosage based on your profile and
          preferences
        </p>
      </div>

      {/* Calculator Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-5 gap-8">
        {/* Input Form */}
        <div className="lg:col-span-2 xl:col-span-2 space-y-6">
          <Card className="bg-doser-surface border-doser-border">
            <CardHeader>
              <CardTitle className="text-doser-text">
                Calculator Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Vaporizer Selection */}
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
                            <span className="text-doser-text-muted">
                              Chamber:
                            </span>
                            <span className="text-doser-text font-medium">
                              {selectedVaporizer.chamberCapacity}g
                            </span>
                          </div>
                        )}
                        {selectedVaporizer.dosingCapsuleCapacity && (
                          <div className="flex justify-between">
                            <span className="text-doser-text-muted">
                              Capsule:
                            </span>
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

              {/* Measurement Method */}
              <div className="space-y-2">
                <label className="text-doser-text font-medium">
                  Measurement Method
                </label>
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
                    onClick={() =>
                      setInputs({ ...inputs, measurementMethod: "capsule" })
                    }
                  >
                    Capsule
                  </Button>
                  <Button
                    type="button"
                    variant={
                      inputs.measurementMethod === "chamber"
                        ? "default"
                        : "outline"
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

              {/* Higher Accuracy Toggle */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-doser-text font-medium">
                    Higher Accuracy
                  </label>
                  <Switch
                    checked={inputs.higherAccuracy}
                    disabled={!isVaporizerSelected}
                    onCheckedChange={(checked) =>
                      setInputs({ ...inputs, higherAccuracy: checked })
                    }
                  />
                </div>
                <p className="text-doser-text-muted text-xs">
                  Include detailed inhalation calculations for more precise
                  results
                </p>
              </div>

              {/* Inhalations per Capsule (only for higher accuracy + capsule method) */}
              {inputs.higherAccuracy && (
                <div className="space-y-2">
                  <label className="text-doser-text font-medium">
                    Inhalations per Capsule
                  </label>
                  <Input
                    type="text"
                    placeholder="8"
                    disabled={!isVaporizerSelected}
                    value={
                      inputs. === 0
                        ? ""
                        : inputs.inhalationsPerCapsule.toString()
                    }
                    onChange={(e) =>
                      validateNumberInput(
                        e,
                        "totalSessionInhalations",
                        setInputs,
                        inputs
                      )
                    }
                    className="bg-doser-surface border-doser-border text-doser-text placeholder-gray-400"
                  />
                </div>
              )}

              {/* THC and CBD Content */}
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

              {/* Desired Dose Type */}
              <div className="space-y-2">
                <label className="text-doser-text font-medium">
                  Desired Dose Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={
                      inputs.desiredDoseType === "thc" ? "doser" : "outline"
                    }
                    className={
                      inputs.desiredDoseType === "thc"
                        ? "bg-doser-primary-light border-doser-primary/20 text-doser-primary"
                        : "bg-doser-surface border-doser-border text-doser-text-muted hover:bg-doser-surface-hover hover:text-doser-text"
                    }
                    disabled={!isVaporizerSelected}
                    onClick={() =>
                      setInputs({ ...inputs, desiredDoseType: "thc" })
                    }
                  >
                    THC
                  </Button>
                  <Button
                    type="button"
                    variant={
                      inputs.desiredDoseType === "cbd" ? "doser" : "outline"
                    }
                    className={
                      inputs.desiredDoseType === "cbd"
                        ? "bg-doser-primary-light border-doser-primary/20 text-doser-primary"
                        : "bg-doser-surface border-doser-border text-doser-text-muted hover:bg-doser-surface-hover hover:text-doser-text"
                    }
                    disabled={!isVaporizerSelected}
                    onClick={() =>
                      setInputs({ ...inputs, desiredDoseType: "cbd" })
                    }
                  >
                    CBD
                  </Button>
                </div>
              </div>

              {/* Desired Dose */}
              <div className="space-y-2">
                <label className="text-doser-text font-medium">
                  Desired Dose (mg)
                </label>
                <Input
                  type="text"
                  placeholder="5"
                  disabled={!isVaporizerSelected}
                  value={
                    inputs.desiredDose === 0
                      ? ""
                      : inputs.desiredDose.toString()
                  }
                  onChange={(e) =>
                    validateNumberInput(e, "desiredDose", setInputs, inputs)
                  }
                  className="bg-doser-surface border-doser-border text-doser-text placeholder-gray-400"
                />
              </div>

              {/* Error Display */}
              {errors.length > 0 && (
                <div className="p-3 bg-red-100 border border-red-300 rounded-lg">
                  <h4 className="text-red-800 font-medium text-sm mb-1">
                    Calculation Errors:
                  </h4>
                  <ul className="text-red-700 text-xs space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Calculate Button */}
              <Button
                onClick={handleCalculate}
                disabled={
                  !isVaporizerSelected ||
                  (inputs.desiredDoseType === "thc" &&
                    inputs.thcPercentage === 0) ||
                  (inputs.desiredDoseType === "cbd" &&
                    inputs.cbdPercentage === 0)
                }
                className="w-full bg-doser-primary hover:bg-doser-primary-hover text-doser-text disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!isVaporizerSelected
                  ? "Select a Vaporizer First"
                  : "Calculate Dosage"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        {results && selectedVaporizer && (
          <ResultsPanel
            results={results}
            inputs={inputs}
            selectedVaporizer={selectedVaporizer}
          />
        )}
        {/* Recent Calculations */}
        {results && selectedVaporizer && (
          <ResultsCalculations
            results={results}
            inputs={inputs}
            selectedVaporizer={selectedVaporizer}
          />
        )}
      </div>
    </div>
  );
}
