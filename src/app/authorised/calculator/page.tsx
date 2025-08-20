"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import SelectYourVapourizer from "../../../components/calculator/comps/SelectYourVapourizer";
import MeasurementMethod from "../../../components/calculator/comps/MeasurementMethod";
import HigherAccuracyToggle from "../../../components/calculator/comps/HigherAccuracyToggle";
import InhalationsPerCapsule from "../../../components/calculator/comps/InhalationsPerCapsule";
import CannabinoidContent from "../../../components/calculator/comps/CannabinoidContent";
import DesiredDoseType from "../../../components/calculator/comps/DesiredDoseType";
import DesiredDose from "../../../components/calculator/comps/DesiredDose";
import ErrorDisplay from "../../../components/calculator/comps/ErrorDisplay";
import CalculateButton from "../../../components/calculator/comps/CalculateButton";

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
              <SelectYourVapourizer
                inputs={inputs}
                setInputs={setInputs}
                selectedVaporizer={selectedVaporizer ?? null}
              />

              {/* Measurement Method */}
              <MeasurementMethod
                inputs={inputs}
                setInputs={setInputs}
                selectedVaporizer={selectedVaporizer ?? null}
                isVaporizerSelected={isVaporizerSelected}
                isKnownVaporizer={isKnownVaporizer}
              />

              {/* Higher Accuracy Toggle */}
              <HigherAccuracyToggle
                inputs={inputs}
                setInputs={setInputs}
                isVaporizerSelected={isVaporizerSelected}
              />

              {/* Inhalations per Capsule (only for higher accuracy + capsule method) */}
              {inputs.higherAccuracy && (
                <InhalationsPerCapsule
                  inputs={inputs}
                  setInputs={setInputs}
                  isVaporizerSelected={isVaporizerSelected}
                />
              )}

              {/* THC and CBD Content */}
              <CannabinoidContent
                thcDisplayValue={thcDisplayValue}
                cbdDisplayValue={cbdDisplayValue}
                handleDecimalInput={handleDecimalInput}
                isVaporizerSelected={isVaporizerSelected}
              />

              {/* Desired Dose Type */}
              <DesiredDoseType
                inputs={inputs}
                setInputs={setInputs}
                isVaporizerSelected={isVaporizerSelected}
              />

              {/* Desired Dose */}
              <DesiredDose
                inputs={inputs}
                setInputs={setInputs}
                isVaporizerSelected={isVaporizerSelected}
                validateNumberInput={validateNumberInput}
              />

              {/* Error Display */}
              <ErrorDisplay errors={errors} />

              {/* Calculate Button */}
              <CalculateButton
                inputs={inputs}
                isVaporizerSelected={isVaporizerSelected}
                handleCalculate={handleCalculate}
              />
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
