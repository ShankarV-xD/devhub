import React from "react";

interface JsonTableProps {
  data: unknown;
}

const JsonTable: React.FC<JsonTableProps> = ({ data }) => {
  // Helper to stringify complex values
  const stringifyValue = (value: unknown): string => {
    if (value === null) return "null";
    if (value === undefined) return "undefined";
    if (typeof value === "object") return JSON.stringify(value);
    if (typeof value === "boolean") return value.toString();
    return String(value);
  };

  // Check if data is an array of objects
  const isArrayOfObjects =
    Array.isArray(data) &&
    data.length > 0 &&
    typeof data[0] === "object" &&
    data[0] !== null;

  if (isArrayOfObjects) {
    // Get all unique keys from all objects
    const allKeys = new Set<string>();
    data.forEach((item: unknown) => {
      if (typeof item === "object" && item !== null) {
        Object.keys(item).forEach((key) => allKeys.add(key));
      }
    });
    const columns = Array.from(allKeys);

    return (
      <div className="w-full h-full overflow-auto custom-scrollbar">
        <table className="w-full border-collapse min-w-full">
          <thead className="sticky top-0 z-10 bg-zinc-900">
            <tr>
              <th className="border border-zinc-800 px-4 py-3 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider bg-zinc-900">
                #
              </th>
              {columns.map((col) => (
                <th
                  key={col}
                  className="border border-zinc-800 px-4 py-3 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider bg-zinc-900 whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row: Record<string, unknown>, rowIndex: number) => (
              <tr
                key={rowIndex}
                className="group hover:bg-zinc-800/60 transition-colors duration-150"
              >
                <td className="border border-zinc-800 px-4 py-3 text-sm font-mono text-zinc-450 whitespace-nowrap">
                  {rowIndex + 1}
                </td>
                {columns.map((col) => (
                  <td
                    key={col}
                    className="border border-zinc-800 px-4 py-3 text-sm font-mono text-zinc-300 max-w-md"
                  >
                    <div className="break-words">
                      {row && col in row ? (
                        <span
                          className={
                            typeof row[col] === "string"
                              ? "text-green-400"
                              : typeof row[col] === "number"
                                ? "text-blue-400"
                                : typeof row[col] === "boolean"
                                  ? "text-orange-400"
                                  : row[col] === null
                                    ? "text-rose-400"
                                    : "text-purple-400"
                          }
                        >
                          {stringifyValue(row[col])}
                        </span>
                      ) : (
                        <span className="text-zinc-700 italic">—</span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Handle single object
  if (typeof data === "object" && data !== null && !Array.isArray(data)) {
    const entries = Object.entries(data);
    return (
      <div className="w-full h-full overflow-auto custom-scrollbar">
        <table
          className="w-full border-collapse"
          aria-label="Object Properties"
        >
          <thead className="sticky top-0 z-10 bg-zinc-900">
            <tr>
              <th className="border border-zinc-800 px-4 py-3 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider bg-zinc-900 w-1/3">
                Attribute
              </th>
              <th className="border border-zinc-800 px-4 py-3 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider bg-zinc-900">
                Value
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map(([key, value], index) => (
              <tr
                key={index}
                className="group hover:bg-zinc-800/60 transition-colors duration-150"
              >
                <td className="border border-zinc-800 px-4 py-3 text-sm font-mono text-purple-400 font-medium whitespace-nowrap">
                  {key}
                </td>
                <td className="border border-zinc-800 px-4 py-3 text-sm font-mono text-zinc-300">
                  <div className="break-words">
                    <span
                      className={
                        typeof value === "string"
                          ? "text-green-400"
                          : typeof value === "number"
                            ? "text-blue-400"
                            : typeof value === "boolean"
                              ? "text-orange-400"
                              : value === null
                                ? "text-rose-400"
                                : "text-purple-400"
                      }
                    >
                      {stringifyValue(value)}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Handle arrays of primitives
  if (Array.isArray(data)) {
    return (
      <div className="w-full h-full overflow-auto custom-scrollbar">
        <table className="w-full border-collapse" aria-label="Array Data">
          <thead className="sticky top-0 z-10 bg-zinc-900">
            <tr>
              <th className="border border-zinc-800 px-4 py-3 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider bg-zinc-900">
                Index
              </th>
              <th className="border border-zinc-800 px-4 py-3 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider bg-zinc-900">
                Value
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((value, index) => (
              <tr
                key={index}
                className="group hover:bg-zinc-800/60 transition-colors duration-150"
              >
                <td className="border border-zinc-800 px-4 py-3 text-sm font-mono text-zinc-450">
                  {index}
                </td>
                <td className="border border-zinc-800 px-4 py-3 text-sm font-mono text-zinc-300">
                  <div className="break-words">
                    <span
                      className={
                        typeof value === "string"
                          ? "text-green-400"
                          : typeof value === "number"
                            ? "text-blue-400"
                            : typeof value === "boolean"
                              ? "text-orange-400"
                              : value === null
                                ? "text-rose-400"
                                : "text-purple-400"
                      }
                    >
                      {stringifyValue(value)}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Handle primitive values
  return (
    <div className="w-full h-full overflow-auto custom-scrollbar flex items-center justify-center p-8">
      <div className="text-center">
        <div className="text-sm text-zinc-500 mb-2 uppercase tracking-wider">
          Value
        </div>
        <div className="text-2xl font-mono text-zinc-300">
          <span
            className={
              typeof data === "string"
                ? "text-green-400"
                : typeof data === "number"
                  ? "text-blue-400"
                  : typeof data === "boolean"
                    ? "text-orange-400"
                    : data === null
                      ? "text-rose-400"
                      : "text-purple-400"
            }
          >
            {stringifyValue(data)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default JsonTable;
