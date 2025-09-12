import gocardless from "gocardless-nodejs";
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
  private client: any;
  private config: GoCardlessConfig;

  constructor(config: GoCardlessConfig) {
    console.log("GoCardlessService constructor called with config:", {
      accessToken: config.accessToken
        ? "***" + config.accessToken.slice(-4)
        : "undefined",
      environment: config.environment,
      webhookSecret: config.webhookSecret
        ? "***" + config.webhookSecret.slice(-4)
        : "undefined",
    });

    // Ensure access token is a string
    const accessToken = String(config.accessToken);
    console.log("Access token type:", typeof accessToken);
    console.log("Access token length:", accessToken.length);

    // Initialize GoCardless client with correct parameters
    this.client = gocardless(
      accessToken,
      config.environment === "live" ? "live" : "sandbox"
    );
    this.config = config;
    console.log("GoCardless client initialized");
  }

  private async getSupabase() {
    return await createSupabaseServerClient();
  }

  /**
   * Create a GoCardless customer
   */
  async createCustomer(
    email: string,
    name?: string,
    metadata?: Record<string, unknown>
  ): Promise<GoCardlessCustomer> {
    try {
      console.log("createCustomer called with:", { email, name, metadata });

      const [givenName, familyName] = name
        ? name.split(" ")
        : [undefined, undefined];

      console.log("Creating GoCardless customer with data:", {
        email,
        given_name: givenName,
        family_name: familyName,
        country_code: "GB",
        metadata: {
          ...metadata,
          created_via: "doser_app",
        },
      });

      const customer = await this.client.customers.create({
        email,
        given_name: givenName,
        family_name: familyName,
        country_code: "GB", // Default to UK
        metadata: {
          ...metadata,
          created_via: "doser_app",
        },
      });

      console.log("GoCardless customer created successfully:", customer.id);
      return customer as GoCardlessCustomer;
    } catch (error) {
      console.error("Error creating GoCardless customer:", error);
      console.error("Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
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
  ): Promise<GoCardlessCustomer> {
    try {
      console.log("getOrCreateCustomer called with:", { userId, email, name });

      const supabase = await this.getSupabase();
      console.log("Supabase client obtained");

      // Check if customer already exists in our database
      console.log("Checking for existing subscription...");
      const { data: existingSubscription, error: dbError } = await supabase
        .from("user_subscriptions")
        .select("gocardless_customer_id")
        .eq("user_id", userId)
        .single();

      if (dbError) {
        console.log("No existing subscription found, will create new customer");
      } else {
        console.log("Existing subscription found:", existingSubscription);
      }

      if (existingSubscription?.gocardless_customer_id) {
        console.log("Getting existing customer from GoCardless...");
        // Get existing customer from GoCardless
        const customer = await this.client.customers.get(
          existingSubscription.gocardless_customer_id
        );
        console.log("Existing customer retrieved:", customer.id);
        return customer as GoCardlessCustomer;
      }

      console.log("Creating new customer...");
      // Create new customer
      const customer = await this.createCustomer(email, name, {
        user_id: userId,
      });
      console.log("New customer created:", customer.id);

      console.log("Storing customer ID in database...");
      // Store customer ID in database
      const { error: insertError } = await supabase
        .from("user_subscriptions")
        .insert({
          user_id: userId,
          gocardless_customer_id: customer.id,
          status: "inactive",
        });

      if (insertError) {
        console.error("Error storing customer in database:", insertError);
        throw new Error(`Failed to store customer: ${insertError.message}`);
      }

      console.log("Customer stored successfully");
      return customer;
    } catch (error) {
      console.error("Error getting/creating customer:", error);
      console.error("Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw new Error("Failed to get or create customer");
    }
  }

  /**
   * Create a subscription payment (simplified approach)
   */
  async createSubscriptionPayment(
    request: CreateSubscriptionRequest
  ): Promise<SubscriptionResponse> {
    try {
      console.log(
        "GoCardlessService.createSubscriptionPayment called with:",
        request
      );

      const { userId, planId, customerEmail, customerName, trialDays } =
        request;

      // Get plan configuration
      const plan = SUBSCRIPTION_PLANS[planId] || ANNUAL_PLANS[planId];
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

      console.log("Creating initial payment for mandate...");
      // Create initial payment to establish mandate and subscription
      return await this.createInitialPaymentForMandate(
        customer.id,
        plan,
        userId,
        planId,
        trialDays
      );
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
   * Create initial payment to establish mandate
   */
  private async createInitialPaymentForMandate(
    customerId: string,
    plan: SubscriptionPlan,
    userId: string,
    planId: string,
    trialDays?: number
  ): Promise<SubscriptionResponse> {
    try {
      // Get customer details to prefill the redirect flow
      const customer = await this.client.customers.get(customerId);

      const redirectFlow = await this.client.redirectFlows.create({
        description: `${plan.name} subscription setup`,
        session_token: crypto.randomUUID(),
        success_redirect_url: `${getBaseUrl()}/billing/success`,
        prefilled_customer: {
          email: customer.email,
          given_name: customer.given_name,
          family_name: customer.family_name,
        },
        metadata: {
          user_id: userId,
          plan_id: planId,
          subscription_type: "initial_payment",
          trial_days: trialDays || plan.trialDays || 0,
        },
      });

      return {
        success: true,
        checkoutUrl: redirectFlow.redirect_url,
      };
    } catch (error) {
      console.error("Error creating redirect flow:", error);
      return { success: false, error: "Failed to create payment flow" };
    }
  }

  /**
   * Create subscription using existing mandate
   */
  private async createSubscriptionWithMandate(
    customerId: string,
    mandateId: string,
    plan: SubscriptionPlan,
    userId: string,
    planId: string,
    trialDays?: number
  ): Promise<SubscriptionResponse> {
    try {
      const now = new Date();
      const trialDaysNum = trialDays || plan.trialDays || 0;
      const startDate =
        trialDaysNum > 0
          ? new Date(now.getTime() + trialDaysNum * 24 * 60 * 60 * 1000)
          : now;

      const subscription = await this.client.subscriptions.create({
        name: `${plan.name} subscription`,
        amount: Math.round(plan.price * 100), // Convert to pence
        currency: plan.currency,
        interval_unit: plan.interval === "year" ? "yearly" : "monthly",
        interval: 1,
        day_of_month: startDate.getDate(),
        start_date: startDate.toISOString().split("T")[0],
        links: {
          mandate: mandateId,
        },
        metadata: {
          user_id: userId,
          plan_id: planId,
          trial_days: trialDaysNum,
        },
      });

      // Store subscription in database
      const userSubscription = await this.storeSubscription(
        userId,
        planId,
        subscription as GoCardlessSubscription
      );

      return {
        success: true,
        subscription: userSubscription,
      };
    } catch (error) {
      console.error("Error creating subscription:", error);
      return { success: false, error: "Failed to create subscription" };
    }
  }

  /**
   * Store subscription in database
   */
  private async storeSubscription(
    userId: string,
    planId: string,
    gocardlessSubscription: GoCardlessSubscription
  ): Promise<UserSubscription> {
    const supabase = await this.getSupabase();
    const now = new Date();
    const trialDays =
      parseInt(gocardlessSubscription.metadata?.trial_days as string) || 0;
    const trialEnd =
      trialDays > 0
        ? new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000)
        : null;

    const subscription: UserSubscription = {
      id: crypto.randomUUID(),
      userId,
      planId,
      gocardlessCustomerId: gocardlessSubscription.links.customer,
      gocardlessSubscriptionId: gocardlessSubscription.id,
      status: trialDays > 0 ? "trialing" : "active",
      currentPeriodStart: now,
      currentPeriodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
      trialStart: trialDays > 0 ? now : undefined,
      trialEnd: trialEnd || undefined,
      cancelAtPeriodEnd: false,
      createdAt: now,
      updatedAt: now,
    };

    // Store in database
    await supabase
      .from("user_subscriptions")
      .upsert(subscription, { onConflict: "user_id" });

    return subscription;
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
   * Handle webhook events
   */
  async handleWebhook(event: WebhookEvent): Promise<void> {
    try {
      const { type, action, resource } = event;

      switch (type) {
        case "payments":
          await this.handlePaymentEvent(action, resource);
          break;
        case "mandates":
          await this.handleMandateEvent(action, resource);
          break;
        case "subscriptions":
          await this.handleSubscriptionEvent(action, resource);
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
   * Handle payment events
   */
  private async handlePaymentEvent(
    action: string,
    resource: { id: string; status: string; [key: string]: unknown }
  ): Promise<void> {
    const { id: paymentId, status } = resource;

    if (action === "created" && status === "confirmed") {
      // Payment confirmed, get payment details
      const payment = await this.client.payments.get(paymentId);
      const metadata = payment.metadata || {};
      const { user_id: userId, plan_id: planId, subscription_type } = metadata;

      if (!userId || !planId) {
        console.log("Payment metadata missing user_id or plan_id");
        return;
      }

      if (subscription_type === "initial_payment") {
        // Initial payment completed, now create the subscription
        await this.createSubscriptionAfterInitialPayment(
          userId as string,
          planId as string,
          payment.links.mandate
        );
      }
    }
  }

  /**
   * Handle mandate events
   */
  private async handleMandateEvent(
    action: string,
    resource: { id: string; status: string; [key: string]: unknown }
  ): Promise<void> {
    const { id: mandateId, status } = resource;

    if (action === "created" && status === "active") {
      // Mandate is now active, we can create subscriptions
      console.log(`Mandate ${mandateId} is now active`);
    }
  }

  /**
   * Handle subscription events
   */
  private async handleSubscriptionEvent(
    action: string,
    resource: { id: string; status: string; [key: string]: unknown }
  ): Promise<void> {
    const { id: subscriptionId, status } = resource;
    const supabase = await this.getSupabase();

    // Update subscription status in database
    await supabase
      .from("user_subscriptions")
      .update({
        status: status === "active" ? "active" : "inactive",
        updated_at: new Date().toISOString(),
      })
      .eq("gocardless_subscription_id", subscriptionId);
  }

  /**
   * Create subscription after initial payment establishes mandate
   */
  private async createSubscriptionAfterInitialPayment(
    userId: string,
    planId: string,
    mandateId: string
  ): Promise<void> {
    try {
      const plan = SUBSCRIPTION_PLANS[planId] || ANNUAL_PLANS[planId];
      if (!plan) {
        console.error("Invalid plan ID:", planId);
        return;
      }

      // Get customer ID from mandate
      const mandate = await this.client.mandates.get(mandateId);
      const customerId = mandate.links.customer;

      // Create subscription with the mandate
      await this.createSubscriptionWithMandate(
        customerId,
        mandateId,
        plan,
        userId,
        planId
      );
    } catch (error) {
      console.error(
        "Error creating subscription after initial payment:",
        error
      );
    }
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
      if (!subscription?.gocardlessSubscriptionId) {
        return false;
      }

      // Cancel subscription in GoCardless
      await this.client.subscriptions.cancel(
        subscription.gocardlessSubscriptionId
      );

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
let gocardlessService: GoCardlessService | null = null;

export function getGoCardlessService(): GoCardlessService {
  if (!gocardlessService) {
    const config: GoCardlessConfig = {
      accessToken: process.env.GOCARDLESS_ACCESS_TOKEN!,
      environment:
        (process.env.GOCARDLESS_ENVIRONMENT as "sandbox" | "live") || "sandbox",
      webhookSecret: process.env.GOCARDLESS_WEBHOOK_SECRET!,
    };
    gocardlessService = new GoCardlessService(config);
  }
  return gocardlessService;
}
