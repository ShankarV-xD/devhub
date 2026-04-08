"use client";

import { useEffect, useRef } from "react";
import { DiffEditor, loader } from "@monaco-editor/react";

// Pre-define theme to avoid initial white flash
if (typeof window !== "undefined") {
  loader.init().then((monaco) => {
    monaco.editor.defineTheme("devhub-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#00000000",
        "diffEditor.insertedTextBackground": "#10b98120",
        "diffEditor.removedTextBackground": "#ef444420",
        "scrollbar.shadow": "#00000000",
      },
    });
  });
}

interface DiffViewerProps {
  original: string;
  modified: string;
  theme?: string;
  language?: string;
}

export default function DiffViewer({
  original,
  modified,
  onChange,
  theme = "devhub-dark",
  language = "plaintext",
}: DiffViewerProps & { onChange?: (val: string) => void }) {
  const subscriptionRef = useRef<any>(null);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      // Proper cleanup order to prevent "TextModel got disposed before DiffEditorWidget model got reset"
      if (editorRef.current) {
        try {
          // First, reset the diff editor model
          editorRef.current.setModel(null);
        } catch (e) {
          // Ignore errors during cleanup
        }
      }

      // Then dispose the subscription
      if (subscriptionRef.current) {
        subscriptionRef.current.dispose();
        subscriptionRef.current = null;
      }

      // Finally dispose the editor
      if (editorRef.current) {
        try {
          editorRef.current.dispose();
        } catch (e) {
          // Ignore errors during cleanup
        }
        editorRef.current = null;
      }
    };
  }, []);

  const handleEditorDidMount = (
    editor: Parameters<
      NonNullable<React.ComponentProps<typeof DiffEditor>["onMount"]>
    >[0]
  ) => {
    // Store the editor reference for cleanup
    editorRef.current = editor;

    const modifiedEditor = editor.getModifiedEditor();
    const originalEditor = editor.getOriginalEditor();

    // Ensure word wrap is off on both editors for consistency
    modifiedEditor.updateOptions({ wordWrap: "off" });
    originalEditor.updateOptions({ wordWrap: "off" });

    subscriptionRef.current = modifiedEditor.onDidChangeModelContent(() => {
      if (modifiedEditor.getModel()?.isDisposed()) return;
      if (onChange) {
        onChange(modifiedEditor.getValue());
      }
    });
  };

  return (
    <div className="h-full w-full border border-zinc-800 rounded-lg overflow-hidden bg-black relative group">
      {/* Placeholders */}
      {!original && (
        <div className="absolute top-1/2 left-[25%] -translate-x-1/2 -translate-y-1/2 text-zinc-700 text-sm pointer-events-none select-none font-mono">
          Original (Empty)
        </div>
      )}
      {!modified && (
        <div className="absolute top-1/2 right-[25%] translate-x-1/2 -translate-y-1/2 text-zinc-700 text-sm pointer-events-none select-none font-mono">
          Type here to compare...
        </div>
      )}

      <DiffEditor
        key={language}
        height="100%"
        language={language}
        original={original}
        modified={modified}
        theme={theme}
        onMount={handleEditorDidMount}
        options={{
          readOnly: false, // Allow editing
          originalEditable: false, // Keep original read-only
          minimap: { enabled: false },
          renderSideBySide: true,
          fontSize: 14,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          fontFamily: "monospace",
          lineNumbers: "off",
          renderLineHighlight: "none",
          scrollbar: {
            vertical: "auto",
            horizontal: "auto",
            useShadows: false,
          },
          diffCodeLens: false,
          renderOverviewRuler: false,
          wordWrap: "off",
        }}
      />
    </div>
  );
}
