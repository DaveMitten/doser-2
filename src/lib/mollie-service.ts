import createMollieClient from "@mollie/api-client";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  MollieConfig,
  UserSubscription,
  CreateSubscriptionRequest,
  SubscriptionResponse,
  MollieCustomer,
  SUBSCRIPTION_PLANS,
  ANNUAL_PLANS,
} from "./mollie-types";

export class MollieService {
  private client: ReturnType<typeof createMollieClient>;
  private config: MollieConfig;

  constructor(config: MollieConfig) {
    this.client = createMollieClient({ apiKey: config.apiKey });
    this.config = config;
  }

  private async getSupabase() {
    return await createSupabaseServerClient();
  }

  /**
   * Create a Mollie customer
   */
  async createCustomer(
    email: string,
    name?: string,
    metadata?: Record<string, unknown>
  ): Promise<MollieCustomer> {
    try {
      const customer = await this.client.customers.create({
        name,
        email,
        locale: "en_US" as any,
        metadata: {
          ...metadata,
          created_via: "doser_app",
        },
      });
      return customer as MollieCustomer;
    } catch (error) {
      console.error("Error creating Mollie customer:", error);
      throw new Error("Failed to create customer");
    }
  }

  /**
   * Get or create a customer for a user
   */
  async getOrCreateCustomer(
    userId: string,
    email: string,
    name?: string
  ): Promise<MollieCustomer> {
    try {
      const supabase = await this.getSupabase();

      // Check if customer already exists in our database
      const { data: existingSubscription } = await supabase
        .from("user_subscriptions")
        .select("mollie_customer_id")
        .eq("user_id", userId)
        .single();

      if (existingSubscription?.mollie_customer_id) {
        // Get existing customer from Mollie
        const customer = await this.client.customers.get(
          existingSubscription.mollie_customer_id
        );
        return customer as MollieCustomer;
      }

      // Create new customer
      const customer = await this.createCustomer(email, name, {
        user_id: userId,
      });

      // Store customer ID in database
      await supabase.from("user_subscriptions").insert({
        user_id: userId,
        mollie_customer_id: customer.id,
        status: "inactive",
      });

      return customer;
    } catch (error) {
      console.error("Error getting/creating customer:", error);
      throw new Error("Failed to get or create customer");
    }
  }

  /**
   * Create a subscription payment
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

      // Get or create customer
      const customer = await this.getOrCreateCustomer(
        userId,
        customerEmail,
        customerName
      );

      // Create payment for subscription
      const payment = await this.client.payments.create({
        amount: {
          value: plan.price.toFixed(2),
          currency: plan.currency,
        },
        description: `${plan.name} subscription - ${plan.interval}`,
        customerId: customer.id,
        redirectUrl: `${
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        }/billing/success`,
        webhookUrl: `${
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        }/api/webhooks/mollie`,
        metadata: {
          user_id: userId,
          plan_id: planId,
          subscription_type: "recurring",
          trial_days: trialDays || plan.trialDays || 0,
        },
      });

      return {
        success: true,
        checkoutUrl: payment.getCheckoutUrl(),
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
      mollieCustomerId: "", // No customer needed for free plan
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
   * Handle webhook events
   */
  async handleWebhook(event: {
    type: string;
    data: { id: string; status: string; [key: string]: unknown };
  }): Promise<void> {
    try {
      const { type, data } = event;

      switch (type) {
        case "payment.status.changed":
          await this.handlePaymentStatusChange(data);
          break;
        case "subscription.status.changed":
          await this.handleSubscriptionStatusChange(data);
          break;
        default:
          console.log("Unhandled webhook event type:", type);
      }
    } catch (error) {
      console.error("Error handling webhook:", error);
      throw error;
    }
  }

  /**
   * Handle payment status changes
   */
  private async handlePaymentStatusChange(paymentData: {
    id: string;
    status: string;
    [key: string]: unknown;
  }): Promise<void> {
    const { id: paymentId, status } = paymentData;

    // Get payment details from Mollie
    const payment = await this.client.payments.get(paymentId);
    const metadata = (payment.metadata as Record<string, unknown>) || {};
    const { user_id: userId, plan_id: planId, trial_days } = metadata;

    if (!userId || !planId) {
      console.log("Payment metadata missing user_id or plan_id");
      return;
    }

    if (status === "paid") {
      const supabase = await this.getSupabase();

      // Create active subscription
      const now = new Date();
      const trialDays = parseInt(trial_days as string) || 0;
      const trialEnd =
        trialDays > 0
          ? new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000)
          : null;

      const subscription: UserSubscription = {
        id: crypto.randomUUID(),
        userId: userId as string,
        planId: planId as string,
        mollieCustomerId: payment.customerId || "",
        status: trialDays > 0 ? "trialing" : "active",
        currentPeriodStart: now,
        currentPeriodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
        trialStart: trialDays > 0 ? now : undefined,
        trialEnd: trialEnd || undefined,
        cancelAtPeriodEnd: false,
        createdAt: now,
        updatedAt: now,
      };

      // Update or create subscription in database
      await supabase
        .from("user_subscriptions")
        .upsert(subscription, { onConflict: "user_id" });
    }
  }

  /**
   * Handle subscription status changes
   */
  private async handleSubscriptionStatusChange(subscriptionData: {
    id: string;
    status: string;
    [key: string]: unknown;
  }): Promise<void> {
    const { id: subscriptionId, status } = subscriptionData;
    const supabase = await this.getSupabase();

    // Update subscription status in database
    await supabase
      .from("user_subscriptions")
      .update({
        status: status === "active" ? "active" : "inactive",
        updated_at: new Date().toISOString(),
      })
      .eq("mollie_subscription_id", subscriptionId);
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
      const subscription = await this.getUserSubscription(userId);
      if (!subscription) {
        return false;
      }

      const supabase = await this.getSupabase();

      // Update subscription to cancel at period end
      await supabase
        .from("user_subscriptions")
        .update({
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

    // Free plan has limited access
    if (subscription.planId === "starter") {
      return ["basic_calculator", "safety_guidelines"].includes(feature);
    }

    // Pro plan features
    if (subscription.planId === "pro") {
      const proFeatures = [
        "basic_calculator",
        "safety_guidelines",
        "unlimited_calculations",
        "session_tracking",
        "tolerance_monitoring",
        "custom_profiles",
        "weekly_insights",
        "basic_ai",
      ];
      return proFeatures.includes(feature);
    }

    // Expert plan has all features
    if (subscription.planId === "expert") {
      return true;
    }

    return false;
  }
}

// Singleton instance
let mollieService: MollieService | null = null;

export function getMollieService(): MollieService {
  if (!mollieService) {
    const config: MollieConfig = {
      apiKey: process.env.MOLLIE_API_KEY!,
      environment:
        (process.env.MOLLIE_ENVIRONMENT as "test" | "live") || "test",
    };
    mollieService = new MollieService(config);
  }
  return mollieService;
}
