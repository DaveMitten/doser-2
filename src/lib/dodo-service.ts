import { createSupabaseServerClient } from "@/lib/supabase-server";
import DodoPayments from "dodopayments";

import {
  DodoConfig,
  CreateSubscriptionRequest,
  SubscriptionResponse,
  UserSubscription,
  CheckoutSessionResponse,
  SUBSCRIPTION_PLANS,
} from "./dodo-types";
import { PlanService } from "./plan-service";

export class DodoService {
  private config: DodoConfig;
  private supabase?: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  private dodoClient: DodoPayments;

  constructor() {
    this.config = {
      apiKey: process.env.DODO_PAYMENTS_API_KEY!,
      environment:
        (process.env.DODO_PAYMENTS_ENVIRONMENT as "test_mode" | "live_mode") ||
        "test_mode",
      webhookSecret: process.env.DODO_PAYMENTS_WEBHOOK_KEY,
      returnUrl: process.env.DODO_PAYMENTS_RETURN_URL,
    };

    // Initialize the Dodo Payments client
    this.dodoClient = new DodoPayments({
      bearerToken: this.config.apiKey,
      environment: this.config.environment,
    });

    console.log("DodoService config:", {
      hasApiKey: !!this.config.apiKey,
      environment: this.config.environment,
      hasWebhookSecret: !!this.config.webhookSecret,
      returnUrl: this.config.returnUrl,
    });
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
   * Get or create a Dodo Payments customer using the official SDK
   */
  async getOrCreateCustomer(
    userId: string,
    email: string,
    name?: string
  ): Promise<DodoPayments.Customer> {
    console.log("getOrCreateCustomer", { userId, email, name });
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
        // Fetch customer details using the SDK
        const customer = await this.dodoClient.customers.retrieve(
          existingSubscription.dodo_customer_id
        );
        return customer;
      }

      // Create new customer using the SDK
      const customer = await this.dodoClient.customers.create({
        email,
        name: name || "",
      });

      return customer;
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

      // Get plan configuration using PlanService
      console.log("Looking up plan details for:", { planId, isYearly });
      const planDetails = PlanService.getPlanDetails(planId, isYearly);
      console.log("Plan found:", planDetails);
      if (!planDetails) {
        console.error("Invalid plan ID:", planId);
        console.error("Available plans:", Object.keys(SUBSCRIPTION_PLANS));
        return { success: false, error: `Invalid plan ID: ${planId}` };
      }

      // Free plan - no payment needed
      if (planDetails.price === 0) {
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
      console.log("customer", customer);
      console.log("customerEmail", customerEmail);
      console.log("userId", userId);
      console.log("customerName", customerName);
      console.log("Customer obtained:", customer.customer_id);

      // Create checkout session for subscription
      const customerRequest: DodoPayments.NewCustomer = {
        email: customerEmail,
        name: customerName || "", // DodoPayments requires name to be a string, not optional
      };

      const checkoutRequest: DodoPayments.CheckoutSessionCreateParams = {
        product_cart: [
          {
            product_id: planDetails.id, // Use the Dodo product ID from plan details
            quantity: 1,
          },
        ],
        customer: customerRequest,
        return_url:
          this.config.returnUrl ||
          `${process.env.NEXT_PUBLIC_APP_URL}/billing/success`,
        metadata: {
          user_id: userId,
          plan_id: planId,
          is_yearly: isYearly.toString(),
        },
      };

      console.log(
        "Creating checkout session with request:",
        JSON.stringify(checkoutRequest, null, 2)
      );

      const checkoutSession = await this.createCheckoutSession(checkoutRequest);

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

      // Return more specific error message
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        success: false,
        error: `Failed to create subscription payment: ${errorMessage}`,
      };
    }
  }

  /**
   * Create a checkout session using the official SDK
   */
  async createCheckoutSession(
    request: DodoPayments.CheckoutSessionCreateParams
  ): Promise<CheckoutSessionResponse> {
    try {
      console.log(
        "Creating checkout session with request:",
        JSON.stringify(request, null, 2)
      );

      // Use the SDK to create checkout session
      const checkoutSession = await this.dodoClient.checkoutSessions.create(
        request
      );

      console.log("Checkout session created:", checkoutSession);
      return {
        checkout_url: checkoutSession.checkout_url,
        session_id: checkoutSession.session_id,
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
