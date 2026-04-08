"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { colord } from "colord";
import { Hash, Monitor, Sliders } from "lucide-react";
import Tooltip from "../../Tooltip";

const HexColorPicker = dynamic(
  () =>
    import("react-colorful").then((mod) => ({ default: mod.HexColorPicker })),
  { ssr: false }
);

interface ColorRendererProps {
  color: string;
  onChange: (color: string) => void;
  onCopy: (text: string) => void;
}

export function ColorRenderer({ color, onChange, onCopy }: ColorRendererProps) {
  // Handle hashless hex (e.g., "FF5733" -> "#FF5733")
  const validColor = useMemo(() => {
    const isHashlessHex =
      /^[0-9a-fA-F]{3,8}$/.test(color.trim()) && !color.includes("#");
    return isHashlessHex ? `#${color}` : color;
  }, [color]);

  const c = useMemo(() => colord(validColor), [validColor]);

  const palettes = useMemo(() => {
    if (!c.isValid()) return null;
    return {
      complementary: c.rotate(180).toHex(),
      analogous: [c.rotate(-30).toHex(), c.toHex(), c.rotate(30).toHex()],
      monochromatic: [c.darken(0.2).toHex(), c.toHex(), c.lighten(0.2).toHex()],
    };
  }, [c]);

  return (
    <div className="absolute inset-0 flex bg-zinc-950 animate-in fade-in duration-200">
      {/* Left Panel: Input & Codes */}
      <div className="w-1/2 h-full flex flex-col items-center justify-center p-8 border-r border-zinc-900 overflow-auto custom-scrollbar">
        <div className="w-full max-w-sm flex flex-col gap-8">
          <div className="w-full">
            <label className="block text-zinc-500 text-sm font-medium mb-4 text-center uppercase tracking-widest">
              Color Input
            </label>
            <input
              type="text"
              value={color}
              onChange={(e) => onChange(e.target.value)}
              className="w-full bg-transparent text-center text-4xl font-mono text-zinc-100 border-b-2 border-zinc-800 focus:border-pink-500 outline-none py-2 transition-colors placeholder:text-zinc-800"
              placeholder="#000000"
              spellCheck={false}
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-4 w-full">
            {c.isValid() ? (
              <>
                {/* HEX */}
                <div className="group relative flex items-center justify-center gap-4">
                  <div className="absolute left-0 text-zinc-600">
                    <Hash size={20} />
                  </div>
                  <Tooltip text="Copy HEX">
                    <div
                      onClick={() => onCopy(c.toHex())}
                      className="text-3xl font-mono text-zinc-300 text-center py-2 cursor-pointer hover:text-white transition-colors"
                    >
                      {c.toHex()}
                    </div>
                  </Tooltip>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[10px] text-zinc-600 uppercase tracking-widest">
                    HEX
                  </div>
                </div>

                {/* RGB */}
                <div className="group relative flex items-center justify-center gap-4 mt-2">
                  <div className="absolute left-0 text-zinc-600">
                    <Monitor size={20} />
                  </div>
                  <Tooltip text="Copy RGB">
                    <div
                      onClick={() => onCopy(c.toRgbString())}
                      className="text-2xl font-mono text-zinc-300 text-center py-2 cursor-pointer hover:text-white transition-colors"
                    >
                      {c.toRgbString()}
                    </div>
                  </Tooltip>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[10px] text-zinc-600 uppercase tracking-widest">
                    RGB
                  </div>
                </div>

                {/* HSL */}
                <div className="group relative flex items-center justify-center gap-4 mt-2">
                  <div className="absolute left-0 text-zinc-600">
                    <Sliders size={20} />
                  </div>
                  <Tooltip text="Copy HSL">
                    <div
                      onClick={() => onCopy(c.toHslString())}
                      className="text-2xl font-mono text-zinc-300 text-center py-2 cursor-pointer hover:text-white transition-colors"
                    >
                      {c.toHslString()}
                    </div>
                  </Tooltip>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[10px] text-zinc-600 uppercase tracking-widest">
                    HSL
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-zinc-700 italic">
                Invalid Color
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel: Preview & Picker */}
      <div className="w-1/2 h-full flex flex-col bg-zinc-950">
        {/* Top Half: Preview & Palettes */}
        {/* Top Half: Preview & Palettes */}
        <div className="h-1/2 w-full border-b border-zinc-900 bg-zinc-950 overflow-y-auto custom-scrollbar">
          <div className="min-h-full flex flex-col items-center justify-center p-4">
            <div
              className="transition-colors duration-300 rounded-lg shadow-2xl mb-4 shrink-0"
              style={{
                width: "100%",
                maxWidth: "300px",
                height: "100px",
                backgroundColor: c.isValid() ? validColor : "transparent",
              }}
            />

            {palettes && (
              <div className="w-full max-w-sm space-y-3">
                {/* Complementary */}
                <div className="p-3 rounded bg-zinc-900/50 border border-zinc-900">
                  <div className="text-[10px] uppercase text-zinc-500 font-bold mb-2">
                    Complementary
                  </div>
                  <div className="flex gap-2">
                    {[c.toHex(), palettes.complementary].map((colorStr, i) => (
                      <Tooltip
                        key={i}
                        text={`Copy ${colorStr}`}
                        className="flex-1 w-full"
                      >
                        <button
                          onClick={() => onCopy(colorStr)}
                          className="flex-1 cursor-pointer group w-full"
                        >
                          <div
                            className="h-8 w-full rounded border-2 border-zinc-800 group-hover:border-zinc-700 transition-colors mb-1"
                            style={{ backgroundColor: colorStr }}
                          />
                        </button>
                      </Tooltip>
                    ))}
                  </div>
                </div>

                {/* Analogous */}
                <div className="p-3 rounded bg-zinc-900/50 border border-zinc-900">
                  <div className="text-[10px] uppercase text-zinc-500 font-bold mb-2">
                    Analogous
                  </div>
                  <div className="flex gap-2">
                    {palettes.analogous.map((colorStr, i) => (
                      <Tooltip
                        key={i}
                        text={`Copy ${colorStr}`}
                        className="flex-1 w-full"
                      >
                        <button
                          onClick={() => onCopy(colorStr)}
                          className="flex-1 cursor-pointer group w-full"
                        >
                          <div
                            className="h-8 w-full rounded border-2 border-zinc-800 group-hover:border-zinc-700 transition-colors mb-1"
                            style={{ backgroundColor: colorStr }}
                          />
                        </button>
                      </Tooltip>
                    ))}
                  </div>
                </div>

                {/* Monochromatic */}
                <div className="p-3 rounded bg-zinc-900/50 border border-zinc-900">
                  <div className="text-[10px] uppercase text-zinc-500 font-bold mb-2">
                    Monochromatic
                  </div>
                  <div className="flex gap-2">
                    {palettes.monochromatic.map((colorStr, i) => (
                      <Tooltip
                        key={i}
                        text={`Copy ${colorStr}`}
                        className="flex-1 w-full"
                      >
                        <button
                          onClick={() => onCopy(colorStr)}
                          className="flex-1 cursor-pointer group w-full"
                        >
                          <div
                            className="h-8 w-full rounded border-2 border-zinc-800 group-hover:border-zinc-700 transition-colors mb-1"
                            style={{ backgroundColor: colorStr }}
                          />
                        </button>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Half: Picker */}
        <div className="h-1/2 w-full flex flex-col items-center justify-center bg-zinc-900/30 border-t border-zinc-900 p-8">
          <HexColorPicker
            color={c.isValid() ? c.toHex() : "#000000"}
            onChange={onChange}
            style={{
              width: "100%",
              maxWidth: "300px",
              height: "200px",
            }}
          />
        </div>
      </div>
    </div>
  );
}
