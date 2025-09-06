import { NextRequest, NextResponse } from "next/server";
import { getMollieService } from "@/lib/mollie-service";

import { CreateSubscriptionRequest } from "@/lib/mollie-types";
import { createSupabaseServerClient } from "../../../../lib/supabase-server";

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
    const { planId, trialDays } = body;

    // Validate plan ID
    if (!planId || !["starter", "pro", "expert"].includes(planId)) {
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

    // Create subscription request
    const subscriptionRequest: CreateSubscriptionRequest = {
      userId: user.id,
      planId,
      customerEmail: profile.email,
      customerName: profile.full_name,
      trialDays,
    };

    // Create subscription using Mollie service
    const mollieService = getMollieService();
    const result = await mollieService.createSubscriptionPayment(
      subscriptionRequest
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}
