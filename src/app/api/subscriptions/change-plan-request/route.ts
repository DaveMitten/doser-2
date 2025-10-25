import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { Resend } from "resend";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import * as Sentry from "@sentry/nextjs";
import { logError, logInfo } from "@/lib/error-logger";

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Check if Resend API key is configured
if (!process.env.RESEND_API_KEY) {
  console.error("RESEND_API_KEY is not configured");
  Sentry.captureMessage("RESEND_API_KEY is not configured", {
    level: "error",
    tags: {
      component: "change-plan-request",
      issue: "missing-config",
    },
  });
}

// Initialize rate limiter (3 requests per hour per user)
const ratelimit = process.env.UPSTASH_REDIS_REST_URL
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter:
        process.env.NODE_ENV === "development"
          ? Ratelimit.slidingWindow(3, "1 h")
          : Ratelimit.slidingWindow(100, "1 h"),
      analytics: true,
    })
  : null;

export async function POST(request: NextRequest) {
  let userId: string | undefined;
  try {
    // Authenticate user
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      logError(
        new Error(`Authentication failed: ${authError?.message || "No user"}`),
        {
          errorType: "subscription",
          eventType: "change-plan-request-auth-failed",
          metadata: {
            authError: authError?.message,
          },
        }
      );
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    userId = user.id;

    // Set user context for Sentry
    Sentry.setUser({
      id: user.id,
      email: user.email || undefined,
    });

    // Rate limiting (if Redis is configured)
    if (ratelimit) {
      const identifier = user.id;
      const { success, limit, reset, remaining } = await ratelimit.limit(
        identifier
      );

      if (!success) {
        logInfo("Rate limit exceeded for user", {
          userId: user.id,
          limit,
          reset,
          remaining,
          eventType: "change-plan-request-rate-limited",
        });

        Sentry.captureMessage("Change plan request rate limited", {
          level: "info",
          user: { id: user.id },
          tags: {
            component: "change-plan-request",
            issue: "rate-limit",
          },
        });

        return NextResponse.json(
          {
            error: `Rate limit exceeded. You can make ${limit} requests per hour. Try again in ${Math.ceil(
              (reset - Date.now()) / 1000 / 60
            )} minutes.`,
          },
          {
            status: 429,
            headers: {
              "X-RateLimit-Limit": limit.toString(),
              "X-RateLimit-Remaining": remaining.toString(),
              "X-RateLimit-Reset": reset.toString(),
            },
          }
        );
      }
    }

    // Parse request body
    const body = await request.json();
    const { name, email, message, currentPlan, targetPlan } = body;

    // Validate required fields
    if (!name || !email || !message || !currentPlan || !targetPlan) {
      const missingFields = [];
      if (!name) missingFields.push("name");
      if (!email) missingFields.push("email");
      if (!message) missingFields.push("message");
      if (!currentPlan) missingFields.push("currentPlan");
      if (!targetPlan) missingFields.push("targetPlan");

      logError(
        new Error(`Missing required fields: ${missingFields.join(", ")}`),
        {
          errorType: "subscription",
          eventType: "change-plan-request-validation-failed",
          userId: user.id,
          metadata: {
            missingFields,
            hasName: !!name,
            hasEmail: !!email,
            hasMessage: !!message,
            hasCurrentPlan: !!currentPlan,
            hasTargetPlan: !!targetPlan,
          },
        }
      );

      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      logError(new Error(`Invalid email format: ${email}`), {
        errorType: "subscription",
        eventType: "change-plan-request-invalid-email",
        userId: user.id,
        metadata: {
          email,
        },
      });

      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Send email to support
    try {
      // Log email send attempt
      logInfo("Attempting to send change plan email", {
        userId: user.id,
        currentPlan,
        targetPlan,
        requestEmail: email,
        hasResendKey: !!process.env.RESEND_API_KEY,
      });

      Sentry.addBreadcrumb({
        category: "email",
        message: "Attempting to send change plan email",
        level: "info",
        data: {
          userId: user.id,
          currentPlan,
          targetPlan,
          requestEmail: email,
        },
      });

      const emailResponse = await resend.emails.send({
        from: "Doser Support <support@doserapp.com>",
        to: "support@doserapp.com",
        subject: `Plan Change Request: ${currentPlan} → ${targetPlan}`,
        html: `
          <h2>Plan Change Request</h2>
          <p>A user has requested to change their subscription plan.</p>
          
          <h3>User Details:</h3>
          <ul>
            <li><strong>Name:</strong> ${name}</li>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>User ID:</strong> ${user.id}</li>
            <li><strong>Account Email:</strong> ${user.email}</li>
          </ul>
          
          <h3>Plan Change:</h3>
          <ul>
            <li><strong>Current Plan:</strong> ${currentPlan}</li>
            <li><strong>Target Plan:</strong> ${targetPlan}</li>
          </ul>
          
          <h3>Message:</h3>
          <p>${message.replace(/\n/g, "<br>")}</p>
          
          <hr>
          <p><em>Submitted at: ${new Date().toISOString()}</em></p>
        `,
        text: `
Plan Change Request

User Details:
- Name: ${name}
- Email: ${email}
- User ID: ${user.id}
- Account Email: ${user.email}

Plan Change:
- Current Plan: ${currentPlan}
- Target Plan: ${targetPlan}

Message:
${message}

---
Submitted at: ${new Date().toISOString()}
        `,
      });

      // Log successful email send
      logInfo("Change plan email sent successfully", {
        userId: user.id,
        currentPlan,
        targetPlan,
        emailId: emailResponse.data?.id,
        emailResponse: JSON.stringify(emailResponse),
      });

      Sentry.addBreadcrumb({
        category: "email",
        message: "Change plan email sent successfully",
        level: "info",
        data: {
          userId: user.id,
          emailId: emailResponse.data?.id,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Your plan change request has been submitted successfully.",
      });
    } catch (emailError) {
      console.error("Error sending email:", emailError);

      // Extract error details
      const errorMessage =
        emailError instanceof Error ? emailError.message : "Unknown error";
      const errorStack =
        emailError instanceof Error ? emailError.stack : undefined;

      // Log detailed error information
      logError(
        emailError instanceof Error
          ? emailError
          : new Error(`Email send failed: ${JSON.stringify(emailError)}`),
        {
          errorType: "subscription",
          eventType: "change-plan-request-email-failed",
          userId: user.id,
          metadata: {
            currentPlan,
            targetPlan,
            requestEmail: email,
            requestName: name,
            errorMessage,
            errorStack,
            hasResendKey: !!process.env.RESEND_API_KEY,
            resendKeyLength: process.env.RESEND_API_KEY?.length || 0,
          },
        }
      );

      Sentry.captureException(emailError, {
        tags: {
          component: "change-plan-request",
          issue: "email-send-failed",
        },
        contexts: {
          email: {
            from: "support@doserapp.com",
            to: "support@doserapp.com",
            currentPlan,
            targetPlan,
          },
        },
      });

      return NextResponse.json(
        {
          error:
            "Failed to send request. Please try again or contact us directly at support@doserapp.com.",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error processing plan change request:", error);

    // Log unexpected error
    logError(
      error instanceof Error
        ? error
        : new Error(
            `Unexpected error in change plan request: ${JSON.stringify(error)}`
          ),
      {
        errorType: "subscription",
        eventType: "change-plan-request-unexpected-error",
        userId: userId,
        metadata: {
          errorMessage:
            error instanceof Error ? error.message : "Unknown error",
          errorStack: error instanceof Error ? error.stack : undefined,
        },
      }
    );

    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    );
  }
}
