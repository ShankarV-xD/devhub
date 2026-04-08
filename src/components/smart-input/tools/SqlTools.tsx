import React from "react";
// import { format } from "sql-formatter"; // Removed top-level import
import { Maximize2, Minimize2, Database } from "lucide-react";
import { toast } from "sonner";
import ToolButton from "../ToolButton";

// SQL to MongoDB converter functions
function parseWhereClause(where: string): string {
  // Basic parsing for simple conditions
  const match = where.match(/(\w+)\s*(=|>|<|>=|<=|!=)\s*(.+)/);
  if (!match) return "{}";

  const [, field, operator, value] = match;
  const mongoOp: Record<string, string> = {
    "=": "",
    ">": "$gt",
    "<": "$lt",
    ">=": "$gte",
    "<=": "$lte",
    "!=": "$ne",
  };

  const val = value.trim().replace(/^'|'$/g, '"');
  if (operator === "=") {
    return `{ "${field}": ${val} }`;
  }
  return `{ "${field}": { "${mongoOp[operator]}": ${val} } }`;
}

function convertSelectToMongo(sql: string): string {
  // Normalize whitespace to handle multi-line formatted SQL
  const normalized = sql.replace(/\s+/g, " ").trim();

  // Extract table name and columns - handle JOIN and ORDER BY
  const selectMatch = normalized.match(
    /SELECT\s+(.*?)\s+FROM\s+(\w+)(?:\s+(?:LEFT\s+JOIN|INNER\s+JOIN|JOIN).*?)?(?:\s+WHERE\s+(.*?))?(?:\s+ORDER\s+BY.*?)?$/i
  );
  if (!selectMatch) throw new Error("Invalid SELECT query");

  const [, columns, table, whereClause] = selectMatch;
  const projection =
    columns.trim() === "*"
      ? "{}"
      : `{ ${columns
          .split(",")
          .map((c) => `"${c.trim()}": 1`)
          .join(", ")} }`;

  let filter = "{}";
  if (whereClause) {
    filter = parseWhereClause(whereClause.trim());
  }

  return `db.${table}.find(${filter}, ${projection})`;
}

function convertInsertToMongo(sql: string): string {
  // Normalize whitespace to handle multi-line formatted SQL
  const normalized = sql.replace(/\s+/g, " ").trim();

  const insertMatch = normalized.match(
    /INSERT INTO\s+(\w+)\s*\((.*?)\)\s*VALUES\s*\((.*?)\)/i
  );
  if (!insertMatch) throw new Error("Invalid INSERT query");

  const [, table, columns, values] = insertMatch;
  const cols = columns.split(",").map((c) => c.trim());
  const vals = values.split(",").map((v) => v.trim().replace(/^'|'$/g, '"'));

  const document = cols.map((col, i) => `"${col}": ${vals[i]}`).join(", ");
  return `db.${table}.insertOne({ ${document} })`;
}

function convertUpdateToMongo(sql: string): string {
  // Normalize whitespace to handle multi-line formatted SQL
  const normalized = sql.replace(/\s+/g, " ").trim();

  const updateMatch = normalized.match(
    /UPDATE\s+(\w+)\s+SET\s+(.*?)(?:\s+WHERE\s+(.*?))?$/i
  );
  if (!updateMatch) throw new Error("Invalid UPDATE query");

  const [, table, setClause, whereClause] = updateMatch;

  // Parse SET clause
  const updates = setClause
    .split(",")
    .map((s) => {
      const [key, value] = s.split("=").map((p) => p.trim());
      return `"${key}": ${value.replace(/^'|'$/g, '"')}`;
    })
    .join(", ");

  const filter = whereClause ? parseWhereClause(whereClause.trim()) : "{}";

  return `db.${table}.updateMany(${filter}, { "$set": { ${updates} } })`;
}

function sqlToMongoDB(sqlQuery: string): string {
  const trimmed = sqlQuery.trim().toUpperCase();

  // SELECT conversion
  if (trimmed.startsWith("SELECT")) {
    return convertSelectToMongo(sqlQuery);
  }

  // INSERT conversion
  if (trimmed.startsWith("INSERT INTO")) {
    return convertInsertToMongo(sqlQuery);
  }

  // UPDATE conversion
  if (trimmed.startsWith("UPDATE")) {
    return convertUpdateToMongo(sqlQuery);
  }

  throw new Error(
    "Unsupported SQL operation. Supports: SELECT, INSERT, UPDATE"
  );
}

interface SqlToolsProps {
  content: string;
  setContent: (value: string) => void;
  // setMsg: (msg: { text: string; type: "success" | "error" }) => void; // REMOVED
  setLastTransform: (
    transform: { type: string; original: string } | null
  ) => void;
  searchTerm?: string;
}

export const SqlTools: React.FC<SqlToolsProps> = ({
  content,
  setContent,
  // setMsg,
  setLastTransform,
  searchTerm = "",
}) => {
  const filter = (label: string) =>
    !searchTerm || label.toLowerCase().includes(searchTerm.toLowerCase());

  return (
    <div className="animate-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-2 mb-2">
        {filter("Format SQL") && (
          <ToolButton
            icon={<Maximize2 size={16} />}
            label="Format SQL"
            shortcut="Ctrl+S"
            onClick={async () => {
              toast.promise(
                async () => {
                  const { format } = await import("sql-formatter");
                  const formatted = format(content);
                  setContent(formatted);
                  setLastTransform(null);
                  return "SQL Formatted";
                },
                {
                  loading: "Formatting SQL...",
                  success: (msg) => msg,
                  error: (_error: any) => "Invalid SQL",
                }
              );
            }}
          />
        )}
        {filter("Minify SQL") && (
          <ToolButton
            icon={<Minimize2 size={16} />}
            label="Minify SQL"
            onClick={() => {
              const minified = content.replace(/\s+/g, " ").trim();
              setContent(minified);
              setLastTransform(null);
            }}
          />
        )}
        {filter("Convert to MongoDB") && (
          <ToolButton
            icon={<Database size={16} />}
            label="Convert to MongoDB"
            onClick={() => {
              toast.promise(
                async () => {
                  const mongoQuery = sqlToMongoDB(content);
                  setContent(mongoQuery);
                  setLastTransform(null);
                  return "Converted to MongoDB";
                },
                {
                  loading: "Converting...",
                  success: (msg) => msg,
                  error: (err: any) => err.message || "Conversion failed",
                }
              );
            }}
          />
        )}
        <div className="h-px bg-zinc-900 my-1" />
      </div>
    </div>
  );
};
