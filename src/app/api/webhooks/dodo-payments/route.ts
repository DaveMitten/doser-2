import { Webhooks } from "@dodopayments/nextjs";
import { DodoService } from "@/lib/dodo-service";

const dodoService = new DodoService();

export const POST = Webhooks({
  webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY!,
  onPayload: async (payload) => {
    await dodoService.handleWebhookEvent(payload);
  },
  onPaymentSucceeded: async (payload) => {
    console.log("Payment succeeded:", payload);
    await dodoService.handleWebhookEvent(payload);
  },
  onPaymentFailed: async (payload) => {
    console.log("Payment failed:", payload);
    await dodoService.handleWebhookEvent(payload);
  },
  onSubscriptionActive: async (payload) => {
    console.log("Subscription activated:", payload);
    await dodoService.handleWebhookEvent(payload);
  },
  onSubscriptionCancelled: async (payload) => {
    console.log("Subscription cancelled:", payload);
    await dodoService.handleWebhookEvent(payload);
  },
  onSubscriptionFailed: async (payload) => {
    console.log("Subscription failed:", payload);
    await dodoService.handleWebhookEvent(payload);
  },
  onSubscriptionExpired: async (payload) => {
    console.log("Subscription expired:", payload);
    await dodoService.handleWebhookEvent(payload);
  },
});
