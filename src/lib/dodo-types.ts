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

// Using official DodoPayments Customer type instead of custom DodoCustomer
// Import from: import { Customer } from "dodopayments";

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
  status:
    | "active"
    | "cancelled"
    | "expired"
    | "on_hold"
    | "failed"
    | "trialing";
  dodo_subscription_id?: string;
  dodo_customer_id?: string;
  current_period_start: string;
  current_period_end: string;
  trial_start?: string;
  trial_end?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentHistory {
  id: string;
  user_id: string;
  dodo_payment_id: string;
  dodo_subscription_id?: string;
  amount: number;
  currency: string;
  status: "pending" | "processing" | "succeeded" | "failed" | "cancelled";
  payment_method?: string;
  error_message?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlan {
  id: string; // This is the Dodo product ID
  name: string;
  price: { monthly: number; yearly: number };
  currency: string;
  interval: "month" | "year";
  trialDays?: number;
  features: string[];
}

// Pricing plans configuration
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "pdt_euP6KahnWde9Ew1jvhIJj",
    name: "Learn",
    price: { monthly: 4.99, yearly: 54.89 },
    currency: "GBP",
    interval: "month",
    trialDays: 7,
    features: [
      "Basic dosage calculator",
      "5 calculations per day",
      "Basic vaporizer profiles",
      "Safety guidelines",
    ],
  },
  {
    id: "pdt_QT8CsZEYopzV38iWlE0Sb",
    name: "Track",
    price: { monthly: 9.99, yearly: 109.89 },
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
  {
    id: "pdt_cseHYcjUQrkC7iti2ysVR",
    name: "Optimize",
    price: { monthly: 19.99, yearly: 219.89 },
    currency: "GBP",
    interval: "month",
    trialDays: 7,
    features: [
      "Everything in Track",
      "Medical condition profiles",
      "Priority support",
    ],
  },
];

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
