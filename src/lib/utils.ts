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
 * Get the base URL for the current environment
 * Prioritizes DEV_WEBHOOK_URL for ngrok development
 */
export function getBaseUrl(): string {
  return (
    process.env.DEV_WEBHOOK_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000"
  );
}

/**
 * Get the full callback URL for authentication
 * Prioritizes DEV_WEBHOOK_URL for ngrok development
 */
export function getAuthCallbackUrl(): string {
  return `${getBaseUrl()}/auth/callback`;
}

export const subscriptionIdToName: Record<string, string> = {
  pdt_euP6KahnWde9Ew1jvhIJj: "Learn",
  pdt_QT8CsZEYopzV38iWlE0Sb: "Track",
  pdt_cseHYcjUQrkC7iti2ysVR: "Optimize",
};

/**
 * Get the webhook URL for external services
 * Prioritizes DEV_WEBHOOK_URL for ngrok development
 */
export function getWebhookUrl(): string {
  return `${getBaseUrl()}/api/webhooks/dodo-payments`;
}

/**
 * Universal parameter extraction for email verification
 * Handles URL transformations from various email clients (Gmail, Outlook, Yahoo, etc.)
 */
export interface VerificationParams {
  token_hash: string | null;
  type: string | null;
  source: string;
}

export function extractVerificationParams(url: URL): VerificationParams {
  let token_hash: string | null = null;
  let type: string | null = null;

  // 1. Check direct parameters (normal case - most common)
  token_hash = url.searchParams.get("token_hash");
  type = url.searchParams.get("type");

  if (token_hash && type) {
    return { token_hash, type, source: "direct" };
  }

  // 2. Check all query parameters for wrapped URLs
  // This handles Gmail (?q=), Outlook SafeLinks, and other email client transformations
  for (const [key, value] of url.searchParams.entries()) {
    if (value.includes("token_hash=") && value.includes("type=")) {
      try {
        // Try parsing as full URL (Gmail's q= parameter)
        const wrappedUrl = new URL(value);
        token_hash = wrappedUrl.searchParams.get("token_hash");
        type = wrappedUrl.searchParams.get("type");

        if (token_hash && type) {
          return { token_hash, type, source: `wrapped-${key}` };
        }
      } catch {
        // Not a valid URL, try regex extraction
        const tokenMatch = value.match(/token_hash=([^&\s]+)/);
        const typeMatch = value.match(/type=([^&\s]+)/);

        if (tokenMatch && typeMatch) {
          return {
            token_hash: tokenMatch[1],
            type: typeMatch[1],
            source: `regex-${key}`,
          };
        }
      }
    }
  }

  // 3. Check URL hash fragment (some email clients/security scanners use this)
  if (url.hash) {
    try {
      const hashParams = new URLSearchParams(url.hash.substring(1));
      token_hash = hashParams.get("token_hash");
      type = hashParams.get("type");

      if (token_hash && type) {
        return { token_hash, type, source: "hash" };
      }
    } catch {
      // Hash parsing failed, continue
    }
  }

  return { token_hash: null, type: null, source: "none" };
}
