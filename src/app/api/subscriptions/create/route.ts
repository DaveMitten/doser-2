import { NextRequest, NextResponse } from "next/server";
import { getBaseUrl } from "@/lib/utils";
import { createSupabaseServerClient } from "../../../../lib/supabase-server";
import { SUBSCRIPTION_PLANS, ANNUAL_PLANS } from "@/lib/dodo-types";

export async function POST(request: NextRequest) {
  try {
    // Debug: Check if environment variables are loaded
    console.log("Environment check:", {
      hasDodoApiKey: !!process.env.DODO_PAYMENTS_API_KEY,
      dodoEnvironment: process.env.DODO_PAYMENTS_ENVIRONMENT,
      baseUrl: getBaseUrl(),
    });

    const supabase = await createSupabaseServerClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    console.log("authError", authError);
    console.log("user", user);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { planId, trialDays, isYearly = false } = body;

    // Validate plan ID
    if (!planId || !["learn", "track", "optimize"].includes(planId)) {
      return NextResponse.json({ error: "Invalid plan ID" }, { status: 400 });
    }

    // Get user profile for email
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", user.id)
      .single();

    if (!profile?.email) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    // Get plan configuration
    const plan = isYearly ? ANNUAL_PLANS[planId] : SUBSCRIPTION_PLANS[planId];
    console.log("Plan found:", plan);

    if (!plan) {
      console.error("Invalid plan ID:", planId);
      return NextResponse.json({ error: "Invalid plan ID" }, { status: 400 });
    }

    // Free plan - no payment needed
    if (plan.price === 0) {
      console.log("Free plan detected, creating free subscription");
      // Create free subscription directly in database
      const now = new Date().toISOString();
      const subscription = {
        id: crypto.randomUUID(),
        user_id: user.id,
        plan_id: planId,
        status: "active",
        current_period_start: now,
        current_period_end: new Date(
          Date.now() + 365 * 24 * 60 * 60 * 1000
        ).toISOString(), // 1 year from now
        created_at: now,
        updated_at: now,
      };

      const { error } = await supabase
        .from("user_subscriptions")
        .upsert(subscription, { onConflict: "user_id" });

      if (error) {
        throw new Error(`Failed to create free subscription: ${error.message}`);
      }

      return NextResponse.json({ success: true, subscription });
    }

    // For paid plans, redirect to Dodo Payments checkout
    // Use the static checkout with productId parameter
    const productId =
      plan.dodo_product_id ||
      `pdt_${planId}_${isYearly ? "yearly" : "monthly"}`;
    const checkoutUrl = `${getBaseUrl()}/api/checkout?productId=${productId}&quantity=1&email=${encodeURIComponent(
      profile.email
    )}&fullName=${encodeURIComponent(
      profile.full_name || ""
    )}&metadata_planId=${planId}&metadata_isYearly=${isYearly}&metadata_trialDays=${trialDays}`;

    console.log("Redirecting to checkout URL:", checkoutUrl);

    return NextResponse.json({
      success: true,
      checkoutUrl: checkoutUrl,
    });
  } catch (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}
