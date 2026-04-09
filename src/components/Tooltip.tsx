import React, { useState, useRef, useEffect, useCallback } from "react";

interface TooltipProps {
  text: string | React.ReactNode;
  children: React.ReactNode;
  delay?: number;
  maxWidth?: string;
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
  text,
  children,
  delay = 300,
  maxWidth = "200px",
  className = "",
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [placement, setPlacement] = useState<"top" | "bottom">("top");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const showTooltip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const vw = window.innerWidth;
        const estimatedHeight = 32;
        const gap = 8;

        const preferTop = rect.top > estimatedHeight + gap;

        let top: number;
        let p: "top" | "bottom";

        if (preferTop) {
          top = rect.top - gap;
          p = "top";
        } else {
          top = rect.bottom + gap;
          p = "bottom";
        }

        const left = Math.max(
          60,
          Math.min(rect.left + rect.width / 2, vw - 60)
        );

        setPosition({ top, left });
        setPlacement(p);
        setIsVisible(true);
      }
    }, delay);
  }, [delay]);

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className={`inline-block focus:outline-none ${className}`}
      >
        {children}
      </div>
      {isVisible && (
        <div
          ref={tooltipRef}
          className="fixed z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-200"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            transform:
              placement === "top"
                ? "translate(-50%, -100%)"
                : "translate(-50%, 0)",
            maxWidth,
          }}
        >
          <div className="bg-zinc-800 text-zinc-100 text-xs font-medium px-2 py-1 rounded shadow-lg border border-zinc-700 whitespace-normal text-center">
            {text}
          </div>
          <div
            className={`absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-800 rotate-45 ${
              placement === "top"
                ? "bottom-0 translate-y-1/2 border-r border-b border-zinc-700"
                : "top-0 -translate-y-1/2 border-l border-t border-zinc-700"
            }`}
          />
        </div>
      )}
    </>
  );
};

export default Tooltip;
