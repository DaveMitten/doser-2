import { test, expect } from "@playwright/test";

test.describe("Empty State Functionality", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page first
    await page.goto("/");
  });

  test("should show empty state on sessions page when no sessions exist", async ({
    page,
  }) => {
    // Navigate to sessions page (this will require authentication in a real app)
    // For now, we'll test the component behavior by checking if the empty state renders
    await page.goto("/sessions");

    // Check if the empty state is displayed
    await expect(page.getByText("No sessions recorded yet")).toBeVisible();
    await expect(
      page.getByText(
        "Start tracking your cannabis consumption to see your dosing patterns and effects"
      )
    ).toBeVisible();
    await expect(page.getByText("Record Your First Session")).toBeVisible();

    // Verify the button has the correct styling
    const button = page.getByRole("button", {
      name: "Record Your First Session",
    });
    await expect(button).toHaveClass(/bg-doser-primary/);
  });

  test("should show empty state on dashboard when no sessions exist", async ({
    page,
  }) => {
    // Navigate to dashboard page
    await page.goto("/dashboard");

    // Check if the empty state is displayed in the Recent Sessions section
    await expect(page.getByText("Recent Sessions")).toBeVisible();
    await expect(page.getByText("No sessions recorded yet")).toBeVisible();
    await expect(
      page.getByText(
        "Start tracking your cannabis consumption to see your dosing patterns and effects"
      )
    ).toBeVisible();
    await expect(page.getByText("Record Your First Session")).toBeVisible();
  });

  test("should not show New Session button in header when no sessions exist", async ({
    page,
  }) => {
    // Navigate to dashboard page
    await page.goto("/dashboard");

    // Wait for the page to load and show empty state
    await expect(page.getByText("No sessions recorded yet")).toBeVisible();

    // Verify that the New Session button is not in the header
    await expect(
      page.getByRole("button", { name: "+ New Session" })
    ).not.toBeVisible();
  });

  test("should open new session form when empty state button is clicked", async ({
    page,
  }) => {
    // Navigate to dashboard page
    await page.goto("/dashboard");

    // Wait for the page to load and show empty state
    await expect(page.getByText("No sessions recorded yet")).toBeVisible();

    // Click the "Record Your First Session" button
    await page
      .getByRole("button", { name: "Record Your First Session" })
      .click();

    // Verify that the new session form is opened
    // This will depend on how the form is implemented (modal, sheet, etc.)
    // For now, we'll check if some form-related text appears
    await expect(page.getByText("New Session")).toBeVisible();
  });

  test("should have proper empty state styling and layout", async ({
    page,
  }) => {
    // Navigate to sessions page
    await page.goto("/sessions");

    // Check if the empty state container has proper styling
    const emptyStateContainer = page
      .locator("text=No sessions recorded yet")
      .locator("..")
      .first();

    // Verify the container has proper spacing and centering classes
    await expect(emptyStateContainer).toHaveClass(/col-span-full/);
    await expect(emptyStateContainer).toHaveClass(/text-center/);
    await expect(emptyStateContainer).toHaveClass(/py-6/);

    // Check if the button is properly styled
    const button = page.getByRole("button", {
      name: "Record Your First Session",
    });
    await expect(button).toHaveClass(/bg-doser-primary/);
    await expect(button).toHaveClass(/hover:bg-doser-primary-hover/);
  });

  test("should display icon when provided", async ({ page }) => {
    // Navigate to sessions page
    await page.goto("/sessions");

    // Check if the icon is displayed (📊)
    await expect(page.getByText("📊")).toBeVisible();

    // Verify the icon container has proper styling
    const iconContainer = page.locator("text=📊").locator("..").first();
    await expect(iconContainer).toHaveClass(/w-16/);
    await expect(iconContainer).toHaveClass(/h-16/);
    await expect(iconContainer).toHaveClass(/bg-doser-primary\/10/);
  });
});
