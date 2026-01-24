import { Webhooks } from "@dodopayments/nextjs";
import { DodoService } from "@/lib/dodo-service";
import * as Sentry from "@sentry/nextjs";
import { logError } from "@/lib/error-logger";

const { logger } = Sentry;

const dodoService = new DodoService();

export const POST = Webhooks({
  webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY!,
  onPayload: async (payload) => {
    return Sentry.startSpan(
      {
        op: "webhook.process",
        name: "Dodo Webhook - onPayload",
      },
      async (span) => {
        logger.info("Webhook onPayload received", { payload });

        // Extract webhook type and add to span
        const webhookType =
          payload && typeof payload === "object" && "type" in payload
            ? String(payload.type)
            : "unknown";
        span.setAttribute("webhook.type", webhookType);

        // Extract subscription_id if present in data
        if (
          payload &&
          typeof payload === "object" &&
          "data" in payload &&
          payload.data &&
          typeof payload.data === "object" &&
          "subscription_id" in payload.data
        ) {
          span.setAttribute(
            "subscription_id",
            String(payload.data.subscription_id)
          );

          // Set Sentry context for subscription events
          Sentry.setContext("webhook", {
            event: webhookType,
            subscriptionId: String(payload.data.subscription_id),
          });
        }

        // Extract payment_id if present in data
        if (
          payload &&
          typeof payload === "object" &&
          "data" in payload &&
          payload.data &&
          typeof payload.data === "object" &&
          "payment_id" in payload.data
        ) {
          span.setAttribute("payment_id", String(payload.data.payment_id));
        }

        try {
          await dodoService.handleWebhookEvent(payload);
          span.setAttribute("status", "success");
          logger.info("Webhook processed successfully", { webhookType });
        } catch (error) {
          span.setAttribute("status", "error");
          logger.error("Webhook processing failed", { error, webhookType });

          logError(error instanceof Error ? error : new Error(String(error)), {
            errorType: "webhook",
            eventType: webhookType,
            metadata: { payload },
          });

          // Throw error so Dodo Payments receives 500 and retries
          throw error;
        }
      }
    );
  },
});
