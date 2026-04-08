import { useMemo, memo } from "react";
import { List, RowComponentProps } from "react-window";
import { AutoSizer } from "react-virtualized-auto-sizer";
import {
  ChevronRight,
  ChevronDown,
  Maximize2,
  Minimize2,
  Loader2,
} from "lucide-react";
import { useProgressiveJson } from "@/hooks/useProgressiveJson";
import clsx from "clsx";

// Types
type DataType =
  | "object"
  | "array"
  | "string"
  | "number"
  | "boolean"
  | "null"
  | "undefined";

interface Node {
  id: string;
  key: string;
  value: any;
  level: number;
  type: DataType;
  childCount: number;
  path: string;
}

interface JsonViewerProps {
  data: unknown;
}

// Helper to determine type
const getDataType = (value: any): DataType => {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (Array.isArray(value)) return "array";
  return typeof value as DataType;
};

// Helper: Flatten the JSON data into a linear list based on expanded state
const flattenData = (
  data: any,
  expandedPaths: Set<string>,
  level = 0,
  path = "root"
): Node[] => {
  const nodes: Node[] = [];
  const type = getDataType(data);

  // If primitive, we handled it in parent, but this function is called recursively.
  // Actually, we iterate properties of object/array.

  // If it's root and not object/array, we just show one line?
  // But usually we pass an object/array as root.

  const isExpandable = type === "object" || type === "array";

  if (!isExpandable) return [];

  const keys = Object.keys(data);

  for (const key of keys) {
    const value = data[key];
    const valueType = getDataType(value);
    const isChildExpandable = valueType === "object" || valueType === "array";
    const childPath = `${path}.${key}`;
    const childCount = isChildExpandable ? Object.keys(value).length : 0;

    // Push the current node
    nodes.push({
      id: childPath,
      key,
      value,
      level,
      type: valueType,
      childCount,
      path: childPath,
    });

    // If expanded and has children, recurse
    if (isChildExpandable && expandedPaths.has(childPath) && childCount > 0) {
      nodes.push(...flattenData(value, expandedPaths, level + 1, childPath));
    }
  }

  return nodes;
};

// Initial expansion helper (expand first 2 levels)
const getInitialExpandedPaths = (
  data: any,
  maxLevel = 1,
  currentLevel = 0,
  path = "root"
): Set<string> => {
  const paths = new Set<string>();
  if (currentLevel > maxLevel) return paths;

  const type = getDataType(data);
  if (type === "object" || type === "array") {
    const keys = Object.keys(data);
    for (const key of keys) {
      const value = data[key];
      const childPath = `${path}.${key}`;
      const valueType = getDataType(value);
      if (valueType === "object" || valueType === "array") {
        paths.add(childPath);
        const subPaths = getInitialExpandedPaths(
          value,
          maxLevel,
          currentLevel + 1,
          childPath
        );
        subPaths.forEach((p) => paths.add(p));
      }
    }
  }
  return paths;
};

// Row Data Interface
interface RowData {
  visibleNodes: Node[];
  expandedPaths: Set<string>;
  loadingPath: string | null;
  toggleExpand: (path: string) => void;
}

// Row component moved outside to preserve identity
const Row = ({
  index,
  style,
  visibleNodes,
  expandedPaths,
  loadingPath,
  toggleExpand,
}: RowComponentProps & RowData) => {
  const node = visibleNodes[index];
  if (!node) return null;

  const isExpanded = expandedPaths.has(node.path);
  const isExpandable = node.type === "object" || node.type === "array";

  return (
    <div
      style={style}
      className={clsx(
        "flex items-center hover:bg-zinc-900/50 font-mono text-sm px-2",
        "border-l border-transparent hover:border-zinc-800"
      )}
    >
      <div
        style={{ paddingLeft: `${node.level * 20}px` }}
        className="flex items-center w-full"
      >
        <button
          onClick={() => isExpandable && toggleExpand(node.path)}
          className={clsx(
            "w-4 h-4 flex items-center justify-center mr-1 text-zinc-500 hover:text-zinc-300 transition-colors",
            !isExpandable && "opacity-0 cursor-default"
          )}
          aria-expanded={isExpandable ? isExpanded : undefined}
          aria-label={isExpanded ? "Collapse" : "Expand"}
        >
          {isExpandable &&
            (loadingPath === node.path ? (
              <Loader2 size={14} className="animate-spin text-zinc-500" />
            ) : isExpanded ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            ))}
        </button>

        <span className="text-sky-400 mr-1.5 shrink-0">{node.key}</span>
        <span className="text-zinc-600 mr-2 shrink-0">:</span>

        <div className="truncate flex items-center">
          {isExpandable ? (
            <span className="text-zinc-500">
              {node.type === "array" ? (
                <>
                  Array({node.childCount}) {isExpanded ? "[" : "[...]"}
                </>
              ) : (
                <>
                  Object({node.childCount}) {isExpanded ? "{" : "{...}"}
                </>
              )}
            </span>
          ) : (
            <span
              className={clsx(
                node.type === "string" && "text-emerald-400",
                node.type === "number" && "text-amber-400",
                node.type === "boolean" && "text-purple-400",
                node.type === "null" && "text-rose-400",
                node.type === "undefined" && "text-zinc-500"
              )}
            >
              {JSON.stringify(node.value)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(
  function JsonViewer({ data }: JsonViewerProps) {
    const { expandedPaths, loadingPath, toggleExpand, setExpandedPaths } =
      useProgressiveJson(getInitialExpandedPaths(data));

    const visibleNodes = useMemo(() => {
      return flattenData(data, expandedPaths);
    }, [data, expandedPaths]);

    // toggleExpand is now handled by the hook

    const expandAll = () => {
      const allPaths = getInitialExpandedPaths(data, 100);
      setExpandedPaths(allPaths);
    };

    const collapseAll = () => {
      setExpandedPaths(new Set());
    };

    return (
      <div className="flex flex-col h-full bg-zinc-950/50 rounded-lg border border-zinc-900 overflow-hidden">
        <div className="flex items-center gap-2 p-2 border-b border-zinc-900 bg-zinc-950">
          <button
            onClick={expandAll}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors"
            title="Expand All"
          >
            <Maximize2 size={14} />
          </button>
          <button
            onClick={collapseAll}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors"
            title="Collapse All"
          >
            <Minimize2 size={14} />
          </button>
          <div className="ml-auto text-xs text-zinc-600 font-mono">
            {visibleNodes.length} visible items
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <AutoSizer
            renderProp={({ height, width }) => (
              <List
                style={{ height: height ?? 0, width: width ?? 0 }}
                rowCount={visibleNodes.length}
                rowHeight={24}
                rowComponent={Row as any}
                rowProps={{
                  visibleNodes,
                  expandedPaths,
                  loadingPath,
                  toggleExpand,
                }}
              />
            )}
          />
        </div>
      </div>
    );
  },
  (prevProps: JsonViewerProps, nextProps: JsonViewerProps) => {
    return prevProps.data === nextProps.data;
  }
);
