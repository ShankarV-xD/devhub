import { useState, useEffect } from "react";
import figlet from "figlet";
// @ts-ignore
import standardFont from "figlet/importable-fonts/Standard.js";
// @ts-ignore
import ghostFont from "figlet/importable-fonts/Ghost.js";
// @ts-ignore
import slantFont from "figlet/importable-fonts/Slant.js";
// @ts-ignore
import smallFont from "figlet/importable-fonts/Small.js";
// @ts-ignore
import graffitiFont from "figlet/importable-fonts/Graffiti.js";
// @ts-ignore
import chuncFont from "figlet/importable-fonts/Chunky.js";
import { Copy, ArrowRight, X, Type } from "lucide-react";
import { toast } from "sonner";
import ToolButton from "../ToolButton";

interface AsciiArtToolsProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (text: string) => void;
  initialText?: string;
}

export function AsciiArtTools({
  isOpen,
  onClose,
  onInsert,
  initialText = "",
}: AsciiArtToolsProps) {
  const [inputText, setInputText] = useState("DevHub");
  const [fontName, setFontName] = useState("Standard");
  const [preview, setPreview] = useState("");

  const fonts = {
    Standard: standardFont,
    Ghost: ghostFont,
    Slant: slantFont,
    Small: smallFont,
    Graffiti: graffitiFont,
    Chunky: chuncFont,
  };

  useEffect(() => {
    figlet.parseFont("Standard", standardFont);
    figlet.parseFont("Ghost", ghostFont);
    figlet.parseFont("Slant", slantFont);
    figlet.parseFont("Small", smallFont);
    figlet.parseFont("Graffiti", graffitiFont);
    figlet.parseFont("Chunky", chuncFont);
  }, []);

  useEffect(() => {
    if (isOpen && initialText && initialText.length < 20) {
      setInputText(initialText);
    }
  }, [isOpen, initialText]);

  useEffect(() => {
    figlet.text(
      inputText || " ",
      {
        font: fontName as any,
      },
      (err, data) => {
        if (err) {
          console.error(err);
          return;
        }
        setPreview(data || "");
      }
    );
  }, [inputText, fontName]);

  const handleCopy = () => {
    navigator.clipboard.writeText(preview);
    toast.success("ASCII Art copied to clipboard");
  };

  const handleInsert = () => {
    onInsert(preview);
    toast.success("Inserted into editor");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-2">
            <Type size={18} className="text-zinc-400" />
            <h2 className="text-lg font-semibold text-zinc-100">
              ASCII Art Generator
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded transition-colors text-zinc-400 hover:text-zinc-200"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto">
          <div className="space-y-4 shrink-0">
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">
                Text Input
              </label>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-emerald-500/50"
                placeholder="Type content..."
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">
                Font Style
              </label>
              <div className="grid grid-cols-3 gap-2">
                {Object.keys(fonts).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFontName(f)}
                    className={`px-3 py-2 text-xs font-medium rounded border transition-colors ${
                      fontName === f
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-800"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-[200px] flex flex-col">
            <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">
              Preview
            </label>
            <div className="flex-1 bg-zinc-950 border border-zinc-900 rounded p-4 overflow-auto custom-scrollbar">
              <pre className="font-mono text-xs leading-none text-emerald-400 whitespace-pre">
                {preview}
              </pre>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 shrink-0">
            <ToolButton
              icon={<Copy size={16} />}
              label="Copy Art"
              onClick={handleCopy}
              variant="default"
              showTooltip={false}
            />
            <ToolButton
              icon={<ArrowRight size={16} />}
              label="Insert"
              onClick={handleInsert}
              variant="default"
              showTooltip={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
