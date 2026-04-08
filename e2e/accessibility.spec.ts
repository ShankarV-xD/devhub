import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Accessibility Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("homepage accessibility", async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("accessibility with JSON content", async ({ page }) => {
    // Add JSON content
    await page.fill("textarea", '{"name":"test","data":[1,2,3]}');
    await page.waitForTimeout(500);

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("accessibility with mobile menu", async ({ page }) => {
    // Test mobile menu accessibility
    await page.setViewportSize({ width: 375, height: 667 });

    const menuBtn = page.getByRole("button", { name: "Open menu" });
    if (await menuBtn.isVisible()) {
      await menuBtn.click();
      await page.waitForTimeout(300);

      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
      expect(accessibilityScanResults.violations).toEqual([]);
    }
  });

  test("keyboard navigation", async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press("Tab");

    // Check that focus is visible
    const focusedElement = await page.evaluate(() => document.activeElement);
    expect(focusedElement).toBeTruthy();

    // Continue tabbing through interactive elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("Tab");
      await page.waitForTimeout(100);
    }

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("screen reader landmarks", async ({ page }) => {
    // Check for proper ARIA landmarks
    const landmarks = await page.evaluate(() => {
      const elements = document.querySelectorAll(
        "[role], main, nav, header, footer, section, article, aside]"
      );
      return Array.from(elements).map((el) => ({
        tag: el.tagName.toLowerCase(),
        role: el.getAttribute("role"),
        ariaLabel: el.getAttribute("aria-label"),
        ariaLabelledby: el.getAttribute("aria-labelledby"),
      }));
    });

    // Should have main landmark
    const hasMain = landmarks.some(
      (l) => l.tag === "main" || l.role === "main"
    );
    expect(hasMain).toBeTruthy();

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("form accessibility", async ({ page }) => {
    // Test any form elements
    const inputs = await page.locator("input, textarea, select, button").all();

    for (let i = 0; i < Math.min(3, inputs.length); i++) {
      const input = inputs[i];
      if (await input.isVisible()) {
        const accessibilityScanResults = await new AxeBuilder({ page })
          .include(
            (await input.getAttribute("id")) ||
              "input, textarea, select, button"
          )
          .analyze();
        expect(accessibilityScanResults.violations).toEqual([]);
      }
    }
  });

  test("color contrast and visual accessibility", async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
