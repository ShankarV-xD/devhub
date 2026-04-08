interface AnnouncerProps {
  message: string;
  "aria-live"?: "polite" | "assertive";
}

/**
 * A component that handles announcing messages to screen readers using ARIA live regions.
 * The message is rendered in a visually hidden element that screen readers monitor.
 */
export function ScreenReaderAnnouncer({
  message,
  "aria-live": ariaLive = "polite",
}: AnnouncerProps) {
  return (
    <div
      role="status"
      aria-live={ariaLive}
      aria-atomic="true"
      className="sr-only" // Screen reader only (visually hidden)
    >
      {message}
    </div>
  );
}
