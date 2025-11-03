import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase-server";
import { DodoService } from "@/lib/dodo-service";
import { PlanService } from "../../../../lib/plan-service";
import { SUBSCRIPTION_PLANS } from "../../../../lib/dodo-types";

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { planId, isYearly = false } = body;
    // Validate plan ID
    if (!planId || !SUBSCRIPTION_PLANS.find((plan) => plan.id === planId)) {
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
    const plan = PlanService.getPlanDetails(planId, isYearly);

    if (!plan) {
      console.error("Invalid plan ID:", planId);
      return NextResponse.json({ error: "Invalid plan ID" }, { status: 400 });
    }
    // For paid plans, create checkout session using DodoService
    const dodoService = new DodoService();

    const result = await dodoService.createSubscriptionPayment({
      userId: user.id,
      planId,
      customerEmail: profile.email,
      customerName: profile.full_name || profile.email.split("@")[0], // Use email prefix as fallback
      isYearly,
    });

    if (!result.success) {
      console.error("DodoService failed:", result.error);
      return NextResponse.json(
        { error: result.error || "Failed to create checkout session" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: result.checkoutUrl,
    });
  } catch (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}
