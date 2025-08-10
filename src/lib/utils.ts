import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CalculatorInputs } from "./calculator";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCurrentPage(pathname: string): string {
  // Remove leading slash and split by '/'
  const segments = pathname.replace(/^\//, "").split("/");

  // If we're in the authorised area, get the second segment
  if (segments[0] === "authorised" && segments[1]) {
    return segments[1];
  }

  // Default to dashboard if no specific page
  return "dashboard";
}

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
