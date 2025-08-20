import { z } from "zod";

export const sessionFormSchema = z.object({
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  duration: z
    .string()
    .min(1, "Duration is required")
    .refine((val) => {
      const num = parseInt(val);
      return !isNaN(num) && num > 0 && num <= 300;
    }, "Duration must be between 1 and 300 minutes"),
  method: z.string().min(1, "Method is required"),
  device: z.string().min(1, "Device is required"),
  temperature: z.string().min(1, "Temperature is required"),
  unitType: z.string().min(1, "Unit type is required"),
  unitCapacity: z.string().min(1, "Unit capacity is required"),
  unitAmount: z
    .string()
    .min(1, "Unit amount is required")
    .refine((val) => {
      const num = parseInt(val);
      return !isNaN(num) && num > 0 && num <= 10;
    }, "Unit amount must be between 1 and 10"),
  thcPercentage: z
    .string()
    .min(1, "THC percentage is required")
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 && num <= 100;
    }, "THC percentage must be between 0 and 100"),
  cbdPercentage: z
    .string()
    .min(1, "CBD percentage is required")
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 && num <= 100;
    }, "CBD percentage must be between 0 and 100"),
  totalSessionInhalations: z.string(),
  inhalationsPerCapsule: z.string(),
  higherAccuracy: z.boolean(),
  totalTHC: z.string(),
  totalCBD: z.string(),
  rating: z.number().min(0).max(5),
  notes: z.string(),
});

export type SessionFormSchema = z.infer<typeof sessionFormSchema>;

// Validation schema for when higher accuracy mode is enabled
export const higherAccuracySchema = sessionFormSchema.extend({
  totalSessionInhalations: z
    .string()
    .min(1, "Total session inhalations is required in higher accuracy mode")
    .refine((val) => {
      const num = parseInt(val);
      return !isNaN(num) && num > 0;
    }, "Total session inhalations must be a positive number"),
  inhalationsPerCapsule: z
    .string()
    .min(1, "Inhalations per capsule is required in higher accuracy mode")
    .refine((val) => {
      const num = parseInt(val);
      return !isNaN(num) && num > 0;
    }, "Inhalations per capsule must be a positive number"),
});

export type HigherAccuracySessionFormSchema = z.infer<
  typeof higherAccuracySchema
>;
