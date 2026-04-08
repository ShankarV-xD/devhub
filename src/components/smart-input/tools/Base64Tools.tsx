import { ArrowLeftRight } from "lucide-react";
import { toast } from "sonner";
import ToolButton from "../ToolButton";

interface Base64ToolsProps {
  content: string;
  setContent: (value: string) => void;
  searchTerm?: string;
}

export function Base64Tools({
  content,
  setContent,
  searchTerm = "",
}: Base64ToolsProps) {
  const filter = (label: string) =>
    !searchTerm || label.toLowerCase().includes(searchTerm.toLowerCase());

  // Encode text to base64
  const encodeToBase64 = () => {
    try {
      // If it's already base64, don't re-encode
      if (isValidBase64(content)) {
        toast.error("Content is already Base64 encoded");
        return;
      }
      const encoded = btoa(content);
      setContent(encoded);
      toast.success("Encoded to Base64");
    } catch (error) {
      toast.error("Failed to encode. Check for invalid characters.");
    }
  };

  // Decode base64 to text
  const decodeFromBase64 = () => {
    try {
      const decoded = atob(content.trim());
      setContent(decoded);
      toast.success("Decoded from Base64");
    } catch (error) {
      toast.error("Invalid Base64 string");
    }
  };

  // Check if string is valid base64
  const isValidBase64 = (str: string): boolean => {
    try {
      return btoa(atob(str)) === str;
    } catch {
      return false;
    }
  };

  const isBase64Encoded = isValidBase64(content.trim());

  return (
    <div className="space-y-3">
      <div className="text-xs text-zinc-500 mb-2">
        {isBase64Encoded ? (
          <span className="text-emerald-500">✓ Valid Base64</span>
        ) : (
          <span className="text-zinc-600">Plain text</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Encode to Base64 */}
        {filter("Encode to Base64") && !isBase64Encoded && (
          <ToolButton
            icon={<ArrowLeftRight size={16} />}
            label="Encode to Base64"
            onClick={encodeToBase64}
          />
        )}

        {/* Decode from Base64 */}
        {filter("Decode from Base64") && isBase64Encoded && (
          <ToolButton
            icon={<ArrowLeftRight size={16} />}
            label="Decode from Base64"
            onClick={decodeFromBase64}
          />
        )}
      </div>

      {/* Info */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-500 space-y-1">
        <div>
          <strong>Base64 Encoding</strong>
        </div>
        <div className="text-zinc-600">
          Converts text to Base64 format, commonly used for:
        </div>
        <ul className="list-disc list-inside text-zinc-600 ml-2">
          <li>API tokens & credentials</li>
          <li>Data transmission</li>
          <li>Email attachments (MIME)</li>
        </ul>
      </div>
    </div>
  );
}
