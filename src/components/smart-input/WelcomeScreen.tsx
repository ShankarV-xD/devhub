import React from "react";
import { FileJson, Key, Code2, Link2 } from "lucide-react";

interface WelcomeScreenProps {
  onLoadExample?: (type: "json" | "jwt" | "sql") => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onLoadExample,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-4">
      <div className="flex flex-col items-center justify-center text-center max-w-lg animate-in fade-in zoom-in-95 duration-500">
        {/* <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/5 flex items-center justify-center mb-6 shadow-lg shadow-blue-900/10">
          <Sparkles className="w-8 h-8 text-blue-400" />
        </div> */}

        <h2 className="text-2xl font-bold bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent mb-2">
          Paste Anything
        </h2>

        <p className="text-zinc-500 max-w-sm mb-8 text-sm leading-relaxed">
          JSON, JWT, SQL, Regex, or just text.{" "}
          <br className="hidden sm:block" />
          DevHub auto-detects and formats it instantly.
        </p>

        {/* Quick Actions - Make them clickable */}
        {onLoadExample && (
          <div className="grid grid-cols-3 gap-3 mb-8 w-full pointer-events-auto">
            <button
              onClick={() => onLoadExample("json")}
              className="cursor-pointer flex flex-col items-center gap-2 p-3 rounded-xl border border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-800/80 hover:border-zinc-700 transition-all group"
            >
              <div className="p-2 rounded-lg bg-yellow-500/10 group-hover:bg-yellow-500/20 transition-colors">
                <FileJson className="w-5 h-5 text-yellow-500" />
              </div>
              <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-200">
                JSON
              </span>
            </button>

            <button
              onClick={() => onLoadExample("jwt")}
              className="cursor-pointer flex flex-col items-center gap-2 p-3 rounded-xl border border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-800/80 hover:border-zinc-700 transition-all group"
            >
              <div className="p-2 rounded-lg bg-rose-500/10 group-hover:bg-rose-500/20 transition-colors">
                <Key className="w-5 h-5 text-rose-500" />
              </div>
              <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-200">
                JWT
              </span>
            </button>

            <button
              onClick={() => onLoadExample("sql")}
              className="cursor-pointer flex flex-col items-center gap-2 p-3 rounded-xl border border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-800/80 hover:border-zinc-700 transition-all group"
            >
              <div className="p-2 rounded-lg bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors">
                <Code2 className="w-5 h-5 text-orange-500" />
              </div>
              <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-200">
                SQL
              </span>
            </button>
          </div>
        )}

        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs mb-6 shadow-lg shadow-emerald-500/5">
          <Link2 className="w-3.5 h-3.5" />
          <span>Everything lives in the URL. Share instantly.</span>
        </div>

        {/* Features Specs */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-left max-w-sm w-full border-t border-zinc-800/50 pt-6 opacity-70">
          <div>
            <h4 className="text-[10px] items-center gap-1.5 flex uppercase tracking-wider font-semibold text-zinc-400 mb-1">
              <span className="w-1 h-1 rounded-full bg-emerald-500" />{" "}
              Auto-Detection
            </h4>
            <p className="text-[10px] text-zinc-600">
              Identify 15+ formats instantly
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

        {/* Keyboard Hint */}
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
