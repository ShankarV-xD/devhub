import { useState, useRef, useEffect } from "react";
import { Plus, X, Trash2, Check } from "lucide-react";
import { clsx } from "clsx";

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

interface TodoToolProps {
  todos: Todo[];
  onChange: (todos: Todo[]) => void;
  onClose: () => void;
}

export default function TodoTool({ todos, onChange, onClose }: TodoToolProps) {
  const [newTodo, setNewTodo] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    if (!newTodo.trim()) return;
    const newItem: Todo = {
      id: crypto.randomUUID(),
      text: newTodo.trim(),
      completed: false,
    };
    onChange([...todos, newItem]);
    setNewTodo("");
  };

  const handleToggle = (id: string) => {
    onChange(
      todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDelete = (id: string) => {
    onChange(todos.filter((t) => t.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAdd();
    }
  };

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="h-full w-full flex flex-col bg-transparent animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-6 md:p-12 pb-4">
        <h2 className="text-3xl font-thin text-zinc-100 tracking-tight">
          Tasks
        </h2>
        <button
          onClick={onClose}
          className="cursor-pointer p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 rounded-full transition-all"
          title="Close Todo List"
        >
          <X size={24} />
        </button>
      </div>

      {/* List Area */}
      <div className="flex-1 overflow-y-auto px-6 md:px-12 pb-12 custom-scrollbar">
        <div className="max-w-3xl mx-auto flex flex-col gap-2">
          {/* Input */}
          <div className="relative group mb-8">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Plus
                size={20}
                className="text-zinc-600 group-focus-within:text-zinc-400 transition-colors"
              />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add a new task..."
              className="w-full bg-zinc-900/30 hover:bg-zinc-900/50 focus:bg-zinc-900 text-zinc-200 text-lg placeholder:text-zinc-600 rounded-xl py-4 pl-12 pr-4 border border-zinc-800/50 focus:border-zinc-700 outline-none transition-all"
            />
          </div>

          {/* Empty State */}
          {todos.length === 0 && (
            <div className="flex flex-col items-center justify-center py-6 text-center animate-in fade-in zoom-in duration-300">
              <div className="w-24 h-24 bg-zinc-900/50 rounded-full flex items-center justify-center mb-6 ring-1 ring-zinc-800">
                <Check strokeWidth={1.5} className="w-10 h-10 text-zinc-700" />
              </div>
              <h3 className="text-xl font-medium text-zinc-300 mb-2">
                All caught up!
              </h3>
              <p className="text-zinc-500 max-w-xs">
                You have no pending tasks. Enjoy your day or add a new task to
                get started.
              </p>
            </div>
          )}

          {/* Items */}
          <div className="space-y-1">
            {todos.map((todo) => (
              <div
                key={todo.id}
                className={clsx(
                  "group flex items-center gap-4 p-4 rounded-xl transition-all duration-200 border border-transparent",
                  todo.completed
                    ? "bg-zinc-900/20 opacity-60 hover:opacity-100"
                    : "bg-zinc-900/40 hover:bg-zinc-900/60 hover:border-zinc-800/50 hover:shadow-sm"
                )}
              >
                <button
                  onClick={() => handleToggle(todo.id)}
                  className={clsx(
                    "flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center transition-all",
                    todo.completed
                      ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-500"
                      : "border-zinc-700 hover:border-zinc-500 text-transparent"
                  )}
                >
                  <Check size={14} strokeWidth={3} />
                </button>

                <span
                  className={clsx(
                    "flex-1 text-lg font-light transition-all break-words",
                    todo.completed
                      ? "text-zinc-500 line-through decoration-zinc-800"
                      : "text-zinc-200"
                  )}
                >
                  {todo.text}
                </span>

                <button
                  onClick={() => handleDelete(todo.id)}
                  className="cursor-pointer opacity-0 group-hover:opacity-100 p-2 text-zinc-600 hover:text-red-400 hover:bg-red-950/30 rounded transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
