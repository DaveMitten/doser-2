import { NextRequest, NextResponse } from "next/server";
import { getGoCardlessService } from "@/lib/gocardless-service";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    const body = JSON.parse(rawBody);

    // Verify webhook signature
    // GoCardless sends signature in webhook-signature header
    const signature = request.headers.get("webhook-signature");

    if (!signature) {
      console.error(
        "Missing GoCardless signature. Available headers:",
        Object.fromEntries(request.headers.entries())
      );
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // Get webhook secret
    const webhookSecret = process.env.GOCARDLESS_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("Missing GOCARDLESS_WEBHOOK_SECRET environment variable");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    // GoCardless signature verification
    // GoCardless sends signature in format: "sha256=<hash>"
    const expectedSignature = `sha256=${crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex")}`;

    // Compare signatures using timing-safe comparison
    const signatureMatches = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );

    if (!signatureMatches) {
      console.error("Invalid webhook signature", {
        received: signature,
        expected: expectedSignature,
        rawBodyLength: rawBody.length,
        webhookSecretLength: webhookSecret.length,
      });
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Log successful signature verification
    console.log("✅ Webhook signature verified successfully");

    // Get GoCardless service
    const gocardlessService = getGoCardlessService();

    // Handle the webhook event
    await gocardlessService.handleWebhook(body);

    // Log the webhook for debugging
    console.log("GoCardless webhook processed:", {
      type: body.type,
      action: body.action,
      id: body.resource?.id,
      status: body.resource?.status,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing GoCardless webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// Handle GET requests for webhook verification
export async function GET() {
  return NextResponse.json({
    message: "GoCardless webhook endpoint is active",
    timestamp: new Date().toISOString(),
  });
}
