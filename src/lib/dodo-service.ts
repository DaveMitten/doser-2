import {
  createSupabaseServerClient,
  createSupabaseServiceClient,
} from "@/lib/supabase-server";
import { SupabaseClient } from "@supabase/supabase-js";
import DodoPayments from "dodopayments";

import type {
  SubscriptionActivePayloadSchema,
  WebhookPayloadSchema,
} from "@dodopayments/core/schemas";

import {
  DodoConfig,
  CreateSubscriptionRequest,
  SubscriptionResponse,
  UserSubscription,
  CheckoutSessionResponse,
  SUBSCRIPTION_PLANS,
} from "./dodo-types";
import { PlanService } from "./plan-service";
import { logError, logWarning, logInfo } from "./error-logger";
import { Database } from "./database.types";
import z from "zod";

type SupabaseClientType = Awaited<
  ReturnType<typeof createSupabaseServerClient>
>;

export class DodoService {
  private config: DodoConfig;
  private supabase?: any;
  private serviceSupabase?: ReturnType<typeof createSupabaseServiceClient>;
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

  private async getSupabase(): Promise<SupabaseClient<Database>> {
    if (!this.supabase) {
      this.supabase = await createSupabaseServerClient();
    }
    return this.supabase as SupabaseClient<Database>;
  }

  /**
   * Get service role Supabase client for webhook operations (bypasses RLS)
   */
  private getServiceSupabase() {
    if (!this.serviceSupabase) {
      this.serviceSupabase = createSupabaseServiceClient();
    }
    return this.serviceSupabase;
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
      const supabase = (await this.getSupabase()) as any;
      const {
        data: existingSubscription,
        error: queryError,
      }: { data: UserSubscription | null; error: any | Error } = await supabase
        .from("user_subscriptions")
        .select("dodo_customer_id")
        .eq("user_id", userId)
        .not("dodo_customer_id", "is", null)
        .maybeSingle(); // Use maybeSingle() instead of single() to avoid throwing on no rows

      if (queryError) {
        console.error("Error querying user_subscriptions:", queryError);
        // If table doesn't exist, just create a new customer
        if ((queryError as any).code === "42P01") {
          console.warn(
            "user_subscriptions table not found. Please run dodo-payments-migration.sql"
          );
        }
      }

      // Only fetch existing customer if we found one
      if (existingSubscription?.dodo_customer_id) {
        try {
          console.log(
            "Found existing customer ID:",
            existingSubscription.dodo_customer_id
          );
          const customer = await this.dodoClient.customers.retrieve(
            existingSubscription.dodo_customer_id
          );
          console.log("Retrieved existing customer from Dodo");
          return customer;
        } catch (err) {
          console.warn(
            "Existing customer not found in Dodo, creating new one:",
            err
          );
          // If customer doesn't exist in Dodo anymore, create a new one
        }
      }

      // Create new customer using the SDK
      console.log("Creating new customer in Dodo Payments");
      console.log("Request details:", {
        email,
        name: name || email.split("@")[0],
        environment: this.config.environment,
        apiKeyConfigured: !!this.dodoClient,
      });

      const customer = await this.dodoClient.customers.create({
        email,
        name: name || email.split("@")[0], // Use email prefix as fallback
      });

      console.log("Customer created successfully:", customer.customer_id);
      return customer;
    } catch (error: unknown) {
      console.error("Error getting or creating customer:", error);

      // Type guard for errors with status property
      const hasStatus = (err: unknown): err is { status: number } => {
        return typeof err === "object" && err !== null && "status" in err;
      };

      console.error("Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        userId,
        email,
        // Check if it's a Dodo API error
        status: hasStatus(error) ? error.status : undefined,
        errorType: error?.constructor?.name,
      });

      // Provide more helpful error message based on status code
      if (hasStatus(error) && error.status === 401) {
        throw new Error(
          `Failed to get or create customer: 401 Unauthorized - Please check:
1. Your Dodo Payments account identity verification status
2. Your API key is correct and active
3. You're using the right environment (test_mode vs live_mode)`
        );
      }

      throw new Error(
        `Failed to get or create customer: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
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
    const subscription: Database["public"]["Tables"]["user_subscriptions"]["Insert"] =
      {
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

    const supabase = (await this.getSupabase()) as any;
    const { error } = await supabase
      .from("user_subscriptions")
      .upsert(subscription, { onConflict: "user_id" });

    if (error) {
      throw new Error(`Failed to create free subscription: ${error.message}`);
    }

    return subscription as UserSubscription;
  }

  /**
   * Handle webhook events from Dodo Payments
   */
  async handleWebhookEvent(payload: unknown): Promise<void> {
    try {
      console.log("Dodo webhook event received:", payload);

      const payloadData = payload as z.infer<typeof WebhookPayloadSchema>;
      const { type, data } = payloadData;

      switch (type) {
        case "subscription.active":
          await this.handleSubscriptionActivated({
            type: "subscription.active",
            data,
            business_id: payloadData.business_id,
            timestamp: payloadData.timestamp,
          });
          break;
        case "subscription.cancelled":
          await this.handleSubscriptionCancelled({
            type: "subscription.cancelled",
            data,
            business_id: payloadData.business_id,
            timestamp: payloadData.timestamp,
          });
          break;
        case "subscription.failed":
          await this.handleSubscriptionFailed(data);
          break;
        case "subscription.expired":
          await this.handleSubscriptionExpired(data);
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
  private async handleSubscriptionActivated(
    subscriptionData: z.infer<typeof SubscriptionActivePayloadSchema>
  ): Promise<void> {
    try {
      console.log(
        "Raw subscription webhook data:",
        JSON.stringify(subscriptionData, null, 2)
      );

      const subscription = subscriptionData.data;
      const metadata = subscription.metadata as
        | Record<string, unknown>
        | undefined;
      let userId = metadata?.user_id as string;
      const planId = metadata?.plan_id as string;
      const subscriptionId = subscription.subscription_id as string;

      console.log("Processing subscription activation:", {
        subscriptionId,
        userId,
        planId,
        status: subscription.status,
      });

      // Fallback: Try to get user_id from customer lookup
      if (!userId && subscription.customer?.customer_id) {
        logWarning(
          "user_id missing from metadata, attempting customer lookup",
          {
            subscriptionId,
            customerId: subscription.customer.customer_id as string,
          }
        );

        const supabase = this.getServiceSupabase() as any;
        const { data: existingSubscription } = await supabase
          .from("user_subscriptions")
          .select("user_id")
          .eq("dodo_customer_id", subscription.customer.customer_id as string)
          .maybeSingle();

        if (existingSubscription?.user_id) {
          userId = existingSubscription.user_id;
          logInfo("Found user_id via customer lookup", {
            userId,
            subscriptionId,
          });
        }
      }

      // Still missing? Now throw error
      if (!userId || !planId) {
        const error = new Error(
          `Missing required metadata: ${
            !userId ? "user_id" : "plan_id"
          } not found`
        );
        logError(error, {
          errorType: "webhook",
          subscriptionId,
          dodoSubscriptionId: subscriptionId,
          eventType: "subscription.active",
          metadata: metadata || {},
        });
        throw error;
      }

      // Use the actual status from Dodo, with fallback logic
      const subscriptionStatus = subscription.status as string;

      // this is wrong, if the user pays for the subscription they are immediately out of the trial period

      // Build subscription object with explicit null handling
      const now = new Date().toISOString();
      const userSubscription: UserSubscription = {
        id: crypto.randomUUID(),
        user_id: userId,
        plan_id: planId,
        status: subscriptionStatus as
          | "active"
          | "cancelled"
          | "expired"
          | "on_hold"
          | "failed"
          | "trialing",
        dodo_subscription_id: subscription.subscription_id as string,
        dodo_customer_id:
          (subscription.customer?.customer_id as string) || undefined,
        current_period_start:
          subscription?.previous_billing_date?.toISOString() as string,
        current_period_end:
          subscription?.next_billing_date?.toISOString() as string,
        trial_start: subscription?.created_at?.toISOString() as string,
        trial_end: new Date(
          subscription.created_at.getTime() +
            subscription.trial_period_days * 24 * 60 * 60 * 1000
        ).toISOString(),
        created_at: subscription.created_at?.toISOString() as string,
        updated_at: now,
      };

      console.log(
        "Prepared subscription data for upsert:",
        JSON.stringify(userSubscription, null, 2)
      );

      // Use service role client for webhook operations to bypass RLS
      const supabase = this.getServiceSupabase() as any;

      // Log before upsert
      console.log("🔄 Attempting upsert to user_subscriptions table...");
      console.log("  - user_id:", userId);
      console.log("  - dodo_subscription_id:", subscriptionId);
      console.log("  - plan_id:", planId);
      console.log("  - status:", subscriptionStatus);

      const { data: upsertedData, error } = await supabase
        .from("user_subscriptions")
        .upsert(userSubscription, {
          onConflict: "user_id",
          ignoreDuplicates: false,
        })
        .select();

      // Log the result
      if (upsertedData) {
        console.log(
          "✅ Upsert successful! Returned data:",
          JSON.stringify(upsertedData, null, 2)
        );
      }

      if (error) {
        let errorMessage = `Failed to upsert subscription: ${error.message}`;

        // Handle specific Supabase errors
        if (error.code === "23505") {
          errorMessage = "Duplicate subscription entry";
        } else if (error.code === "23503") {
          errorMessage =
            "Foreign key constraint violation - user may not exist";
        } else if (error.code === "42P01") {
          errorMessage = "Table user_subscriptions not found - run migrations";
        }

        const dbError = new Error(errorMessage);
        logError(dbError, {
          errorType: "database",
          userId,
          subscriptionId,
          dodoSubscriptionId: subscriptionId,
          eventType: "subscription.active",
          metadata: {
            supabaseError: error,
            errorCode: error.code,
          },
        });

        throw dbError;
      }

      console.log("Subscription activated successfully:", {
        userId,
        planId,
        status: subscriptionStatus,
        subscriptionId,
      });
    } catch (error) {
      console.error("Error handling subscription activation:", error);
      throw error;
    }
  }

  /**
   * Handle subscription cancelled event
   */
  private async handleSubscriptionCancelled(
    data: Record<string, unknown>
  ): Promise<void> {
    const subscription = data;
    const dodoSubscriptionId = subscription.subscription_id as string;

    const supabase = this.getServiceSupabase() as any;
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
  private async handleSubscriptionFailed(
    data: Record<string, unknown>
  ): Promise<void> {
    const subscription = data;
    const dodoSubscriptionId = subscription.subscription_id as string;

    const supabase = this.getServiceSupabase() as any;
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
   * Handle subscription expired event
   */
  private async handleSubscriptionExpired(
    data: Record<string, unknown>
  ): Promise<void> {
    const subscription = data;
    const dodoSubscriptionId = subscription.subscription_id as string;

    const supabase = this.getServiceSupabase() as any;
    const { error } = await supabase
      .from("user_subscriptions")
      .update({
        status: "expired",
        updated_at: new Date().toISOString(),
      })
      .eq("dodo_subscription_id", dodoSubscriptionId);

    if (error) {
      console.error("Failed to expire subscription:", error);
      throw error;
    }

    console.log("Subscription expired:", dodoSubscriptionId);
  }

  /**
   * Handle payment succeeded event
   */
  private async handlePaymentSucceeded(
    data: Record<string, unknown>
  ): Promise<void> {
    try {
      console.log("Raw payment webhook data:", JSON.stringify(data, null, 2));

      const payment = data;
      const paymentId = payment.payment_id as string;
      console.log("Payment succeeded:", paymentId);

      // Extract payment details with better null handling
      // Amount might be in different formats (number, string, cents)
      let amount = payment.amount as number | undefined;

      // If amount is null/undefined, try to extract from other fields
      if (!amount && payment.total_amount) {
        amount = payment.total_amount as number;
      }

      // Convert from cents to decimal if needed (Dodo typically uses cents)
      if (amount && amount > 1000) {
        // Likely in cents, convert to decimal
        amount = amount / 100;
      }

      const currency = (payment.currency as string) || "GBP";
      const subscriptionId = payment.subscription_id as string | undefined;
      const paymentMethod = payment.payment_method as string | undefined;
      const metadata = payment.metadata as Record<string, unknown> | undefined;

      console.log("Extracted payment details:", {
        paymentId,
        amount,
        currency,
        subscriptionId,
        paymentMethod,
      });

      // Get user_id from subscription or metadata
      let userId: string | undefined;
      if (metadata?.user_id) {
        userId = metadata.user_id as string;
      } else if (subscriptionId) {
        // Try to find user from subscription (use service client for webhook)
        const supabase = this.getServiceSupabase() as any;
        const { data: subscription } = await supabase
          .from("user_subscriptions")
          .select("user_id")
          .eq("dodo_subscription_id", subscriptionId)
          .maybeSingle();
        userId = subscription?.user_id;
      }

      if (!userId) {
        console.error("Cannot track payment: user_id not found", {
          metadata,
          subscriptionId,
          paymentId,
        });
        return;
      }

      // Only insert payment history if we have a valid amount
      if (amount && amount > 0) {
        // Insert payment record into payment_history (use service client for webhook)
        const supabase = this.getServiceSupabase() as any;
        const { error: insertError } = await supabase
          .from("payment_history")
          .insert({
            user_id: userId,
            dodo_payment_id: paymentId,
            dodo_subscription_id: subscriptionId,
            amount,
            currency,
            status: "succeeded",
            payment_method: paymentMethod,
            metadata,
          });

        if (insertError) {
          console.error("Failed to insert payment history:", insertError);
          // Don't throw - we don't want to fail webhook processing
        } else {
          console.log("Payment history recorded successfully");
        }
      } else {
        console.warn(
          "Skipping payment history insertion - amount is 0 or undefined",
          {
            amount,
            paymentId,
          }
        );
      }

      // If this is a subscription payment, update subscription status to active
      // Note: payment.succeeded webhook only fires when real money is charged
      // During free trials, no payment webhook is sent
      if (subscriptionId) {
        console.log(
          `Payment received (${currency} ${
            amount || 0
          }) for subscription ${subscriptionId}, updating status to active`
        );

        const supabase = this.getServiceSupabase() as any;
        const { error: updateError } = await supabase
          .from("user_subscriptions")
          .update({
            status: "active",
            updated_at: new Date().toISOString(),
          })
          .eq("dodo_subscription_id", subscriptionId);

        if (updateError) {
          console.error("Failed to update subscription status:", updateError);
        } else {
          console.log(
            `Subscription ${subscriptionId} status updated to active after successful payment`
          );
        }
      }
    } catch (error) {
      console.error("Error handling payment succeeded:", error);
      // Don't throw - we don't want to fail webhook processing
    }
  }

  /**
   * Handle payment failed event
   */
  private async handlePaymentFailed(
    data: Record<string, unknown>
  ): Promise<void> {
    try {
      console.log(
        "Raw failed payment webhook data:",
        JSON.stringify(data, null, 2)
      );

      const payment = data;
      const paymentId = payment.payment_id as string;
      console.log("Payment failed:", paymentId);

      // Extract payment details with better null handling
      let amount = payment.amount as number | undefined;

      // If amount is null/undefined, try to extract from other fields
      if (!amount && payment.total_amount) {
        amount = payment.total_amount as number;
      }

      // Convert from cents to decimal if needed
      if (amount && amount > 1000) {
        amount = amount / 100;
      }

      const currency = (payment.currency as string) || "GBP";
      const subscriptionId = payment.subscription_id as string | undefined;
      const paymentMethod = payment.payment_method as string | undefined;
      const metadata = payment.metadata as Record<string, unknown> | undefined;
      const errorMessage = payment.error_message as string | undefined;

      console.log("Extracted failed payment details:", {
        paymentId,
        amount,
        currency,
        subscriptionId,
        errorMessage,
      });

      // Get user_id from subscription or metadata
      let userId: string | undefined;
      if (metadata?.user_id) {
        userId = metadata.user_id as string;
      } else if (subscriptionId) {
        // Try to find user from subscription (use service client for webhook)
        const supabase = this.getServiceSupabase() as any;
        const { data: subscription } = await supabase
          .from("user_subscriptions")
          .select("user_id")
          .eq("dodo_subscription_id", subscriptionId)
          .maybeSingle();
        userId = subscription?.user_id;
      }

      if (!userId) {
        console.error("Cannot track failed payment: user_id not found", {
          metadata,
          subscriptionId,
          paymentId,
        });
        return;
      }

      // Only insert payment history if we have a valid amount
      if (amount && amount > 0) {
        // Insert failed payment record into payment_history (use service client for webhook)
        const supabase = this.getServiceSupabase() as any;
        const { error: insertError } = await supabase
          .from("payment_history")
          .insert({
            user_id: userId,
            dodo_payment_id: paymentId,
            dodo_subscription_id: subscriptionId,
            amount,
            currency,
            status: "failed",
            payment_method: paymentMethod,
            error_message: errorMessage || "Payment failed",
            metadata,
          });

        if (insertError) {
          console.error("Failed to insert payment history:", insertError);
          // Don't throw - we don't want to fail webhook processing
        } else {
          console.log("Failed payment history recorded successfully");
        }
      } else {
        console.warn(
          "Skipping failed payment history insertion - amount is 0 or undefined",
          {
            amount,
            paymentId,
          }
        );
      }

      // Check if we should update subscription status
      // Note: Dodo Payments usually handles subscription status updates
      // We'll log this but let Dodo manage the subscription lifecycle
      if (subscriptionId) {
        console.log(
          `Payment failed for subscription ${subscriptionId}. Dodo Payments will handle retry logic.`
        );
      }
    } catch (error) {
      console.error("Error handling payment failed:", error);
      // Don't throw - we don't want to fail webhook processing
    }
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
