import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  DodoConfig,
  CreateSubscriptionRequest,
  SubscriptionResponse,
  UserSubscription,
  CheckoutSessionRequest,
  CheckoutSessionResponse,
  DodoCustomer,
  SUBSCRIPTION_PLANS,
  ANNUAL_PLANS,
} from "./dodo-types";

export class DodoService {
  private config: DodoConfig;
  private supabase?: Awaited<ReturnType<typeof createSupabaseServerClient>>;

  constructor() {
    this.config = {
      apiKey: process.env.DODO_PAYMENTS_API_KEY!,
      environment:
        (process.env.DODO_PAYMENTS_ENVIRONMENT as "test_mode" | "live_mode") ||
        "test_mode",
      webhookSecret: process.env.DODO_PAYMENTS_WEBHOOK_KEY,
      returnUrl: process.env.DODO_PAYMENTS_RETURN_URL,
    };
  }

  private getApiBaseUrl(): string {
    return this.config.environment === "test_mode"
      ? "https://test.dodopayments.com"
      : "https://live.dodopayments.com";
  }

  private async getSupabase() {
    if (!this.supabase) {
      this.supabase = await createSupabaseServerClient();
    }
    return this.supabase;
  }

  /**
   * Get or create a Dodo Payments customer
   */
  async getOrCreateCustomer(
    userId: string,
    email: string,
    name?: string
  ): Promise<DodoCustomer> {
    try {
      // First check if we already have a customer for this user
      const supabase = await this.getSupabase();
      const { data: existingSubscription } = await supabase
        .from("user_subscriptions")
        .select("dodo_customer_id")
        .eq("user_id", userId)
        .not("dodo_customer_id", "is", null)
        .single();

      if (existingSubscription?.dodo_customer_id) {
        // Fetch customer details from Dodo Payments API
        const response = await fetch(
          `${this.getApiBaseUrl()}/v1/customers/${
            existingSubscription.dodo_customer_id
          }`,
          {
            headers: {
              Authorization: `Bearer ${this.config.apiKey}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const customer = await response.json();
          return customer.data;
        }
      }

      // Create new customer via Dodo Payments API
      const response = await fetch(`${this.getApiBaseUrl()}/v1/customers`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          name,
          metadata: {
            user_id: userId,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create customer: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error("Error getting or creating customer:", error);
      throw new Error("Failed to get or create customer");
    }
  }

  /**
   * Create a subscription payment using Dodo Payments checkout sessions
   */
  async createSubscriptionPayment(
    request: CreateSubscriptionRequest
  ): Promise<SubscriptionResponse> {
    try {
      console.log(
        "DodoService.createSubscriptionPayment called with:",
        request
      );

      const {
        userId,
        planId,
        customerEmail,
        customerName,
        isYearly = false,
      } = request;

      // Get plan configuration
      const plan = isYearly ? ANNUAL_PLANS[planId] : SUBSCRIPTION_PLANS[planId];
      console.log("Plan found:", plan);
      if (!plan) {
        console.error("Invalid plan ID:", planId);
        return { success: false, error: "Invalid plan ID" };
      }

      // Free plan - no payment needed
      if (plan.price === 0) {
        console.log("Free plan detected, creating free subscription");
        const subscription = await this.createFreeSubscription(userId, planId);
        return { success: true, subscription };
      }

      console.log("Getting or creating customer...");
      // Get or create customer
      const customer = await this.getOrCreateCustomer(
        userId,
        customerEmail,
        customerName
      );
      console.log("Customer obtained:", customer.id);

      // Create checkout session for subscription
      const checkoutSession = await this.createCheckoutSession({
        product_cart: [
          {
            product_id: plan.dodo_product_id || `pdt_${planId}`, // Use configured product ID or generate one
            quantity: 1,
          },
        ],
        customer: {
          email: customerEmail,
          name: customerName,
        },
        return_url: `${this.config.returnUrl}?subscription_id={subscription_id}`,
        metadata: {
          user_id: userId,
          plan_id: planId,
          is_yearly: isYearly,
        },
      });

      console.log("Checkout session created:", checkoutSession.checkout_url);

      return {
        success: true,
        checkoutUrl: checkoutSession.checkout_url,
      };
    } catch (error) {
      console.error("Error creating subscription payment:", error);
      console.error("Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
      return { success: false, error: "Failed to create subscription payment" };
    }
  }

  /**
   * Create a checkout session
   */
  async createCheckoutSession(
    request: CheckoutSessionRequest
  ): Promise<CheckoutSessionResponse> {
    try {
      const response = await fetch(
        `${this.getApiBaseUrl()}/v1/checkout/sessions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to create checkout session: ${response.statusText} - ${errorText}`
        );
      }

      const result = await response.json();
      return {
        checkout_url: result.checkout_url,
        session_id: result.id,
      };
    } catch (error) {
      console.error("Error creating checkout session:", error);
      throw error;
    }
  }

  /**
   * Create a free subscription (Starter plan)
   */
  private async createFreeSubscription(
    userId: string,
    planId: string
  ): Promise<UserSubscription> {
    const now = new Date().toISOString();
    const subscription: UserSubscription = {
      id: crypto.randomUUID(),
      user_id: userId,
      plan_id: planId,
      status: "active",
      current_period_start: now,
      current_period_end: new Date(
        Date.now() + 365 * 24 * 60 * 60 * 1000
      ).toISOString(), // 1 year from now
      created_at: now,
      updated_at: now,
    };

    const supabase = await this.getSupabase();
    const { error } = await supabase
      .from("user_subscriptions")
      .upsert(subscription, { onConflict: "user_id" });

    if (error) {
      throw new Error(`Failed to create free subscription: ${error.message}`);
    }

    return subscription;
  }

  /**
   * Handle webhook events from Dodo Payments
   */
  async handleWebhookEvent(payload: unknown): Promise<void> {
    try {
      console.log("Dodo webhook event received:", payload);

      const payloadData = payload as {
        type: string;
        data: { attributes: Record<string, unknown> };
      };
      const { type, data } = payloadData;

      switch (type) {
        case "subscription.created":
        case "subscription.activated":
          await this.handleSubscriptionActivated(data);
          break;
        case "subscription.cancelled":
          await this.handleSubscriptionCancelled(data);
          break;
        case "subscription.failed":
          await this.handleSubscriptionFailed(data);
          break;
        case "payment.succeeded":
          await this.handlePaymentSucceeded(data);
          break;
        case "payment.failed":
          await this.handlePaymentFailed(data);
          break;
        default:
          console.log(`Unhandled webhook event type: ${type}`);
      }
    } catch (error) {
      console.error("Error handling webhook event:", error);
      throw error;
    }
  }

  /**
   * Handle subscription activated event
   */
  private async handleSubscriptionActivated(data: {
    attributes: Record<string, unknown>;
  }): Promise<void> {
    const subscription = data.attributes;
    const metadata = subscription.metadata as
      | Record<string, unknown>
      | undefined;
    const userId = metadata?.user_id as string;
    const planId = metadata?.plan_id as string;

    if (!userId || !planId) {
      console.error("Missing user_id or plan_id in subscription metadata");
      return;
    }

    const userSubscription: UserSubscription = {
      id: crypto.randomUUID(),
      user_id: userId,
      plan_id: planId,
      status: "active",
      dodo_subscription_id: subscription.id as string,
      dodo_customer_id: subscription.customer_id as string,
      current_period_start: subscription.current_period_start as string,
      current_period_end: subscription.current_period_end as string,
      trial_start: subscription.trial_start as string | undefined,
      trial_end: subscription.trial_end as string | undefined,
      created_at: subscription.created_at as string,
      updated_at: subscription.updated_at as string,
    };

    const supabase = await this.getSupabase();
    const { error } = await supabase
      .from("user_subscriptions")
      .upsert(userSubscription, { onConflict: "user_id" });

    if (error) {
      console.error("Failed to create subscription:", error);
      throw error;
    }

    console.log("Subscription activated for user:", userId);
  }

  /**
   * Handle subscription cancelled event
   */
  private async handleSubscriptionCancelled(data: {
    attributes: Record<string, unknown>;
  }): Promise<void> {
    const subscription = data.attributes;
    const dodoSubscriptionId = subscription.id as string;

    const supabase = await this.getSupabase();
    const { error } = await supabase
      .from("user_subscriptions")
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("dodo_subscription_id", dodoSubscriptionId);

    if (error) {
      console.error("Failed to cancel subscription:", error);
      throw error;
    }

    console.log("Subscription cancelled:", dodoSubscriptionId);
  }

  /**
   * Handle subscription failed event
   */
  private async handleSubscriptionFailed(data: {
    attributes: Record<string, unknown>;
  }): Promise<void> {
    const subscription = data.attributes;
    const dodoSubscriptionId = subscription.id as string;

    const supabase = await this.getSupabase();
    const { error } = await supabase
      .from("user_subscriptions")
      .update({
        status: "failed",
        updated_at: new Date().toISOString(),
      })
      .eq("dodo_subscription_id", dodoSubscriptionId);

    if (error) {
      console.error("Failed to update subscription status:", error);
      throw error;
    }

    console.log("Subscription failed:", dodoSubscriptionId);
  }

  /**
   * Handle payment succeeded event
   */
  private async handlePaymentSucceeded(data: {
    attributes: Record<string, unknown>;
  }): Promise<void> {
    const payment = data.attributes;
    console.log("Payment succeeded:", payment.id as string);
    // Additional payment processing logic can be added here
  }

  /**
   * Handle payment failed event
   */
  private async handlePaymentFailed(data: {
    attributes: Record<string, unknown>;
  }): Promise<void> {
    const payment = data.attributes;
    console.log("Payment failed:", payment.id as string);
    // Additional payment failure handling can be added here
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.getApiBaseUrl()}/v1/subscriptions/${subscriptionId}/cancel`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to cancel subscription: ${response.statusText}`
        );
      }

      return true;
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      return false;
    }
  }

  /**
   * Get subscription status
   */
  async getSubscriptionStatus(
    subscriptionId: string
  ): Promise<Record<string, unknown>> {
    try {
      const response = await fetch(
        `${this.getApiBaseUrl()}/v1/subscriptions/${subscriptionId}`,
        {
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get subscription: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error("Error getting subscription status:", error);
      throw error;
    }
  }
}
