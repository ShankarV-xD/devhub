import { test, expect } from "@playwright/test";

test.describe("Visual Regression", () => {
  test("homepage", async ({ page }) => {
    await page.goto("/");
    
    // Wait for page to fully load
    await page.waitForLoadState("networkidle");
    
    // Take full page screenshot
    await expect(page).toHaveScreenshot("homepage.png");
  });

  test("JSON tree view", async ({ page }) => {
    await page.goto("/");
    
    // Enter JSON content
    await page.fill("textarea", '{"name":"test","users":[{"id":1,"name":"Alice"},{"id":2,"name":"Bob"}]}');
    
    // Wait for auto-detection
    await page.waitForTimeout(500);
    
    // Switch to tree view if available
    const treeBtn = page.getByRole("button", { name: "Tree" });
    if (await treeBtn.isVisible()) {
      await treeBtn.click();
      await page.waitForTimeout(300);
    }
    
    // Take screenshot of the editor area
    const editor = page.locator('[data-testid="editor"]').first();
    if (await editor.isVisible()) {
      await expect(editor).toHaveScreenshot("json-tree-view.png");
    } else {
      // Fallback to full page if editor not found
      await expect(page).toHaveScreenshot("json-tree-view-fallback.png");
    }
  });

  test("empty state", async ({ page }) => {
    await page.goto("/");
    
    // Wait for page to load
    await page.waitForLoadState("networkidle");
    
    // Take screenshot of empty state
    await expect(page).toHaveScreenshot("empty-state.png");
  });

  test("mobile responsive view", async ({ page }) => {
    await page.goto("/");
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Wait for responsive layout
    await page.waitForTimeout(300);
    
    // Take mobile screenshot
    await expect(page).toHaveScreenshot("mobile-view.png");
  });

  test("dark mode toggle", async ({ page }) => {
    await page.goto("/");
    
    // Wait for page to load
    await page.waitForLoadState("networkidle");
    
    // Try to find and click dark mode toggle if it exists
    const darkModeBtn = page.getByRole("button", { name: /dark|theme|mode/i });
    if (await darkModeBtn.isVisible()) {
      await darkModeBtn.click();
      await page.waitForTimeout(300);
      await expect(page).toHaveScreenshot("dark-mode.png");
    } else {
      // Skip test if dark mode toggle not found
      test.skip();
    }
  });

  test("sidebar navigation", async ({ page }) => {
    await page.goto("/");
    
    // Wait for page to load
    await page.waitForLoadState("networkidle");
    
    // Open mobile menu if needed
    const menuBtn = page.getByRole("button", { name: "Open menu" });
    if (await menuBtn.isVisible()) {
      await menuBtn.click();
      await page.waitForTimeout(300);
    }
    
    // Take screenshot with navigation visible
    await expect(page).toHaveScreenshot("sidebar-navigation.png");
  });
});
