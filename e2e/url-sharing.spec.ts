import { test, expect } from "@playwright/test";

test("should save and load from URL", async ({ page }) => {
  await page.goto("/");

  // Enter content
  await page.locator("textarea").first().fill("Hello, World!");
  await page.waitForTimeout(300); // Wait for auto-detection

  // Open mobile menu if needed

  // Get shareable URL - Share button should be visible
  const shareBtn = page.getByRole("button", { name: /Share/i });
  await expect(shareBtn).toBeVisible({ timeout: 10000 });
  await shareBtn.click();

  // Wait for URL to update (URL state hook needs time to save)
  await page.waitForTimeout(1200);
  const url = page.url();
  expect(url).toContain("#");

  // Reload page
  await page.goto(url);

  // Verify content restored
  const input = page.locator("textarea").first();
  await expect(input).toHaveValue("Hello, World!", { timeout: 10000 });
});
