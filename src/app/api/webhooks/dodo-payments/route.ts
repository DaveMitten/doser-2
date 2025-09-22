import { Webhooks } from "@dodopayments/nextjs";
import { DodoService } from "@/lib/dodo-service";

const dodoService = new DodoService();

export const POST = Webhooks({
  webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY!,
  onPayload: async (payload) => {
    await dodoService.handleWebhookEvent(payload);
  },
  onPaymentSucceeded: async (payload) => {
    await dodoService.handleWebhookEvent(payload);
  },
  onPaymentFailed: async (payload) => {
    await dodoService.handleWebhookEvent(payload);
  },
  onSubscriptionActive: async (payload) => {
    await dodoService.handleWebhookEvent(payload);
  },
  onSubscriptionCancelled: async (payload) => {
    await dodoService.handleWebhookEvent(payload);
  },
  onSubscriptionFailed: async (payload) => {
    await dodoService.handleWebhookEvent(payload);
  },
  onSubscriptionExpired: async (payload) => {
    await dodoService.handleWebhookEvent(payload);
  },
});
