"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUserPreferences } from "@/lib/useUserPreferences";
import { dryHerbVaporizers } from "@/data/vapes";
import { type Vaporizer } from "@/context/data-types";

import { formatDecimalInput } from "@/lib/utils";
import {
  sessionFormSchema,
  higherAccuracySchema,
  type SessionFormSchema,
} from "@/lib/validation-schemas";

import { getMaxDraws } from "../../lib/new-session";
import { SessionFormData } from "../../lib/sessionService";
import ConsumptionMethod from "./comps/ConsumptionMethod";
import CannabinoidContent from "./comps/CannabinoidContent";
import SessionNotes from "./comps/SessionNotes";
import SessionDetails from "./comps/SessionDetails";
import DosageBreakdown from "./comps/DosageBreakdown";
import EffectsExperienced from "./comps/EffectsExperienced";
import SessionRating from "./comps/SessionRating";
import FormActions from "./comps/FormActions";
import InhalationsSummary from "./comps/InhalationsSummary";
import { Button } from "../ui/button";

interface NewSessionFormProps {
  isOpen: boolean;
  setSessionFormOpen: (open: boolean) => void;
  onSessionCreated?: () => void;
}

export function NewSessionForm({
  isOpen,
  setSessionFormOpen,
  onSessionCreated,
}: NewSessionFormProps) {
  const { preferences } = useUserPreferences();
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
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);

  // React Hook Form setup
  const form = useForm<SessionFormSchema>({
    resolver: zodResolver(sessionFormSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      time: new Date().toISOString().slice(0, 5),
      duration: "",
      method: "dry-herb", // Fixed to vaporizer
      device: "",
      temperature: "",
      unitAmount: "", // New field for actual amount used
      unitType: "capsule", // New field for unit type
      unitCapacity: "0", // New field for unit capacity
      thcPercentage: "0", // New field for THC percentage
      cbdPercentage: "0", // New field for CBD percentage
      totalSessionInhalations: "", // Total session inhalations
      inhalationsPerCapsule: "", // Inhalations per capsule/chamber
      higherAccuracy: false, // New field for calculation mode
      totalTHC: "",
      totalCBD: "",
      rating: 0,
      notes: "",
    },
    mode: "onSubmit", // Only validate when form is submitted
    reValidateMode: "onSubmit", // Re-validate only on submit
  });

  const {
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { errors },
    trigger, // Add trigger for manual validation
  } = form;
  if (errors) console.log(errors);
  const watchedValues = watch();

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
    } else {
      // Reset form to initial state when dialog opens
      reset({
        date: new Date().toISOString().split("T")[0],
        time: new Date().toISOString().slice(0, 5),
        duration: "",
        method: "dry-herb", // Fixed to vaporizer
        device: "",
        temperature: "",
        unitType: "", // Will be auto-selected when device is chosen
        unitCapacity: "", // Will be auto-selected when device is chosen
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
  }, [isOpen, reset]);

  // Update selected device when device selection changes
  useEffect(() => {
    if (watchedValues.device) {
      const device = dryHerbVaporizers.find(
        (v) => v.name === watchedValues.device
      );
      setSelectedDevice(device || null);

      // Auto-select the first available option (chamber or capsule) when device changes
      if (device) {
        let unitType = "";
        let unitCapacity = "";

        // Prefer chamber if available, otherwise use capsule
        if (device.chamberCapacity > 0) {
          unitType = "chamber";
          unitCapacity = device.chamberCapacity.toString();
        } else if (device.capsuleOption) {
          unitType = "capsule";
          unitCapacity = device.dosingCapsuleCapacity.toString();
        }

        setValue("unitType", unitType);
        setValue("unitCapacity", unitCapacity);
      } else {
        setValue("unitType", "");
        setValue("unitCapacity", "");
      }
    } else {
      setSelectedDevice(null);
      setValue("unitType", "");
      setValue("unitCapacity", "");
    }
  }, [watchedValues.device, setValue]);

  // Update inhalations per capsule from user preferences when device changes
  useEffect(() => {
    if (
      selectedDevice &&
      preferences &&
      preferences.inhalations_per_capsule !== null
    ) {
      setValue(
        "inhalationsPerCapsule",
        preferences.inhalations_per_capsule?.toString()
      );
    }
  }, [selectedDevice, preferences, setValue]);

  // Reset inhalations when higher accuracy settings change to prevent invalid values
  useEffect(() => {
    if (watchedValues.higherAccuracy && watchedValues.totalSessionInhalations) {
      const maxDraws = getMaxDraws(watchedValues as unknown as SessionFormData);
      if (parseFloat(watchedValues.totalSessionInhalations) > maxDraws) {
        setValue("totalSessionInhalations", "");
      }
    }
  }, [
    watchedValues,
    watchedValues.higherAccuracy,
    watchedValues.totalSessionInhalations,
    watchedValues.unitAmount,
    setValue,
  ]);

  // Real-time calculation updates - only when essential values change
  const calculateTotals = useCallback(() => {
    if (
      !selectedDevice ||
      !watchedValues.unitType ||
      !watchedValues.unitAmount ||
      !watchedValues.thcPercentage ||
      !watchedValues.cbdPercentage ||
      (watchedValues.higherAccuracy && !watchedValues.totalSessionInhalations)
    ) {
      setCalculatedTotals(null);
      return;
    }

    try {
      // Calculate material weight based on device and method
      const unitWeight =
        watchedValues.unitType === "capsule"
          ? (selectedDevice?.dosingCapsuleCapacity || 0) *
            parseFloat(watchedValues.unitAmount)
          : (selectedDevice?.chamberCapacity || 0) *
            parseFloat(watchedValues.unitAmount);

      // Calculate total cannabinoids in the material
      const totalThc =
        (parseFloat(watchedValues.thcPercentage) / 100) * unitWeight * 1000; // Convert to mg
      const totalCbd =
        (parseFloat(watchedValues.cbdPercentage) / 100) * unitWeight * 1000; // Convert to mg

      // Calculate consumed amounts based on higher accuracy mode
      let consumedThc = totalThc;
      let consumedCbd = totalCbd;
      let consumptionRatio = 1;

      if (
        watchedValues.higherAccuracy &&
        watchedValues.totalSessionInhalations &&
        watchedValues.inhalationsPerCapsule
      ) {
        const totalInhalations = parseFloat(
          watchedValues.totalSessionInhalations
        );
        const inhalationsPerCapsule = parseFloat(
          watchedValues.inhalationsPerCapsule
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
    selectedDevice,
    watchedValues.unitType,
    watchedValues.unitAmount,
    watchedValues.thcPercentage,
    watchedValues.cbdPercentage,
    watchedValues.higherAccuracy,
    watchedValues.totalSessionInhalations,
    watchedValues.inhalationsPerCapsule,
  ]);

  // Only calculate totals when essential values change
  useEffect(() => {
    calculateTotals();
  }, [calculateTotals]);

  const handleInputChange = (
    field: keyof SessionFormSchema,
    value: string | boolean
  ) => {
    // Apply decimal formatting for THC and CBD percentage fields
    if (field === "thcPercentage" || field === "cbdPercentage") {
      const formattedValue = formatDecimalInput(value as string);
      setValue(field, formattedValue);
    } else {
      setValue(field, value);
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
    if (watchedValues.rating === rating) {
      setValue("rating", 0);
    } else {
      setValue("rating", rating);
    }
  };

  const onSubmit = async (data: SessionFormSchema) => {
    // Prevent double submission
    if (isSubmitting) {
      return;
    }

    // Trigger validation for all fields
    const isValid = await trigger();
    if (!isValid) {
      // Validation failed, errors will be displayed by react-hook-form
      console.log("Validation failed");
      return;
    }

    // Additional validation for higher accuracy mode
    if (data.higherAccuracy) {
      try {
        higherAccuracySchema.parse(data);
      } catch (error) {
        console.error("Error in onSubmit:", error);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Import sessionService dynamically to avoid SSR issues
      const { sessionService } = await import("@/lib/sessionService");

      const { data: sessionData, error } = await sessionService.createSession(
        data as unknown as SessionFormData,
        selectedEffects,
        calculatedTotals,
        selectedDevice as Vaporizer,
        temperatureUnit
      );

      if (error) {
        console.error("Error creating session:", error);
        return;
      }

      if (sessionData) {
        // Reset form after successful submission
        reset({
          date: new Date().toISOString().split("T")[0],
          time: new Date().toISOString().slice(0, 5),
          duration: "",
          method: "dry-herb",
          device: "",
          temperature: "",
          unitType: "",
          unitCapacity: "",
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

        // Show success overlay
        setShowSuccessOverlay(true);
        onSessionCreated?.(); // Call the prop function
      }
    } catch (error) {
      console.error("Error in onSubmit:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setSessionFormOpen}>
      <DialogContent className="bg-doser-surface border-doser-border w-[90vw] max-w-[1000px] sm:max-w-[1000px] max-h-[90vh] overflow-y-auto p-6 scrollbar-doser">
        {showSuccessOverlay ? (
          <DialogHeader className="bg-doser-surface flex items-center justify-center  h-[90vh]">
            <DialogTitle className="text-center space-y-4">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto">
                <span className="text-white text-3xl">✓</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-doser-text mb-2">
                  Session Logged Successfully!
                </h3>
                <p className="text-doser-text-muted">
                  Your cannabis session has been recorded.
                </p>
                <Button
                  variant="dashboard"
                  className="mt-4 w-full"
                  onClick={() => {
                    setSessionFormOpen(false);
                    onSessionCreated?.();
                  }}
                >
                  Close
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
        ) : (
          <>
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

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-8">
              {/* Session Details */}
              <SessionDetails
                formData={watchedValues as unknown as SessionFormData}
                handleInputChange={handleInputChange}
                errors={errors}
              />

              {/* Consumption Method */}
              <ConsumptionMethod
                formData={watchedValues as unknown as SessionFormData}
                handleInputChange={handleInputChange}
                selectedDevice={selectedDevice}
                temperatureUnit={temperatureUnit}
                setTemperatureUnit={setTemperatureUnit}
                errors={errors}
              />

              {/* Cannabinoid Content */}
              <CannabinoidContent
                formData={watchedValues as unknown as SessionFormData}
                handleInputChange={handleInputChange}
                errors={errors}
              />

              {/* Inhalations Summary - Only shown in higher accuracy mode */}
              {watchedValues.higherAccuracy &&
                watchedValues.inhalationsPerCapsule &&
                watchedValues.unitAmount && (
                  <InhalationsSummary
                    formData={watchedValues as unknown as SessionFormData}
                  />
                )}

              {/* Dosage Breakdown */}
              <DosageBreakdown
                formData={watchedValues as unknown as SessionFormData}
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
                rating={watchedValues.rating}
                hoveredRating={hoveredRating}
                handleRatingChange={handleRatingChange}
                setHoveredRating={setHoveredRating}
              />

              {/* Session Notes */}
              <SessionNotes
                formData={watchedValues as unknown as SessionFormData}
                handleInputChange={handleInputChange}
                errors={errors}
              />

              {/* Form Actions */}
              <FormActions
                formData={watchedValues as unknown as SessionFormData}
                selectedEffects={selectedEffects}
                isSubmitting={isSubmitting}
                form={form}
                handleSubmit={handleSubmit(onSubmit)}
                onSaveAsDraft={() => {}}
              />
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
