import React, { useState } from "react";
import { Table, X } from "lucide-react";
import ToolButton from "../ToolButton";

interface MarkdownToolsProps {
  content: string;
  setContent: (value: string) => void;
}

export const MarkdownTools: React.FC<MarkdownToolsProps> = ({
  content,
  setContent,
}) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <ToolButton
        icon={<Table size={16} />}
        label="Generate Table"
        onClick={() => setShowModal(true)}
      />

      <MarkdownTableGeneratorModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onInsert={(tableText) => {
          setContent(content + (content ? "\n\n" : "") + tableText);
          setShowModal(false);
        }}
      />
    </>
  );
};

interface MarkdownTableGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (tableText: string) => void;
}

const MarkdownTableGeneratorModal: React.FC<
  MarkdownTableGeneratorModalProps
> = ({ isOpen, onClose, onInsert }) => {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [data, setData] = useState<string[][]>(
    Array(rows).fill(Array(cols).fill(""))
  );

  if (!isOpen) return null;

  const handleDataChange = (r: number, c: number, value: string) => {
    const newData = data.map((rowArr, i) =>
      i === r ? rowArr.map((cell, j) => (j === c ? value : cell)) : rowArr
    );
    setData(newData);
  };

  const handleDimensionsChange = (newRows: number, newCols: number) => {
    setRows(newRows);
    setCols(newCols);
    setData((prev) => {
      const newData = Array(newRows)
        .fill(null)
        .map((_, r) =>
          Array(newCols)
            .fill(null)
            .map((__, c) => (prev[r] && prev[r][c]) || "")
        );
      return newData;
    });
  };

  const generateMarkdown = () => {
    if (rows === 0 || cols === 0) return "";
    let md = "";

    // Header
    md += "| " + data[0].join(" | ") + " |\n";
    // Separator
    md += "| " + Array(cols).fill("---").join(" | ") + " |\n";
    // Rows
    for (let r = 1; r < rows; r++) {
      md += "| " + data[r].join(" | ") + " |\n";
    }
    return md;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-2xl px-6 py-5 flex flex-col gap-4 max-h-[90vh]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-100 font-medium">
            <Table size={18} />
            <h3>Markdown Table Generator</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex gap-4 mb-2 text-sm">
          <div className="flex flex-col gap-1">
            <label className="text-zinc-400">Rows</label>
            <input
              type="number"
              min={1}
              max={20}
              value={rows}
              onChange={(e) =>
                handleDimensionsChange(parseInt(e.target.value) || 1, cols)
              }
              className="bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-zinc-200 outline-none w-20"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-zinc-400">Columns</label>
            <input
              type="number"
              min={1}
              max={10}
              value={cols}
              onChange={(e) =>
                handleDimensionsChange(rows, parseInt(e.target.value) || 1)
              }
              className="bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-zinc-200 outline-none w-20"
            />
          </div>
        </div>

        <div className="overflow-auto custom-scrollbar flex-1 border border-zinc-800 rounded">
          <table className="w-full text-sm">
            <tbody>
              {data.map((row, rCheck) => (
                <tr
                  key={rCheck}
                  className={rCheck === 0 ? "bg-zinc-800/50" : ""}
                >
                  {row.map((cell, cCheck) => (
                    <td
                      key={cCheck}
                      className="p-1 min-w-[100px] border-b border-zinc-800 border-r last:border-r-0"
                    >
                      <input
                        type="text"
                        value={cell}
                        onChange={(e) =>
                          handleDataChange(rCheck, cCheck, e.target.value)
                        }
                        placeholder={
                          rCheck === 0
                            ? `Header ${cCheck + 1}`
                            : `Row ${rCheck} Col ${cCheck + 1}`
                        }
                        className="w-full bg-transparent px-2 py-1 text-zinc-200 placeholder-zinc-600 outline-none"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end pt-2 border-t border-zinc-800">
          <button
            onClick={() => onInsert(generateMarkdown())}
            className="px-4 py-2 bg-zinc-100 text-zinc-900 rounded hover:bg-white font-medium text-sm transition-colors"
          >
            Insert Table
          </button>
        </div>
      </div>
    </div>
  );
};
