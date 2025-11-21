"use client";

import { useState, useEffect, useMemo } from "react";
import {
  type CalculatorInputs,
  type CalculatorOutputs,
} from "@/lib/calculator";
import { dryHerbVaporizers } from "@/data/vapes";
import { calculateDosage } from "@/lib/calculator";
import { formatDecimalInput } from "../../../lib/utils";
import CalculationDetails from "./(comps)/CalculationDetails";
import { CalculatorEmptyState } from "@/components/calculator/calculator-empty-state";
import { EnhancedCalculatorForm } from "@/components/calculator/enhanced-calculator-form";

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
    totalSessionInhalations: 0,
    totalTHC: 0,
    totalCBD: 0,
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

      // Auto-select the first available measurement method when vaporizer is selected
      if (
        inputs.measurementMethod === "capsule" ||
        inputs.measurementMethod === "chamber"
      ) {
        // User has already made a selection, don't override
        return;
      }

      // Prefer chamber if available, otherwise use capsule
      if (selectedVaporizer.chamberCapacity > 0) {
        setInputs((prev) => ({
          ...prev,
          measurementMethod: "chamber",
        }));
      } else if (selectedVaporizer.capsuleOption) {
        setInputs((prev) => ({
          ...prev,
          measurementMethod: "capsule",
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
  }, [selectedVaporizer, inputs.vaporizer, inputs.measurementMethod]);

  // Note: Display values are managed by handleDecimalInput to avoid race conditions

  const handleCalculate = () => {
    try {
      setErrors([]);
      const result = calculateDosage(inputs);
      setResults(result);
    } catch (error) {
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
    <div className="container mx-auto p-6 space-y-10">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-gradient-doser">
          Dosage Calculator
        </h1>
        <p className="text-doser-text-muted leading-relaxed">
          Calculate your optimal cannabis dosage based on your profile and preferences.<br />
          Get personalized recommendations for a safe and effective experience.
        </p>
      </div>

      {/* Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <EnhancedCalculatorForm
          inputs={inputs}
          setInputs={setInputs}
          onCalculate={handleCalculate}
          errors={errors}
          isVaporizerSelected={isVaporizerSelected}
          thcDisplayValue={thcDisplayValue}
          cbdDisplayValue={cbdDisplayValue}
          onDecimalInput={handleDecimalInput}
        />

        {/* Results/Empty State */}
        <div>
          {results ? (
            <CalculationDetails
              results={results}
              inputs={inputs}
              selectedVaporizer={selectedVaporizer ?? null}
            />
          ) : (
            <CalculatorEmptyState />
          )}
        </div>
      </div>
    </div>
  );
}
