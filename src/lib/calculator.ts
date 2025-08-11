import { dryHerbVaporizers } from "@/data/vapes";

// Types for calculator inputs and outputs
export interface CalculatorInputs {
  vaporizer: string; // Device type from dropdown
  totalSessionInhalations: number; // Total draws/hits for the session
  measurementMethod: "chamber" | "capsule";
  chamberWeight: number; // in grams, when using chamber method
  weight?: number; // in grams, if using weight method (deprecated)
  thcPercentage: number; // 0-100
  cbdPercentage: number; // 0-100
  desiredDoseType: "thc" | "cbd"; // User must choose one
  desiredDose: number; // in mg
  higherAccuracy: boolean; // Whether to use detailed inhalation calculations
  inhalationsPerCapsule: number;

  totalTHC: number; // Total THC
  totalCBD: number; // Total CBD
}

export interface CalculatorOutputs {
  recommendedDose: number; // in mg
  inhalationsNeeded: number;
  capsulesNeeded: number;
  chambersNeeded: number;
  weightNeeded?: number; // in grams
  confidence: number; // 0-100
  warnings: string[];
}

// Helper function to validate inputs
export function validateCalculatorInputs(inputs: CalculatorInputs): string[] {
  const errors: string[] = [];

  if (inputs.higherAccuracy && inputs.totalSessionInhalations <= 0) {
    errors.push(
      "Total draws must be greater than 0 when using higher accuracy"
    );
  }

  if (inputs.thcPercentage < 0 || inputs.thcPercentage > 100) {
    errors.push("THC percentage must be between 0 and 100");
  }

  if (inputs.cbdPercentage < 0 || inputs.cbdPercentage > 100) {
    errors.push("CBD percentage must be between 0 and 100");
  }

  if (inputs.thcPercentage + inputs.cbdPercentage > 100) {
    errors.push("Total THC + CBD percentage cannot exceed 100%");
  }

  if (!inputs.desiredDoseType) {
    errors.push("Must choose either THC or CBD dose type");
  }

  if (inputs.desiredDose <= 0) {
    errors.push("Desired dose must be greater than 0");
  }

  if (
    inputs.measurementMethod === "chamber" &&
    (!inputs.chamberWeight || inputs.chamberWeight <= 0)
  ) {
    errors.push(
      "Chamber weight must be specified when using chamber measurement method"
    );
  }

  return errors;
}

// Get capsule weight based on vaporizer type
function getCapsuleWeight(vaporizer: string): number | null {
  if (vaporizer === "other") {
    return null; // "Other" vaporizers don't support capsules by default
  }
  return (
    dryHerbVaporizers.find((vape) => vape.name === vaporizer)
      ?.dosingCapsuleCapacity ?? null
  );
}

// Calculate total cannabinoids per capsule/weight
function calculateTotalCannabinoids(inputs: CalculatorInputs): {
  thc: number;
  cbd: number;
} {
  let weight: number;

  if (inputs.measurementMethod === "chamber") {
    weight = inputs.chamberWeight;
  } else {
    // Use capsule method - get weight based on vaporizer
    weight = getCapsuleWeight(inputs.vaporizer) ?? 0;
  }

  // Calculate mg of cannabinoids in the given weight
  // Percentage is based on 1 gram, so we multiply by the weight fraction
  const thcMg = (inputs.thcPercentage / 100) * 1000 * weight; // mg per weight
  const cbdMg = (inputs.cbdPercentage / 100) * 1000 * weight; // mg per weight

  return {
    thc: thcMg,
    cbd: cbdMg,
  };
}

const getEfficiency = (vaporizer: string): number => {
  if (vaporizer === "other") {
    return 0.65; // Default 65% efficiency for unknown vaporizers
  }
  return (
    (dryHerbVaporizers.find((vape) => vape.name === vaporizer)
      ?.extractionEfficiency ?? 65) / 100
  );
};

const getFinalDose = (
  totalCannabinoids: { thc: number; cbd: number },
  efficiency: number
): { thc: number; cbd: number } => {
  return {
    thc: totalCannabinoids.thc * efficiency,
    cbd: totalCannabinoids.cbd * efficiency,
  };
};

// Calculate dose per inhalation (for capsule method)
const calculateDosePerUnit = (
  inputs: CalculatorInputs
): {
  thc: number;
  cbd: number;
} => {
  const efficiency = getEfficiency(inputs.vaporizer);
  const totalCannabinoids = calculateTotalCannabinoids(inputs);
  const finalDose = getFinalDose(totalCannabinoids, efficiency);

  if (inputs.higherAccuracy && inputs.measurementMethod === "capsule") {
    // Higher accuracy: calculate per inhalation
    return {
      thc: finalDose.thc / inputs.totalSessionInhalations,
      cbd: finalDose.cbd / inputs.totalSessionInhalations,
    };
  } else {
    // Simple mode: calculate per capsule/chamber
    return finalDose;
  }
};

// Main calculator function
export const calculateDosage = (
  inputs: CalculatorInputs
): CalculatorOutputs => {
  const errors = validateCalculatorInputs(inputs);
  if (errors.length > 0) {
    throw new Error(`Invalid inputs: ${errors.join(", ")}`);
  }
  console.log("inputs", inputs);
  const dosePerUnit = calculateDosePerUnit(inputs);
  const warnings: string[] = [];

  // Store total draws to user profile (console log for now)
  if (inputs.higherAccuracy) {
    console.log(
      `Saving total draws to user profile: ${inputs.totalSessionInhalations}`
    );
  }

  let recommendedDose = 0;
  let unitsNeeded = 0;
  let inhalationsNeeded = 0;
  let capsulesNeeded = 0;

  const targetDose =
    inputs.desiredDoseType === "thc" ? dosePerUnit.thc : dosePerUnit.cbd;
  recommendedDose = inputs.desiredDose;

  if (inputs.higherAccuracy && inputs.measurementMethod === "capsule") {
    // Higher accuracy mode: calculate inhalations directly
    inhalationsNeeded = Math.ceil(inputs.desiredDose / targetDose);
    capsulesNeeded = Math.ceil(
      inhalationsNeeded / inputs.totalSessionInhalations
    );
  } else {
    // Simple mode: calculate capsules/chambers directly
    unitsNeeded = inputs.desiredDose / targetDose;

    if (inputs.measurementMethod === "capsule") {
      capsulesNeeded = Math.ceil(unitsNeeded);
      inhalationsNeeded = inputs.higherAccuracy
        ? capsulesNeeded * inputs.totalSessionInhalations
        : 0; // Don't show inhalations in simple mode
    } else {
      // Chamber method
      inhalationsNeeded = inputs.higherAccuracy ? Math.ceil(unitsNeeded) : 0;
    }
  }

  // Calculate confidence based on various factors
  const confidence = calculateConfidence(inputs, dosePerUnit);

  return {
    recommendedDose,
    inhalationsNeeded: Math.round(inhalationsNeeded),
    capsulesNeeded,
    chambersNeeded:
      inputs.measurementMethod === "chamber"
        ? Math.ceil(unitsNeeded || 1)
        : capsulesNeeded,
    weightNeeded:
      inputs.measurementMethod === "chamber" ? inputs.chamberWeight : undefined,
    confidence,
    warnings,
  };
};

// Calculate confidence level in the recommendation
export function calculateConfidence(
  _inputs: CalculatorInputs,
  _dosePerInhalation: { thc: number; cbd: number }
): number {
  // TODO: Implement confidence calculation
  // Factors to consider:
  // - Temperature range (optimal vs extreme)
  // - Inhalation consistency
  // - Cannabinoid percentages
  // - User experience level
  return 85; // Placeholder
}
