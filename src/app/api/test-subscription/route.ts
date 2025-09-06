import { NextRequest, NextResponse } from "next/server";
import { getMollieService } from "@/lib/mollie-service";
import { CreateSubscriptionRequest } from "@/lib/mollie-types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planId, trialDays, customerEmail, customerName } = body;

    // Validate plan ID
    if (!planId || !["starter", "pro", "expert"].includes(planId)) {
      return NextResponse.json({ error: "Invalid plan ID" }, { status: 400 });
    }

    // Validate required fields
    if (!customerEmail) {
      return NextResponse.json(
        { error: "Customer email is required" },
        { status: 400 }
      );
    }

    // Create subscription request with test data
    const subscriptionRequest: CreateSubscriptionRequest = {
      userId: "test-user-id", // Using a test user ID
      planId,
      customerEmail,
      customerName: customerName || "Test User",
      trialDays: trialDays || 0,
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
    console.error("Error creating test subscription:", error);
    return NextResponse.json(
      { error: "Failed to create test subscription" },
      { status: 500 }
    );
  }
}
