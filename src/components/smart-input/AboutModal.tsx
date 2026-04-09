import { useEffect, useRef } from "react";
import { X, TerminalSquare } from "lucide-react";
import { useFocusTrap } from "@/hooks/useFocusTrap";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
  const focusTrapRef = useFocusTrap(isOpen);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [isOpen]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const tools = [
    {
      title: "JSON",
      desc: "Format, minify, and inspect JSON in tree or table formats.",
    },
    {
      title: "JWT",
      desc: "Decode JWT payloads and quickly verify HS256/RS256 signatures.",
    },
    {
      title: "Base64 & Hash",
      desc: "Bi-directional encode/decode and generate SHA/MD5 hashes.",
    },
    {
      title: "Regex",
      desc: "Test regular expressions directly against your content.",
    },
    {
      title: "SQL & Code",
      desc: "Format queries, highlight syntax, and view code blocks.",
    },
    {
      title: "URL & API",
      desc: "Parse URL parameters, shorten tools, and an API Request Builder.",
    },
    {
      title: "Colors & Design",
      desc: "Color picker, Hex/RGB converters, and CSS formatting.",
    },
    {
      title: "HTML & Markdown",
      desc: "Instant live preview of your HTML and Markdown documents.",
    },
    {
      title: "Cron & Timestamp",
      desc: "Generate human-readable cron schedules and convert timestamps.",
    },
    {
      title: "YAML, CSV, XML",
      desc: "Convert YAML to JSON, preview CSV files, and minify XML.",
    },
    {
      title: "Tools & Utilities",
      desc: "Text Diff viewer, Checklist/Todo tracker, and more standalone tools.",
    },
    {
      title: "Security & Templates",
      desc: "Encrypt/decrypt text securely, and manage your reusable snippet templates.",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="About DevHub"
    >
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={focusTrapRef}
        className="relative z-[101] w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl ring-1 ring-white/10 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex flex-col gap-1 p-4 md:p-5 border-b border-zinc-800/50 bg-zinc-900/40 rounded-t-xl relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 p-32 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/20 text-emerald-400 p-2 rounded-lg">
                <TerminalSquare className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-100 uppercase tracking-wide flex items-center gap-2">
                  DevHub Guide
                </h2>
                <p className="text-sm text-zinc-400 mt-1">
                  Paste any content and DevHub automatically detects and opens
                  the right tool.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="text-zinc-500 hover:text-white transition-colors bg-zinc-900 hover:bg-zinc-800 p-1.5 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 md:p-6 custom-scrollbar shrink-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5">
            {tools.map((item, i) => (
              <div key={i} className="flex flex-col text-left group">
                <div className="text-zinc-300 font-semibold mb-1 group-hover:text-emerald-400 transition-colors flex items-center gap-2 text-sm">
                  {item.title}
                </div>
                <div className="text-xs text-zinc-500 leading-relaxed font-light">
                  {item.desc}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-800/50 text-center shrink-0">
            <span className="text-xs text-zinc-500 flex items-center justify-center gap-2">
              Developed by{" "}
              <span className="font-medium text-zinc-300 font-mono tracking-widest uppercase">
                Shankar
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
