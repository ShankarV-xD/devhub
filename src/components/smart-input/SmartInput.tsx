"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { detectType } from "@/lib/detector";
import { Logo } from "@/components/Logo";
import { useSwipeable } from "react-swipeable";
import { haptics } from "@/utils/haptics";
import { useKeyboardHeight } from "@/hooks/useKeyboardHeight";
import {
  AlertTriangle,
  ArrowDown,
  Trash2,
  RotateCcw,
  RotateCw,
  History,
  Upload,
  Link2,
  Braces,
  FileSpreadsheet,
  FileJson,
  Database,
  Type,
  Regex,
  Code,
  Fingerprint,
  Palette,
  FileCode,
  ListTodo,
  Globe,
  FileDiff,
  Key,
  Clock,
  Sparkles,
  Info,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import clsx from "clsx";
import { useUrlState } from "@/hooks/useUrlState";
import { useDebounce } from "@/hooks/useDebounce";
import { addToHistory } from "@/lib/history";
import { HistoryPanel } from "./HistoryPanel";
import { CommandPalette } from "./CommandPalette";
import { ShortcutsDialog } from "./ShortcutsDialog";
import { AboutModal } from "./AboutModal";
// Heavy libraries are lazy-loaded now: sql-formatter, yaml

import {
  getTypeColor,
  UI_COLORS,
  QUICK_SWITCH_TOOLS,
  VIEW_TRANSITION_MS,
  URL_SAVE_DELAY_MS,
  AUTO_SAVE_DELAY_MS,
  HISTORY_MIN_LENGTH,
  FOCUS_DELAY_MS,
} from "@/lib/constants";
import { EditorSkeleton } from "../Skeleton";
import { ErrorBoundary } from "../ErrorBoundary";
import { ToolErrorBoundary } from "../ToolErrorBoundary";
import DiffViewer from "../DiffViewer";
import { MobileMenuButton } from "../MobileSidebar";
import TodoTool, { Todo } from "../TodoTool";
import { checkContentSize } from "@/lib/sizeValidation";
import {
  getDownloadFilename,
  downloadContent,
  getMimeType,
} from "@/lib/downloadHelpers";

import {
  JsonRenderer,
  ColorRenderer,
  CronRenderer,
  HtmlRenderer,
  MarkdownRenderer,
  TimestampRenderer,
  CsvRenderer,
  IpRenderer,
} from "./renderers";
import Tooltip from "../Tooltip";
import { ApiBuilder } from "../ApiBuilder";
import { EncryptionTools } from "../EncryptionTools";
import { TemplateManager } from "../TemplateManager";

// import { analytics } from "@/lib/analytics"; // TODO: Add tracking events to tools

// Import extracted hooks
import {
  useHistory,
  useDetection,
  useKeyboardShortcuts,
  useContentStats,
  useFileDrop,
} from "./hooks";
import { WelcomeScreen } from "./WelcomeScreen";
import { ToolsSidebar } from "./ToolsSidebar";
import { ToolActionsBar } from "./ToolActionsBar";

// Lazy load heavy components
const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <EditorSkeleton />,
});

const TOOL_DESCRIPTIONS: Record<string, string> = {
  text: "Plain text editor. Type anything or paste content to auto-detect its type.",
  json: "Valid JSON detected. Use the tools to format, minify, or inspect the data structure.",
  jwt: "JSON Web Token detected. Decode the payload and verify the signature.",
  base64:
    "Base64 encoded string detected. Decode it to view the original content.",
  regex: "Regular Expression detected. Test matches against sample text.",
  code: "Code snippet detected. Syntax highlighting enabled for better readability.",
  uuid: "UUID detected. Validate its version and variant.",
  hash: "Hash string detected. Identify the algorithm (MD5, SHA-256, etc.).",
  sql: "SQL query detected. Format and beautify your SQL queries.",
  url: "URL detected. Shorten links using TinyURL or parse query parameters.",
  color: "Color code detected. Picker and format conversion available.",
  html: "HTML content detected. Preview and minify options available.",
  css: "CSS detected. Minify or format your stylesheets.",
  markdown: "Markdown content detected. Preview the formatted document.",
  cron: "Cron expression detected. Schedule explanation provided.",
  yaml: "YAML configuration data detected.",
  timestamp: "Date and time conversion tools.",
  csv: "CSV data detected. Preview as table or convert to JSON.",
  xml: "XML content detected. Format, minify, or convert.",
  graphql: "GraphQL query format and validation.",
  todo: "Checklist management tool.",
  diff: "Text comparison tool.",
  ascii: "ASCII Art Text Banner Generator.",
};

const TYPE_ICONS = {
  json: FileJson,
  sql: Database,
  text: Type,
  regex: Regex,
  code: Code,
  uuid: Fingerprint,
  hash: Fingerprint,
  url: Link2,
  color: Palette,
  html: FileCode,
  markdown: FileCode,
  cron: History,
  yaml: ListTodo,
  diff: FileDiff,
  jwt: Key,
  base64: Type,
  timestamp: Clock,
  csv: FileSpreadsheet,
  xml: Braces,
  graphql: Code,
  todo: ListTodo,
  ascii: Sparkles,
  css: FileCode,
};

interface SmartInputProps {
  initialContent?: string;
  onContentChange?: (content: string) => void;
}

export default function SmartInput({
  initialContent = "",
  onContentChange,
}: SmartInputProps) {
  const {
    state: urlContent,
    setUrlState: setUrlContent,
    isLoaded,
    urlOverflow,
  } = useUrlState("");

  // State
  const [content, setContent] = useState(initialContent);
  const [sizeWarning, setSizeWarning] = useState<string | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [activeView, setActiveView] = useState<"editor" | "todo" | "api">(
    "editor"
  );

  // Sync content updates
  const handleContentChange = useCallback(
    (newContent: string) => {
      setContent(newContent);
      onContentChange?.(newContent);
    },
    [onContentChange]
  );

  // View Mode Transition State (D5)
  type ViewMode = "raw" | "tree" | "table";
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleViewChange = (newMode: ViewMode) => {
    if (newMode === viewMode) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setViewMode(newMode);
      setIsTransitioning(false);
    }, VIEW_TRANSITION_MS);
  };

  // Sync initial content updates (e.g. tab switch)
  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  // Disable URL state if using controlled mode (multi-tab)
  const isControlled = !!onContentChange;
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const [isDiffMode, setIsDiffMode] = useState(false);
  const [diffOriginal, setDiffOriginal] = useState("");
  // msg state removed in favor of sonner
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShortcutsDialogOpen, setIsShortcutsDialogOpen] = useState(false);
  const [isEncryptionOpen, setIsEncryptionOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Reversibility State
  const [lastTransform, setLastTransform] = useState<{
    type: string;
    original: string;
  } | null>(null);
  const [jwtOriginal, setJwtOriginal] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<{
    focus: () => void;
  } | null>(null);

  // ===== EXTRACTED HOOKS =====

  // 1. History management (undo/redo)
  const {
    undo: handleUndo,
    redo: handleRedo,
    canUndo,
    canRedo,
  } = useHistory(content, handleContentChange, {
    maxHistorySize: 20,
    onUndo: () => toast.success("Undone"),
    onRedo: () => toast.success("Redone"),
  });

  // 2. Type detection with debouncing
  const {
    type,
    setType,
    viewMode,
    setViewMode,
    parsedJson,
    message: detectionMsg,
  } = useDetection(content);

  // 3. Content statistics (memoized)
  const contentStats = useContentStats(content);

  // Sync detection messages with toast
  useEffect(() => {
    if (detectionMsg) {
      if (detectionMsg.type === "error") toast.error(detectionMsg.text);
      else toast.success(detectionMsg.text);
    }
  }, [detectionMsg]);

  // Reset preview mode when type changes
  useEffect(() => {
    setIsPreviewMode(false);
  }, [type]);

  // Load from URL (Exclusive: Either Text OR Todos)
  useEffect(() => {
    if (isLoaded && urlContent) {
      try {
        // Try parsing assuming it might be a Todo List (JSON Array of Todos)
        const parsed = JSON.parse(urlContent);
        if (
          Array.isArray(parsed) &&
          parsed.length > 0 &&
          "completed" in parsed[0]
        ) {
          // It's a Todo List!
          setTodos(parsed as Todo[]);
          setActiveView("todo");
          setContent(""); // Clear editor content as per user request (one at a time)
          return;
        }
      } catch {
        // Not a Todo List, treat as Text
      }

      // Fallback: It's just text content
      if (!isControlled) {
        handleContentChange(urlContent);
        setActiveView("editor");
      }
    }
  }, [isLoaded, urlContent, isControlled, handleContentChange]);

  useEffect(() => {
    if (content) {
      const sizeCheck = checkContentSize(content);
      if (sizeCheck.warning) {
        setSizeWarning(sizeCheck.warning);
      } else {
        setSizeWarning(null);
      }
      if (!sizeCheck.allowed) {
        toast.error(sizeCheck.error || "Content too large");
      }
    } else {
      setSizeWarning(null);
    }
  }, [content]);

  // Save to URL (Exclusive: Either Text OR Todos)
  useEffect(() => {
    if (!isLoaded || isControlled) return;
    const timer = setTimeout(() => {
      if (activeView === "todo") {
        if (todos.length > 0) {
          setUrlContent(JSON.stringify(todos));
        } else {
          setUrlContent("");
        }
      } else {
        setUrlContent(content);
      }
    }, URL_SAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [content, todos, activeView, setUrlContent, isLoaded, isControlled]);

  // Warn when content exceeds URL length limits
  useEffect(() => {
    if (urlOverflow) {
      toast.warning(
        "Content too large to share via URL. Use copy/paste instead."
      );
    }
  }, [urlOverflow]);

  // Auto-save to persistent history (U2)
  const debouncedContent = useDebounce(content, AUTO_SAVE_DELAY_MS);
  useEffect(() => {
    if (
      debouncedContent &&
      debouncedContent.length >= HISTORY_MIN_LENGTH &&
      activeView === "editor"
    ) {
      // The type might be "text" initially if detector hasn't run yet,
      // but normally it runs fast. We use the current 'type' from state which is up to date
      // because efficient detection hooks update it.
      addToHistory(debouncedContent, type);
    }
  }, [debouncedContent, activeView, type]);

  // Auto-dismiss messages logic removed (handled by sonner)

  const handleClear = () => {
    if (activeView === "todo") {
      setTodos([]);
      toast.success("Todo list cleared");
      return;
    }
    handleContentChange("");
    setType("text");
    setViewMode("raw");
    setLastTransform(null);
    setJwtOriginal(null);
    setIsPreviewMode(false);
    toast.success("Content cleared");

    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  // ===== KEYBOARD SHORTCUT HANDLERS =====

  // Handler functions for keyboard shortcuts
  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(content);
      setContent(JSON.stringify(parsed, null, 2));
      setViewMode("raw");
      toast.success("JSON Formatted");
    } catch {
      toast.error("Invalid JSON");
    }
  };

  const handleMinifyJson = () => {
    try {
      const parsed = JSON.parse(content);
      setContent(JSON.stringify(parsed));
      setViewMode("raw");
      toast.success("JSON Minified");
    } catch {
      toast.error("Invalid JSON");
    }
  };

  const handleFormatSql = async () => {
    toast.promise(
      async () => {
        const { format } = await import("sql-formatter");
        const formatted = format(content);
        handleContentChange(formatted);
        return "SQL Formatted";
      },
      {
        loading: "Formatting SQL...",
        success: (msg) => msg,
        error: (error: unknown) => {
          let errorMsg = "Invalid SQL";
          if (error instanceof Error && error?.message) {
            const lineMatch = error.message.match(/line (\d+)/i);
            if (lineMatch) {
              errorMsg = `SQL Error at Line ${lineMatch[1]}`;
            } else if (error.message.length < 80) {
              errorMsg = `SQL: ${error.message}`;
            }
          }
          return errorMsg;
        },
      }
    );
  };

  const handleBase64Encode = () => {
    try {
      handleContentChange(btoa(content));
      toast.success("Base64 Encoded");
    } catch {
      toast.error("Encoding failed");
    }
  };

  const handleBase64Decode = () => {
    try {
      handleContentChange(atob(content));
      toast.success("Base64 Decoded");
    } catch {
      toast.error("Decoding failed");
    }
  };

  const handleUrlEncode = () => {
    handleContentChange(encodeURIComponent(content));
    toast.success("URL Encoded");
  };

  const handleUrlDecode = () => {
    try {
      handleContentChange(decodeURIComponent(content));
      toast.success("URL Decoded");
    } catch {
      toast.error("Decoding failed");
    }
  };

  const handleYamlToJson = async () => {
    toast.promise(
      async () => {
        const YAML = (await import("yaml")).default;
        const parsed = YAML.parse(content);
        const jsonStr = JSON.stringify(parsed, null, 2);
        handleContentChange(jsonStr);
        setType(detectType(jsonStr));
        return "Converted to JSON";
      },
      {
        loading: "Converting YAML...",
        success: (msg) => msg,
        error: "Invalid YAML",
      }
    );
  };

  const handleLoadExample = async (
    exampleType:
      | "json"
      | "jwt"
      | "sql"
      | "base64"
      | "regex"
      | "url"
      | "html"
      | "yaml"
  ) => {
    const { EXAMPLES } = await import("@/lib/examples");
    handleContentChange(EXAMPLES[exampleType]);
    // Focus the textarea after loading
    setTimeout(() => {
      editorRef.current?.focus();
    }, FOCUS_DELAY_MS);
  };

  const handleCopyShortcut = () => {
    navigator.clipboard.writeText(content);
    haptics.success();
    toast.success("Copied to clipboard");
  };

  const handleDownloadShortcut = () => {
    const filename = getDownloadFilename(type);
    const mimeType = getMimeType(type);
    downloadContent(content, filename, mimeType);
    toast.success(`Downloaded as ${filename}`);
  };

  // M6: Upgraded share to use native Web Share API (with URL clipboard fallback)
  const handleShare = async () => {
    if (!content) {
      toast.error("No content to share");
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: "DevHub Content",
          text: content.slice(0, 200),
          url: window.location.href,
        });
        haptics.success();
        toast.success("Shared successfully!");
      } catch (error: unknown) {
        // User cancelled — not an error
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Share failed:", error);
          // Fall through to clipboard fallback
          try {
            await navigator.clipboard.writeText(window.location.href);
            haptics.light();
            toast.success("Link copied to clipboard!");
          } catch {
            toast.error("Failed to share or copy link");
          }
        }
      }
    } else {
      // Fallback: copy current URL to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        haptics.light();
        toast.success("Shareable link copied to clipboard!");
      } catch {
        toast.error("Failed to copy link");
      }
    }
  };

  const handleToggleShortcuts = () => {
    setIsShortcutsDialogOpen((prev) => !prev);
  };

  const handleQuickSwitch = (index: number) => {
    // 1-5 keys map to common tools
    const toolMapping = QUICK_SWITCH_TOOLS;
    if (index >= 1 && index <= toolMapping.length) {
      const newType = toolMapping[index - 1];
      if (newType !== type) {
        setType(newType);
        setActiveView("editor");
        toast.success(`Switched to ${newType.toUpperCase()}`);
      }
    }
  };

  // File Drop Hook
  const { isDragging, dragHandlers } = useFileDrop({
    onFileLoad: (txt) => {
      handleContentChange(txt);
      // Auto-focus after drop
      setTimeout(() => {
        editorRef.current?.focus();
      }, FOCUS_DELAY_MS);
    },
    enabled: activeView === "editor",
  });

  // Integrate keyboard shortcuts hook
  useKeyboardShortcuts(
    {
      onUndo: handleUndo,
      onRedo: handleRedo,
      onFormatJson: handleFormatJson,
      onFormatSql: handleFormatSql,
      onMinifyJson: handleMinifyJson,
      onBase64Encode: handleBase64Encode,
      onBase64Decode: handleBase64Decode,
      onUrlEncode: handleUrlEncode,
      onUrlDecode: handleUrlDecode,
      onYamlToJson: handleYamlToJson,
      onCopy: handleCopyShortcut,
      onDownload: handleDownloadShortcut,
      onClear: handleClear,
      onToggleShortcuts: handleToggleShortcuts,
      onQuickSwitch: handleQuickSwitch,
    },
    {
      enabled: true,
      activeView,
      type,
      hasContent: !!content,
    }
  );

  // Command Palette Keyboard Shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleCommand = (command: string) => {
    setIsCommandPaletteOpen(false);

    switch (command) {
      case "format-json":
        handleFormatJson();
        break;
      case "minify-json":
        handleMinifyJson();
        break;
      case "format-sql":
        handleFormatSql();
        break;
      case "base64-encode":
        handleBase64Encode();
        break;
      case "base64-decode":
        handleBase64Decode();
        break;
      case "url-encode":
        handleUrlEncode();
        break;
      case "url-decode":
        handleUrlDecode();
        break;
      case "yaml-to-json":
        handleYamlToJson();
        break;
      case "copy":
        handleCopy();
        break;
      case "download":
        handleDownloadShortcut();
        break;
      case "clear":
        handleClear();
        break;
      case "undo":
        if (canUndo) handleUndo();
        break;
      case "redo":
        if (canRedo) handleRedo();
        break;
      case "toggle-diff":
        if (isDiffMode) {
          setIsDiffMode(false);
        } else {
          setDiffOriginal(content);
          setIsDiffMode(true);
        }
        break;
      case "toggle-todo":
        if (activeView === "todo") setActiveView("editor");
        else setActiveView("todo");
        break;
      case "toggle-preview":
        setIsPreviewMode((prev) => !prev);
        break;
      case "view-raw":
        handleViewChange("raw");
        break;
      case "view-tree":
        handleViewChange("tree");
        break;
      case "decode-jwt":
        // Not a direct function, but typically handled by type detection or dedicated tool.
        // If content is JWT, it's auto-detected. If users force it?
        // Maybe we just setType('jwt')?
        setType("jwt");
        break;
    }
  };

  // ── M3/M4/M5: Mobile hooks — MUST be called before any early returns (Rules of Hooks) ──

  // M3: Keyboard-aware layout
  const keyboardHeight = useKeyboardHeight();

  // M4: Swipe gestures for JSON view mode tabs
  const views: Array<"raw" | "tree" | "table"> = ["raw", "tree", "table"];
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (type === "json" && parsedJson) {
        const currentIndex = views.indexOf(viewMode);
        if (currentIndex < views.length - 1) {
          handleViewChange(views[currentIndex + 1]);
          haptics.light();
        }
      }
    },
    onSwipedRight: () => {
      if (type === "json" && parsedJson) {
        const currentIndex = views.indexOf(viewMode);
        if (currentIndex > 0) {
          handleViewChange(views[currentIndex - 1]);
          haptics.light();
        }
      }
    },
    preventScrollOnSwipe: true,
    trackMouse: false, // touch only
  });

  // M5: Pull-to-refresh prevention (JS layer on top of CSS)
  useEffect(() => {
    let startY = 0;

    const prevent = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "TEXTAREA" ||
        target.closest(".editor-container")
      ) {
        if (e.touches.length !== 1) return;
        const touch = e.touches[0];
        const currentY = touch.clientY;

        if (e.type === "touchstart") {
          startY = currentY;
        } else if (e.type === "touchmove") {
          const deltaY = currentY - startY;
          const scrollTop = (target as HTMLElement).scrollTop || 0;
          // Prevent pull-to-refresh only when at the top of the scroll
          if (deltaY > 0 && scrollTop === 0) {
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener("touchstart", prevent, { passive: false });
    document.addEventListener("touchmove", prevent, { passive: false });

    return () => {
      document.removeEventListener("touchstart", prevent);
      document.removeEventListener("touchmove", prevent);
    };
  }, []);

  // M2: Haptic feedback on copy
  const handleCopy = () => {
    if (activeView === "todo") {
      const text = todos
        .map((t) => `${t.completed ? "[x]" : "[ ]"} ${t.text}`)
        .join("\n");
      navigator.clipboard.writeText(text);
    } else {
      navigator.clipboard.writeText(content);
    }
    haptics.success();
    toast.success("Copied to clipboard");
  };

  return (
    <main
      id="main-content"
      role="main"
      className="flex w-full h-screen bg-white dark:bg-black overflow-hidden font-sans relative app-container"
      {...dragHandlers}
    >
      {isDragging && (
        <div className="absolute inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm border-2 border-dashed border-emerald-500 m-4 rounded-xl animate-in fade-in duration-200 pointer-events-none">
          <div className="text-center">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Upload className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Drop file to load
            </h2>
            <p className="text-zinc-400">
              Supports text, JSON, SQL, YAML, etc. (Max 5MB)
            </p>
          </div>
        </div>
      )}
      {/* Mobile Menu Button - Only visible on mobile */}
      <MobileMenuButton
        isOpen={isMobileMenuOpen}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* LEFT PANEL (Input/Editor) - Full width on mobile, 80% on desktop */}
      {/* M3: keyboardHeight padding prevents virtual keyboard from hiding content */}
      <div
        className="w-full lg:flex-1 lg:min-w-0 h-full flex flex-col p-6 sm:p-8 bg-white dark:bg-black relative editor-container"
        style={{
          paddingBottom: keyboardHeight > 0 ? `${keyboardHeight}px` : undefined,
        }}
      >
        {/* Header Area */}
        <div className="flex items-center justify-between mb-4 h-8 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <Logo className="shrink-0" />
            <span className="text-zinc-700 dark:text-zinc-600">|</span>
            <div
              className={clsx(
                "text-xs uppercase tracking-[0.2em] font-bold flex items-center gap-3 transition-colors duration-500 ease-out",
                !content && activeView === "editor"
                  ? "text-zinc-450" // Use color instead of opacity to keep cursor bright
                  : "opacity-100",
                activeView === "todo" ? UI_COLORS.todo : getTypeColor(type)
              )}
            >
              <div className="flex items-center gap-2">
                {activeView === "todo" ? null : activeView === "api" ? (
                  <div className="text-zinc-500">
                    <Send size={14} />
                  </div>
                ) : content && TYPE_ICONS[type as keyof typeof TYPE_ICONS] ? (
                  <div className="text-zinc-500">
                    {(() => {
                      const Icon: React.ElementType =
                        TYPE_ICONS[type as keyof typeof TYPE_ICONS];
                      return <Icon size={14} />;
                    })()}
                  </div>
                ) : null}
                <span>
                  {activeView === "todo"
                    ? "TODO LIST"
                    : activeView === "api"
                      ? "API REQUEST BUILDER"
                      : isDiffMode
                        ? "DIFF MODE"
                        : content
                          ? type
                          : "WAITING FOR INPUT..."}
                </span>
              </div>

              {sizeWarning && (
                <span className="ml-4 normal-case tracking-normal flex items-center gap-1.5 animate-in fade-in rounded-full px-2 py-0.5 text-[10px] bg-amber-950/50 text-amber-400 border border-amber-900/50">
                  <AlertTriangle size={10} />
                  {sizeWarning}
                </span>
              )}
            </div>
          </div>

          {/* Statistics and Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Content Statistics */}
            {contentStats && activeView === "editor" && (
              <Tooltip
                text={
                  <div className="text-left">
                    <div className="font-bold mb-1">Content Statistics</div>
                    <div>Characters: {contentStats.chars.toLocaleString()}</div>
                    <div>Words: {contentStats.words.toLocaleString()}</div>
                    <div>Lines: {contentStats.lines.toLocaleString()}</div>
                    <div>
                      Size:{" "}
                      {contentStats.bytes < 1024
                        ? `${contentStats.bytes} bytes`
                        : `${(contentStats.bytes / 1024).toFixed(2)} KB`}
                    </div>
                  </div>
                }
                maxWidth="250px"
              >
                <div className="hidden sm:flex items-center gap-4 text-[10px] text-zinc-600 uppercase tracking-wider cursor-help mr-2">
                  <span>{contentStats.chars} chars</span>
                  <span>{contentStats.words} words</span>
                  <span>{contentStats.lines} lines</span>
                </div>
              </Tooltip>
            )}

            {/* History Button (U2) */}
            <div className="relative">
              <Tooltip text="Recent History">
                {/* M1: min-w/h-touch ensures ≥44px touch target (WCAG 2.5.5) */}
                <button
                  onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                  aria-label="Recent History"
                  className={clsx(
                    "p-2.5 min-w-touch min-h-touch flex items-center justify-center rounded-lg transition-colors hover:bg-zinc-900 text-zinc-600 hover:text-zinc-400 cursor-pointer",
                    isHistoryOpen && "bg-zinc-900 text-zinc-400"
                  )}
                >
                  <History size={16} />
                </button>
              </Tooltip>
              <HistoryPanel
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
                onSelect={(txt) => {
                  handleContentChange(txt);
                  // Also update logic to re-detect type effectively if needed,
                  // but setContent updates state which triggers detection hook.
                }}
              />
            </div>

            {/* Undo/Redo */}
            {activeView === "editor" && (
              <div className="flex items-center gap-1 border-r border-zinc-900/50 pr-2 mr-1">
                {/* M1: Undo/Redo buttons meet 44px touch target */}
                <Tooltip text="Undo (Ctrl+Z)">
                  <button
                    onClick={handleUndo}
                    disabled={!canUndo}
                    aria-label="Undo"
                    className={clsx(
                      "p-2.5 min-w-touch min-h-touch flex items-center justify-center rounded-lg transition-colors",
                      canUndo
                        ? "hover:bg-zinc-900 text-zinc-600 hover:text-zinc-400 cursor-pointer"
                        : "text-zinc-800 cursor-not-allowed opacity-50"
                    )}
                  >
                    <RotateCcw size={16} />
                  </button>
                </Tooltip>

                <Tooltip text="Redo (Ctrl+Y)">
                  <button
                    onClick={handleRedo}
                    disabled={!canRedo}
                    aria-label="Redo"
                    className={clsx(
                      "p-2.5 min-w-touch min-h-touch flex items-center justify-center rounded-lg transition-colors",
                      canRedo
                        ? "hover:bg-zinc-900 text-zinc-600 hover:text-zinc-400 cursor-pointer"
                        : "text-zinc-800 cursor-not-allowed opacity-50"
                    )}
                  >
                    <RotateCw size={16} />
                  </button>
                </Tooltip>
              </div>
            )}

            {/* M1 + M6: Share Button — 44px touch target, Web Share API */}
            {content && activeView === "editor" && (
              <Tooltip text="Share content">
                <button
                  onClick={handleShare}
                  aria-label="Share content"
                  className="p-2.5 min-w-touch min-h-touch flex items-center justify-center rounded-lg hover:bg-zinc-900 text-zinc-600 hover:text-zinc-400 transition-colors cursor-pointer"
                >
                  <Globe size={16} />
                </button>
              </Tooltip>
            )}

            {/* Download Button with Export Options */}
            {content && activeView === "editor" && (
              <div className="relative">
                {/* M1: Download button meets 44px touch target */}
                <Tooltip text="Download content (Ctrl+D)">
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    aria-label="Download content"
                    className="p-2.5 min-w-touch min-h-touch flex items-center justify-center rounded-lg hover:bg-zinc-900 text-zinc-600 hover:text-zinc-400 transition-colors cursor-pointer"
                  >
                    <ArrowDown size={16} />
                  </button>
                </Tooltip>

                {/* Export Format Dropdown */}
                {showExportMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowExportMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 z-50 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl p-2 min-w-[140px]">
                      <div className="text-[10px] uppercase text-zinc-600 font-bold px-2 py-1 mb-1">
                        Export As
                      </div>

                      {/* TXT Option - Always enabled */}
                      <button
                        onClick={() => {
                          const filename = getDownloadFilename(type, "txt");
                          const mimeType = getMimeType(type, "txt");
                          downloadContent(content, filename, mimeType);
                          toast.success(`Downloaded as ${filename}`);
                          setShowExportMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                      >
                        TXT
                      </button>

                      {/* JSON Option - Only enabled for JSON content */}
                      <button
                        onClick={() => {
                          if (type !== "json") return;
                          const filename = getDownloadFilename(type, "json");
                          const mimeType = getMimeType(type, "json");
                          downloadContent(content, filename, mimeType);
                          toast.success(`Downloaded as ${filename}`);
                          setShowExportMenu(false);
                        }}
                        disabled={type !== "json"}
                        className={`w-full text-left px-3 py-2 text-xs rounded transition-colors ${
                          type === "json"
                            ? "hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 cursor-pointer"
                            : "text-zinc-700 cursor-not-allowed opacity-50"
                        }`}
                      >
                        JSON
                        {type !== "json" && (
                          <span className="text-[9px] ml-2 text-zinc-600">
                            JSON only
                          </span>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* M1 + M2: Clear button — 44px touch target + haptic */}
            {content && activeView === "editor" && (
              <Tooltip text="Clear content (Escape)">
                <button
                  onClick={() => {
                    haptics.medium();
                    handleClear();
                  }}
                  aria-label="Clear content"
                  className="p-2.5 min-w-touch min-h-touch flex items-center justify-center rounded-lg hover:bg-zinc-900 text-zinc-600 hover:text-zinc-400 transition-colors cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Editor Container */}
        <div className="flex-1 relative w-full h-full min-h-0">
          <ErrorBoundary>
            {activeView === "todo" ? (
              <div className="h-full w-full">
                <ToolErrorBoundary toolName="Todo List">
                  <TodoTool
                    todos={todos}
                    onChange={setTodos}
                    onClose={() => {
                      setActiveView("editor");
                      if (!content) setContent("");
                    }}
                  />
                </ToolErrorBoundary>
              </div>
            ) : activeView === "api" ? (
              <div className="h-full w-full">
                <ToolErrorBoundary toolName="API Request Builder">
                  <ApiBuilder onClose={() => setActiveView("editor")} />
                </ToolErrorBoundary>
              </div>
            ) : isDiffMode ? (
              <ToolErrorBoundary toolName="Diff Viewer">
                <DiffViewer
                  original={diffOriginal}
                  modified={content}
                  onChange={handleContentChange}
                  theme="devhub-dark"
                  language={
                    (type as string) === "json" || (type as string) === "code"
                      ? "javascript"
                      : "plaintext"
                  }
                />
              </ToolErrorBoundary>
            ) : (
              <>
                {type === "color" && content && (
                  <ToolErrorBoundary toolName="Color Picker">
                    <ColorRenderer
                      color={content}
                      onChange={handleContentChange}
                      onCopy={(text) => {
                        navigator.clipboard.writeText(text);
                        toast.success(`Copied ${text}`);
                      }}
                    />
                  </ToolErrorBoundary>
                )}

                {type === "cron" && content && (
                  <ToolErrorBoundary toolName="Cron Scheduler">
                    <CronRenderer
                      expression={content}
                      onChange={handleContentChange}
                    />
                  </ToolErrorBoundary>
                )}

                {/* CSV table preview removed - use Preview Table button instead */}

                {/* Timestamp Renderer removed - conversion buttons transform content directly */}

                {(() => {
                  const editorElement = (
                    <>
                      {type === "code" ? (
                        <Editor
                          height="100%"
                          defaultLanguage="javascript"
                          language="javascript"
                          theme="devhub-dark"
                          value={content}
                          onChange={(val: string | undefined) => {
                            handleContentChange(val || "");
                            setLastTransform(null);
                          }}
                          onMount={(editor) => {
                            editorRef.current = editor;
                          }}
                          beforeMount={(monaco) => {
                            monaco.editor.defineTheme("devhub-dark", {
                              base: "vs-dark",
                              inherit: true,
                              rules: [],
                              colors: {
                                "editor.background": "#00000000",
                              },
                            });
                          }}
                          options={{
                            minimap: { enabled: false },
                            contextmenu: false,
                            fontSize: 14,
                            lineNumbers: "off",
                            glyphMargin: false,
                            folding: false,
                            lineDecorationsWidth: 0,
                            lineNumbersMinChars: 0,
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            padding: { top: 16, bottom: 16 },
                            fontFamily: "monospace",
                            renderLineHighlight: "none",
                            stickyScroll: { enabled: false },
                            scrollbar: {
                              vertical: "auto",
                              horizontal: "auto",
                              verticalScrollbarSize: 10,
                              horizontalScrollbarSize: 10,
                              useShadows: false,
                            },
                            overviewRulerLanes: 0,
                            hideCursorInOverviewRuler: true,
                            overviewRulerBorder: false,
                          }}
                          loading={<EditorSkeleton />}
                        />
                      ) : (
                        <div className="relative w-full h-full">
                          {!content && activeView === "editor" && (
                            <span className="absolute top-2 block w-0.5 h-10 bg-emerald-500 animate-pulse pointer-events-none" />
                          )}
                          {/* M3: scrollIntoView on focus ensures input is visible above keyboard */}
                          <textarea
                            ref={textareaRef}
                            value={content}
                            onChange={(e) => {
                              handleContentChange(e.target.value);
                              setLastTransform(null);
                              setJwtOriginal(null);
                            }}
                            placeholder=""
                            aria-label="Content input"
                            className="w-full h-full bg-transparent border-none outline-none resize-none font-mono text-sm md:text-base leading-7 text-zinc-300 placeholder:text-zinc-800 focus:ring-0 custom-scrollbar p-2 break-all overflow-y-auto overflow-x-hidden"
                            spellCheck="false"
                            autoFocus
                            style={{
                              caretColor: content ? "#FBBF24" : "transparent",
                            }}
                            onKeyDown={(e) => {
                              if (
                                (e.ctrlKey || e.metaKey) &&
                                e.key.toLowerCase() === "s"
                              ) {
                                if (type === "sql") {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  import("sql-formatter").then(({ format }) => {
                                    try {
                                      const formatted = format(content);
                                      handleContentChange(formatted);
                                      toast.success("SQL Formatted");
                                    } catch {
                                      toast.error("Invalid SQL");
                                    }
                                  });
                                }
                              }
                            }}
                          />
                        </div>
                      )}

                      {!content &&
                        activeView === "editor" &&
                        !isDiffMode &&
                        type !== "color" &&
                        type !== "cron" && (
                          <WelcomeScreen onLoadExample={handleLoadExample} />
                        )}
                    </>
                  );

                  if (type === "json") {
                    return (
                      // M4: Swipe left/right to switch JSON view tabs (raw → tree → table)
                      <div
                        {...swipeHandlers}
                        className={`transition-opacity duration-200 ease-in-out ${isTransitioning ? "opacity-0" : "opacity-100"} h-full w-full`}
                      >
                        <ToolErrorBoundary toolName="JSON Viewer">
                          <JsonRenderer
                            data={parsedJson}
                            viewMode={viewMode}
                            onViewModeChange={handleViewChange}
                          >
                            {editorElement}
                          </JsonRenderer>
                        </ToolErrorBoundary>
                        {/* M4: Swipe hint for mobile users */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-zinc-700 tracking-wider pointer-events-none md:hidden">
                          ← Swipe to switch views →
                        </div>
                      </div>
                    );
                  }

                  if (type === "html" && content) {
                    return (
                      <ToolErrorBoundary toolName="HTML Preview">
                        <HtmlRenderer
                          content={content}
                          isPreviewMode={isPreviewMode}
                          onTogglePreview={setIsPreviewMode}
                        >
                          {editorElement}
                        </HtmlRenderer>
                      </ToolErrorBoundary>
                    );
                  }

                  if (type === "markdown" && content) {
                    return (
                      <ToolErrorBoundary toolName="Markdown Preview">
                        <MarkdownRenderer
                          content={content}
                          isPreviewMode={isPreviewMode}
                          onTogglePreview={setIsPreviewMode}
                        >
                          {editorElement}
                        </MarkdownRenderer>
                      </ToolErrorBoundary>
                    );
                  }

                  if (type === "timestamp" && content) {
                    return (
                      <ToolErrorBoundary toolName="Timestamp Converter">
                        <TimestampRenderer
                          content={content}
                          isPreviewMode={isPreviewMode}
                          onTogglePreview={setIsPreviewMode}
                        >
                          {editorElement}
                        </TimestampRenderer>
                      </ToolErrorBoundary>
                    );
                  }

                  if (type === "csv" && content) {
                    return (
                      <ToolErrorBoundary toolName="CSV Viewer">
                        <CsvRenderer
                          content={content}
                          isPreviewMode={isPreviewMode}
                          onTogglePreview={setIsPreviewMode}
                        >
                          {editorElement}
                        </CsvRenderer>
                      </ToolErrorBoundary>
                    );
                  }

                  if (type === "ipaddress" && content) {
                    return (
                      <ToolErrorBoundary toolName="IP Address Viewer">
                        <IpRenderer
                          content={content}
                          setContent={handleContentChange}
                        >
                          {editorElement}
                        </IpRenderer>
                      </ToolErrorBoundary>
                    );
                  }

                  if (type !== "color" && type !== "cron") {
                    return editorElement;
                  }
                  return null;
                })()}
              </>
            )}
          </ErrorBoundary>
        </div>

        {/* Tool Actions Bar - Type-specific actions */}
        {activeView === "editor" && !isDiffMode && (
          <ToolErrorBoundary toolName="Tool Actions Bar">
            <ToolActionsBar
              type={type}
              content={content}
              setContent={handleContentChange}
              setViewMode={handleViewChange}
              setLastTransform={setLastTransform}
              lastTransform={lastTransform}
              setType={setType}
              jwtOriginal={jwtOriginal}
              setJwtOriginal={setJwtOriginal}
            />
          </ToolErrorBoundary>
        )}

        {/* Tool Description Footer */}
        <div className="h-auto min-h-[40px] px-1 py-1 border-t border-zinc-900/50 text-xs text-zinc-500 font-medium flex items-center justify-between shrink-0">
          <div>
            {activeView === "todo"
              ? TOOL_DESCRIPTIONS["todo"]
              : activeView === "api"
                ? "API Request Builder - Send HTTP requests, view responses, and manage your API testing workflow."
                : isDiffMode
                  ? TOOL_DESCRIPTIONS["diff"]
                  : TOOL_DESCRIPTIONS[type] || TOOL_DESCRIPTIONS["text"]}
          </div>
          <div className="flex items-center gap-4 text-zinc-600 pl-4 whitespace-nowrap">
            <button
              onClick={() => setIsAboutOpen(true)}
              className="hover:text-zinc-300 transition-colors flex items-center gap-1.5 cursor-pointer outline-none"
            >
              <Info size={14} /> Guide
            </button>
            <span className="hidden sm:inline border-l border-zinc-800 pl-4">
              Developed by{" "}
              <span className="text-zinc-400 font-semibold tracking-wide">
                Shankar
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL (Tools) - Slim Fixed Width */}
      <ErrorBoundary
        fallback={
          <div className="w-[50px] border-l border-zinc-900 bg-zinc-950 flex items-center justify-center">
            <AlertTriangle className="text-red-500 w-5 h-5" />
          </div>
        }
      >
        <ToolsSidebar
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          activeView={activeView}
          setActiveView={setActiveView}
          todos={todos}
          content={content}
          setContent={handleContentChange}
          setViewMode={handleViewChange}
          setLastTransform={setLastTransform}
          setType={setType}
          isDiffMode={isDiffMode}
          setIsDiffMode={setIsDiffMode}
          setDiffOriginal={setDiffOriginal}
          handleCopy={handleCopy}
          handleClear={handleClear}
          setJwtOriginal={setJwtOriginal}
          jwtOriginal={jwtOriginal}
          setIsPreviewMode={setIsPreviewMode}
          onOpenEncryption={() => setIsEncryptionOpen(true)}
          onOpenTemplates={() => setIsTemplatesOpen(true)}
        />
      </ErrorBoundary>

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onCommand={handleCommand}
        currentType={type}
      />
      <ShortcutsDialog
        isOpen={isShortcutsDialogOpen}
        onClose={() => setIsShortcutsDialogOpen(false)}
      />
      <EncryptionTools
        isOpen={isEncryptionOpen}
        onClose={() => setIsEncryptionOpen(false)}
        initialContent={content}
      />
      <TemplateManager
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onLoad={handleContentChange}
        currentContent={content}
      />
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </main>
  );
}
