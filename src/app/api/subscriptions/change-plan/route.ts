import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { DodoService } from "@/lib/dodo-service";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import * as Sentry from "@sentry/nextjs";
import { logError, logInfo } from "@/lib/error-logger";
import { SUBSCRIPTION_PLANS } from "@/lib/dodo-types";

// Initialize rate limiter (5 plan changes per day per user)
const ratelimit = process.env.UPSTASH_REDIS_REST_URL
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter:
        process.env.NODE_ENV === "development"
          ? Ratelimit.slidingWindow(5, "1 d")
          : Ratelimit.slidingWindow(5, "1 d"),
      analytics: true,
    })
  : null;

export async function POST(request: NextRequest) {
  let userId: string | undefined;

  try {
    // Authenticate user
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      logError(
        new Error(`Authentication failed: ${authError?.message || "No user"}`),
        {
          errorType: "subscription",
          eventType: "change-plan-auth-failed",
          metadata: {
            authError: authError?.message,
          },
        }
      );
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    userId = user.id;

    // Set user context for Sentry
    Sentry.setUser({
      id: user.id,
      email: user.email || undefined,
    });

    // Rate limiting (if Redis is configured)
    if (ratelimit) {
      const identifier = `change-plan:${user.id}`;
      const { success, limit, reset, remaining } =
        await ratelimit.limit(identifier);

      if (!success) {
        logInfo("Rate limit exceeded for plan change", {
          userId: user.id,
          limit,
          reset,
          remaining,
          eventType: "change-plan-rate-limited",
        });

        return NextResponse.json(
          {
            error: `Rate limit exceeded. You can change plans ${limit} times per day. Try again in ${Math.ceil((reset - Date.now()) / 1000 / 60)} minutes.`,
          },
          {
            status: 429,
            headers: {
              "X-RateLimit-Limit": limit.toString(),
              "X-RateLimit-Remaining": remaining.toString(),
              "X-RateLimit-Reset": reset.toString(),
            },
          }
        );
      }
    }

    // Parse request body
    const body = await request.json();
    const { newPlanId } = body;

    // Validate new plan ID
    if (!newPlanId) {
      logError(new Error("Missing newPlanId in request body"), {
        errorType: "subscription",
        eventType: "change-plan-validation-failed",
        userId: user.id,
      });
      return NextResponse.json(
        { error: "Plan ID is required" },
        { status: 400 }
      );
    }

    // Validate plan exists
    const planExists = SUBSCRIPTION_PLANS.some((plan) => plan.id === newPlanId);
    if (!planExists) {
      logError(new Error(`Invalid plan ID: ${newPlanId}`), {
        errorType: "subscription",
        eventType: "change-plan-invalid-plan",
        userId: user.id,
        metadata: { newPlanId },
      });
      return NextResponse.json(
        { error: "Invalid plan ID" },
        { status: 400 }
      );
    }

    // Get current subscription
    const { data: subscription, error: subError } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (subError || !subscription) {
      logError(
        new Error(`No active subscription found: ${subError?.message}`),
        {
          errorType: "subscription",
          eventType: "change-plan-no-subscription",
          userId: user.id,
          metadata: {
            subError: subError?.message,
          },
        }
      );
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }

    // Validate subscription is active and paid (not trial)
    if (subscription.status !== "active") {
      logError(
        new Error(
          `Cannot change plan for subscription with status: ${subscription.status}`
        ),
        {
          errorType: "subscription",
          eventType: "change-plan-invalid-status",
          userId: user.id,
          metadata: {
            status: subscription.status,
          },
        }
      );
      return NextResponse.json(
        {
          error: `Cannot change plans while subscription is ${subscription.status}. Please subscribe first.`,
        },
        { status: 400 }
      );
    }

    // Check if user is trying to change to the same plan
    if (subscription.plan_id === newPlanId) {
      return NextResponse.json(
        { error: "You are already on this plan" },
        { status: 400 }
      );
    }

    // Validate has Dodo subscription ID
    if (!subscription.dodo_subscription_id) {
      logError(new Error("Missing Dodo subscription ID"), {
        errorType: "subscription",
        eventType: "change-plan-missing-dodo-id",
        userId: user.id,
      });
      return NextResponse.json(
        {
          error:
            "Invalid subscription data. Please contact support@doserapp.com.",
        },
        { status: 500 }
      );
    }

    // Change plan using DodoService
    logInfo("Initiating plan change", {
      userId: user.id,
      currentPlanId: subscription.plan_id,
      newPlanId,
      dodoSubscriptionId: subscription.dodo_subscription_id,
    });

    const dodoService = new DodoService();
    const result = await dodoService.changePlan(
      subscription.dodo_subscription_id,
      newPlanId,
      user.id
    );

    if (!result.success) {
      logError(new Error(`Plan change failed: ${result.error}`), {
        errorType: "subscription",
        eventType: "change-plan-dodo-failed",
        userId: user.id,
        metadata: {
          currentPlanId: subscription.plan_id,
          newPlanId,
          error: result.error,
        },
      });
      return NextResponse.json(
        { error: result.error || "Failed to change plan" },
        { status: 500 }
      );
    }

    logInfo("Plan changed successfully", {
      userId: user.id,
      oldPlanId: subscription.plan_id,
      newPlanId,
    });

    return NextResponse.json({
      success: true,
      message: "Plan changed successfully",
      newPlanId,
    });
  } catch (error) {
    console.error("Error processing plan change:", error);

    logError(
      error instanceof Error
        ? error
        : new Error(
            `Unexpected error in plan change: ${JSON.stringify(error)}`
          ),
      {
        errorType: "subscription",
        eventType: "change-plan-unexpected-error",
        userId: userId,
        metadata: {
          errorMessage:
            error instanceof Error ? error.message : "Unknown error",
          errorStack: error instanceof Error ? error.stack : undefined,
        },
      }
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred. Please try again later.",
      },
      { status: 500 }
    );
  }
}
