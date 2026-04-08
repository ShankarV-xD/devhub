import React, { useMemo } from "react";
import clsx from "clsx";
import { CheckCircle2, Loader2 } from "lucide-react";
import Tooltip from "../Tooltip";

interface ToolButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: "default" | "danger";
  size?: "sm" | "md" | "lg";
  shortcut?: string;
  className?: string;
  isActive?: boolean;
  lastUsedTimestamp?: number;
  showTooltip?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  title?: string;
}

function formatTimeAgo(timestamp: number) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function ToolButton({
  icon,
  label,
  onClick,
  variant = "default",
  size = "md",
  shortcut,
  className,
  isActive = false,
  lastUsedTimestamp,
  showTooltip = true,
  isLoading = false,
  disabled = false,
  title,
}: ToolButtonProps) {
  const tooltipText = useMemo(
    () =>
      lastUsedTimestamp
        ? `Last used ${formatTimeAgo(lastUsedTimestamp)}`
        : undefined,
    [lastUsedTimestamp]
  );

  const finalTooltipText = title || tooltipText;

  const sizeClasses = {
    sm: "px-3 py-2 text-xs",
    md: "px-4 py-3 text-sm",
    lg: "px-5 py-4 text-base",
  };

  const iconSize = size === "sm" ? 14 : size === "lg" ? 20 : 16;

  const button = (
    <button
      onClick={onClick}
      disabled={isLoading || disabled}
      aria-label={label}
      title={title} // Fallback title attribute if tooltip is disabled or for accessibility
      className={clsx(
        "flex items-center justify-center sm:justify-start gap-3 rounded-lg font-medium transition-all duration-200 active:scale-95 cursor-pointer group relative break-keep whitespace-nowrap",
        sizeClasses[size],
        variant === "danger"
          ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 border border-transparent hover:border-red-900/50"
          : isActive
            ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-800 hover:border-emerald-700"
            : "bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-700",
        (isLoading || disabled) && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {isActive && !isLoading && (
        <div className="absolute top-1 right-1">
          <CheckCircle2 size={12} className="text-emerald-500" />
        </div>
      )}
      {isLoading ? (
        <Loader2 size={iconSize} className="animate-spin text-zinc-500" />
      ) : React.isValidElement(icon) ? (
        React.cloneElement(
          icon as React.ReactElement<Record<string, unknown>>,
          {
            size: (icon.props as { size?: number }).size || iconSize,
            strokeWidth:
              (icon.props as { strokeWidth?: number }).strokeWidth || 2,
          }
        )
      ) : (
        icon
      )}
      <span className="flex-1 text-left whitespace-nowrap">{label}</span>
      {shortcut && !isLoading && (
        <span className="px-1.5 py-0.5 bg-black/20 rounded text-[10px] text-zinc-500 font-mono">
          {shortcut}
        </span>
      )}
    </button>
  );

  return showTooltip && finalTooltipText ? (
    <Tooltip text={finalTooltipText}>{button}</Tooltip>
  ) : (
    button
  );
}
