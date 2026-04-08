import { test, expect } from "@playwright/test";

test.describe("Todo List", () => {
  test("should create, complete, and delete todos", async ({ page }) => {
    await page.goto("/");

    // Switch to Todo tool
    const menuBtn = page.getByRole("button", { name: "Open menu" });
    if (await menuBtn.isVisible()) {
      await menuBtn.click();
      await page.waitForTimeout(300); // Wait for menu to open
    }

    const todoLink = page.getByRole("button", { name: /Todo/i });
    await expect(todoLink).toBeVisible({ timeout: 5000 });
    await todoLink.click();

    // Close mobile menu after clicking
    const closeMenuBtn = page.getByRole("button", { name: "Close menu" });
    if (await closeMenuBtn.isVisible()) {
      await closeMenuBtn.click();
      await page.waitForTimeout(300);
    }

    // Add todo
    const input = page.locator('input[placeholder*="Add"]');
    await expect(input).toBeVisible();
    await input.fill("Buy groceries");
    await input.press("Enter");

    // Verify added
    await expect(page.getByText("Buy groceries")).toBeVisible();

    // Complete todo - click the circle button
    // Get the parent div of the todo text which contains both buttons
    const todoRow = page.locator("div").filter({ hasText: /^Buy groceries$/ });
    const completeBtn = todoRow.locator("button").first(); // Circle button with Check icon
    await completeBtn.click();

    // Wait a bit for the state to update
    await page.waitForTimeout(200);

    // Check for line-through styling
    const todoText = page.getByText("Buy groceries");
    await expect(todoText).toHaveClass(/line-through/);

    // Delete todo - click the trash icon (last button in the todo row)
    const todoRowAgain = page
      .locator("div")
      .filter({ hasText: /Buy groceries/ });
    const deleteBtn = todoRowAgain.locator("button").last(); // Trash icon button
    await deleteBtn.click({ force: true }); // Force click since it appears on hover

    // Todo should be removed
    await expect(page.getByText("Buy groceries")).not.toBeVisible();
  });
});
