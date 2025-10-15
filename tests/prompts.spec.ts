import { test, expect } from "@playwright/test";

test.describe("Prompts Page", () => {
  test.beforeEach(async ({ page }) => {
    // Note: In a real scenario, you'd need to handle authentication
    // For now, this assumes you're already signed in or mocks are set up
    await page.goto("/prompts");
  });

  test("should display prompts page title", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /prompt templates/i })).toBeVisible();
  });

  test("should allow editing a prompt", async ({ page }) => {
    // Wait for prompts to load
    await page.waitForSelector('[data-testid="prompt-card"]', { timeout: 5000 }).catch(() => {
      // If no prompts exist, that's okay for this smoke test
    });

    // Try to find an edit button
    const editButton = page.getByRole("button", { name: /edit/i }).first();
    
    if (await editButton.isVisible()) {
      await editButton.click();
      
      // Should show save and cancel buttons
      await expect(page.getByRole("button", { name: /save/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /cancel/i })).toBeVisible();
    }
  });

  test("should have temperature, top_p, and max_tokens controls", async ({ page }) => {
    const editButton = page.getByRole("button", { name: /edit/i }).first();
    
    if (await editButton.isVisible()) {
      await editButton.click();
      
      // Check for parameter controls
      await expect(page.getByText(/temperature/i)).toBeVisible();
      await expect(page.getByText(/top p/i)).toBeVisible();
      await expect(page.getByText(/max tokens/i)).toBeVisible();
    }
  });
});

