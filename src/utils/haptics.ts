/**
 * Haptic Feedback Utilities (M2)
 *
 * Uses the Web Vibration API to provide tactile confirmation on mobile.
 * Gracefully degrades on desktop/unsupported browsers.
 *
 * Usage:
 *   import { haptics } from '@/utils/haptics';
 *   haptics.success(); // After a successful copy
 *   haptics.error();   // After a failed operation
 */

const vibrate = (pattern: number | number[]): void => {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
};

export const haptics = {
  /** Very brief tap — ideal for toggle/select actions */
  light: () => vibrate(10),

  /** Standard tap — ideal for button presses */
  medium: () => vibrate(20),

  /** Stronger tap — ideal for destructive or important actions */
  heavy: () => vibrate(50),

  /** Double-pulse pattern — communicates success */
  success: () => vibrate([10, 50, 10]),

  /** Error pattern — communicates failure */
  error: () => vibrate([50, 100, 50]),

  /** Warning pattern — draws attention without alarm */
  warning: () => vibrate([30, 80, 30]),
};

/**
 * iOS PWA-compatible haptics.
 * Falls back to the same Vibration API — works on Android natively.
 * On iOS requires the app to be installed as a PWA.
 */
export const iosHaptics = {
  impact: (style: "light" | "medium" | "heavy") => {
    const durations: Record<typeof style, number> = {
      light: 10,
      medium: 20,
      heavy: 50,
    };
    vibrate(durations[style]);
  },
};
