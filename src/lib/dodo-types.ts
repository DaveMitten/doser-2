// Dodo Payments Type Definitions
// Based on the Dodo Payments API documentation

export interface DodoProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  interval?: "month" | "year";
  trial_days?: number;
  features?: string[];
  metadata?: Record<string, unknown>;
}

export interface DodoCustomer {
  id: string;
  email: string;
  name?: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, unknown>;
}

export interface DodoSubscription {
  id: string;
  customer_id: string;
  product_id: string;
  status: "active" | "cancelled" | "expired" | "on_hold" | "failed";
  current_period_start: string;
  current_period_end: string;
  trial_start?: string;
  trial_end?: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, unknown>;
}

export interface DodoPayment {
  id: string;
  amount: number;
  currency: string;
  status: "pending" | "processing" | "succeeded" | "failed" | "cancelled";
  customer_id: string;
  subscription_id?: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, unknown>;
}

export interface DodoWebhookPayload {
  id: string;
  type: string;
  data: {
    id: string;
    type: string;
    attributes: Record<string, unknown>;
  };
  created_at: string;
}

// Request/Response interfaces for our service
export interface CreateSubscriptionRequest {
  userId: string;
  planId: string;
  customerEmail: string;
  customerName?: string;
  trialDays?: number;
  isYearly?: boolean;
}

export interface SubscriptionResponse {
  success: boolean;
  subscription?: UserSubscription;
  checkoutUrl?: string;
  error?: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: "active" | "cancelled" | "expired" | "on_hold" | "failed";
  dodo_subscription_id?: string;
  dodo_customer_id?: string;
  current_period_start: string;
  current_period_end: string;
  trial_start?: string;
  trial_end?: string;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: "month" | "year";
  trialDays?: number;
  features: string[];
  dodo_product_id?: string; // Dodo Payments product ID
}

// Pricing plans configuration
export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  learn: {
    id: "learn",
    name: "Learn",
    price: 4.99,
    currency: "GBP",
    interval: "month",
    features: [
      "Basic dosage calculator",
      "5 calculations per day",
      "Basic vaporizer profiles",
      "Safety guidelines",
    ],
  },
  track: {
    id: "track",
    name: "Track",
    price: 9.99,
    currency: "GBP",
    interval: "month",
    trialDays: 7,
    features: [
      "Everything in Learn",
      "Unlimited calculations",
      "Session tracking & history",
      "Weekly insights",
      "Detailed analytics & reports",
      "Export data (PDF/CSV)",
    ],
  },
  optimize: {
    id: "optimize",
    name: "Optimize",
    price: 19.99,
    currency: "GBP",
    interval: "month",
    trialDays: 7,
    features: [
      "Everything in Track",
      "Medical condition profiles",
      "Priority support",
    ],
  },
};

// Annual pricing (1 month free - pay for 11 months)
export const ANNUAL_PLANS: Record<string, SubscriptionPlan> = {
  learn: {
    ...SUBSCRIPTION_PLANS.learn,
    price: 54.89, // 4.99 * 11 months (1 month free)
    interval: "year",
  },
  track: {
    ...SUBSCRIPTION_PLANS.track,
    price: 109.89, // 9.99 * 11 months (1 month free)
    interval: "year",
  },
  optimize: {
    ...SUBSCRIPTION_PLANS.optimize,
    price: 219.89, // 19.99 * 11 months (1 month free)
    interval: "year",
  },
};

// Dodo Payments API configuration
export interface DodoConfig {
  apiKey: string;
  environment: "test_mode" | "live_mode";
  webhookSecret?: string;
  returnUrl?: string;
}

// Checkout session request
export interface CheckoutSessionRequest {
  product_cart: Array<{
    product_id: string;
    quantity: number;
  }>;
  customer: {
    email: string;
    name?: string;
  };
  return_url?: string;
  metadata?: Record<string, unknown>;
}

// Checkout session response
export interface CheckoutSessionResponse {
  checkout_url: string;
  session_id: string;
}
