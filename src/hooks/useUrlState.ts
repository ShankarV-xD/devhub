import { useState, useEffect, useCallback } from "react";
import LZString from "lz-string";

export function useUrlState(initialValue: string = "") {
  const [state, setState] = useState(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.slice(1);
      if (hash) {
        try {
          const decompressed = LZString.decompressFromEncodedURIComponent(hash);
          if (decompressed) {
            setState(decompressed);
          }
        } catch (e) {
          console.error("Failed to load state from URL", e);
        }
      }
      setIsLoaded(true);
    }
  }, []);

  const setUrlState = useCallback((newValue: string) => {
    setState(newValue);
    if (typeof window !== "undefined") {
      if (newValue) {
        const compressed = LZString.compressToEncodedURIComponent(newValue);
        window.history.replaceState(null, "", `#${compressed}`);
      } else {
        window.history.replaceState(null, "", window.location.pathname);
      }
    }
  }, []);

  return [state, setUrlState, isLoaded] as const;
}
