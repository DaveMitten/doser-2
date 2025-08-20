import { Vaporizer } from "../context/data-types";
import { SessionFormData } from "./sessionService";

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

// Get unit max based on selected device and method
export const getUnitMax = (
  formData: SessionFormData,
  selectedDevice: Vaporizer | null
) => {
  if (!selectedDevice) return 5;

  if (formData.unitType === "capsule") {
    return 20; // Allow up to 20 capsules
  } else {
    return 10; // Allow up to 10 chamber loads
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
