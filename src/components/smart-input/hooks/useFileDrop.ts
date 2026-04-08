import { useState, useCallback } from "react";
import { toast } from "sonner";

interface UseFileDropOptions {
  onFileLoad: (content: string, filename: string) => void;
  enabled?: boolean;
}

export function useFileDrop({
  onFileLoad,
  enabled = true,
}: UseFileDropOptions) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      if (!enabled) return;
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    },
    [enabled]
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      if (!enabled) return;
      e.preventDefault();
      e.stopPropagation();

      // Only set false if we're leaving the drop zone entirely
      // (This simplistic check prevents flickering when moving over child elements)
      if (e.currentTarget.contains(e.relatedTarget as Node)) return;

      setIsDragging(false);
    },
    [enabled]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      if (!enabled) return;
      e.preventDefault();
      e.stopPropagation();
    },
    [enabled]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      if (!enabled) return;
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        const file = files[0];
        // Check size (e.g. 5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          toast.error("File is too large (max 5MB)");
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result;
          if (typeof text === "string") {
            onFileLoad(text, file.name);
            toast.success(`Loaded ${file.name}`);
          }
        };
        reader.onerror = () => {
          toast.error("Failed to read file");
        };
        reader.readAsText(file);
      }
    },
    [enabled, onFileLoad]
  );

  return {
    isDragging,
    dragHandlers: {
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDragOver: handleDragOver,
      onDrop: handleDrop,
    },
  };
}
