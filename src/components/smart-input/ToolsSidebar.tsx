import React from "react";
import { ListTodo } from "lucide-react";
import { MobileSidebar } from "../MobileSidebar";
import ToolButton from "./ToolButton";
import { GlobalToolbar } from "./GlobalToolbar";
import { Todo } from "../TodoTool";

interface ToolsSidebarProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
  activeView: "editor" | "todo" | "api";
  setActiveView: (view: "editor" | "todo" | "api") => void;
  todos: Todo[];
  content: string;
  setContent: (value: string) => void;
  setViewMode: (mode: "raw" | "tree" | "table") => void;
  setLastTransform: (val: any) => void;
  setType: (type: any) => void;
  isDiffMode: boolean;
  setIsDiffMode: (val: boolean) => void;
  setDiffOriginal: (val: string) => void;
  handleCopy: () => void;
  handleClear: () => void;
  setJwtOriginal: (val: any) => void;
  jwtOriginal: any;
  setIsPreviewMode: (val: boolean) => void;
  onOpenEncryption?: () => void;
  onOpenTemplates?: () => void;
}

export const ToolsSidebar: React.FC<ToolsSidebarProps> = ({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  activeView,
  setActiveView,
  todos,
  content,
  setContent,
  setLastTransform,
  isDiffMode,
  setIsDiffMode,
  setDiffOriginal,
  handleCopy,
  handleClear,
  setJwtOriginal,
  setIsPreviewMode,
  onOpenEncryption,
  onOpenTemplates,
}) => {
  return (
    <MobileSidebar
      isOpen={isMobileMenuOpen}
      onClose={() => setIsMobileMenuOpen(false)}
    >
      <aside
        role="complementary"
        className="w-60 h-full bg-zinc-950 border-l border-zinc-900 flex flex-col shrink-0"
      >
        {/* TOP: Actions Header & Todo Switch */}
        <div className="p-4 border-b border-zinc-900/50 flex flex-col gap-3 shrink-0">
          <ToolButton
            icon={
              <ListTodo
                size={16}
                strokeWidth={2}
                className={
                  todos.some((t) => !t.completed) ? "text-emerald-400" : ""
                }
              />
            }
            label={`Todo List (${todos.filter((t) => !t.completed).length})`}
            onClick={() =>
              setActiveView(activeView === "todo" ? "editor" : "todo")
            }
            variant={activeView === "todo" ? "default" : undefined}
            showTooltip={false}
          />
        </div>
        {/* MIDDLE: Context Tools (Scrollable) */}
        <nav
          role="navigation"
          className="flex-1 overflow-y-auto custom-scrollbar p-3 flex flex-col gap-2 min-h-0"
        >
          {activeView === "editor" && (
            <>
              {/* ALL TYPE-SPECIFIC TOOL ACTIONS MOVED TO BOTTOM BAR (ToolActionsBar) */}
            </>
          )}
        </nav>
        {/* visual separator before global toolbar */}
        {/* BOTTOM: Global Tools & Generators (Sticky) */}
        <GlobalToolbar
          content={content}
          setContent={setContent}
          activeView={activeView}
          setActiveView={setActiveView}
          isDiffMode={isDiffMode}
          setIsDiffMode={setIsDiffMode}
          setDiffOriginal={setDiffOriginal}
          handleCopy={handleCopy}
          handleClear={handleClear}
          setLastTransform={setLastTransform}
          setJwtOriginal={setJwtOriginal}
          setIsPreviewMode={setIsPreviewMode}
          onOpenEncryption={onOpenEncryption}
          onOpenTemplates={onOpenTemplates}
          searchTerm=""
        />
      </aside>
    </MobileSidebar>
  );
};
