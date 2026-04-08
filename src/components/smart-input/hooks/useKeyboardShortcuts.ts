import { useEffect } from "react";
import { ContentType } from "@/lib/detector";

export interface KeyboardShortcutHandlers {
  // History
  onUndo?: () => void;
  onRedo?: () => void;

  // Formatting
  onFormatJson?: () => void;
  onFormatSql?: () => void;
  onMinifyJson?: () => void;

  // Encoding/Decoding
  onBase64Encode?: () => void;
  onBase64Decode?: () => void;
  onUrlEncode?: () => void;
  onUrlDecode?: () => void;

  // Conversions
  onYamlToJson?: () => void;

  // Actions
  onCopy?: () => void;
  onDownload?: () => void;
  onClear?: () => void;
  onToggleShortcuts?: () => void;
  onQuickSwitch?: (index: number) => void;
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  activeView?: "editor" | "todo" | "api";
  type?: ContentType;
  hasContent?: boolean;
}

export function useKeyboardShortcuts(
  handlers: KeyboardShortcutHandlers,
  options: UseKeyboardShortcutsOptions = {}
) {
  const {
    enabled = true,
    activeView = "editor",
    type = "text",
    hasContent = false,
  } = options;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isModKey = e.ctrlKey || e.metaKey;

      // Ctrl+Z - Undo
      if (isModKey && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        handlers.onUndo?.();
        return;
      }

      // Ctrl+Y or Ctrl+Shift+Z - Redo
      if (
        (isModKey && e.key.toLowerCase() === "y") ||
        (isModKey && e.shiftKey && e.key.toLowerCase() === "z")
      ) {
        e.preventDefault();
        handlers.onRedo?.();
        return;
      }

      // Ctrl+J - Format JSON
      if (isModKey && e.key.toLowerCase() === "j") {
        e.preventDefault();
        if (activeView === "editor" && type === "json") {
          handlers.onFormatJson?.();
        }
        return;
      }

      // Ctrl+S - Format SQL
      if (isModKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (activeView === "editor" && type === "sql") {
          handlers.onFormatSql?.();
        }
        return;
      }

      // Ctrl+Shift+C - Copy content
      if (isModKey && e.shiftKey && e.key.toLowerCase() === "c") {
        e.preventDefault();
        if (hasContent && activeView === "editor") {
          handlers.onCopy?.();
        }
        return;
      }

      // Escape - Clear content
      if (e.key === "Escape") {
        if (hasContent && activeView === "editor") {
          handlers.onClear?.();
        }
        return;
      }

      // Ctrl+D - Download/Export content
      if (isModKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        if (hasContent && activeView === "editor") {
          handlers.onDownload?.();
        }
        return;
      }

      // Ctrl+/ - Toggle Shortcuts
      if (isModKey && e.key === "/") {
        e.preventDefault();
        handlers.onToggleShortcuts?.();
        return;
      }

      // Alt+Number - Quick Switch
      if (e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        const num = parseInt(e.key);
        if (!isNaN(num) && num >= 1 && num <= 9) {
          e.preventDefault();
          handlers.onQuickSwitch?.(num);
          return;
        }
      }

      // Number keys 1-5 for quick tool access (only when no modifiers)
      if (!isModKey && !e.shiftKey && !e.altKey && activeView === "editor") {
        // JSON shortcuts
        if (type === "json") {
          if (e.key === "1") {
            e.preventDefault();
            handlers.onFormatJson?.();
          } else if (e.key === "2") {
            e.preventDefault();
            handlers.onMinifyJson?.();
          }
        }

        // SQL shortcuts
        if (type === "sql" && e.key === "2") {
          e.preventDefault();
          handlers.onFormatSql?.();
        }

        // Base64 shortcuts
        if (type === "base64") {
          if (e.key === "2") {
            e.preventDefault();
            handlers.onBase64Encode?.();
          } else if (e.key === "3") {
            e.preventDefault();
            handlers.onBase64Decode?.();
          }
        }

        // YAML shortcuts
        if (type === "yaml" && e.key === "1") {
          e.preventDefault();
          handlers.onYamlToJson?.();
        }

        // URL shortcuts
        if (type === "url") {
          if (e.key === "1") {
            e.preventDefault();
            handlers.onUrlEncode?.();
          } else if (e.key === "2") {
            e.preventDefault();
            handlers.onUrlDecode?.();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, activeView, type, hasContent, handlers]);
}
