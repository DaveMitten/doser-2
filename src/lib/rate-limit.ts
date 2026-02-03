import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import * as Sentry from "@sentry/nextjs";

const { logger } = Sentry;

// Create Redis client for rate limiting
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Create a rate limiter that allows 5 verification attempts per 10 minutes per IP
export const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10 m"), // 5 attempts per 10 minutes
  analytics: true, // Enable analytics for monitoring
  prefix: "auth_verification", // Prefix for Redis keys
});

export interface RateLimitResult {
  success: boolean;
  limit: number;
  reset: number;
  remaining: number;
}

/**
 * Check if an IP address has exceeded the rate limit for email verification
 * @param identifier - Usually the IP address
 * @returns RateLimitResult with success status and remaining attempts
 */
export async function checkRateLimit(
  identifier: string
): Promise<RateLimitResult> {
  try {
    // Add timeout to prevent hanging requests
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Rate limit check timeout")), 2000); // 2 second timeout
    });

    const limitPromise = rateLimiter.limit(identifier);

    const { success, limit, reset, remaining } = await Promise.race([
      limitPromise,
      timeoutPromise,
    ]);

    return {
      success,
      limit,
      reset,
      remaining,
    };
  } catch (error) {
    logger.error("Rate limiting error - failing open", { error });
    // If rate limiting fails, allow the request (fail open for better UX)
    return {
      success: true,
      limit: 5,
      reset: Date.now() + 600000, // 10 minutes from now
      remaining: 5,
    };
  }
}

/**
 * Get the remaining time until rate limit resets
 * @param reset - Unix timestamp when rate limit resets
 * @returns Formatted string showing time remaining
 */
export function getTimeUntilReset(reset: number): string {
  const now = Date.now();
  const timeLeft = Math.max(0, reset - now);
  const minutes = Math.ceil(timeLeft / 60000);

  if (minutes <= 1) {
    return "less than a minute";
  }

  return `${minutes} minutes`;
}
