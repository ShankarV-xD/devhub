import { clsx } from "clsx";
import { ReactNode } from "react";

interface ToolButtonProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  variant?: "default" | "danger";
  shortcut?: string;
  className?: string;
  "aria-label"?: string;
}

export function ToolButton({
  icon,
  label,
  onClick,
  variant = "default",
  shortcut,
  className,
  "aria-label": ariaLabel,
}: ToolButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel || label}
      className={clsx(
        "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 active:scale-95 w-full cursor-pointer group",
        variant === "danger"
          ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 border border-transparent hover:border-red-900/50"
          : "bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-700",
        className
      )}
    >
      {icon}
      <span className="flex-1 text-left whitespace-nowrap">{label}</span>
      {shortcut && (
        <span className="px-1.5 py-0.5 bg-black/20 rounded text-[10px] text-zinc-500 font-mono">
          {shortcut}
        </span>
      )}
    </button>
  );
}
