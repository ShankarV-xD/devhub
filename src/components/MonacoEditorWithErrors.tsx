import { useRef, useEffect } from "react";
import Editor, { type Monaco } from "@monaco-editor/react";
import { ErrorLocation } from "@/hooks/useErrorHighlighting";

interface MonacoEditorWithErrorsProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  errors?: ErrorLocation[];
  className?: string;
}

export function MonacoEditorWithErrors({
  value,
  onChange,
  language = "plaintext",
  errors = [],
  className,
}: MonacoEditorWithErrorsProps) {
  // Using any types since monaco-editor package types aren't available
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Set up error decorations
    updateErrorDecorations();

    // A1: Fix Keyboard Trap
    // Add escape hatch: ESC to focus sidebar
    editor.addCommand(monaco.KeyCode.Escape, () => {
      // Try to focus the tools sidebar or just blur
      const sidebar = document.getElementById("tools-sidebar") as HTMLElement;
      if (sidebar) {
        sidebar.focus();
      } else {
        // Fallback: search box or blur
        (document.activeElement as HTMLElement)?.blur();
      }
    });

    // Shift+Tab from start of file to exit editor
    editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Tab, () => {
      const position = editor.getPosition();
      if (position?.lineNumber === 1 && position?.column === 1) {
        // Trigger generic blur if at start
        (document.activeElement as HTMLElement)?.blur();
      }
    });
  };

  const updateErrorDecorations = () => {
    if (!editorRef.current || !monacoRef.current || errors.length === 0) {
      return;
    }

    const monaco = monacoRef.current;
    const model = editorRef.current.getModel();
    if (!model) return;

    // Clear existing markers
    monaco.editor.setModelMarkers(model, "smartinput", []);

    // Add new markers for errors
    const markers = errors.map((error) => ({
      severity: monaco.MarkerSeverity.Error,
      startLineNumber: error.line,
      startColumn: 1,
      endLineNumber: error.line,
      endColumn: model.getLineMaxColumn(error.line),
      message: error.message,
    }));

    monaco.editor.setModelMarkers(model, "smartinput", markers);

    // Add decorations for visual highlighting
    const decorations = errors.map((error) => ({
      range: new monaco.Range(error.line, 1, error.line, 1),
      options: {
        isWholeLine: true,
        className: "error-line-highlight",
        glyphMarginClassName: "error-line-glyph",
        glyphMarginHoverMessage: { value: error.message },
        minimap: {
          color: "#ff0000",
          position: monaco.editor.MinimapPosition.Inline,
        },
      },
    }));

    editorRef.current.createDecorationsCollection(decorations);
  };

  useEffect(() => {
    updateErrorDecorations();
  }, [errors]);

  return (
    <>
      <style jsx global>{`
        .error-line-highlight {
          background-color: rgba(255, 0, 0, 0.1);
        }
        .error-line-glyph {
          background-color: #ff0000;
          width: 4px !important;
          margin-left: 3px;
        }
      `}</style>
      <Editor
        height="100%"
        language={language}
        value={value}
        onChange={(newValue) => onChange(newValue || "")}
        onMount={handleEditorDidMount}
        theme="vs-dark"
        className={className}
        options={{
          tabIndex: 0,
          minimap: { enabled: true },
          fontSize: 14,
          lineNumbers: "on",
          glyphMargin: true,
          folding: true,
          lineDecorationsWidth: 10,
          lineNumbersMinChars: 3,
          renderLineHighlight: "all",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          insertSpaces: true,
          wordWrap: "on",
        }}
      />
    </>
  );
}
