"use client";

import { useState, useEffect, useMemo } from "react";
import {
  X,
  BookMarked,
  Search,
  Plus,
  Trash2,
  Copy,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

interface Template {
  id: string;
  name: string;
  category: string;
  content: string;
  isBuiltIn: boolean;
  createdAt?: number;
}

// ──────────────────────────────────────────────────────────────────────────────
// Built-in Templates
// ──────────────────────────────────────────────────────────────────────────────
const BUILT_IN_TEMPLATES: Template[] = [
  {
    id: "json-schema",
    name: "JSON Schema",
    category: "JSON",
    isBuiltIn: true,
    content: `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "User",
  "type": "object",
  "required": ["id", "name", "email"],
  "properties": {
    "id": {
      "type": "integer",
      "description": "Unique identifier"
    },
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "email": {
      "type": "string",
      "format": "email"
    },
    "age": {
      "type": "integer",
      "minimum": 0,
      "maximum": 150
    }
  },
  "additionalProperties": false
}`,
  },
  {
    id: "json-api-response",
    name: "API Response (JSON)",
    category: "JSON",
    isBuiltIn: true,
    content: `{
  "status": "success",
  "code": 200,
  "data": {
    "items": [
      { "id": 1, "name": "Item One", "value": 42 },
      { "id": 2, "name": "Item Two", "value": 99 }
    ],
    "pagination": {
      "page": 1,
      "perPage": 10,
      "total": 2,
      "totalPages": 1
    }
  },
  "meta": {
    "requestId": "abc-123",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}`,
  },
  {
    id: "sql-select",
    name: "SQL SELECT with JOIN",
    category: "SQL",
    isBuiltIn: true,
    content: `SELECT
    u.id,
    u.name,
    u.email,
    o.id AS order_id,
    o.total,
    o.created_at
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE u.active = 1
  AND o.created_at >= '2024-01-01'
ORDER BY o.created_at DESC
LIMIT 50;`,
  },
  {
    id: "sql-create-table",
    name: "SQL CREATE TABLE",
    category: "SQL",
    isBuiltIn: true,
    content: `CREATE TABLE users (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       VARCHAR(100) NOT NULL,
    email      VARCHAR(255) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    active     BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);`,
  },
  {
    id: "graphql-query",
    name: "GraphQL Query",
    category: "GraphQL",
    isBuiltIn: true,
    content: `query GetUser($id: ID!) {
  user(id: $id) {
    id
    name
    email
    posts(first: 10, orderBy: { field: CREATED_AT, direction: DESC }) {
      edges {
        node {
          id
          title
          createdAt
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
}`,
  },
  {
    id: "graphql-mutation",
    name: "GraphQL Mutation",
    category: "GraphQL",
    isBuiltIn: true,
    content: `mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    user {
      id
      name
      email
    }
    errors {
      field
      message
    }
  }
}`,
  },
  {
    id: "yaml-config",
    name: "YAML Config",
    category: "YAML",
    isBuiltIn: true,
    content: `app:
  name: my-service
  version: "1.0.0"
  environment: production

server:
  host: 0.0.0.0
  port: 8080
  timeout: 30s

database:
  host: localhost
  port: 5432
  name: mydb
  pool:
    min: 2
    max: 10

logging:
  level: info
  format: json
  output: stdout

features:
  featureA: true
  featureB: false`,
  },
  {
    id: "cron-examples",
    name: "Cron Expressions",
    category: "Cron",
    isBuiltIn: true,
    content: `# Every minute
* * * * *

# Every day at midnight
0 0 * * *

# Every Monday at 9 AM
0 9 * * 1

# Every hour on the hour
0 * * * *

# Every 15 minutes
*/15 * * * *

# First day of every month at 6 AM
0 6 1 * *`,
  },
  {
    id: "regex-patterns",
    name: "Common Regex Patterns",
    category: "Regex",
    isBuiltIn: true,
    content: `# Email
^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$

# URL (http/https)
^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$

# UUID v4
^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$

# IPv4
^(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$

# Strong Password (8+ chars, upper, lower, digit, special)
^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$

# ISO 8601 Date
^\\d{4}-\\d{2}-\\d{2}(T\\d{2}:\\d{2}:\\d{2}(\\.\\d+)?(Z|[+-]\\d{2}:\\d{2})?)?$`,
  },
  {
    id: "html-boilerplate",
    name: "HTML Boilerplate",
    category: "HTML",
    isBuiltIn: true,
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="Page description" />
  <title>My Page</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; font-family: system-ui, sans-serif; }
  </style>
</head>
<body>
  <h1>Hello, World!</h1>
  <script>
    console.log('Hello!');
  </script>
</body>
</html>`,
  },
  {
    id: "jwt-example",
    name: "JWT Example",
    category: "JWT",
    isBuiltIn: true,
    content: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`,
  },
  {
    id: "markdown-readme",
    name: "README Template",
    category: "Markdown",
    isBuiltIn: true,
    content: `# Project Name

> Short description of the project.

## Features

- Feature one
- Feature two
- Feature three

## Installation

\`\`\`bash
npm install my-project
\`\`\`

## Usage

\`\`\`js
const myProject = require('my-project');
myProject.doSomething();
\`\`\`

## API

### \`doSomething(options)\`

Description of the function.

| Parameter | Type     | Description       |
| --------- | -------- | ----------------- |
| options   | \`object\` | Configuration options |

## License

MIT © [Your Name]`,
  },
];

const STORAGE_KEY = "devhub-templates";

function loadCustomTemplates(): Template[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCustomTemplates(templates: Template[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  } catch {
    // ignore
  }
}

interface TemplateManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onLoad: (content: string) => void;
  currentContent?: string;
}

export function TemplateManager({
  isOpen,
  onClose,
  onLoad,
  currentContent = "",
}: TemplateManagerProps) {
  const [activeTab, setActiveTab] = useState<"builtin" | "custom">("builtin");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [customTemplates, setCustomTemplates] = useState<Template[]>([]);
  const [saveName, setSaveName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [selected, setSelected] = useState<Template | null>(null);

  // Load custom templates from localStorage on mount
  useEffect(() => {
    if (isOpen) {
      setCustomTemplates(loadCustomTemplates());
    }
  }, [isOpen]);

  const builtInCategories = useMemo(
    () => [
      "All",
      ...Array.from(new Set(BUILT_IN_TEMPLATES.map((t) => t.category))),
    ],
    []
  );

  const filteredBuiltIn = useMemo(() => {
    return BUILT_IN_TEMPLATES.filter((t) => {
      const matchCat =
        selectedCategory === "All" || t.category === selectedCategory;
      const matchSearch =
        !search ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [selectedCategory, search]);

  const filteredCustom = useMemo(() => {
    return customTemplates.filter(
      (t) => !search || t.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [customTemplates, search]);

  const handleSaveCustom = () => {
    if (!saveName.trim()) {
      toast.error("Please enter a template name");
      return;
    }
    if (!currentContent.trim()) {
      toast.error("Editor is empty — nothing to save");
      return;
    }

    const newTemplate: Template = {
      id: `custom-${Date.now()}`,
      name: saveName.trim(),
      category: "Custom",
      content: currentContent,
      isBuiltIn: false,
      createdAt: Date.now(),
    };

    const updated = [...customTemplates, newTemplate];
    setCustomTemplates(updated);
    saveCustomTemplates(updated);
    setSaveName("");
    setIsSaving(false);
    toast.success(`Template "${newTemplate.name}" saved`);
  };

  const handleDelete = (id: string) => {
    const updated = customTemplates.filter((t) => t.id !== id);
    setCustomTemplates(updated);
    saveCustomTemplates(updated);
    if (selected?.id === id) setSelected(null);
    toast.success("Template deleted");
  };

  const handleLoad = (template: Template) => {
    onLoad(template.content);
    onClose();
    toast.success(`Loaded: ${template.name}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative ml-auto w-[420px] bg-zinc-900 border-l border-zinc-800 flex flex-col h-full shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <BookMarked size={16} className="text-violet-400" />
            <h2 className="font-semibold text-zinc-100 text-sm">Templates</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pt-3 pb-2 shrink-0">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-zinc-800 shrink-0 px-4">
          {(["builtin", "custom"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? "border-violet-500 text-violet-400"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {tab === "builtin"
                ? "Built-in"
                : `Custom (${customTemplates.length})`}
            </button>
          ))}
        </div>

        {/* Built-in tab */}
        {activeTab === "builtin" && (
          <>
            {/* Category filter */}
            <div className="flex gap-1.5 px-4 py-2.5 overflow-x-auto custom-scrollbar shrink-0">
              {builtInCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex-none px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors whitespace-nowrap ${
                    selectedCategory === cat
                      ? "bg-violet-600 text-white"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Template list */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-3 pb-4 space-y-1.5">
              {filteredBuiltIn.length === 0 ? (
                <div className="text-center text-zinc-600 text-sm py-8">
                  No templates match your search
                </div>
              ) : (
                filteredBuiltIn.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    isSelected={selected?.id === template.id}
                    onSelect={() =>
                      setSelected(
                        selected?.id === template.id ? null : template
                      )
                    }
                    onLoad={() => handleLoad(template)}
                    onCopy={() => {
                      navigator.clipboard.writeText(template.content);
                      toast.success(`Copied: ${template.name}`);
                    }}
                  />
                ))
              )}
            </div>
          </>
        )}

        {/* Custom tab */}
        {activeTab === "custom" && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Save current content as template */}
            <div className="px-4 py-3 border-b border-zinc-800 shrink-0 space-y-2">
              {isSaving ? (
                <div className="flex gap-2">
                  <input
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    placeholder="Template name..."
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveCustom();
                      if (e.key === "Escape") setIsSaving(false);
                    }}
                  />
                  <button
                    onClick={handleSaveCustom}
                    className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-medium transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsSaving(false)}
                    className="px-2 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg text-xs transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsSaving(true)}
                  disabled={!currentContent.trim()}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-300 rounded-lg text-xs font-medium transition-colors"
                >
                  <Plus size={13} />
                  Save Current Content as Template
                </button>
              )}
            </div>

            {/* Custom template list */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-3 space-y-1.5">
              {filteredCustom.length === 0 ? (
                <div className="text-center text-zinc-600 text-sm py-8">
                  {customTemplates.length === 0
                    ? "No custom templates yet. Save the current editor content to create one."
                    : "No templates match your search"}
                </div>
              ) : (
                filteredCustom.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    isSelected={selected?.id === template.id}
                    onSelect={() =>
                      setSelected(
                        selected?.id === template.id ? null : template
                      )
                    }
                    onLoad={() => handleLoad(template)}
                    onCopy={() => {
                      navigator.clipboard.writeText(template.content);
                      toast.success(`Copied: ${template.name}`);
                    }}
                    onDelete={() => handleDelete(template.id)}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Template Card
// ──────────────────────────────────────────────────────────────────────────────
interface TemplateCardProps {
  template: Template;
  isSelected: boolean;
  onSelect: () => void;
  onLoad: () => void;
  onCopy: () => void;
  onDelete?: () => void;
}

function TemplateCard({
  template,
  isSelected,
  onSelect,
  onLoad,
  onCopy,
  onDelete,
}: TemplateCardProps) {
  return (
    <div
      className={`group rounded-lg border transition-all cursor-pointer ${
        isSelected
          ? "border-violet-600/60 bg-violet-950/20"
          : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-800/40"
      }`}
    >
      {/* Card header */}
      <div
        className="flex items-center justify-between px-3 py-2.5"
        onClick={onSelect}
      >
        <div className="flex items-center gap-2 min-w-0">
          <ChevronRight
            size={12}
            className={`text-zinc-600 shrink-0 transition-transform ${isSelected ? "rotate-90 text-violet-400" : ""}`}
          />
          <span className="text-sm text-zinc-200 font-medium truncate">
            {template.name}
          </span>
          {template.category && !template.isBuiltIn === false && (
            <span className="text-[10px] px-1.5 py-0.5 bg-zinc-800 text-zinc-500 rounded font-mono shrink-0">
              {template.category}
            </span>
          )}
        </div>
        <div
          className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onCopy}
            className="p-1.5 hover:bg-zinc-700 rounded text-zinc-500 hover:text-zinc-300 transition-colors"
            title="Copy content"
          >
            <Copy size={12} />
          </button>
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-1.5 hover:bg-red-900/40 rounded text-zinc-500 hover:text-red-400 transition-colors"
              title="Delete template"
            >
              <Trash2 size={12} />
            </button>
          )}
          <button
            onClick={onLoad}
            className="px-2.5 py-1 bg-violet-600 hover:bg-violet-500 text-white rounded text-[10px] font-medium transition-colors"
          >
            Load
          </button>
        </div>
      </div>

      {/* Preview on expand */}
      {isSelected && (
        <div className="px-3 pb-3 border-t border-zinc-800/50 pt-2 space-y-2 animate-in fade-in duration-150">
          <pre className="text-[10px] text-zinc-500 font-mono overflow-hidden max-h-32 leading-relaxed bg-zinc-950/60 rounded p-2 overflow-y-auto custom-scrollbar">
            {template.content.slice(0, 500)}
            {template.content.length > 500 ? "\n..." : ""}
          </pre>
          <button
            onClick={onLoad}
            className="w-full py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-md text-xs font-medium transition-colors"
          >
            Load Template →
          </button>
        </div>
      )}
    </div>
  );
}
