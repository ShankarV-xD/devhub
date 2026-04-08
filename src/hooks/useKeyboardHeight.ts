/**
 * useKeyboardHeight Hook (M3 - Virtual Keyboard Overlap Fix)
 *
 * Detects height of the virtual keyboard by comparing the visual viewport
 * height against the document height. Returns the keyboard height in pixels,
 * or 0 when the keyboard is closed.
 *
 * Usage:
 *   const keyboardHeight = useKeyboardHeight();
 *   // Apply as paddingBottom to prevent content hiding under keyboard
 */

import { useState, useEffect } from "react";

export function useKeyboardHeight(): number {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      const windowHeight =
        window.visualViewport?.height ?? window.innerHeight;
      const documentHeight = document.documentElement.clientHeight;

      const diff = documentHeight - windowHeight;
      // Only treat it as a keyboard if the difference is significant (> 100px)
      setKeyboardHeight(diff > 100 ? diff : 0);
    };

    // Prefer visualViewport for better accuracy on mobile browsers
    window.visualViewport?.addEventListener("resize", handleResize);
    window.visualViewport?.addEventListener("scroll", handleResize);
    window.addEventListener("resize", handleResize);

    // Run once to set initial state
    handleResize();

    return () => {
      window.visualViewport?.removeEventListener("resize", handleResize);
      window.visualViewport?.removeEventListener("scroll", handleResize);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return keyboardHeight;
}
