import { useMemo, ReactNode } from "react";
import { format, fromUnixTime, parseISO, formatDistanceToNow } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { Copy, Clock, Edit3 } from "lucide-react";
import { toast } from "sonner";

interface TimestampRendererProps {
  content: string;
  isPreviewMode: boolean;
  onTogglePreview: (mode: boolean) => void;
  children: ReactNode;
}

export function TimestampRenderer({
  content,
  isPreviewMode,
  onTogglePreview,
  children,
}: TimestampRendererProps) {
  const timestampData = useMemo(() => {
    try {
      const trimmed = content.trim();
      let date: Date;

      // Check if it's a Unix timestamp
      if (/^\d{10,13}$/.test(trimmed)) {
        const timestamp = parseInt(trimmed, 10);
        // Detect if it's seconds (10 digits) or milliseconds (13 digits)
        const isSeconds = trimmed.length === 10;
        date = isSeconds ? fromUnixTime(timestamp) : new Date(timestamp);
      }
      // Check if it's ISO 8601
      else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(trimmed)) {
        date = parseISO(trimmed);
      } else {
        return null;
      }

      return {
        date,
        unixMs: date.getTime(),
        unixSec: Math.floor(date.getTime() / 1000),
        iso: date.toISOString(),
        humanReadable: format(date, "PPPP 'at' pppp"),
        relative: formatDistanceToNow(date, { addSuffix: true }),
      };
    } catch (error) {
      return null;
    }
  }, [content]);

  const timezones = [
    { name: "UTC", tz: "UTC" },
    { name: "New York", tz: "America/New_York" },
    { name: "Los Angeles", tz: "America/Los_Angeles" },
    { name: "London", tz: "Europe/London" },
    { name: "Paris", tz: "Europe/Paris" },
    { name: "Tokyo", tz: "Asia/Tokyo" },
    { name: "Shanghai", tz: "Asia/Shanghai" },
    { name: "Sydney", tz: "Australia/Sydney" },
  ];

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  // Show editor when not in preview mode
  if (!isPreviewMode) {
    return <>{children}</>;
  }

  // Show error if invalid timestamp
  if (!timestampData) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-3 border-b border-zinc-800 bg-zinc-950">
          <h3 className="text-sm font-medium text-zinc-300">
            Timestamp Preview
          </h3>
          <button
            onClick={() => onTogglePreview(false)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition-colors"
          >
            <Edit3 size={14} />
            Edit
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center p-4 text-zinc-500 text-sm">
          Invalid timestamp format
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with toggle button */}
      <div className="flex items-center justify-between p-3 border-b border-zinc-800 bg-zinc-950 shrink-0">
        <h3 className="text-sm font-medium text-zinc-300">Timestamp Preview</h3>
        <button
          onClick={() => onTogglePreview(false)}
          className="flex items-center gap-2 px-3 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition-colors"
        >
          <Edit3 size={14} />
          Edit
        </button>
      </div>

      {/* Scrollable preview content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
        {/* Human Readable Section */}
        <div className="space-y-3">
          <h3 className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">
            Human Readable
          </h3>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <div className="text-lg text-zinc-100 mb-2">
              {timestampData.humanReadable}
            </div>
            <div className="text-sm text-zinc-500">
              {timestampData.relative}
            </div>
          </div>
        </div>

        {/* Formats Section */}
        <div className="space-y-3">
          <h3 className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">
            Formats
          </h3>
          <div className="space-y-2">
            {/* Unix Milliseconds */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 flex items-center justify-between group hover:border-zinc-700 transition-colors">
              <div>
                <div className="text-xs text-zinc-500 mb-1">
                  Unix (milliseconds)
                </div>
                <div className="font-mono text-sm text-zinc-200">
                  {timestampData.unixMs}
                </div>
              </div>
              <button
                onClick={() =>
                  handleCopy(timestampData.unixMs.toString(), "Unix (ms)")
                }
                className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-zinc-800 rounded"
                aria-label="Copy Unix milliseconds"
              >
                <Copy size={16} className="text-zinc-400" />
              </button>
            </div>

            {/* Unix Seconds */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 flex items-center justify-between group hover:border-zinc-700 transition-colors">
              <div>
                <div className="text-xs text-zinc-500 mb-1">Unix (seconds)</div>
                <div className="font-mono text-sm text-zinc-200">
                  {timestampData.unixSec}
                </div>
              </div>
              <button
                onClick={() =>
                  handleCopy(timestampData.unixSec.toString(), "Unix (s)")
                }
                className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-zinc-800 rounded"
                aria-label="Copy Unix seconds"
              >
                <Copy size={16} className="text-zinc-400" />
              </button>
            </div>

            {/* ISO 8601 */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 flex items-center justify-between group hover:border-zinc-700 transition-colors">
              <div>
                <div className="text-xs text-zinc-500 mb-1">ISO 8601</div>
                <div className="font-mono text-sm text-zinc-200">
                  {timestampData.iso}
                </div>
              </div>
              <button
                onClick={() => handleCopy(timestampData.iso, "ISO 8601")}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-zinc-800 rounded"
                aria-label="Copy ISO 8601"
              >
                <Copy size={16} className="text-zinc-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Timezones Section */}
        <div className="space-y-3">
          <h3 className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">
            Time Across Zones
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {timezones.map((tz) => (
              <div
                key={tz.tz}
                className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={12} className="text-zinc-500" />
                  <div className="text-xs text-zinc-500">{tz.name}</div>
                </div>
                <div className="font-mono text-sm text-zinc-200">
                  {formatInTimeZone(
                    timestampData.date,
                    tz.tz,
                    "MMM dd, yyyy HH:mm:ss"
                  )}
                </div>
                <div className="text-xs text-zinc-600 mt-1">
                  {formatInTimeZone(timestampData.date, tz.tz, "zzz")}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
