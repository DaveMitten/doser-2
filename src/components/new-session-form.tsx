"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect, useCallback } from "react";
import { useUserPreferences } from "@/lib/useUserPreferences";
import { dryHerbVaporizers } from "@/data/vapes";
import { type Vaporizer } from "@/context/data-types";
import { calculateDosage, type CalculatorInputs } from "@/lib/calculator";
import { formatDecimalInput } from "@/lib/utils";

import {
  getMaxDraws,
  getTemperaturePlaceholder,
  getTemperatureMin,
  getTemperatureMax,
  getTemperatureUnitSymbol,
  getMaterialPlaceholder,
  getMaterialMax,
  getMaterialUnitLabel,
  isDrawsValid,
  isFormValid,
} from "../lib/new-session";
import { SessionFormData } from "../lib/sessionService";

interface NewSessionFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const effectOptions = [
  { value: "relaxed", label: "Relaxed", icon: "😌" },
  { value: "happy", label: "Happy", icon: "😊" },
  { value: "sleepy", label: "Sleepy", icon: "😴" },
  { value: "focused", label: "Focused", icon: "🧠" },
  { value: "creative", label: "Creative", icon: "🎨" },
  { value: "energetic", label: "Energetic", icon: "⚡" },
  { value: "hungry", label: "Hungry", icon: "🍕" },
  { value: "euphoric", label: "Euphoric", icon: "🌟" },
  { value: "anxious", label: "Anxious", icon: "😰" },
  { value: "dry-mouth", label: "Dry Mouth", icon: "👄" },
  { value: "dizzy", label: "Dizzy", icon: "😵" },
  { value: "pain-relief", label: "Pain Relief", icon: "💊" },
];

export function NewSessionForm({ isOpen, onOpenChange }: NewSessionFormProps) {
  const { preferences } = useUserPreferences();
  const [formData, setFormData] = useState<SessionFormData>({
    date: new Date().toISOString().split("T")[0],
    time: new Date().toISOString().slice(0, 5),
    duration: "",
    method: "dry-herb", // Fixed to vaporizer
    device: "",
    temperature: "",
    material: "", // Will be set when device is selected
    materialAmount: "", // New field for actual amount used
    thcPercentage: "0", // New field for THC percentage
    cbdPercentage: "0", // New field for CBD percentage
    totalSessionInhalations: "", // Total session inhalations
    inhalationsPerCapsule: "", // Inhalations per capsule/chamber
    higherAccuracy: false, // New field for calculation mode
    totalTHC: "",
    totalCBD: "",
    rating: 0,
    notes: "",
  });

  const [selectedEffects, setSelectedEffects] = useState<string[]>([]);
  const [temperatureUnit, setTemperatureUnit] = useState<
    "celsius" | "fahrenheit"
  >("celsius");
  const [selectedDevice, setSelectedDevice] = useState<Vaporizer | null>(null);
  const [calculatedTotals, setCalculatedTotals] = useState<{
    thc: number;
    cbd: number;
    // New fields for enhanced calculations
    originalThc: number;
    originalCbd: number;
    consumedThc: number;
    consumedCbd: number;
    consumptionRatio: number;
    remainingMaterial: number;
  } | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number>(0);

  // New state for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Update temperature unit when preferences change
  useEffect(() => {
    if (preferences?.temperature_unit) {
      setTemperatureUnit(preferences.temperature_unit);
    }
  }, [preferences]);

  // Update selected device when device selection changes
  useEffect(() => {
    if (formData.device) {
      const device = dryHerbVaporizers.find((v) => v.name === formData.device);
      setSelectedDevice(device || null);

      // Clear material selection when device changes so user can choose
      setFormData((prev) => ({ ...prev, material: "" }));
    } else {
      setSelectedDevice(null);
      setFormData((prev) => ({ ...prev, material: "" }));
    }
  }, [formData.device]);

  // Update inhalations per capsule from user preferences when device changes
  useEffect(() => {
    if (
      selectedDevice &&
      preferences &&
      preferences.inhalations_per_capsule !== null
    ) {
      setFormData((prev) => ({
        ...prev,
        inhalationsPerCapsule:
          preferences.inhalations_per_capsule?.toString() ?? "8",
      }));
    }
  }, [selectedDevice, preferences]);

  // Reset inhalations when higher accuracy settings change to prevent invalid values
  useEffect(() => {
    if (formData.higherAccuracy && formData.totalSessionInhalations) {
      const maxDraws = getMaxDraws(formData);
      if (parseFloat(formData.totalSessionInhalations) > maxDraws) {
        setFormData((prev) => ({ ...prev, totalSessionInhalations: "" }));
      }
    }
  }, [
    formData.higherAccuracy,
    formData.totalSessionInhalations,
    formData.materialAmount,
  ]);

  // Real-time calculation updates
  const calculateTotals = useCallback(() => {
    if (
      !selectedDevice ||
      !formData.material ||
      !formData.materialAmount ||
      !formData.thcPercentage ||
      !formData.cbdPercentage ||
      (formData.higherAccuracy && !formData.totalSessionInhalations)
    ) {
      setCalculatedTotals(null);
      return;
    }

    try {
      const calculatorInputs: CalculatorInputs = {
        vaporizer: formData.device,
        totalSessionInhalations: formData.higherAccuracy
          ? parseFloat(formData.totalSessionInhalations)
          : 8, // Default value when not in higher accuracy mode
        measurementMethod: formData.material.includes("capsule")
          ? "capsule"
          : "chamber",
        chamberWeight: 0, // Not used in new calculation method
        thcPercentage: parseFloat(formData.thcPercentage),
        cbdPercentage: parseFloat(formData.cbdPercentage),
        desiredDoseType: "thc", // Not used for session logging, but required by calculator
        desiredDose: 1, // Not used for session logging, but required by calculator
        higherAccuracy: formData.higherAccuracy,
      };

      const totalCannabinoids = calculateDosage(calculatorInputs);
      setCalculatedTotals(totalCannabinoids);
    } catch (error) {
      console.error("Error calculating totals:", error);
      setCalculatedTotals(null);
    }
  }, [
    formData.device,
    formData.material,
    formData.materialAmount,
    formData.thcPercentage,
    formData.cbdPercentage,
    formData.higherAccuracy,
    formData.totalSessionInhalations,
    selectedDevice,
  ]);

  useEffect(() => {
    calculateTotals();
  }, [calculateTotals]);

  const handleInputChange = (field: string, value: string | boolean) => {
    // Apply decimal formatting for THC and CBD percentage fields
    if (field === "thcPercentage" || field === "cbdPercentage") {
      const formattedValue = formatDecimalInput(value as string);
      setFormData((prev) => ({ ...prev, [field]: formattedValue }));
    } else {
      if (field === "higherAccuracy") {
        console.log("Setting higherAccuracy to:", value);
      }
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleEffectToggle = (effectValue: string) => {
    setSelectedEffects((prev) =>
      prev.includes(effectValue)
        ? prev.filter((e) => e !== effectValue)
        : [...prev, effectValue]
    );
  };

  const handleRatingChange = (rating: number) => {
    // If clicking the same star again, clear the rating (set to 0)
    if (formData.rating === rating) {
      setFormData((prev) => ({ ...prev, rating: 0 }));
    } else {
      setFormData((prev) => ({ ...prev, rating }));
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        type="button"
        className={`text-2xl transition-colors ${
          i < (hoveredRating || formData.rating)
            ? "text-yellow-400"
            : "text-doser-text-muted/30"
        } hover:text-yellow-400`}
        onClick={() => handleRatingChange(i + 1)}
        onMouseEnter={() => setHoveredRating(i + 1)}
        onMouseLeave={() => setHoveredRating(0)}
        title={
          formData.rating === i + 1
            ? "Click again to clear rating"
            : `Rate ${i + 1} stars`
        }
      >
        ★
      </button>
    ));
  };
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-doser-surface border-doser-border w-[90vw] max-w-[1000px] sm:max-w-[1000px] max-h-[90vh] overflow-y-auto p-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-doser-primary/50 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-doser-primary [&::-webkit-scrollbar]:hover:w-2 [&::-webkit-scrollbar-thumb]:transition-all [&::-webkit-scrollbar-thumb]:duration-200">
        <DialogHeader className="pb-6 border-b border-doser-border">
          <DialogTitle className="flex items-center gap-3 text-doser-text">
            <div className="w-10 h-10 bg-gradient-to-br from-doser-primary to-doser-primary-hover rounded-xl flex items-center justify-center">
              <span className="text-white text-lg">📝</span>
            </div>
            <div>
              <div className="font-semibold text-xl">Log New Session</div>
              <div className="text-doser-text-muted text-sm font-normal">
                Record your cannabis session details for tracking
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Success Message */}
        {submitSuccess && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-center gap-3 text-green-500">
              <span className="text-xl">✅</span>
              <div>
                <div className="font-medium">Session logged successfully!</div>
                <div className="text-sm text-green-500/80">
                  Your session has been saved to the database.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {submitError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center gap-3 text-red-500">
              <span className="text-xl">❌</span>
              <div>
                <div className="font-medium">Error saving session</div>
                <div className="text-sm text-red-500/80">{submitError}</div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-8">
          {/* Session Details */}
          <div>
            <h3 className="text-doser-primary font-semibold mb-4">
              Session Details
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-doser-text mb-2">
                  Date <span className="text-red-400">*</span>
                </label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  className="bg-doser-surface-hover border-doser-border text-doser-text"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-doser-text mb-2">
                  Time <span className="text-red-400">*</span>
                </label>
                <Input
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange("time", e.target.value)}
                  className="bg-doser-surface-hover border-doser-border text-doser-text"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-doser-text mb-2">
                Duration <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="45"
                  value={formData.duration}
                  onChange={(e) =>
                    handleInputChange("duration", e.target.value)
                  }
                  className="bg-doser-surface-hover border-doser-border text-doser-text pr-20"
                  min="1"
                  max="300"
                  required
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-doser-text-muted text-sm">
                  minutes
                </span>
              </div>
              <p className="text-xs text-doser-text-muted mt-1">
                How long did the effects last?
              </p>
            </div>
          </div>

          {/* Consumption Method */}
          <div>
            <h3 className="text-doser-primary font-semibold mb-4">
              Consumption Method
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-doser-text mb-2">
                  Method <span className="text-red-400">*</span>
                </label>
                <div className="bg-doser-surface-hover border border-doser-border rounded-lg px-3 py-2 text-doser-text">
                  <span className="text-sm">Dry Herb Vaporizer</span>
                </div>
                <p className="text-xs text-doser-text-muted mt-1">
                  Fixed to vaporizer for now
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-doser-text mb-2">
                  Device Used <span className="text-red-400">*</span>
                </label>
                <Select
                  value={formData.device}
                  onValueChange={(value) => handleInputChange("device", value)}
                >
                  <SelectTrigger className="bg-doser-surface-hover border-doser-border text-doser-text">
                    <SelectValue placeholder="Select your vaporizer" />
                  </SelectTrigger>
                  <SelectContent className="bg-doser-surface-hover border-doser-border">
                    <div className="px-2 py-1.5 text-sm font-semibold text-doser-text-muted border-b border-doser-border">
                      Portable Vaporizers
                    </div>
                    {dryHerbVaporizers
                      .filter((v) => v.type === "portable")
                      .map((vaporizer) => (
                        <SelectItem key={vaporizer.name} value={vaporizer.name}>
                          {vaporizer.name}
                        </SelectItem>
                      ))}
                    <div className="px-2 py-1.5 text-sm font-semibold text-doser-text-muted border-b border-doser-border mt-2">
                      Desktop Vaporizers
                    </div>
                    {dryHerbVaporizers
                      .filter((v) => v.type === "desktop")
                      .map((vaporizer) => (
                        <SelectItem key={vaporizer.name} value={vaporizer.name}>
                          {vaporizer.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-doser-text-muted mt-1">
                  Select the vaporizer you used for this session
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-doser-text mb-2">
                  Temperature
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder={getTemperaturePlaceholder(temperatureUnit)}
                    value={formData.temperature}
                    onChange={(e) =>
                      handleInputChange("temperature", e.target.value)
                    }
                    className="bg-doser-surface-hover border-doser-border text-doser-text pr-16"
                    min={getTemperatureMin(temperatureUnit)}
                    max={getTemperatureMax(temperatureUnit)}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    <span className="text-doser-text-muted text-sm">
                      {getTemperatureUnitSymbol(temperatureUnit)}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-doser-text-muted">°C</span>
                      <Switch
                        checked={temperatureUnit === "fahrenheit"}
                        onCheckedChange={(checked) =>
                          setTemperatureUnit(checked ? "fahrenheit" : "celsius")
                        }
                        className="data-[state=checked]:bg-doser-primary data-[state=unchecked]:bg-doser-border"
                      />
                      <span className="text-xs text-doser-text-muted">°F</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-doser-text-muted mt-1">
                  {temperatureUnit === "celsius"
                    ? "150-230°C range"
                    : "300-450°F range"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-doser-text mb-2">
                  Measurement Method
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={`flex-1 px-3 py-2 rounded-lg border transition-all text-sm font-medium ${
                      formData.material.includes("chamber")
                        ? "bg-doser-primary/10 border-doser-primary/30 text-doser-primary"
                        : "bg-doser-surface-hover border-doser-border text-doser-text-muted hover:text-doser-text hover:bg-doser-surface"
                    }`}
                    onClick={() => {
                      if (
                        selectedDevice &&
                        selectedDevice.chamberCapacity > 0
                      ) {
                        handleInputChange(
                          "material",
                          `chamber-${selectedDevice.chamberCapacity}`
                        );
                      }
                    }}
                    disabled={
                      !selectedDevice || selectedDevice.chamberCapacity === 0
                    }
                  >
                    Chamber
                  </button>
                  <button
                    type="button"
                    className={`flex-1 px-3 py-2 rounded-lg border transition-all text-sm font-medium ${
                      formData.material.includes("capsule")
                        ? "bg-doser-primary/10 border-doser-primary/30 text-doser-primary"
                        : "bg-doser-surface-hover border-doser-border text-doser-text-muted hover:text-doser-text hover:bg-doser-surface"
                    }`}
                    onClick={() => {
                      if (selectedDevice && selectedDevice.capsuleOption) {
                        handleInputChange(
                          "material",
                          `capsule-${selectedDevice.dosingCapsuleCapacity}`
                        );
                      }
                    }}
                    disabled={!selectedDevice || !selectedDevice.capsuleOption}
                  >
                    Capsule
                  </button>
                </div>
                <p className="text-xs text-doser-text-muted mt-1">
                  {selectedDevice
                    ? `Select whether you used the chamber or dosing capsule`
                    : "Select a device first to see available options"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-doser-text mb-2">
                  Amount Used <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    step="1"
                    placeholder={getMaterialPlaceholder(
                      formData,
                      selectedDevice
                    )}
                    value={formData.materialAmount}
                    onChange={(e) =>
                      handleInputChange("materialAmount", e.target.value)
                    }
                    className="bg-doser-surface-hover border-doser-border text-doser-text pr-20"
                    min="1"
                    max={getMaterialMax(formData, selectedDevice)}
                    required
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-doser-text-muted text-sm">
                    {getMaterialUnitLabel(formData)}
                  </span>
                </div>
                <p className="text-xs text-doser-text-muted mt-1">
                  Number of {getMaterialUnitLabel(formData)} consumed (max:{" "}
                  {getMaterialMax(formData, selectedDevice)}). Each{" "}
                  {formData.material.includes("capsule")
                    ? "capsule"
                    : "chamber"}{" "}
                  contains{" "}
                  {formData.material.includes("capsule")
                    ? selectedDevice?.dosingCapsuleCapacity
                    : selectedDevice?.chamberCapacity}
                  g of material.
                </p>
              </div>
            </div>

            {/* Higher Accuracy Mode Toggle */}
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-doser-text mb-2">
                  Higher Accuracy Mode
                </label>
                <div className="flex items-center space-x-3">
                  <Switch
                    checked={formData.higherAccuracy}
                    onCheckedChange={(checked) => {
                      console.log("Switch changed to:", checked);
                      handleInputChange("higherAccuracy", checked);
                    }}
                  />
                  <span className="text-xs text-doser-text-muted">
                    Use detailed inhalation calculations
                  </span>
                </div>
                {!formData.higherAccuracy && (
                  <p className="text-xs text-doser-text-muted mt-2 italic">
                    💡 When disabled, total inhalations is hidden and
                    calculations use a default value of 8 inhalations.
                  </p>
                )}
              </div>
            </div>

            {/* Inhalations Fields - Now in a row when higher accuracy is enabled */}
            {formData.higherAccuracy && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-doser-text mb-2">
                    Inhalations per{" "}
                    {formData.material.includes("capsule")
                      ? "capsule"
                      : "chamber"}{" "}
                    <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="number"
                    placeholder="6"
                    value={formData.totalSessionInhalations}
                    onChange={(e) =>
                      handleInputChange(
                        "totalSessionInhalations",
                        e.target.value
                      )
                    }
                    className={`bg-doser-surface-hover border text-doser-text ${
                      formData.totalSessionInhalations &&
                      !isDrawsValid(formData)
                        ? "border-red-400 focus:border-red-400 focus:ring-red-400/20"
                        : "border-doser-border focus:border-doser-primary focus:ring-doser-primary/20"
                    }`}
                    min="1"
                    max={getMaxDraws(formData)}
                    required
                  />
                  <div className="mt-1">
                    <p className="text-xs text-doser-text-muted">
                      Max: {getMaxDraws(formData)} inhalations per{" "}
                      {formData.material.includes("capsule")
                        ? "capsule"
                        : "chamber"}
                    </p>
                    {formData.totalSessionInhalations &&
                      !isDrawsValid(formData) && (
                        <p className="text-xs text-red-400 mt-1">
                          ⚠️ Inhalations per{" "}
                          {formData.material.includes("capsule")
                            ? "capsule"
                            : "chamber"}{" "}
                          cannot exceed {getMaxDraws(formData)}.
                        </p>
                      )}
                  </div>
                  <p className="text-xs text-doser-text-muted mt-1">
                    Number of inhalations you took from each{" "}
                    {formData.material.includes("capsule")
                      ? "capsule"
                      : "chamber"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-doser-text mb-2">
                    Total Session Inhalations
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g., 8"
                    value={formData.totalSessionInhalations}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        totalSessionInhalations: e.target.value,
                      })
                    }
                    className="w-full"
                  />
                  <p className="text-xs text-doser-text-muted mt-1">
                    Total number of inhalations for this session
                  </p>
                  <div className="mt-2 p-2 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                    <p className="text-xs text-blue-600/80">
                      💡 This is the maximum number of inhalations you can
                      typically get from one capsule/chamber before the material
                      is fully extracted. This helps calculate how much material
                      you actually consumed based on your actual inhalations
                      taken.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Cannabinoid Content */}
          <div>
            <h3 className="text-doser-primary font-semibold mb-4">
              Cannabinoid Content
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-doser-text mb-2">
                  THC Percentage <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="18.5"
                    value={formData.thcPercentage}
                    onChange={(e) =>
                      handleInputChange("thcPercentage", e.target.value)
                    }
                    className="bg-doser-surface-hover border-doser-border text-doser-text pr-16"
                    min="0"
                    max="100"
                    required
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-doser-text-muted text-sm">
                    %
                  </span>
                </div>
                <p className="text-xs text-doser-text-muted mt-1">
                  THC content percentage of your material
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-doser-text mb-2">
                  CBD Percentage <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="2.1"
                    value={formData.cbdPercentage}
                    onChange={(e) =>
                      handleInputChange("cbdPercentage", e.target.value)
                    }
                    className="bg-doser-surface-hover border-doser-border text-doser-text pr-16"
                    min="0"
                    max="100"
                    required
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-doser-text-muted text-sm">
                    %
                  </span>
                </div>
                <p className="text-xs text-doser-text-muted mt-1">
                  CBD content percentage of your material
                </p>
              </div>
            </div>

            {/* Inhalations Summary Display */}
            {formData.higherAccuracy &&
              formData.totalSessionInhalations &&
              formData.materialAmount && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
                  <h4 className="text-blue-600 font-medium text-sm mb-3">
                    📈 Inhalations Analysis
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-blue-600 mb-1">
                        Per{" "}
                        {formData.material.includes("capsule")
                          ? "Capsule"
                          : "Chamber"}
                      </label>
                      <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg px-2 py-1 text-doser-text font-mono text-center text-sm">
                        {formData.inhalationsPerCapsule} inhalations
                      </div>
                      <p className="text-xs text-blue-600/80 mt-1">
                        Maximum possible
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-blue-600 mb-1">
                        Total Possible
                      </label>
                      <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg px-2 py-1 text-doser-text font-mono text-center text-sm">
                        {formData.inhalationsPerCapsule &&
                        formData.materialAmount
                          ? (
                              parseFloat(formData.inhalationsPerCapsule) *
                              parseFloat(formData.materialAmount)
                            ).toString()
                          : "0"}{" "}
                        inhalations
                      </div>
                      <p className="text-xs text-blue-600/80 mt-1">
                        Across all {getMaterialUnitLabel()}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-blue-600 mb-1">
                        Efficiency
                      </label>
                      <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg px-2 py-1 text-doser-text font-mono text-center text-sm">
                        {formData.totalSessionInhalations &&
                        formData.inhalationsPerCapsule &&
                        formData.materialAmount
                          ? Math.round(
                              (parseFloat(formData.totalSessionInhalations) /
                                parseFloat(formData.inhalationsPerCapsule)) *
                                100
                            )
                          : "0"}
                        %
                      </div>
                      <p className="text-xs text-blue-600/80 mt-1">
                        Of max per unit
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 p-2 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                    <p className="text-xs text-blue-600/80">
                      💡 This shows your inhalation efficiency and helps
                      calculate actual material consumption. Higher efficiency
                      means you&apos;re extracting more cannabinoids from each
                      unit.
                    </p>
                  </div>
                </div>
              )}

            {/* Enhanced Material Consumption Display */}
            {formData.higherAccuracy &&
              formData.totalSessionInhalations &&
              formData.inhalationsPerCapsule &&
              formData.materialAmount && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-4">
                  <h4 className="text-amber-600 font-medium text-sm mb-3">
                    📊 Enhanced Material Consumption Analysis
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-amber-600 mb-1">
                        Material Consumed
                      </label>
                      <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg px-2 py-1 text-doser-text font-mono text-center text-sm">
                        {calculateConsumedMaterialAmount()?.consumedAmount ||
                          "0.00"}{" "}
                        {getMaterialUnitLabel()}
                      </div>
                      <p className="text-xs text-amber-600/80 mt-1">
                        Based on actual inhalations
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-amber-600 mb-1">
                        Consumption Rate
                      </label>
                      <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg px-2 py-1 text-doser-text font-mono text-center text-sm">
                        {calculateConsumedMaterialAmount()?.consumedRatio ||
                          "0.0"}
                        %
                      </div>
                      <p className="text-xs text-amber-600/80 mt-1">
                        Of total material used
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-amber-600 mb-1">
                        Remaining Material
                      </label>
                      <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg px-2 py-1 text-doser-text font-mono text-center text-sm">
                        {calculateConsumedMaterialAmount()?.remainingAmount ||
                          "0.00"}{" "}
                        {getMaterialUnitLabel()}
                      </div>
                      <p className="text-xs text-amber-600/80 mt-1">
                        Potentially reusable
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 p-2 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                    <p className="text-xs text-amber-600/80">
                      💡 This analysis shows how much material you actually
                      consumed based on your inhalations, providing more
                      accurate dosing calculations than simply counting
                      capsules/chambers.
                    </p>
                  </div>
                </div>
              )}
          </div>

          {/* Inhalations Summary - Only shown in higher accuracy mode */}
          {formData.higherAccuracy &&
            formData.inhalationsPerCapsule &&
            formData.materialAmount && (
              <div>
                <h3 className="text-doser-primary font-semibold mb-4">
                  Inhalations Summary
                </h3>
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {formData.inhalationsPerCapsule}
                      </div>
                      <div className="text-xs text-blue-600/80">
                        Per{" "}
                        {formData.material.includes("capsule")
                          ? "Capsule"
                          : "Chamber"}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {formData.materialAmount}
                      </div>
                      <div className="text-xs text-purple-600/80">
                        {getMaterialUnitLabel()} Used
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {formData.inhalationsPerCapsule &&
                        formData.materialAmount
                          ? (
                              parseFloat(formData.inhalationsPerCapsule) *
                              parseFloat(formData.materialAmount)
                            ).toString()
                          : "0"}
                      </div>
                      <div className="text-xs text-green-600/80">
                        Total Possible Inhalations
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {formData.totalSessionInhalations || "0"}
                      </div>
                      <div className="text-xs text-orange-600/80">
                        Your Actual Inhalations
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-white/5 border border-white/20 rounded-lg">
                    <p className="text-xs text-doser-text-muted text-center">
                      📊 This summary shows your inhalation efficiency and helps
                      determine actual material consumption. The difference
                      between total possible and actual inhalations indicates
                      how much material remains.
                    </p>
                  </div>
                </div>
              </div>
            )}

          {/* Dosage Breakdown */}
          <div>
            <h3 className="text-doser-primary font-semibold mb-4">
              Dosage Breakdown
            </h3>
            <div className="bg-doser-primary/10 border border-doser-primary/20 rounded-lg p-4">
              <p className="text-doser-primary text-sm mb-3">
                Calculated values based on your session consumption
              </p>

              {/* Primary Display - Shows consumed values for higher accuracy, original for simple mode */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-doser-primary mb-2">
                    {formData.higherAccuracy
                      ? "Consumed THC (mg)"
                      : "Total THC (mg)"}
                  </label>
                  <div className="bg-doser-primary/20 border border-doser-primary/30 rounded-lg px-3 py-2 text-doser-text font-mono text-center">
                    {calculatedTotals ? calculatedTotals.thc.toFixed(1) : "0.0"}{" "}
                    mg
                  </div>
                  {formData.higherAccuracy && calculatedTotals && (
                    <p className="text-xs text-doser-text-muted mt-1">
                      Based on actual inhalations
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-doser-primary mb-2">
                    {formData.higherAccuracy
                      ? "Consumed CBD (mg)"
                      : "Total CBD (mg)"}
                  </label>
                  <div className="bg-doser-primary/20 border border-doser-primary/30 rounded-lg px-3 py-2 text-doser-text font-mono text-center">
                    {calculatedTotals ? calculatedTotals.cbd.toFixed(1) : "0.0"}{" "}
                    mg
                  </div>
                  {formData.higherAccuracy && calculatedTotals && (
                    <p className="text-xs text-doser-text-muted mt-1">
                      Based on actual inhalations
                    </p>
                  )}
                </div>
              </div>

              {/* Enhanced Calculation Display - Only shown in higher accuracy mode */}
              {formData.higherAccuracy && calculatedTotals && (
                <div className="mb-4 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg">
                  <h4 className="text-blue-600 font-medium text-sm mb-3">
                    📊 Enhanced Calculation Breakdown
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-blue-600 mb-1">
                        Original THC (mg)
                      </label>
                      <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg px-2 py-1 text-doser-text font-mono text-center text-sm">
                        {calculatedTotals.originalThc.toFixed(1)} mg
                      </div>
                      <p className="text-xs text-blue-600/80 mt-1">
                        Total available
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-blue-600 mb-1">
                        Original CBD (mg)
                      </label>
                      <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg px-2 py-1 text-doser-text font-mono text-center text-sm">
                        {calculatedTotals.originalCbd.toFixed(1)} mg
                      </div>
                      <p className="text-xs text-blue-600/80 mt-1">
                        Total available
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-purple-600 mb-1">
                        Consumption Rate
                      </label>
                      <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg px-2 py-1 text-doser-text font-mono text-center text-sm">
                        {(calculatedTotals.consumptionRatio * 100).toFixed(1)}%
                      </div>
                      <p className="text-xs text-purple-600/80 mt-1">
                        Material used
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-purple-600 mb-1">
                        Remaining Material
                      </label>
                      <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg px-2 py-1 text-doser-text font-mono text-center text-sm">
                        {calculatedTotals.remainingMaterial.toFixed(2)} g
                      </div>
                      <p className="text-xs text-purple-600/80 mt-1">
                        Potentially reusable
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 p-2 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                    <p className="text-xs text-blue-600/80">
                      💡 This enhanced calculation shows the difference between
                      what you put in (original) and what you actually consumed
                      based on your inhalations. The remaining material could
                      potentially be reused in future sessions.
                    </p>
                  </div>
                </div>
              )}

              {calculatedTotals && (
                <div className="mt-3 p-3 bg-doser-primary/5 border border-doser-primary/20 rounded-lg">
                  <p className="text-xs text-doser-primary font-medium mb-2">
                    Session Summary:
                  </p>
                  <div className="text-xs text-doser-text-muted space-y-1">
                    <div>
                      • {formData.materialAmount} {getMaterialUnitLabel()}{" "}
                      consumed
                    </div>
                    <div>
                      • {formData.thcPercentage}% THC + {formData.cbdPercentage}
                      % CBD
                    </div>
                    <div>
                      • Total cannabinoids:{" "}
                      {(calculatedTotals.thc + calculatedTotals.cbd).toFixed(1)}{" "}
                      mg
                      {formData.higherAccuracy && (
                        <span className="text-blue-600"> (consumed)</span>
                      )}
                    </div>
                    <div className="pt-1 border-t border-doser-primary/20">
                      <div>
                        • Total material weight:{" "}
                        {(() => {
                          if (formData.material.includes("capsule")) {
                            return (
                              parseFloat(formData.materialAmount) *
                              (selectedDevice?.dosingCapsuleCapacity || 0)
                            ).toFixed(2);
                          } else {
                            return (
                              parseFloat(formData.materialAmount) *
                              (selectedDevice?.chamberCapacity || 0)
                            ).toFixed(2);
                          }
                        })()}
                        g
                      </div>
                    </div>
                    {formData.higherAccuracy &&
                      formData.totalSessionInhalations &&
                      calculateTotalInhalations(formData) && (
                        <>
                          <div className="pt-1 border-t border-doser-primary/20">
                            <div>
                              • Total inhalations:{" "}
                              {calculateTotalInhalations(formData)}
                            </div>
                            <div>
                              • Inhalations per{" "}
                              {formData.material.includes("capsule")
                                ? "capsule"
                                : "chamber"}
                              : {formData.totalSessionInhalations}
                            </div>
                          </div>
                          {calculateConsumedMaterialAmount(formData) && (
                            <div className="pt-1 border-t border-doser-primary/20">
                              <div className="text-amber-600 font-medium">
                                • Enhanced calculation based on actual
                                inhalations:
                              </div>
                              <div className="ml-2">
                                - Material actually consumed:{" "}
                                {
                                  calculateConsumedMaterialAmount()
                                    ?.consumedAmount
                                }{" "}
                                {getMaterialUnitLabel()}
                              </div>
                              <div className="ml-2">
                                - Consumption rate:{" "}
                                {
                                  calculateConsumedMaterialAmount()
                                    ?.consumedRatio
                                }
                                %
                              </div>
                              <div className="ml-2">
                                - Remaining material:{" "}
                                {
                                  calculateConsumedMaterialAmount()
                                    ?.remainingAmount
                                }{" "}
                                {getMaterialUnitLabel()}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                  </div>
                </div>
              )}
              <p className="text-xs text-doser-text-muted mt-3">
                * Values update in real-time as you change inputs
                {formData.higherAccuracy && (
                  <span className="text-blue-600">
                    {" "}
                    • Higher accuracy mode uses actual inhalation data for
                    precise calculations
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Effects Experienced */}
          <div>
            <h3 className="text-doser-primary font-semibold mb-4">
              Effects Experienced
            </h3>
            <p className="text-xs text-doser-text-muted mb-3">
              Select all effects you experienced during this session
            </p>
            <div className="grid grid-cols-3 gap-3">
              {effectOptions.map((effect) => (
                <button
                  key={effect.value}
                  type="button"
                  className={`flex items-center justify-center gap-2 px-2 py-3 rounded-lg border transition-all text-center min-w-0 ${
                    selectedEffects.includes(effect.value)
                      ? "bg-doser-primary/10 border-doser-primary/30 text-doser-text"
                      : "bg-doser-surface-hover border-doser-border text-doser-text-muted hover:text-doser-text hover:bg-doser-surface"
                  }`}
                  onClick={() => handleEffectToggle(effect.value)}
                >
                  <span className="text-base flex-shrink-0">{effect.icon}</span>
                  <span className="text-sm font-medium truncate">
                    {effect.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Session Rating */}
          <div>
            <h3 className="text-doser-primary font-semibold mb-4">
              Session Rating (Optional)
            </h3>
            <div>
              <label className="block text-sm font-medium text-doser-text mb-2">
                Overall Experience
              </label>
              <div className="flex gap-1 mb-2">{renderStars()}</div>
              <p className="text-xs text-doser-text-muted">
                Rate your overall session experience. Click a star to rate,
                click again to clear.
              </p>
            </div>
          </div>

          {/* Session Notes */}
          <div>
            <h3 className="text-doser-primary font-semibold mb-4">
              Session Notes
            </h3>
            <div>
              <label className="block text-sm font-medium text-doser-text mb-2">
                Additional Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Perfect evening session. Great for relaxation after work. The vaporizer provided smooth, flavorful vapor. Effects kicked in around 5 minutes and lasted about 45 minutes total."
                className="w-full p-3 bg-doser-surface-hover border border-doser-border rounded-lg text-doser-text placeholder:text-doser-text-muted focus:border-doser-primary focus:ring-2 focus:ring-doser-primary/20 resize-none"
                rows={4}
              />
              <p className="text-xs text-doser-text-muted mt-1">
                Record any additional observations about this session
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-6 border-t border-doser-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1 bg-doser-surface border-doser-border text-doser-text-muted hover:text-doser-text hover:bg-doser-surface-hover"
              onClick={handleSaveDraft}
              disabled={isSubmitting}
            >
              <span className="mr-2">📋</span>
              Save as Draft
            </Button>
            <Button
              type="submit"
              size="sm"
              className="flex-1 bg-doser-primary hover:bg-doser-primary-hover text-white border-0 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!isFormValid() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="mr-2 animate-spin">⏳</span>
                  Saving...
                </>
              ) : (
                <>
                  <span className="mr-2">💾</span>
                  Log Session
                </>
              )}
            </Button>
          </div>

          {/* Validation Helper */}
          {!isFormValid(formData, selectedEffects) && (
            <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <p className="text-xs text-amber-500 font-medium mb-2">
                ⚠️ Please complete all required fields to log your session
              </p>
              <div className="text-xs text-amber-500/80 space-y-1">
                {!formData.device && <div>• Select a device</div>}
                {!formData.material && (
                  <div>• Choose capsule or chamber method</div>
                )}
                {!formData.materialAmount && <div>• Enter amount used</div>}
                {!formData.thcPercentage && <div>• Enter THC percentage</div>}
                {!formData.cbdPercentage && <div>• Enter CBD percentage</div>}
                {formData.higherAccuracy && !formData.inhalationsPerCapsule && (
                  <div>• Enter inhalations per capsule</div>
                )}
                {!formData.date && <div>• Select date</div>}
                {!formData.time && <div>• Enter time</div>}
                {!formData.duration && <div>• Enter session duration</div>}
                {formData.higherAccuracy && !formData.draws && (
                  <div>
                    • Enter number of inhalations (higher accuracy mode)
                  </div>
                )}
                {formData.higherAccuracy &&
                  formData.draws &&
                  !isDrawsValid() && (
                    <div>
                      • Reduce inhalations to {getMaxDraws()} or less (higher
                      accuracy mode)
                    </div>
                  )}
                {selectedEffects.length === 0 && (
                  <div>• Select at least one effect</div>
                )}
              </div>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
