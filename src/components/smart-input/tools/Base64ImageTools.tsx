import { useState, useRef, useEffect, useCallback } from "react";
import { Upload, Copy, Download, Image as ImageIcon, X } from "lucide-react";
import { toast } from "sonner";
import ToolButton from "../ToolButton";

interface Base64ImageToolsProps {
  content: string;
  setContent: (value: string) => void;
  searchTerm?: string;
}

export function Base64ImageTools({
  content,
  setContent,
  searchTerm = "",
}: Base64ImageToolsProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [imageFormat, setImageFormat] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close modal on Escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setShowModal(false);
  }, []);

  useEffect(() => {
    if (showModal) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [showModal, handleKeyDown]);

  // Auto-decode image base64 when content changes
  useEffect(() => {
    if (content && content.startsWith("data:image/")) {
      setPreview(content);
      const match = content.match(/data:image\/(\w+);base64/);
      if (match) setImageFormat(`image/${match[1]}`);
    } else {
      setPreview(null);
      setImageFormat("");
    }
  }, [content]);

  const filter = (label: string) =>
    !searchTerm || label.toLowerCase().includes(searchTerm.toLowerCase());

  // Convert image file to base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image too large. Maximum size is 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setPreview(base64);
      setContent(base64);
      setImageFormat(file.type);
      toast.success("Image converted to Base64");
    };
    reader.readAsDataURL(file);
  };

  // Try to decode base64 content as image
  const decodeBase64 = () => {
    try {
      if (content.startsWith("data:image/")) {
        setPreview(content);
        const match = content.match(/data:image\/(\w+);base64/);
        if (match) setImageFormat(`image/${match[1]}`);
        toast.success("Base64 decoded successfully");
      } else {
        toast.error("Not a valid image base64 string");
      }
    } catch {
      toast.error("Failed to decode base64");
    }
  };

  // Download decoded image
  const downloadImage = () => {
    if (!preview) return;
    const link = document.createElement("a");
    link.href = preview;
    const ext = imageFormat.split("/")[1] || "png";
    link.download = `image-${Date.now()}.${ext}`;
    link.click();
    toast.success("Image downloaded");
  };

  // Copy base64 to clipboard
  const copyBase64 = () => {
    navigator.clipboard.writeText(content);
    toast.success("Base64 copied to clipboard");
  };

  return (
    <div className="flex items-center gap-2">
      {/* Upload Image */}
      {filter("Upload Image") && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <ToolButton
            icon={<Upload size={16} />}
            label="Upload Image"
            onClick={() => fileInputRef.current?.click()}
          />
        </div>
      )}

      {/* Decode Base64 */}
      {filter("Decode Base64") && content && !preview && (
        <ToolButton
          icon={<ImageIcon size={16} />}
          label="Decode Base64"
          onClick={decodeBase64}
        />
      )}

      {/* Compact Thumbnail Preview — click to enlarge */}
      {preview && (
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-2 py-1 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:border-zinc-600 transition-colors cursor-pointer"
          title="Click to enlarge"
        >
          <img
            src={preview}
            alt="Preview"
            className="h-10 w-auto max-w-[80px] rounded border border-zinc-700 object-contain"
          />
          {imageFormat && (
            <span className="text-[10px] text-zinc-500 whitespace-nowrap">
              {imageFormat.split("/")[1]?.toUpperCase()} ·{" "}
              {((content.length * 0.75) / 1024).toFixed(0)} KB
            </span>
          )}
        </button>
      )}

      {/* Image Preview Modal */}
      {showModal && preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className="relative max-w-[80vw] max-h-[80vh] bg-zinc-900 border border-zinc-700 rounded-xl p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute -top-3 -right-3 p-1.5 bg-zinc-800 border border-zinc-700 rounded-full hover:bg-zinc-700 transition-colors text-zinc-400 hover:text-white cursor-pointer"
              aria-label="Close preview"
            >
              <X size={14} />
            </button>
            <img
              src={preview}
              alt="Full Preview"
              className="max-w-full max-h-[70vh] rounded-lg object-contain"
            />
            {imageFormat && (
              <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
                <span>Format: {imageFormat}</span>
                <span>
                  Size: {((content.length * 0.75) / 1024).toFixed(2)} KB
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Copy & Download */}
      {preview && filter("Copy Base64") && (
        <ToolButton
          icon={<Copy size={16} />}
          label="Copy Base64"
          onClick={copyBase64}
        />
      )}
      {preview && filter("Download") && (
        <ToolButton
          icon={<Download size={16} />}
          label="Download"
          onClick={downloadImage}
        />
      )}
    </div>
  );
}
