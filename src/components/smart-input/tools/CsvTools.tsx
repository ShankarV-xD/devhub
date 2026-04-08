import { FileJson, Download, Table, Eye } from "lucide-react";
import { toast } from "sonner";
import ToolButton from "../ToolButton";
import Papa from "papaparse";

interface CsvToolsProps {
  content: string;
  setContent: (content: string) => void;
  searchTerm?: string;
  setIsPreviewMode?: (mode: boolean) => void;
}

export function CsvTools({
  content,
  setContent,
  searchTerm = "",
  setIsPreviewMode,
}: CsvToolsProps) {
  const filter = (label: string) =>
    !searchTerm || label.toLowerCase().includes(searchTerm.toLowerCase());

  const handleConvertToJson = () => {
    try {
      const parsed = Papa.parse(content, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
      });

      if (parsed.errors.length > 0) {
        toast.error("CSV parsing error");
        return;
      }

      setContent(JSON.stringify(parsed.data, null, 2));
      toast.success("Converted to JSON");
    } catch (error) {
      toast.error("Failed to convert CSV to JSON");
    }
  };

  const handleDownloadCsv = () => {
    try {
      const blob = new Blob([content], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `data-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("CSV downloaded");
    } catch (error) {
      toast.error("Failed to download CSV");
    }
  };

  const handleFormat = () => {
    try {
      const parsed = Papa.parse(content, {
        header: true,
        skipEmptyLines: true,
      });

      if (parsed.errors.length > 0) {
        toast.error("CSV parsing error");
        return;
      }

      const formatted = Papa.unparse(parsed.data, {
        header: true,
      });

      setContent(formatted);
      toast.success("CSV formatted");
    } catch (error) {
      toast.error("Failed to format CSV");
    }
  };

  return (
    <div className="flex items-center gap-2">
      {filter("Format CSV") && (
        <ToolButton
          icon={<Table size={16} />}
          label="Format CSV"
          onClick={handleFormat}
        />
      )}
      {filter("Convert to JSON") && (
        <ToolButton
          icon={<FileJson size={16} />}
          label="Convert to JSON"
          onClick={handleConvertToJson}
        />
      )}
      {filter("Download CSV") && (
        <ToolButton
          icon={<Download size={16} />}
          label="Download CSV"
          onClick={handleDownloadCsv}
        />
      )}

      {setIsPreviewMode && (
        <ToolButton
          icon={<Eye size={16} />}
          label="Preview Table"
          onClick={() => setIsPreviewMode(true)}
        />
      )}
    </div>
  );
}
