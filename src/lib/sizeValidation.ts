import { SIZE_LIMITS } from "./constants";
import { getErrorMessage } from "./errorMessages";

export interface SizeCheckResult {
  allowed: boolean;
  warning?: string;
  error?: string;
}

/**
 * Check if content size is within acceptable limits
 */
export function checkContentSize(content: string): SizeCheckResult {
  const size = content.length;

  if (size > SIZE_LIMITS.MAX) {
    const errorMsg = getErrorMessage("file_too_large");
    return {
      allowed: false,
      error: `${errorMsg.message} (${formatSize(size)} / ${formatSize(SIZE_LIMITS.MAX)})`,
    };
  }

  if (size > SIZE_LIMITS.WARNING) {
    return {
      allowed: true,
      warning: `Large content detected (${formatSize(size)}). Performance may be affected.`,
    };
  }

  return { allowed: true };
}

/**
 * Format byte size for display
 */
export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} bytes`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Safe content setter with size validation
 */
export function createSafeContentSetter(
  setContent: (value: string) => void,
  onError: (message: string) => void,
  onWarning?: (message: string) => void
) {
  return (newContent: string) => {
    const sizeCheck = checkContentSize(newContent);

    if (!sizeCheck.allowed) {
      onError(sizeCheck.error || "Content too large");
      return false;
    }

    if (sizeCheck.warning && onWarning) {
      onWarning(sizeCheck.warning);
    }

    setContent(newContent);
    return true;
  };
}
