"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";

export function PostHogPageView(): React.JSX.Element {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize PostHog once (disabled by default to prevent errors)
  useEffect(() => {
    // Only initialize if explicitly enabled via environment variable
    const isEnabled = process.env.NEXT_PUBLIC_POSTHOG_ENABLED === "true";

    if (!isEnabled) {
      console.log(
        "📊 PostHog analytics disabled. Set NEXT_PUBLIC_POSTHOG_ENABLED=true to enable."
      );
      return;
    }

    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      return;
    }

    try {
      if (!posthog.__loaded) {
        posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
          api_host:
            process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
          disable_session_recording: true,
          disable_surveys: true,
          advanced_disable_feature_flags: true,
          autocapture: false,
          loaded: (_posthog) => {
            console.log("✅ PostHog loaded successfully!");
          },
        });
      }
    } catch (error) {
      // Silently fail - analytics is optional
      console.log("📊 PostHog initialization skipped");
    }
  }, []);

  // Track page views (only if PostHog is loaded)
  useEffect(() => {
    if (pathname && posthog && posthog.__loaded) {
      try {
        let url = window.origin + pathname;
        if (searchParams && searchParams.toString()) {
          url = url + `?${searchParams.toString()}`;
        }
        posthog.capture("$pageview", {
          $current_url: url,
        });
      } catch (error) {
        // Silently fail
      }
    }
  }, [pathname, searchParams]);

  return <></>;
}
