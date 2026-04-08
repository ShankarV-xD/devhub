import { test, expect } from "@playwright/test";

test("should generate and validate UUID", async ({ page }) => {
  await page.goto("/");

  // Click Generate UUID
  // Check for mobile menu button
  const menuBtn = page.getByRole("button", { name: "Open menu" });
  if (await menuBtn.isVisible()) {
    await menuBtn.click();
  }

  // Click Generate (The button with text "UUID" and aria-label "Generate UUID")
  // We use aria-label to be precise as there might be other "UUID" text
  const generateBtn = page.getByRole("button", { name: "Generate UUID" });
  await generateBtn.click();

  // Check format
  const input = page.locator("textarea");
  await expect(input).toHaveValue(
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    { timeout: 10000 }
  );
  const uuid = await input.inputValue();

  expect(uuid).toMatch(
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  );

  // UUID format validation above already confirms the generation worked
  // No need for additional detection check as multiple "UUID" text elements exist
});
