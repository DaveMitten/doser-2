import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CalculatorInputs } from "./calculator";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Determine current page based on pathname for navigation highlighting
export const getCurrentPage = (pathname: string): string => {
  if (pathname.startsWith("/dashboard")) return "dashboard";
  if (pathname.startsWith("/calculator")) return "calculator";
  if (pathname.startsWith("/sessions")) return "sessions";
  if (pathname.startsWith("/preferences")) return "preferences";
  return "dashboard"; // default fallback
};

export const validateNumberInput = (
  e: React.ChangeEvent<HTMLInputElement>,
  input: keyof CalculatorInputs,
  setInputs: (inputs: CalculatorInputs) => void,
  inputs: CalculatorInputs
) => {
  const value = e.target.value;

  // Allow empty input
  if (value === "") {
    setInputs({
      ...inputs,
      [input]: 0,
    });
    return;
  }

  // Only allow positive integers, no leading zeros
  if (/^[1-9]\d*$/.test(value)) {
    const numValue = parseInt(value) || 0;
    setInputs({
      ...inputs,
      [input]: numValue,
    });
  }
};

export const formatDecimalInput = (value: string): string => {
  // If empty, return empty
  if (value === "") return "";

  // If it's just a decimal point, return "0."
  if (value === ".") return "0.";

  // If it starts with a decimal point, add leading zero
  if (value.startsWith(".")) return "0" + value;

  // If it's a decimal below 1 (e.g., 0.5), allow leading zero
  if (value.startsWith("0.")) return value;

  // Handle cases with multiple leading zeros before decimal point
  // e.g., "000.5" -> "0.5", "0000.123" -> "0.123"
  if (value.match(/^0+\./)) {
    return "0" + value.replace(/^0+/, "");
  }

  // Remove leading zeros for numbers 1 and above, but keep single zero
  // e.g., "0001" -> "1", "00010" -> "10", "01" -> "1"
  if (value.match(/^0+[1-9]/)) {
    return value.replace(/^0+/, "");
  }

  // Handle pure zero sequences (e.g., "000", "0000") - keep as "0"
  if (value.match(/^0+$/)) {
    return "0";
  }

  return value;
};

/**
 * Get the site URL for the current environment
 * Falls back to localhost:3000 for development
 */

/**
 * Get the full callback URL for authentication
 */
export function getAuthCallbackUrl(): string {
  return `${
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  }/auth/callback`;
}
