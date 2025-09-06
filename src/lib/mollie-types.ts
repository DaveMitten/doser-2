// Mollie integration types for Doser app
export interface MollieConfig {
  apiKey: string;
  environment: "test" | "live";
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: "month" | "year";
  trialDays?: number;
  features: string[];
  molliePriceId?: string; // Mollie's price ID for this plan
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  mollieCustomerId: string;
  mollieSubscriptionId?: string;
  status: "active" | "inactive" | "trialing" | "past_due" | "canceled";
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialStart?: Date;
  trialEnd?: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSubscriptionRequest {
  userId: string;
  planId: string;
  customerEmail: string;
  customerName?: string;
  trialDays?: number;
}

export interface SubscriptionResponse {
  success: boolean;
  subscription?: UserSubscription;
  checkoutUrl?: string;
  error?: string;
}

export interface WebhookEvent {
  id: string;
  type: "payment.status.changed" | "subscription.status.changed";
  data: {
    id: string;
    status: string;
    [key: string]: unknown;
  };
}

// Mollie API response types
export interface MollieCustomer {
  id: string;
  name?: string;
  email: string;
  locale?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface MolliePayment {
  id: string;
  mode: "test" | "live";
  status: "open" | "canceled" | "pending" | "expired" | "failed" | "paid";
  amount: {
    value: string;
    currency: string;
  };
  description: string;
  method?: string;
  customerId?: string;
  subscriptionId?: string;
  webhookUrl?: string;
  redirectUrl?: string;
  createdAt: string;
  paidAt?: string;
  canceledAt?: string;
  metadata?: Record<string, unknown>;
}

export interface MollieSubscription {
  id: string;
  mode: "test" | "live";
  status: "active" | "pending" | "canceled" | "suspended" | "completed";
  amount: {
    value: string;
    currency: string;
  };
  interval: string;
  description: string;
  customerId: string;
  startDate: string;
  nextPaymentDate?: string;
  canceledAt?: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

// Pricing plans configuration
export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  starter: {
    id: "starter",
    name: "Starter",
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
  pro: {
    id: "pro",
    name: "Pro",
    price: 9.99,
    currency: "GBP",
    interval: "month",
    trialDays: 7,
    features: [
      "Everything in Starter",
      "Unlimited calculations",
      "Session tracking & history",
      "Weekly insights",
      "Detailed analytics & reports",
      "Export data (PDF/CSV)",
    ],
  },
  expert: {
    id: "expert",
    name: "Expert",
    price: 19.99,
    currency: "GBP",
    interval: "month",
    trialDays: 7,
    features: [
      "Everything in Pro",
      "Medical condition profiles",
      "Priority support",
    ],
  },
};

// Annual pricing (1 month free - pay for 11 months)
export const ANNUAL_PLANS: Record<string, SubscriptionPlan> = {
  starter: {
    ...SUBSCRIPTION_PLANS.starter,
    price: 54.89, // 4.99 * 11 months (1 month free)
    interval: "year",
  },
  pro: {
    ...SUBSCRIPTION_PLANS.pro,
    price: 109.89, // 9.99 * 11 months (1 month free)
    interval: "year",
  },
  expert: {
    ...SUBSCRIPTION_PLANS.expert,
    price: 219.89, // 19.99 * 11 months (1 month free)
    interval: "year",
  },
};
