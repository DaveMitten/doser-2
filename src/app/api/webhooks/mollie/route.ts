import { NextRequest, NextResponse } from "next/server";
import { getMollieService } from "@/lib/mollie-service";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawBody = JSON.stringify(body);

    // Verify webhook signature
    const signature = request.headers.get("mollie-signature");
    if (!signature) {
      console.error("Missing Mollie signature");
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // Verify the signature using the webhook secret
    // if running locally, use the local secret
    // if running in production, use the production secret
    const webhookSecret =
      process.env.NODE_ENV === "production"
        ? process.env.MOLLIE_WEBHOOK_SECRET_PROD
        : process.env.MOLLIE_WEBHOOK_SECRET_LOCAL;
    //
    if (!webhookSecret) {
      console.error("Missing MOLLIE_WEBHOOK_SECRET environment variable");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    // Create expected signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    // Compare signatures
    if (signature !== expectedSignature) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Get Mollie service
    const mollieService = getMollieService();

    // Handle the webhook event
    await mollieService.handleWebhook(body);

    // Log the webhook for debugging
    console.log("Mollie webhook processed:", {
      type: body.type,
      id: body.data?.id,
      status: body.data?.status,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing Mollie webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// Handle GET requests for webhook verification
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "Mollie webhook endpoint is active",
    timestamp: new Date().toISOString(),
  });
}
