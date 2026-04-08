import { useEffect } from "react";
import { Keyboard, X } from "lucide-react";

interface ShortcutsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShortcutsDialog({ isOpen, onClose }: ShortcutsDialogProps) {
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

  const shortcuts = [
    {
      category: "General",
      items: [
        { keys: ["Ctrl", "K"], description: "Open Command Palette" },
        { keys: ["Ctrl", "/"], description: "Show Keyboard Shortcuts" },
        { keys: ["Esc"], description: "Clear Content / Close Dialogs" },
        { keys: ["Ctrl", "D"], description: "Download Content" },
        { keys: ["Ctrl", "Shift", "C"], description: "Copy Content" },
      ],
    },
    {
      category: "Editing",
      items: [
        { keys: ["Ctrl", "Z"], description: "Undo" },
        { keys: ["Ctrl", "Y"], description: "Redo" },
        { keys: ["Ctrl", "J"], description: "Format JSON" },
        { keys: ["Ctrl", "S"], description: "Format SQL" },
      ],
    },
    {
      category: "Navigation",
      items: [
        { keys: ["Alt", "1"], description: "Switch to JSON" },
        { keys: ["Alt", "2"], description: "Switch to JWT" },
        { keys: ["Alt", "3"], description: "Switch to SQL" },
        { keys: ["Alt", "4"], description: "Switch to Base64" },
        { keys: ["Alt", "5"], description: "Switch to URL" },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-[101] w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl ring-1 ring-white/10 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-zinc-400" />
            <h2 className="text-sm font-semibold text-zinc-100">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 custom-scrollbar">
          <div className="space-y-6">
            {shortcuts.map((section) => (
              <div key={section.category}>
                <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-3">
                  {section.category}
                </h4>
                <div className="space-y-2">
                  {section.items.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between group"
                    >
                      <span className="text-sm text-zinc-300 group-hover:text-zinc-200 transition-colors">
                        {item.description}
                      </span>
                      <div className="flex items-center gap-1">
                        {item.keys.map((key, k) => (
                          <kbd
                            key={k}
                            className="px-1.5 py-0.5 text-[10px] font-mono font-medium bg-zinc-800 border border-zinc-700 rounded text-zinc-400 min-w-[20px] text-center shadow-sm"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
