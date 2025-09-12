// Placeholder GoCardless service implementation
// This file provides a working implementation without requiring the GoCardless SDK
// Replace with actual GoCardless integration when ready

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getBaseUrl } from "@/lib/utils";
import {
  GoCardlessConfig,
  UserSubscription,
  CreateSubscriptionRequest,
  SubscriptionResponse,
  GoCardlessCustomer,
  GoCardlessSubscription,
  WebhookEvent,
  SubscriptionPlan,
  SUBSCRIPTION_PLANS,
  ANNUAL_PLANS,
} from "./gocardless-types";

export class GoCardlessService {
  private config: GoCardlessConfig;

  constructor(config: GoCardlessConfig) {
    this.config = config;
  }

  private async getSupabase() {
    return await createSupabaseServerClient();
  }

  /**
   * Create a GoCardless customer (placeholder implementation)
   */
  async createCustomer(
    email: string,
    name?: string,
    metadata?: Record<string, unknown>
  ): Promise<GoCardlessCustomer> {
    // TODO: Implement actual GoCardless customer creation
    throw new Error(
      "GoCardless SDK not installed. Please install gocardless-nodejs package."
    );
  }

  /**
   * Get or create a customer for a user
   */
  async getOrCreateCustomer(
    userId: string,
    email: string,
    name?: string
  ): Promise<GoCardlessCustomer> {
    try {
      const supabase = await this.getSupabase();

      // Check if customer already exists in our database
      const { data: existingSubscription } = await supabase
        .from("user_subscriptions")
        .select("gocardless_customer_id")
        .eq("user_id", userId)
        .single();

      if (existingSubscription?.gocardless_customer_id) {
        // Return placeholder customer data
        return {
          id: existingSubscription.gocardless_customer_id,
          created_at: new Date().toISOString(),
          email,
          given_name: name?.split(" ")[0],
          family_name: name?.split(" ")[1],
          country_code: "GB",
          metadata: { user_id: userId },
        };
      }

      // Create new customer (placeholder)
      const customerId = `cus_${crypto.randomUUID()}`;
      const customer: GoCardlessCustomer = {
        id: customerId,
        created_at: new Date().toISOString(),
        email,
        given_name: name?.split(" ")[0],
        family_name: name?.split(" ")[1],
        country_code: "GB",
        metadata: {
          ...metadata,
          user_id: userId,
          created_via: "doser_app",
        },
      };

      // Store customer ID in database
      await supabase.from("user_subscriptions").insert({
        user_id: userId,
        gocardless_customer_id: customer.id,
        status: "inactive",
      });

      return customer;
    } catch (error) {
      console.error("Error getting/creating customer:", error);
      throw new Error("Failed to get or create customer");
    }
  }

  /**
   * Create a subscription payment (placeholder implementation)
   */
  async createSubscriptionPayment(
    request: CreateSubscriptionRequest
  ): Promise<SubscriptionResponse> {
    try {
      const { userId, planId, customerEmail, customerName, trialDays } =
        request;

      // Get plan configuration
      const plan = SUBSCRIPTION_PLANS[planId] || ANNUAL_PLANS[planId];
      if (!plan) {
        return { success: false, error: "Invalid plan ID" };
      }

      // Free plan - no payment needed
      if (plan.price === 0) {
        const subscription = await this.createFreeSubscription(userId, planId);
        return { success: true, subscription };
      }

      // For paid plans, return a placeholder checkout URL
      // In a real implementation, this would create a GoCardless redirect flow
      return {
        success: true,
        checkoutUrl: `${getBaseUrl()}/checkout/placeholder?plan=${planId}`,
      };
    } catch (error) {
      console.error("Error creating subscription payment:", error);
      return { success: false, error: "Failed to create subscription payment" };
    }
  }

  /**
   * Create a free subscription (Starter plan)
   */
  private async createFreeSubscription(
    userId: string,
    planId: string
  ): Promise<UserSubscription> {
    const supabase = await this.getSupabase();
    const now = new Date();
    const subscription: UserSubscription = {
      id: crypto.randomUUID(),
      userId,
      planId,
      gocardlessCustomerId: "", // No customer needed for free plan
      status: "active",
      currentPeriodStart: now,
      currentPeriodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
      cancelAtPeriodEnd: false,
      createdAt: now,
      updatedAt: now,
    };

    // Store in database
    await supabase.from("user_subscriptions").insert(subscription);

    return subscription;
  }

  /**
   * Handle webhook events (placeholder implementation)
   */
  async handleWebhook(event: WebhookEvent): Promise<void> {
    console.log("GoCardless webhook received (placeholder):", event);
    // TODO: Implement actual webhook handling
  }

  /**
   * Get user's current subscription
   */
  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    try {
      const supabase = await this.getSupabase();
      const { data: subscription } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", userId)
        .single();

      return subscription;
    } catch (error) {
      console.error("Error getting user subscription:", error);
      return null;
    }
  }

  /**
   * Cancel user's subscription
   */
  async cancelSubscription(userId: string): Promise<boolean> {
    try {
      const supabase = await this.getSupabase();

      // Update subscription status in database
      await supabase
        .from("user_subscriptions")
        .update({
          status: "canceled",
          cancel_at_period_end: true,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      return true;
    } catch (error) {
      console.error("Error canceling subscription:", error);
      return false;
    }
  }

  /**
   * Check if user has access to a feature
   */
  async hasFeatureAccess(userId: string, feature: string): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription) {
      return false;
    }

    // Learn plan has limited access
    if (subscription.planId === "learn") {
      return ["basic_calculator", "safety_guidelines"].includes(feature);
    }

    // Track plan features
    if (subscription.planId === "track") {
      const trackFeatures = [
        "basic_calculator",
        "safety_guidelines",
        "unlimited_calculations",
        "session_tracking",
        "tolerance_monitoring",
        "custom_profiles",
        "weekly_insights",
        "basic_ai",
      ];
      return trackFeatures.includes(feature);
    }

    // Optimize plan has all features
    if (subscription.planId === "optimize") {
      return true;
    }

    return false;
  }
}

// Singleton instance
let gocardlessService: GoCardlessService | null = null;

export function getGoCardlessService(): GoCardlessService {
  if (!gocardlessService) {
    const config: GoCardlessConfig = {
      accessToken: process.env.GOCARDLESS_ACCESS_TOKEN || "placeholder_token",
      environment:
        (process.env.GOCARDLESS_ENVIRONMENT as "sandbox" | "live") || "sandbox",
      webhookSecret:
        process.env.GOCARDLESS_WEBHOOK_SECRET || "placeholder_secret",
    };
    gocardlessService = new GoCardlessService(config);
  }
  return gocardlessService;
}
