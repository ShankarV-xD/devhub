import { Clock, RefreshCw, Eye } from "lucide-react";
import { toast } from "sonner";
import ToolButton from "../ToolButton";
import { fromUnixTime, parseISO } from "date-fns";

interface TimestampToolsProps {
  content: string;
  setContent: (content: string) => void;
  setIsPreviewMode?: (mode: boolean) => void;
}

export function TimestampTools({
  content,
  setContent,
  setIsPreviewMode,
}: TimestampToolsProps) {
  const handleConvertToUnixMs = () => {
    try {
      // Try parsing as ISO 8601
      if (content.includes("T")) {
        const date = parseISO(content);
        const ms = date.getTime();
        if (!isNaN(ms)) {
          setContent(ms.toString());
        } else {
          toast.error("Invalid timestamp format");
        }
      } else {
        toast.error("Invalid timestamp format");
      }
    } catch {
      toast.error("Failed to convert");
    }
  };

  const handleConvertToUnixSec = () => {
    try {
      // Try parsing as ISO 8601
      if (content.includes("T")) {
        const date = parseISO(content);
        const ms = date.getTime();
        if (!isNaN(ms)) {
          setContent(Math.floor(ms / 1000).toString());
        } else {
          toast.error("Invalid timestamp format");
        }
      } else {
        toast.error("Invalid timestamp format");
      }
    } catch {
      toast.error("Failed to convert");
    }
  };

  const handleConvertToISO = () => {
    try {
      const timestamp = parseInt(content.trim(), 10);
      if (isNaN(timestamp)) {
        toast.error("Invalid timestamp");
        return;
      }

      // Detect if it's seconds (10 digits) or milliseconds (13 digits)
      const isSeconds = content.trim().length === 10;
      const date = isSeconds ? fromUnixTime(timestamp) : new Date(timestamp);

      if (!isNaN(date.getTime())) {
        setContent(date.toISOString());
      } else {
        toast.error("Invalid timestamp");
      }
    } catch {
      toast.error("Failed to convert");
    }
  };

  const handleUseCurrentTime = () => {
    setContent(Date.now().toString());
  };

  const isTimestamp = /^\d{10,13}$/.test(content.trim());
  const isISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(content.trim());

  return (
    <div className="flex items-center gap-2">
      {isISO && (
        <>
          <ToolButton
            icon={<Clock size={16} />}
            label="To Unix (ms)"
            onClick={handleConvertToUnixMs}
          />
          <ToolButton
            icon={<Clock size={16} />}
            label="To Unix (s)"
            onClick={handleConvertToUnixSec}
          />
        </>
      )}

      {isTimestamp && (
        <ToolButton
          icon={<Clock size={16} />}
          label="To ISO 8601"
          onClick={handleConvertToISO}
        />
      )}

      {setIsPreviewMode && (
        <ToolButton
          icon={<Eye size={16} />}
          label="Preview"
          onClick={() => setIsPreviewMode(true)}
        />
      )}

      <ToolButton
        icon={<RefreshCw size={16} />}
        label="Current Time"
        onClick={handleUseCurrentTime}
      />
    </div>
  );
}
