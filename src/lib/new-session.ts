import { Vaporizer } from "../context/data-types";
import { SessionFormData } from "./sessionService";

// Validation function to check if all required fields are filled
export const isFormValid = (
  formData: SessionFormData,
  selectedEffects: string[]
) => {
  return (
    formData.device &&
    formData.unit &&
    formData.unitAmount &&
    formData.thcPercentage !== "" &&
    formData.cbdPercentage !== "" &&
    (!formData.higherAccuracy || formData.totalSessionInhalations) &&
    (!formData.higherAccuracy || formData.inhalationsPerCapsule) &&
    formData.date &&
    formData.time &&
    formData.duration &&
    selectedEffects.length > 0
  );
};

// Temperature conversion helpers
export const getTemperaturePlaceholder = (temperatureUnit: string) => {
  return temperatureUnit === "celsius" ? "190" : "375";
};

export const getTemperatureMin = (temperatureUnit: string) => {
  return temperatureUnit === "celsius" ? "150" : "300";
};

export const getTemperatureMax = (temperatureUnit: string) => {
  return temperatureUnit === "celsius" ? "230" : "450";
};

export const getTemperatureUnitSymbol = (temperatureUnit: string) => {
  return temperatureUnit === "celsius" ? "°C" : "°F";
};

// Get unit placeholder based on selected device and method
export const getUnitPlaceholder = (
  formData: SessionFormData,
  selectedDevice: Vaporizer | null
) => {
  if (!selectedDevice) return "1";

  if (formData.unit.includes("capsule")) {
    return "1";
  } else {
    return "1";
  }
};

// Get unit max based on selected device and method
export const getUnitMax = (
  formData: SessionFormData,
  selectedDevice: Vaporizer | null
) => {
  if (!selectedDevice) return 5;

  if (formData.unit.includes("capsule")) {
    return 10; // Allow up to 10 capsules
  } else {
    return 5; // Allow up to 5 chamber loads
  }
};

// Get unit label
export const getUnitLabel = (formData: SessionFormData) => {
  if (!formData.unit.includes("-")) return "units";

  if (formData.unit.includes("capsule")) {
    return "capsules";
  } else {
    return "chambers";
  }
};

// Check if inhalations value is valid for higher accuracy mode
export const isDrawsValid = (formData: SessionFormData) => {
  if (
    !formData.higherAccuracy ||
    !formData.inhalationsPerCapsule ||
    !formData.totalSessionInhalations
  ) {
    return true;
  }
  // Inhalations per capsule/chamber cannot exceed inhalations per capsule/chamber
  return (
    parseFloat(formData.totalSessionInhalations) <=
    parseFloat(formData.inhalationsPerCapsule)
  );
};

// Get the maximum allowed inhalations for higher accuracy mode
export const getMaxDraws = (formData: SessionFormData) => {
  if (
    !formData.higherAccuracy ||
    !formData.inhalationsPerCapsule ||
    !formData.unitAmount
  ) {
    return 50;
  }
  return Math.floor(
    parseFloat(formData.inhalationsPerCapsule) * parseFloat(formData.unitAmount)
  );
};
