import { NextRequest, NextResponse } from "next/server";
import { getGoCardlessService } from "@/lib/gocardless-service";
import { CreateSubscriptionRequest } from "@/lib/gocardless-types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planId, trialDays, customerEmail, customerName } = body;

    // Validate plan ID
    if (!planId || !["learn", "track", "optimize"].includes(planId)) {
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

    // Create subscription using GoCardless service
    console.log("Creating GoCardless service...");
    const gocardlessService = getGoCardlessService();
    console.log(
      "GoCardless service created, calling createSubscriptionPayment..."
    );

    const result = await gocardlessService.createSubscriptionPayment(
      subscriptionRequest
    );

    console.log("GoCardless result:", result);

    if (!result.success) {
      console.error("GoCardless subscription creation failed:", result.error);
      return NextResponse.json(
        {
          error: result.error,
          details: "GoCardless subscription creation failed",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error creating test subscription:", error);
    return NextResponse.json(
      {
        error: "Failed to create test subscription",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
