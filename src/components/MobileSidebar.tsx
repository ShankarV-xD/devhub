import { Menu, X } from "lucide-react";
import { clsx } from "clsx";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useEffect, useRef } from "react";

interface MobileMenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export function MobileMenuButton({ isOpen, onClick }: MobileMenuButtonProps) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden fixed top-4 right-4 z-50 p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
      aria-label={isOpen ? "Close menu" : "Open menu"}
    >
      {isOpen ? <X size={20} /> : <Menu size={20} />}
    </button>
  );
}

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function MobileSidebar({
  isOpen,
  onClose,
  children,
}: MobileSidebarProps) {
  const sidebarRef = useFocusTrap(isOpen);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Mobile Backdrop - Only on mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Mobile Sidebar - slides in on mobile */}
      <nav
        ref={sidebarRef}
        className={clsx(
          "lg:hidden fixed top-0 right-0 bottom-0 w-80 bg-zinc-950 border-l border-zinc-900 z-40 transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        aria-label="Sidebar navigation"
      >
        {children}
      </nav>

      {/* Desktop Sidebar - always visible on desktop */}
      <nav className="hidden lg:block" aria-label="Sidebar navigation">
        {children}
      </nav>
    </>
  );
}
