import React from "react";
import { Link, Braces } from "lucide-react";
import { toast } from "sonner";
import ToolButton from "../ToolButton";

interface UrlToolsProps {
  content: string;
  setContent: (value: string) => void;
  // setMsg: (msg: { text: string; type: "success" | "error" }) => void; // REMOVED
  setType: (type: any) => void; // Using any to avoid importing ContentType for now, or string
  setViewMode: (mode: "raw" | "tree" | "table") => void;
  setLastTransform: (
    transform: { type: string; original: string } | null
  ) => void;
  searchTerm?: string;
}

export const UrlTools: React.FC<UrlToolsProps> = ({
  content,
  setContent,
  // setMsg,
  setType,
  setViewMode,
  setLastTransform,
  searchTerm = "",
}) => {
  const [isShortening, setIsShortening] = React.useState(false);

  // Check if content is encoded
  const isDecodable = React.useMemo(() => {
    if (!content) return false;
    try {
      const cleanContent = content.split("\n\nShortened URL:\n")[0];
      return cleanContent !== decodeURIComponent(cleanContent);
    } catch {
      return false;
    }
  }, [content]);

  const filter = (label: string) =>
    !searchTerm || label.toLowerCase().includes(searchTerm.toLowerCase());

  return (
    <div className="flex items-center gap-2 animate-in slide-in-from-right-4 duration-300">
      {filter("Encode") && (
        <ToolButton
          icon={<Link size={16} />}
          label="Encode"
          onClick={() => {
            const cleanContent = content.split("\n\nShortened URL:\n")[0];
            setContent(encodeURIComponent(cleanContent));
            setLastTransform(null);
          }}
        />
      )}
      {filter("Decode") && (
        <ToolButton
          icon={<Link size={16} />}
          label="Decode"
          disabled={!isDecodable}
          title={!isDecodable ? "Content is not URL encoded" : "Decode URL"}
          onClick={() => {
            try {
              const cleanContent = content.split("\n\nShortened URL:\n")[0];
              setContent(decodeURIComponent(cleanContent));
              setLastTransform(null);
            } catch {
              toast.error("Invalid URL Encoding");
            }
          }}
        />
      )}
      {filter("Parse Params") && (
        <ToolButton
          icon={<Braces size={16} />}
          label="Parse Params"
          onClick={() => {
            try {
              const cleanContent = content.split("\n\nShortened URL:\n")[0];
              const urlObj = new URL(
                cleanContent.startsWith("http")
                  ? cleanContent
                  : `http://example.com${
                      cleanContent.startsWith("/")
                        ? cleanContent
                        : `/${cleanContent}`
                    }`
              );
              const params: Record<string, string> = {};
              urlObj.searchParams.forEach((value, key) => {
                params[key] = value;
              });
              setContent(JSON.stringify(params, null, 2));
              setType("json");
              setViewMode("tree");
              setLastTransform(null);
            } catch {
              toast.error("Invalid URL");
            }
          }}
        />
      )}
      {filter("Shorten") && (
        <ToolButton
          icon={<Link size={16} />}
          label="Shorten URL"
          isLoading={isShortening}
          onClick={async () => {
            try {
              if (!content.trim()) return;

              setIsShortening(true);

              // 1. Get real content (strip suffix if present, though if encoded it won't match)
              let urlToProcess = content
                .split("\n\nShortened URL:\n")[0]
                .trim();

              // 2. Auto-decode if needed
              // We try to decode recursively until it stops changing or looks like a URL
              try {
                const decoded = decodeURIComponent(urlToProcess);
                if (decoded !== urlToProcess) {
                  urlToProcess = decoded;
                  // After decoding, strip suffix again just in case the suffix was encoded
                  urlToProcess = urlToProcess
                    .split("\n\nShortened URL:\n")[0]
                    .trim();
                }
              } catch {}

              // 3. Ensure protocol
              if (
                !/^https?:\/\//i.test(urlToProcess) &&
                urlToProcess.includes(".")
              ) {
                urlToProcess = `https://${urlToProcess}`;
              }

              const res = await fetch(
                `/api/shorten?url=${encodeURIComponent(urlToProcess)}`
              );

              if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to shorten");
              }

              const data = await res.json();

              setLastTransform({
                type: "url-shorten",
                original: content,
              });

              // Append to the CURRENT content (which might be encoded),
              // or should we append to the decoded content?
              // User said "keep the original url as it is".
              // If original was encoded, we keep it encoded.
              const newContent = `${content}\n\nShortened URL:\n${data.shortUrl}`;
              setContent(newContent);

              toast.success("URL Shortened");
            } catch (error: any) {
              console.error("Shortener Error:", error);
              toast.error(error.message || "Failed to shorten URL");
            } finally {
              setIsShortening(false);
            }
          }}
        />
      )}
    </div>
  );
};
