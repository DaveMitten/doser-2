import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase-server";
import { Database } from "@/lib/database.types";
import { DodoService } from "@/lib/dodo-service";
import * as Sentry from "@sentry/nextjs";

const { logger } = Sentry;

type UserSubscription =
  Database["public"]["Tables"]["user_subscriptions"]["Row"];

/**
 * Check if a subscription is truly active (not expired)
 */
function isSubscriptionActive(subscription: UserSubscription): boolean {
  const now = new Date();

  // Check status field
  if (!["active", "trialing"].includes(subscription.status)) {
    return false;
  }

  // For trialing subscriptions, check trial_end
  if (subscription.status === "trialing") {
    if (subscription.trial_end) {
      const trialEnd = new Date(subscription.trial_end);
      return trialEnd > now;
    }
  }

  // For active subscriptions, check current_period_end
  if (subscription.status === "active") {
    if (subscription.current_period_end) {
      const periodEnd = new Date(subscription.current_period_end);
      return periodEnd > now;
    }
  }

  // Default to status field if no dates available
  return true;
}

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Step 1: Try to get user's subscription from database
    let subscription: UserSubscription | null = null;
    const {
      data: dbSubscription,
      error: dbError,
    }: { data: UserSubscription | null; error: Error | null } = (await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()) as { data: UserSubscription | null; error: Error | null };

    if (dbError) {
      logger.error("Error querying user_subscriptions", { error: dbError });
    }

    subscription = dbSubscription;

    // Step 2: If no subscription found in DB, try to fetch from Dodo Payments
    if (!subscription) {
      logger.info("No subscription in database, checking Dodo Payments", {
        userId: user.id,
      });

      try {
        // Get user's email from auth
        const userEmail = user.email;

        if (!userEmail) {
          logger.warn("No email found for user", { userId: user.id });
          return NextResponse.json({
            subscription: null,
            hasActiveSubscription: false,
          });
        }

        // Initialize DodoService and get/create customer
        const dodoService = new DodoService();
        const customer = await dodoService.getOrCreateCustomer(
          user.id,
          userEmail
        );

        if (customer && customer.customer_id) {
          logger.info("Found Dodo customer, fetching subscriptions", {
            customerId: customer.customer_id,
            userId: user.id,
          });

          // Fetch and sync subscriptions from Dodo
          const syncedSubscription =
            await dodoService.fetchAndSyncSubscriptionsByCustomer(
              customer.customer_id,
              user.id
            );

          if (syncedSubscription) {
            subscription = syncedSubscription;
            logger.info("Successfully synced subscription from Dodo", {
              subscriptionId: syncedSubscription.id,
              userId: user.id,
            });
          }
        }
      } catch (dodoError) {
        logger.error("Error fetching from Dodo Payments", {
          error: dodoError,
          userId: user.id,
        });
        // Continue - don't fail the request if Dodo sync fails
      }
    }

    // Step 3: Return subscription status with expiration check
    if (!subscription) {
      return NextResponse.json({
        subscription: null,
        hasActiveSubscription: false,
      });
    }

    const hasActiveSubscription = isSubscriptionActive(subscription);

    return NextResponse.json({
      subscription,
      hasActiveSubscription,
    });
  } catch (error) {
    logger.error("Error getting subscription status", { error });
    return NextResponse.json(
      { error: "Failed to get subscription status" },
      { status: 500 }
    );
  }
}
