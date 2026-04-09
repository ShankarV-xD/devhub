import React from "react";
import {
  FileJson,
  Key,
  Code2,
  Link2,
  FileCode,
  Hash,
  Braces,
  Palette,
} from "lucide-react";

type ExampleType =
  | "json"
  | "jwt"
  | "sql"
  | "base64"
  | "regex"
  | "url"
  | "html"
  | "yaml";

const EXAMPLE_BUTTONS: {
  type: ExampleType;
  label: string;
  icon: React.ElementType;
  bgColor: string;
  iconColor: string;
  hoverBg: string;
}[] = [
  {
    type: "json",
    label: "JSON",
    icon: FileJson,
    bgColor: "bg-yellow-500/10",
    iconColor: "text-yellow-500",
    hoverBg: "group-hover:bg-yellow-500/20",
  },
  {
    type: "jwt",
    label: "JWT",
    icon: Key,
    bgColor: "bg-rose-500/10",
    iconColor: "text-rose-500",
    hoverBg: "group-hover:bg-rose-500/20",
  },
  {
    type: "sql",
    label: "SQL",
    icon: Code2,
    bgColor: "bg-orange-500/10",
    iconColor: "text-orange-500",
    hoverBg: "group-hover:bg-orange-500/20",
  },
  {
    type: "base64",
    label: "Base64",
    icon: Braces,
    bgColor: "bg-blue-500/10",
    iconColor: "text-blue-500",
    hoverBg: "group-hover:bg-blue-500/20",
  },
  {
    type: "regex",
    label: "Regex",
    icon: Hash,
    bgColor: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
    hoverBg: "group-hover:bg-emerald-500/20",
  },
  {
    type: "url",
    label: "URL",
    icon: Link2,
    bgColor: "bg-sky-500/10",
    iconColor: "text-sky-500",
    hoverBg: "group-hover:bg-sky-500/20",
  },
  {
    type: "html",
    label: "HTML",
    icon: FileCode,
    bgColor: "bg-orange-500/10",
    iconColor: "text-orange-500",
    hoverBg: "group-hover:bg-orange-500/20",
  },
  {
    type: "yaml",
    label: "YAML",
    icon: Palette,
    bgColor: "bg-amber-500/10",
    iconColor: "text-amber-500",
    hoverBg: "group-hover:bg-amber-500/20",
  },
];

interface WelcomeScreenProps {
  onLoadExample?: (type: ExampleType) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onLoadExample,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-4">
      <div className="flex flex-col items-center justify-center text-center max-w-lg animate-in fade-in zoom-in-95 duration-500">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent mb-2">
          Paste Anything
        </h2>

        <p className="text-zinc-500 max-w-sm mb-8 text-sm leading-relaxed">
          JSON, JWT, SQL, Regex, or just text.{" "}
          <br className="hidden sm:block" />
          DevHub auto-detects and formats it instantly.
        </p>

        {onLoadExample && (
          <div className="grid grid-cols-4 gap-2 mb-8 w-full max-w-xs pointer-events-auto">
            {EXAMPLE_BUTTONS.map(
              ({ type, label, icon: Icon, bgColor, iconColor, hoverBg }) => (
                <button
                  key={type}
                  onClick={() => onLoadExample(type)}
                  className="cursor-pointer flex flex-col items-center gap-1.5 p-2.5 rounded-xl border border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-800/80 hover:border-zinc-700 transition-all group"
                >
                  <div
                    className={`p-1.5 rounded-lg ${bgColor} ${hoverBg} transition-colors`}
                  >
                    <Icon className={`w-4 h-4 ${iconColor}`} />
                  </div>
                  <span className="text-[10px] font-medium text-zinc-400 group-hover:text-zinc-200">
                    {label}
                  </span>
                </button>
              )
            )}
          </div>
        )}

        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs mb-6 shadow-lg shadow-emerald-500/5">
          <Link2 className="w-3.5 h-3.5" />
          <span>Everything lives in the URL. Share instantly.</span>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-left max-w-sm w-full border-t border-zinc-800/50 pt-6 opacity-70">
          <div>
            <h4 className="text-[10px] items-center gap-1.5 flex uppercase tracking-wider font-semibold text-zinc-400 mb-1">
              <span className="w-1 h-1 rounded-full bg-emerald-500" />{" "}
              Auto-Detection
            </h4>
            <p className="text-[10px] text-zinc-600">
              Identify 22+ formats instantly
            </p>
          </div>

          <div>
            <h4 className="text-[10px] items-center gap-1.5 flex uppercase tracking-wider font-semibold text-zinc-400 mb-1">
              <span className="w-1 h-1 rounded-full bg-blue-500" />{" "}
              Transformations
            </h4>
            <p className="text-[10px] text-zinc-600">
              Format, minify, encode, decode
            </p>
          </div>
        </div>

        <div className="mt-8 text-[10px] text-zinc-600 flex items-center gap-1.5 opacity-60">
          Press{" "}
          <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-zinc-700 font-mono text-zinc-400">
            Ctrl+K
          </kbd>{" "}
          to open command palette
        </div>
      </div>
    </div>
  );
};
