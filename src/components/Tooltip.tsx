import React, { useState, useRef, useEffect } from "react";

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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setPosition({
          top: rect.top - 8,
          left: rect.left + rect.width / 2,
        });
      }
      setIsVisible(true);
    }, delay);
  };

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
          className="fixed z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-200"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            transform: "translate(-50%, -100%)",
            maxWidth,
          }}
        >
          <div className="bg-zinc-800 text-zinc-100 text-xs font-medium px-2 py-1 rounded shadow-lg border border-zinc-700 whitespace-normal text-center">
            {text}
          </div>
          <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-zinc-800 border-r border-b border-zinc-700" />
        </div>
      )}
    </>
  );
};

export default Tooltip;
