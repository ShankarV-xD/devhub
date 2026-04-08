import { Code, Minimize2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import ToolButton from "../ToolButton";
import { parse, print } from "graphql";

interface GraphqlToolsProps {
  content: string;
  setContent: (content: string) => void;
  searchTerm?: string;
}

export function GraphqlTools({
  content,
  setContent,
  searchTerm = "",
}: GraphqlToolsProps) {
  const filter = (label: string) =>
    !searchTerm || label.toLowerCase().includes(searchTerm.toLowerCase());

  const handleFormatQuery = () => {
    try {
      const ast = parse(content);
      const formatted = print(ast);
      setContent(formatted);
      toast.success("GraphQL formatted");
    } catch (error: any) {
      toast.error(`Format failed: ${error.message}`);
    }
  };

  const handleValidateSyntax = () => {
    try {
      parse(content);
      toast.success("✓ Valid GraphQL syntax");
    } catch (error: any) {
      toast.error(`Syntax error: ${error.message}`);
    }
  };

  const handleMinifyQuery = () => {
    try {
      const ast = parse(content);
      const minified = print(ast).replace(/\s+/g, " ").trim();
      setContent(minified);
      toast.success("GraphQL minified");
    } catch (error: any) {
      toast.error(`Minify failed: ${error.message}`);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {filter("Format Query") && (
        <ToolButton
          icon={<Code size={16} />}
          label="Format Query"
          onClick={handleFormatQuery}
        />
      )}
      {filter("Validate Syntax") && (
        <ToolButton
          icon={<CheckCircle size={16} />}
          label="Validate Syntax"
          onClick={handleValidateSyntax}
        />
      )}
      {filter("Minify Query") && (
        <ToolButton
          icon={<Minimize2 size={16} />}
          label="Minify Query"
          onClick={handleMinifyQuery}
        />
      )}
    </div>
  );
}
