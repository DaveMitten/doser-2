// GoCardless integration types for Doser app
export interface GoCardlessConfig {
  accessToken: string;
  environment: "sandbox" | "live";
  webhookSecret: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: "month" | "year";
  trialDays?: number;
  features: string[];
  gocardlessPriceId?: string; // GoCardless's price ID for this plan
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  gocardlessCustomerId: string;
  gocardlessSubscriptionId?: string;
  gocardlessMandateId?: string;
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
  type: "payments" | "mandates" | "subscriptions" | "refunds";
  action: string;
  resource_type: string;
  resource: {
    id: string;
    status: string;
    [key: string]: unknown;
  };
}

// GoCardless API response types
export interface GoCardlessCustomer {
  id: string;
  created_at: string;
  email: string;
  given_name?: string;
  family_name?: string;
  company_name?: string;
  address_line1?: string;
  address_line2?: string;
  address_line3?: string;
  city?: string;
  region?: string;
  postal_code?: string;
  country_code: string;
  language?: string;
  metadata?: Record<string, unknown>;
}

export interface GoCardlessPayment {
  id: string;
  created_at: string;
  charge_date: string;
  amount: number;
  currency: string;
  description?: string;
  reference?: string;
  status:
    | "pending_submission"
    | "submitted"
    | "confirmed"
    | "paid_out"
    | "cancelled"
    | "customer_approval_denied"
    | "failed"
    | "charged_back";
  amount_refunded: number;
  metadata?: Record<string, unknown>;
  links: {
    mandate: string;
    subscription?: string;
    creditor: string;
  };
}

export interface GoCardlessSubscription {
  id: string;
  created_at: string;
  name?: string;
  status: "active" | "cancelled" | "finished" | "paused";
  start_date: string;
  end_date?: string;
  interval_unit: "weekly" | "monthly" | "yearly";
  interval: number;
  amount: number;
  currency: string;
  day_of_month?: number;
  month?: string;
  payment_reference?: string;
  metadata?: Record<string, unknown>;
  links: {
    mandate: string;
    customer: string;
  };
}

export interface GoCardlessMandate {
  id: string;
  created_at: string;
  reference?: string;
  status:
    | "pending_customer_approval"
    | "pending_submission"
    | "submitted"
    | "active"
    | "failed"
    | "cancelled"
    | "expired";
  scheme: string;
  next_possible_charge_date?: string;
  metadata?: Record<string, unknown>;
  links: {
    customer: string;
    creditor: string;
    customer_bank_account: string;
  };
}

export interface GoCardlessCustomerBankAccount {
  id: string;
  created_at: string;
  account_holder_name: string;
  account_number_ending: string;
  bank_name: string;
  country_code: string;
  currency: string;
  metadata?: Record<string, unknown>;
  links: {
    customer: string;
  };
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
      "Everything in Starter",
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
      "Everything in Pro",
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
