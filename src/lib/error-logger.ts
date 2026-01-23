import * as Sentry from "@sentry/nextjs";

const { logger } = Sentry;

interface ErrorContext {
  userId?: string;
  subscriptionId?: string;
  dodoSubscriptionId?: string;
  eventType?: string;
  errorType: "webhook" | "payment" | "subscription" | "database" | "email";
  metadata?: Record<string, unknown>;
}

export function logError(error: Error, context: ErrorContext) {
  // Use Sentry's structured logger
  logger.error(logger.fmt`[${context.errorType}] ${error.message}`, {
    error: error.message,
    stack: error.stack,
    userId: context.userId,
    subscriptionId: context.subscriptionId,
    dodoSubscriptionId: context.dodoSubscriptionId,
    eventType: context.eventType,
    errorType: context.errorType,
    ...context.metadata,
  });

  // Set Sentry user context
  if (context.userId) {
    Sentry.setUser({ id: context.userId });
  }

  // Set additional context
  Sentry.setContext("error_details", {
    errorType: context.errorType,
    subscriptionId: context.subscriptionId,
    dodoSubscriptionId: context.dodoSubscriptionId,
    eventType: context.eventType,
  });

  if (context.metadata) {
    Sentry.setContext("metadata", context.metadata);
  }

  // Capture exception in Sentry
  Sentry.captureException(error, {
    level: context.errorType === "database" ? "error" : "warning",
    tags: {
      errorType: context.errorType,
      eventType: context.eventType,
    },
  });
}

export function logWarning(message: string, context: Record<string, unknown>) {
  logger.warn(message, context);

  // Also send to Sentry for visibility
  Sentry.captureMessage(message, {
    level: "warning",
    contexts: {
      warning_context: context,
    },
  });
}

export function logInfo(message: string, context: Record<string, unknown>) {
  logger.info(message, context);

  // Log to console for debugging context
  console.log(message, context);
}
