import { useState, useEffect } from "react";
import { X, Download, Copy, QrCode as QrIcon } from "lucide-react";
import QRCode from "qrcode";
import { toast } from "sonner";

interface QRCodeGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  initialText?: string;
}

type QRSize = "small" | "medium" | "large";

const SIZE_MAP = {
  small: 200,
  medium: 400,
  large: 800,
};

export function QRCodeGenerator({
  isOpen,
  onClose,
  initialText = "",
}: QRCodeGeneratorProps) {
  const [text, setText] = useState(initialText);
  const [size, setSize] = useState<QRSize>("medium");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate QR code when text or size changes
  useEffect(() => {
    if (!text) {
      setQrDataUrl("");
      return;
    }

    const generateQR = async () => {
      setIsGenerating(true);
      try {
        const dataUrl = await QRCode.toDataURL(text, {
          width: SIZE_MAP[size],
          margin: 2,
          color: {
            dark: "#000000",
            light: "#ffffff",
          },
          errorCorrectionLevel: "M",
        });
        setQrDataUrl(dataUrl);
      } catch (error) {
        console.error("QR generation error:", error);
        toast.error("Failed to generate QR code");
      } finally {
        setIsGenerating(false);
      }
    };

    const timer = setTimeout(generateQR, 300); // Debounce
    return () => clearTimeout(timer);
  }, [text, size]);

  const handleDownload = () => {
    if (!qrDataUrl) return;

    const link = document.createElement("a");
    link.download = `qrcode-${Date.now()}.png`;
    link.href = qrDataUrl;
    link.click();
    toast.success("QR code downloaded");
  };

  const handleCopyImage = async () => {
    if (!qrDataUrl) return;

    try {
      // Convert data URL to blob
      const response = await fetch(qrDataUrl);
      const blob = await response.blob();

      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      toast.success("QR code copied to clipboard");
    } catch (error) {
      console.error("Copy error:", error);
      toast.error("Failed to copy image");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-3xl h-[500px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <QrIcon size={18} className="text-zinc-400" />
            <h2 className="text-lg font-semibold text-zinc-100">
              QR Code Generator
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded transition-colors text-zinc-400 hover:text-zinc-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content - Side by Side */}
        <div className="p-6 flex gap-6 flex-1 min-h-0">
          {/* Left: Input & Controls */}
          <div className="flex-1 flex flex-col space-y-4">
            {/* Text Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">
                Text or URL
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text or URL to encode..."
                className="custom-scrollbar w-full h-32 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-sm text-zinc-100 focus:outline-none focus:border-zinc-700 resize-none"
                autoFocus
              />
            </div>

            {/* Size Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Size</label>
              <div className="grid grid-cols-3 gap-2">
                {(["small", "medium", "large"] as QRSize[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                      size === s
                        ? "bg-emerald-600 text-white"
                        : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
                    }`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                    <div className="text-xs opacity-70">{SIZE_MAP[s]}px</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            {qrDataUrl && (
              <div className="flex gap-2">
                <button
                  onClick={handleDownload}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded transition-colors"
                >
                  <Download size={16} />
                  Download PNG
                </button>
                <button
                  onClick={handleCopyImage}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded transition-colors"
                >
                  <Copy size={16} />
                </button>
              </div>
            )}

            {/* Info */}
            {!text && (
              <div className="text-xs text-zinc-500 p-3 bg-zinc-950 rounded border border-zinc-800">
                <p>
                  💡 Scan the generated QR code with your phone to decode the
                  text/URL
                </p>
              </div>
            )}
          </div>

          {/* Right: Preview */}
          <div className="flex-1 flex flex-col space-y-2">
            <label className="text-sm font-medium text-zinc-300">Preview</label>
            <div className="flex-1 flex justify-center items-center bg-white rounded">
              {!text ? (
                <div className="text-zinc-400 text-sm">
                  Enter text to generate QR code
                </div>
              ) : isGenerating ? (
                <div className="text-zinc-400">Generating...</div>
              ) : qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="QR Code"
                  className="object-contain"
                  style={{
                    width:
                      size === "small" ? 150 : size === "medium" ? 220 : 300,
                    height:
                      size === "small" ? 150 : size === "medium" ? 220 : 300,
                  }}
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
