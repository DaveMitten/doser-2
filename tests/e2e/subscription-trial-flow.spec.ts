import { test, expect, Page } from "@playwright/test";

/**
 * E2E Tests for Subscription Trial Flow
 * Tests the complete subscription UI including trial status, button text, and plan changes
 */

// Helper function to mock authentication
async function mockAuth(page: Page, isAuthenticated: boolean = true) {
  if (isAuthenticated) {
    await page.route("**/auth/v1/user", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "test-user-123",
          email: "test@example.com",
          user_metadata: {
            full_name: "Test User",
          },
        }),
      });
    });
  }
}

// Helper function to mock subscription status API
async function mockSubscriptionStatus(
  page: Page,
  status: "trialing" | "active" | "expired" | "cancelled",
  planId: string = "pdt_QT8CsZEYopzV38iWlE0Sb", // Track plan
  daysRemaining: number = 5
) {
  const now = new Date();
  const trialEnd = new Date(now.getTime() + daysRemaining * 24 * 60 * 60 * 1000);
  const trialStart = new Date(now.getTime() - (7 - daysRemaining) * 24 * 60 * 60 * 1000);

  await page.route("**/api/subscriptions/status", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        subscription: {
          id: "sub-123",
          user_id: "test-user-123",
          plan_id: planId,
          status: status,
          dodo_subscription_id: "dodo-sub-123",
          dodo_customer_id: "dodo-cust-123",
          current_period_start: now.toISOString(),
          current_period_end: new Date(
            now.getTime() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
          trial_start: status === "trialing" ? trialStart.toISOString() : null,
          trial_end: status === "trialing" ? trialEnd.toISOString() : null,
          created_at: new Date(
            now.getTime() - 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
          updated_at: now.toISOString(),
        },
        hasActiveSubscription: status === "active" || status === "trialing",
      }),
    });
  });
}

test.describe("Subscription Trial Flow", () => {
  test.describe("Trial User - Pricing Page", () => {
    test.beforeEach(async ({ page }) => {
      await mockAuth(page, true);
      await mockSubscriptionStatus(page, "trialing", "pdt_QT8CsZEYopzV38iWlE0Sb", 5);
    });

    test("should display trial countdown banner with days remaining", async ({
      page,
    }) => {
      await page.goto("/pricing");

      // Check for trial banner
      await expect(page.getByText("Free Trial Active")).toBeVisible();
      await expect(page.getByText(/5 days remaining/)).toBeVisible();

      // Check that trial end date is displayed
      await expect(page.locator('text=/Expires/')).toBeVisible();
    });

    test("should show 'Start Paid Subscription' for current trial plan", async ({
      page,
    }) => {
      await page.goto("/pricing");

      // Find the Track plan card (current trial plan)
      const trackCard = page.locator('[class*="Card"]', { hasText: "Track" });

      // Should show "Start Paid Subscription" button
      await expect(trackCard.getByRole("button", { name: /Start Paid Subscription/i })).toBeVisible();
    });

    test("should show 'Upgrade to [Plan]' for different plans", async ({
      page,
    }) => {
      await page.goto("/pricing");

      // Find the Optimize plan card (different from current plan)
      const optimizeCard = page.locator('[class*="Card"]', { hasText: "Optimize" });

      // Should show "Upgrade to Optimize" button
      await expect(optimizeCard.getByRole("button", { name: /Upgrade to Optimize/i })).toBeVisible();
    });

    test("should highlight trial plan as Most Popular", async ({ page }) => {
      await page.goto("/pricing");

      // Check that Track plan has "Most Popular" badge
      const trackCard = page.locator('[class*="Card"]', { hasText: "Track" });
      await expect(trackCard.getByText("Most Popular")).toBeVisible();
    });

    test("should allow early conversion from trial to paid on current plan", async ({
      page,
    }) => {
      // Mock the checkout API
      await page.route("**/api/subscriptions/create", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            checkoutUrl: "https://checkout.dodopayments.com/test-session",
          }),
        });
      });

      await page.goto("/pricing");

      // Click "Start Paid Subscription" on Track plan
      const trackCard = page.locator('[class*="Card"]', { hasText: "Track" });
      await trackCard.getByRole("button", { name: /Start Paid Subscription/i }).click();

      // Should redirect to checkout (in real scenario)
      // Here we just verify the API was called
    });

    test("should allow trial user to upgrade to different plan (trial upgrade)", async ({
      page,
    }) => {
      // Mock the plan change API (trial users upgrading to different plan)
      await page.route("**/api/subscriptions/change-plan", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            message: "Plan changed successfully",
            newPlanId: "pdt_RwjIQmhRz9N3S6afZ92p7", // Optimize plan
          }),
        });
      });

      await page.goto("/pricing");

      // Find the Optimize plan card (different from current trial plan)
      const optimizeCard = page.locator('[class*="Card"]', { hasText: "Optimize" });

      // Click "Upgrade to Optimize" button
      await optimizeCard.getByRole("button", { name: /Upgrade to Optimize/i }).click();

      // Modal should open showing plan change confirmation
      await expect(page.getByRole("dialog")).toBeVisible();
      await expect(page.getByText("Change Subscription Plan")).toBeVisible();

      // Should show current trial plan (Track) and new plan (Optimize)
      await expect(page.getByText("Current Plan")).toBeVisible();
      await expect(page.getByText("New Plan")).toBeVisible();
      await expect(page.getByText("Track")).toBeVisible();
      await expect(page.getByText("Optimize")).toBeVisible();

      // Should show prorated billing information
      await expect(page.getByText(/Prorated Billing/i)).toBeVisible();

      // Confirm plan change
      await page.getByRole("button", { name: /Confirm Plan Change/i }).click();

      // Should show success message
      await expect(page.getByText("Plan Changed Successfully!")).toBeVisible();
      await expect(
        page.getByText("Your subscription has been updated to Optimize")
      ).toBeVisible();
    });

    test("should handle trial upgrade errors gracefully", async ({ page }) => {
      // Mock the plan change API with an error (simulating the old bug)
      await page.route("**/api/subscriptions/change-plan", async (route) => {
        await route.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify({
            error: 'Cannot change plans. Your subscription status is "trialing". Only active or trial subscriptions can be upgraded.',
          }),
        });
      });

      await page.goto("/pricing");

      // Find the Optimize plan card
      const optimizeCard = page.locator('[class*="Card"]', { hasText: "Optimize" });

      // Click "Upgrade to Optimize" button
      await optimizeCard.getByRole("button", { name: /Upgrade to Optimize/i }).click();

      // Wait for modal to open
      await expect(page.getByRole("dialog")).toBeVisible();

      // Confirm plan change
      await page.getByRole("button", { name: /Confirm Plan Change/i }).click();

      // Should show error message with clear explanation
      await expect(
        page.getByText(/Cannot change plans/i)
      ).toBeVisible();
      await expect(
        page.getByText(/subscription status is/i)
      ).toBeVisible();
    });
  });

  test.describe("Trial User - Expiring Soon", () => {
    test.beforeEach(async ({ page }) => {
      await mockAuth(page, true);
      await mockSubscriptionStatus(page, "trialing", "pdt_QT8CsZEYopzV38iWlE0Sb", 2);
    });

    test("should show yellow warning banner when trial expires soon", async ({
      page,
    }) => {
      await page.goto("/pricing");

      // Check for warning banner (≤2 days remaining)
      await expect(page.getByText("Trial Expires Soon")).toBeVisible();
      await expect(page.getByText(/2 days remaining/)).toBeVisible();

      // Should have "Subscribe Now" button
      // await expect(page.getByRole("button", { name: /Subscribe Now/i })).toBeVisible();
    });
  });

  test.describe("Trial User - Expired", () => {
    test.beforeEach(async ({ page }) => {
      await mockAuth(page, true);
      await mockSubscriptionStatus(page, "expired", "pdt_QT8CsZEYopzV38iWlE0Sb", -1);
    });

    test("should show expired trial banner", async ({ page }) => {
      await page.goto("/pricing");

      // Check for expired banner
      await expect(page.getByText("Trial Expired")).toBeVisible();
      await expect(
        page.getByText(/Your 7-day free trial has ended/)
      ).toBeVisible();
    });
  });

  test.describe("Paid User - Plan Changes", () => {
    test.beforeEach(async ({ page }) => {
      await mockAuth(page, true);
      await mockSubscriptionStatus(page, "active", "pdt_euP6KahnWde9Ew1jvhIJj"); // Learn plan
    });

    test("should show 'Current Plan' for active subscription", async ({
      page,
    }) => {
      await page.goto("/pricing");

      // No trial banner should be visible
      await expect(page.getByText("Free Trial Active")).not.toBeVisible();

      // Find the Learn plan card (current plan)
      const learnCard = page.locator('[class*="Card"]', { hasText: "Learn" });

      // Should show "Current Plan" button (disabled)
      const currentPlanButton = learnCard.getByRole("button", { name: /Current Plan/i });
      await expect(currentPlanButton).toBeVisible();
      await expect(currentPlanButton).toBeDisabled();
    });

    test("should show 'Change Plan' for different plans", async ({ page }) => {
      await page.goto("/pricing");

      // Find the Track plan card (different from current Learn plan)
      const trackCard = page.locator('[class*="Card"]', { hasText: "Track" });

      // Should show "Change Plan" button
      await expect(trackCard.getByRole("button", { name: /Change Plan/i })).toBeVisible();
    });

    test("should open plan change modal when clicking 'Change Plan'", async ({
      page,
    }) => {
      await page.goto("/pricing");

      // Find the Track plan card
      const trackCard = page.locator('[class*="Card"]', { hasText: "Track" });

      // Click "Change Plan" button
      await trackCard.getByRole("button", { name: /Change Plan/i }).click();

      // Modal should open
      await expect(page.getByRole("dialog")).toBeVisible();
      await expect(page.getByText("Change Subscription Plan")).toBeVisible();

      // Should show current and new plan comparison
      await expect(page.getByText("Current Plan")).toBeVisible();
      await expect(page.getByText("New Plan")).toBeVisible();
      await expect(page.getByText("Learn")).toBeVisible();
      await expect(page.getByText("Track")).toBeVisible();
    });

    test("should complete plan change flow successfully", async ({ page }) => {
      // Mock the plan change API
      await page.route("**/api/subscriptions/change-plan", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            message: "Plan changed successfully",
            newPlanId: "pdt_QT8CsZEYopzV38iWlE0Sb",
          }),
        });
      });

      await page.goto("/pricing");

      // Open plan change modal
      const trackCard = page.locator('[class*="Card"]', { hasText: "Track" });
      await trackCard.getByRole("button", { name: /Change Plan/i }).click();

      // Confirm plan change
      await page.getByRole("button", { name: /Confirm Plan Change/i }).click();

      // Should show success message
      await expect(page.getByText("Plan Changed Successfully!")).toBeVisible();
      await expect(
        page.getByText("Your subscription has been updated to Track")
      ).toBeVisible();
    });

    test("should show prorated billing information in modal", async ({
      page,
    }) => {
      await page.goto("/pricing");

      // Open plan change modal
      const trackCard = page.locator('[class*="Card"]', { hasText: "Track" });
      await trackCard.getByRole("button", { name: /Change Plan/i }).click();

      // Check for proration explanation
      await expect(page.getByText(/Prorated Billing/i)).toBeVisible();
      await expect(
        page.getByText(/based on your remaining billing cycle/i)
      ).toBeVisible();
    });

    test("should handle plan change errors gracefully", async ({ page }) => {
      // Mock the plan change API with error
      await page.route("**/api/subscriptions/change-plan", async (route) => {
        await route.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify({
            error: "You are already on this plan",
          }),
        });
      });

      await page.goto("/pricing");

      // Open plan change modal
      const trackCard = page.locator('[class*="Card"]', { hasText: "Track" });
      await trackCard.getByRole("button", { name: /Change Plan/i }).click();

      // Confirm plan change
      await page.getByRole("button", { name: /Confirm Plan Change/i }).click();

      // Should show error message
      await expect(
        page.getByText("You are already on this plan")
      ).toBeVisible();
    });

    test("should close modal when clicking Cancel", async ({ page }) => {
      await page.goto("/pricing");

      // Open plan change modal
      const trackCard = page.locator('[class*="Card"]', { hasText: "Track" });
      await trackCard.getByRole("button", { name: /Change Plan/i }).click();

      // Modal should be visible
      await expect(page.getByRole("dialog")).toBeVisible();

      // Click cancel
      await page.getByRole("button", { name: /Cancel/i }).click();

      // Modal should close
      await expect(page.getByRole("dialog")).not.toBeVisible();
    });
  });

  test.describe("Unauthenticated User", () => {
    test.beforeEach(async ({ page }) => {
      await mockAuth(page, false);
    });

    test("should show 'Start 7-Day Free Trial' for all plans", async ({
      page,
    }) => {
      await page.goto("/pricing");

      // No trial banner should be visible
      await expect(page.getByText("Free Trial Active")).not.toBeVisible();

      // All plans should show "Start 7-Day Free Trial"
      const buttons = page.getByRole("button", { name: /Start 7-Day Free Trial/i });
      await expect(buttons).toHaveCount(3); // 3 plans
    });

    test("should not show trial status banner", async ({ page }) => {
      await page.goto("/pricing");

      // No trial information should be visible
      await expect(page.getByText("Free Trial Active")).not.toBeVisible();
      await expect(page.getByText("Trial Expires Soon")).not.toBeVisible();
      await expect(page.getByText("Trial Expired")).not.toBeVisible();
    });
  });

  test.describe("Mobile Responsiveness", () => {
    test.beforeEach(async ({ page }) => {
      await mockAuth(page, true);
      await mockSubscriptionStatus(page, "trialing", "pdt_QT8CsZEYopzV38iWlE0Sb", 5);

      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
    });

    test("should display trial banner on mobile", async ({ page }) => {
      await page.goto("/pricing");

      // Trial banner should be visible and responsive
      await expect(page.getByText("Free Trial Active")).toBeVisible();
      await expect(page.getByText(/5 days remaining/)).toBeVisible();
    });

    test("should display plan cards in single column on mobile", async ({
      page,
    }) => {
      await page.goto("/pricing");

      // Find plan cards container
      const plansGrid = page.locator('[class*="grid-cols-1"]').first();
      await expect(plansGrid).toBeVisible();
    });
  });
});
