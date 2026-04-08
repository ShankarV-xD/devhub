"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { HttpMethod } from "./types";

interface MethodSelectorProps {
  value: HttpMethod;
  onChange: (method: HttpMethod) => void;
}

const METHODS: HttpMethod[] = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "HEAD",
  "OPTIONS",
];

/** Per-method color tokens: trigger text + dropdown item accent */
const METHOD_STYLES: Record<
  HttpMethod,
  { text: string; bg: string; dot: string }
> = {
  GET:     { text: "text-emerald-400", bg: "hover:bg-emerald-500/10", dot: "bg-emerald-500" },
  POST:    { text: "text-amber-400",   bg: "hover:bg-amber-500/10",   dot: "bg-amber-500"   },
  PUT:     { text: "text-blue-400",    bg: "hover:bg-blue-500/10",    dot: "bg-blue-500"    },
  PATCH:   { text: "text-violet-400",  bg: "hover:bg-violet-500/10",  dot: "bg-violet-500"  },
  DELETE:  { text: "text-red-400",     bg: "hover:bg-red-500/10",     dot: "bg-red-500"     },
  HEAD:    { text: "text-sky-400",     bg: "hover:bg-sky-500/10",     dot: "bg-sky-500"     },
  OPTIONS: { text: "text-zinc-400",    bg: "hover:bg-zinc-500/10",    dot: "bg-zinc-500"    },
};

export function MethodSelector({ value, onChange }: MethodSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const styles = METHOD_STYLES[value];

  return (
    <div ref={ref} className="relative flex-shrink-0">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`
          flex items-center gap-2 h-full px-4 py-2
          bg-zinc-900 hover:bg-zinc-800
          border border-zinc-800 rounded-l-lg
          text-sm font-bold tracking-wider
          transition-colors cursor-pointer select-none
          ${styles.text}
          ${open ? "bg-zinc-800 border-zinc-700" : ""}
        `}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {/* Colored dot */}
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${styles.dot}`} />
        {value}
        <ChevronDown
          size={14}
          className={`text-zinc-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          role="listbox"
          className="
            absolute left-0 top-full mt-1 z-50
            w-36
            bg-zinc-900 border border-zinc-800
            rounded-lg shadow-2xl shadow-black/60
            overflow-hidden
            animate-in fade-in slide-in-from-top-1 duration-100
          "
        >
          {METHODS.map((method) => {
            const s = METHOD_STYLES[method];
            const isActive = method === value;
            return (
              <button
                key={method}
                role="option"
                aria-selected={isActive}
                type="button"
                onClick={() => {
                  onChange(method);
                  setOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5
                  text-sm font-semibold tracking-wide
                  transition-colors cursor-pointer text-left
                  ${s.text} ${s.bg}
                  ${isActive ? "bg-white/5" : ""}
                `}
              >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
                {method}
                {isActive && (
                  <span className="ml-auto text-[10px] font-normal text-zinc-600">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
