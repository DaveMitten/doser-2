"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useState, useEffect, useCallback } from "react";
import { useUserPreferences } from "@/lib/useUserPreferences";
import { dryHerbVaporizers } from "@/data/vapes";
import { type Vaporizer } from "@/context/data-types";

import { formatDecimalInput } from "@/lib/utils";

import { getMaxDraws } from "../../lib/new-session";
import { SessionFormData, sessionService } from "../../lib/sessionService";
import ConsumptionMethod from "./comps/ConsumptionMethod";
import CannabinoidContent from "./comps/CannabinoidContent";
import SessionNotes from "./comps/SessionNotes";
import SessionDetails from "./comps/SessionDetails";
import DosageBreakdown from "./comps/DosageBreakdown";
import EffectsExperienced from "./comps/EffectsExperienced";
import SessionRating from "./comps/SessionRating";
import FormActions from "./comps/FormActions";
import SuccessAndErrorMessages from "./comps/SuccessAndErrorMessages";
import InhalationsSummary from "./comps/InhalationsSummary";

interface NewSessionFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewSessionForm({ isOpen, onOpenChange }: NewSessionFormProps) {
  const { preferences } = useUserPreferences();
  const [formData, setFormData] = useState<SessionFormData>({
    date: new Date().toISOString().split("T")[0],
    time: new Date().toISOString().slice(0, 5),
    duration: "",
    method: "dry-herb", // Fixed to vaporizer
    device: "",
    temperature: "",
    unit: "", // Will be set when device is selected
    unitAmount: "", // New field for actual amount used
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

  // Reset form state when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setIsSubmitting(false);
      setSubmitError(null);
      setSubmitSuccess(false);
    } else {
      // Reset form to initial state when dialog opens
      setFormData({
        date: new Date().toISOString().split("T")[0],
        time: new Date().toISOString().slice(0, 5),
        duration: "",
        method: "dry-herb", // Fixed to vaporizer
        device: "",
        temperature: "",
        unit: "", // Will be auto-selected when device is chosen
        unitAmount: "", // New field for actual amount used
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
      setSelectedEffects([]);
      setSelectedDevice(null);
      setCalculatedTotals(null);
    }
  }, [isOpen]);

  // Update selected device when device selection changes
  useEffect(() => {
    if (formData.device) {
      const device = dryHerbVaporizers.find((v) => v.name === formData.device);
      setSelectedDevice(device || null);

      // Auto-select the first available option (chamber or capsule) when device changes
      if (device) {
        let autoSelectedUnit = "";

        // Prefer chamber if available, otherwise use capsule
        if (device.chamberCapacity > 0) {
          autoSelectedUnit = `chamber-${device.chamberCapacity}`;
        } else if (device.capsuleOption) {
          autoSelectedUnit = `capsule-${device.dosingCapsuleCapacity}`;
        }

        setFormData((prev) => ({ ...prev, unit: autoSelectedUnit }));
      } else {
        setFormData((prev) => ({ ...prev, unit: "" }));
      }
    } else {
      setSelectedDevice(null);
      setFormData((prev) => ({ ...prev, unit: "" }));
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
    formData.unitAmount,
  ]);

  // Real-time calculation updates
  const calculateTotals = useCallback(() => {
    if (
      !selectedDevice ||
      !formData.unit ||
      !formData.unitAmount ||
      !formData.thcPercentage ||
      !formData.cbdPercentage ||
      (formData.higherAccuracy && !formData.totalSessionInhalations)
    ) {
      setCalculatedTotals(null);
      return;
    }

    try {
      // Calculate material weight based on device and method
      const unitWeight = formData.unit.includes("capsule")
        ? (selectedDevice?.dosingCapsuleCapacity || 0) *
          parseFloat(formData.unitAmount)
        : (selectedDevice?.chamberCapacity || 0) *
          parseFloat(formData.unitAmount);

      // Calculate total cannabinoids in the material
      const totalThc =
        (parseFloat(formData.thcPercentage) / 100) * unitWeight * 1000; // Convert to mg
      const totalCbd =
        (parseFloat(formData.cbdPercentage) / 100) * unitWeight * 1000; // Convert to mg

      // Calculate consumed amounts based on higher accuracy mode
      let consumedThc = totalThc;
      let consumedCbd = totalCbd;
      let consumptionRatio = 1;

      if (
        formData.higherAccuracy &&
        formData.totalSessionInhalations &&
        formData.inhalationsPerCapsule
      ) {
        const totalInhalations = parseFloat(formData.totalSessionInhalations);
        const inhalationsPerCapsule = parseFloat(
          formData.inhalationsPerCapsule
        );
        consumptionRatio = totalInhalations / inhalationsPerCapsule;
        consumedThc = totalThc * consumptionRatio;
        consumedCbd = totalCbd * consumptionRatio;
      }

      const calculatedTotals = {
        thc: consumedThc,
        cbd: consumedCbd,
        originalThc: totalThc,
        originalCbd: totalCbd,
        consumedThc: consumedThc,
        consumedCbd: consumedCbd,
        consumptionRatio: consumptionRatio,
        remainingMaterial: unitWeight * (1 - consumptionRatio),
      };

      setCalculatedTotals(calculatedTotals);
    } catch (error) {
      console.error("Error calculating totals:", error);
      setCalculatedTotals(null);
    }
  }, [
    formData.device,
    formData.unit,
    formData.unitAmount,
    formData.thcPercentage,
    formData.cbdPercentage,
    formData.higherAccuracy,
    formData.totalSessionInhalations,
    formData.inhalationsPerCapsule,
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Prevent double submission
    if (isSubmitting) {
      return;
    }

    // Validate required fields
    if (!formData.device || !formData.unit || !formData.unitAmount) {
      setSubmitError(
        "Please fill in all required fields (device, unit, and amount)"
      );
      return;
    }

    if (!selectedDevice) {
      setSubmitError("Please select a valid device");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Import sessionService dynamically to avoid SSR issues
      const { sessionService } = await import("@/lib/sessionService");

      const { data, error } = await sessionService.createSession(
        formData,
        selectedEffects,
        calculatedTotals,
        selectedDevice,
        temperatureUnit
      );

      if (error) {
        console.error("Error creating session:", error);
        setSubmitError("Failed to save session. Please try again.");
        return;
      }

      if (data) {
        setSubmitSuccess(true);
        // Reset form after successful submission
        setFormData({
          date: new Date().toISOString().split("T")[0],
          time: new Date().toISOString().slice(0, 5),
          duration: "",
          method: "dry-herb",
          device: "",
          temperature: "",
          unit: "",
          unitAmount: "",
          thcPercentage: "0",
          cbdPercentage: "0",
          totalSessionInhalations: "0",
          inhalationsPerCapsule: "",
          higherAccuracy: false,
          totalTHC: "",
          totalCBD: "",
          rating: 0,
          notes: "",
        });
        setSelectedEffects([]);
        setSelectedDevice(null);
        setCalculatedTotals(null);

        // Close the dialog after a short delay to show success message
        setTimeout(() => {
          onOpenChange(false);
        }, 2000);
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      setSubmitError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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

        {/* Success and Error Messages */}
        <SuccessAndErrorMessages
          submitSuccess={submitSuccess}
          submitError={submitError}
        />

        <form onSubmit={handleSubmit} className="mt-6 space-y-8">
          {/* Session Details */}
          <SessionDetails
            formData={formData}
            handleInputChange={handleInputChange}
          />

          {/* Consumption Method */}
          <ConsumptionMethod
            formData={formData}
            handleInputChange={handleInputChange}
            selectedDevice={selectedDevice}
            temperatureUnit={temperatureUnit}
            setTemperatureUnit={setTemperatureUnit}
          />

          {/* Cannabinoid Content */}
          <CannabinoidContent
            formData={formData}
            handleInputChange={handleInputChange}
          />

          {/* Inhalations Summary - Only shown in higher accuracy mode */}
          {formData.higherAccuracy &&
            formData.inhalationsPerCapsule &&
            formData.unitAmount && <InhalationsSummary formData={formData} />}

          {/* Dosage Breakdown */}
          <DosageBreakdown
            formData={formData}
            calculatedTotals={calculatedTotals}
            selectedDevice={selectedDevice}
          />

          {/* Effects Experienced */}
          <EffectsExperienced
            selectedEffects={selectedEffects}
            handleEffectToggle={handleEffectToggle}
          />

          {/* Session Rating */}
          <SessionRating
            rating={formData.rating}
            hoveredRating={hoveredRating}
            handleRatingChange={handleRatingChange}
            setHoveredRating={setHoveredRating}
          />

          {/* Session Notes */}
          <SessionNotes
            formData={formData}
            handleInputChange={handleInputChange}
          />

          {/* Form Actions */}
          <FormActions
            formData={formData}
            selectedEffects={selectedEffects}
            isSubmitting={isSubmitting}
            handleSubmit={handleSubmit}
            onSaveAsDraft={() => {}}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
