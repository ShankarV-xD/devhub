/**
 * Touch Target Audit Script (M1)
 *
 * Run in the browser console or as a bookmarklet to identify all interactive
 * elements that don't meet the WCAG 2.5.5 minimum 44×44px touch target size.
 *
 * Usage (browser console):
 *   // Paste this file's content into the console, then call:
 *   auditTouchTargets();
 *
 * Usage (as a script tag in development):
 *   <script src="/scripts/audit-touch-targets.js" />
 */

export function auditTouchTargets(minSize = 44): void {
  const selectors = "button, a[href], input, select, textarea, [role='button'], [tabindex]";
  const elements = document.querySelectorAll<HTMLElement>(selectors);

  const violations: Array<{
    element: HTMLElement;
    width: number;
    height: number;
    text: string;
  }> = [];

  elements.forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.width < minSize || rect.height < minSize) {
      violations.push({
        element: el,
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        text:
          el.textContent?.trim().slice(0, 30) ||
          el.getAttribute("aria-label") ||
          el.tagName,
      });
    }
  });

  if (violations.length === 0) {
    console.log(
      `%c✅ All ${elements.length} interactive elements meet the ${minSize}px touch target requirement.`,
      "color: green; font-weight: bold;"
    );
    return;
  }

  console.group(
    `%c⚠️ Touch Target Violations (${violations.length} of ${elements.length})`,
    "color: orange; font-weight: bold;"
  );

  violations.forEach(({ element, width, height, text }) => {
    console.warn(
      `[${width}×${height}px] "${text}"`,
      element
    );
  });

  console.groupEnd();
}

// Auto-run in development mode if this script is imported directly
if (
  typeof window !== "undefined" &&
  process.env.NODE_ENV === "development"
) {
  // Run after page load so elements are rendered
  if (document.readyState === "complete") {
    auditTouchTargets();
  } else {
    window.addEventListener("load", () => auditTouchTargets());
  }
}
