import { Command } from "cmdk";
import { useState, useEffect } from "react";
import {
  Braces,
  Key,
  FileJson,
  Download,
  Copy,
  Trash2,
  Code,
  Globe,
  Database,
  Search,
  RotateCcw,
  RotateCw,
  X,
  Sparkles,
} from "lucide-react";
import { ContentType } from "@/lib/detector";
import { useFocusTrap } from "@/hooks/useFocusTrap";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onCommand: (command: string) => void;
  currentType: ContentType;
}

export function CommandPalette({
  isOpen,
  onClose,
  onCommand,
  currentType,
}: CommandPaletteProps) {
  const [search, setSearch] = useState("");
  const focusTrapRef = useFocusTrap(isOpen);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // If closed, open logic is handled by parent, but here this effect is only if rendered?
          // No, isOpen controls unmounting/hiding.
        }
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [isOpen, onClose]);

  // If we rely on parent to mount/unmount, we don't need isOpen check in effect.
  // Actually usually Command.Dialog handles open state if used correctly or we conditionally render it.
  // If we conditionally render <CommandPalette /> only when isOpen, the effect runs on mount.

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <Command
        label="Command Menu"
        ref={focusTrapRef}
        className="relative z-[101] w-full max-w-lg overflow-hidden bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl ring-1 ring-white/10 animate-in fade-in zoom-in-95 duration-200 flex flex-col"
      >
        <div className="flex items-center border-b border-zinc-800 px-3 shrink-0">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50 text-zinc-400" />
          <Command.Input
            value={search}
            onValueChange={setSearch}
            placeholder="Type a command or search..."
            className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-zinc-500 disabled:cursor-not-allowed disabled:opacity-50 text-zinc-100"
            autoFocus
          />
          <button
            onClick={onClose}
            aria-label="Close"
            className="ml-2 p-1 text-zinc-500 hover:text-zinc-300 rounded"
          >
            <kbd className="hidden sm:inline-block text-[10px] font-mono bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700">
              ESC
            </kbd>
            <X className="sm:hidden w-4 h-4" />
          </button>
        </div>

        <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2 custom-scrollbar">
          <Command.Empty className="py-6 text-center text-sm text-zinc-500">
            No results found.
          </Command.Empty>

          {/* Context-Aware Actions */}
          <Command.Group
            heading="Suggested"
            className="text-xs text-zinc-500 font-medium px-2 py-1.5 mb-1"
          >
            {currentType === "json" && (
              <>
                <CommandItem
                  onSelect={() => onCommand("format-json")}
                  icon={Braces}
                >
                  Format JSON
                </CommandItem>
                <CommandItem
                  onSelect={() => onCommand("minify-json")}
                  icon={Braces}
                >
                  Minify JSON
                </CommandItem>
              </>
            )}
            {currentType === "sql" && (
              <CommandItem
                onSelect={() => onCommand("format-sql")}
                icon={Database}
              >
                Format SQL
              </CommandItem>
            )}
            {currentType === "base64" && (
              <CommandItem
                onSelect={() => onCommand("decode-base64")}
                icon={Code}
              >
                Decode Base64
              </CommandItem>
            )}
            {currentType === "jwt" && (
              <CommandItem onSelect={() => onCommand("decode-jwt")} icon={Key}>
                Decode JWT
              </CommandItem>
            )}
            {currentType === "yaml" && (
              <CommandItem
                onSelect={() => onCommand("yaml-to-json")}
                icon={FileJson}
              >
                Convert YAML to JSON
              </CommandItem>
            )}
            <CommandItem
              onSelect={() => onCommand("clear")}
              icon={Trash2}
              shortcut="Esc"
            >
              Clear Content
            </CommandItem>
          </Command.Group>

          <Command.Separator className="h-px bg-zinc-800 my-1 mx-2" />

          <Command.Group
            heading="Transformation Tools"
            className="text-xs text-zinc-500 font-medium px-2 py-1.5 mb-1"
          >
            <CommandItem
              onSelect={() => onCommand("format-json")}
              icon={Braces}
              shortcut="Ctrl+J"
            >
              Format JSON
            </CommandItem>
            <CommandItem
              onSelect={() => onCommand("minify-json")}
              icon={Braces}
            >
              Minify JSON
            </CommandItem>
            <CommandItem
              onSelect={() => onCommand("format-sql")}
              icon={Database}
            >
              Format SQL
            </CommandItem>
            <CommandItem
              onSelect={() => onCommand("base64-encode")}
              icon={Code}
            >
              Base64 Encode
            </CommandItem>
            <CommandItem
              onSelect={() => onCommand("base64-decode")}
              icon={Code}
            >
              Base64 Decode
            </CommandItem>
            <CommandItem onSelect={() => onCommand("url-encode")} icon={Globe}>
              URL Encode
            </CommandItem>
            <CommandItem onSelect={() => onCommand("url-decode")} icon={Globe}>
              URL Decode
            </CommandItem>
            <CommandItem
              onSelect={() => onCommand("yaml-to-json")}
              icon={FileJson}
            >
              YAML to JSON
            </CommandItem>
          </Command.Group>

          <Command.Separator className="h-px bg-zinc-800 my-1 mx-2" />

          <Command.Group
            heading="Actions"
            className="text-xs text-zinc-500 font-medium px-2 py-1.5 mb-1"
          >
            <CommandItem
              onSelect={() => onCommand("copy")}
              icon={Copy}
              shortcut="Ctrl+Shift+C"
            >
              Copy Content
            </CommandItem>
            <CommandItem
              onSelect={() => onCommand("download")}
              icon={Download}
              shortcut="Ctrl+D"
            >
              Download File
            </CommandItem>
            <CommandItem
              onSelect={() => onCommand("undo")}
              icon={RotateCcw}
              shortcut="Ctrl+Z"
            >
              Undo
            </CommandItem>
            <CommandItem
              onSelect={() => onCommand("redo")}
              icon={RotateCw}
              shortcut="Ctrl+Y"
            >
              Redo
            </CommandItem>
            <CommandItem
              onSelect={() => onCommand("clear")}
              icon={Trash2}
              shortcut="Esc"
            >
              Clear All
            </CommandItem>
          </Command.Group>

          <Command.Separator className="h-px bg-zinc-800 my-1 mx-2" />

          <Command.Group
            heading="View"
            className="text-xs text-zinc-500 font-medium px-2 py-1.5 mb-1"
          >
            <CommandItem onSelect={() => onCommand("view-raw")} icon={FileJson}>
              Raw View
            </CommandItem>
            {currentType === "json" && (
              <>
                <CommandItem
                  onSelect={() => onCommand("view-tree")}
                  icon={FileJson}
                >
                  Tree View
                </CommandItem>
                {/* <CommandItem onSelect={() => onCommand('view-table')} icon={FileJson}>Table View</CommandItem> */}
              </>
            )}
            {(currentType === "html" || currentType === "markdown") && (
              <CommandItem
                onSelect={() => onCommand("toggle-preview")}
                icon={Globe}
              >
                Toggle Preview
              </CommandItem>
            )}
            <CommandItem
              onSelect={() => onCommand("toggle-diff")}
              icon={Sparkles}
            >
              Toggle Diff Mode
            </CommandItem>
            <CommandItem
              onSelect={() => onCommand("toggle-todo")}
              icon={RotateCcw}
            >
              Toggle Todo Mode
            </CommandItem>
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}

function CommandItem({
  children,
  onSelect,
  icon: Icon,
  shortcut,
}: {
  children: React.ReactNode;
  onSelect: () => void;
  icon?: React.ElementType;
  shortcut?: string;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 rounded-md aria-selected:bg-zinc-800 aria-selected:text-white cursor-pointer transition-colors"
    >
      {Icon && <Icon className="w-4 h-4 text-zinc-500" />}
      <span>{children}</span>
      {shortcut && (
        <span className="ml-auto text-xs text-zinc-600 font-mono">
          {shortcut}
        </span>
      )}
    </Command.Item>
  );
}
