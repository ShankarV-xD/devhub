import posthog from "posthog-js";

// Initialize PostHog (only in browser)
if (typeof window !== "undefined") {
  console.log("🔍 PostHog Init:", {
    key: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    hasKey: !!process.env.NEXT_PUBLIC_POSTHOG_KEY,
  });

  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY || "phc_local_dev_key", {
    api_host:
      process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    loaded: (posthog) => {
      if (process.env.NODE_ENV === "development") {
        posthog.debug(); // Enable debug mode in development
      }
    },
  });
}

// Track custom events
export const trackEvent = (
  eventName: string,
  properties?: Record<string, any>
) => {
  if (typeof window !== "undefined" && posthog) {
    posthog.capture(eventName, properties);
  }
};

// Predefined event helpers
export const analytics = {
  // Tool usage
  toolUsed: (tool: string, contentType?: string) => {
    trackEvent("tool_used", { tool, content_type: contentType });
  },

  // Content type detected
  contentDetected: (type: string, size?: number) => {
    trackEvent("content_detected", { type, size_bytes: size });
  },

  // Error occurred
  errorOccurred: (tool: string, errorType: string, message?: string) => {
    trackEvent("error_occurred", { tool, error_type: errorType, message });
  },

  // Feature used
  featureUsed: (feature: string) => {
    trackEvent("feature_used", { feature });
  },

  // Export action
  exportPerformed: (format: string, contentType: string) => {
    trackEvent("export_performed", { format, content_type: contentType });
  },
};

export default posthog;
