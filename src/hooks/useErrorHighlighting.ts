import { useState, useCallback } from "react";

export interface ErrorLocation {
  line: number;
  column?: number;
  message: string;
  severity: "error" | "warning";
}

export function useErrorHighlighting() {
  const [errors, setErrors] = useState<ErrorLocation[]>([]);

  const parseErrorMessage = useCallback(
    (errorMessage: string): ErrorLocation | null => {
      // Try multiple error message formats
      const patterns = [
        // "Error at line 5"
        /(?:error|invalid|unexpected).*?(?:at\s+)?line\s+(\d+)/i,
        // "Line 5: error message"
        /line\s+(\d+)\s*:?\s*(.*)/i,
        // "Parse error on line 5"
        /(?:parse|syntax)\s+error.*?line\s+(\d+)/i,
        // JSON.parse errors: "position 123"
        /position\s+(\d+)/i,
      ];

      for (const pattern of patterns) {
        const match = errorMessage.match(pattern);
        if (match) {
          const lineOrPos = parseInt(match[1], 10);
          return {
            line: lineOrPos,
            message: errorMessage,
            severity: "error",
          };
        }
      }

      return null;
    },
    []
  );

  const addError = useCallback(
    (errorMessage: string) => {
      const error = parseErrorMessage(errorMessage);
      if (error) {
        setErrors((prev) => [...prev, error]);
      }
    },
    [parseErrorMessage]
  );

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const getErrorsForLine = useCallback(
    (line: number) => {
      return errors.filter((e) => e.line === line);
    },
    [errors]
  );

  return {
    errors,
    addError,
    clearErrors,
    getErrorsForLine,
    parseErrorMessage,
  };
}
