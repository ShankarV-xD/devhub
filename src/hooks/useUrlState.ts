import { useState, useEffect, useCallback } from "react";
import LZString from "lz-string";

const MAX_URL_LENGTH = 2000;

export function useUrlState(initialValue: string = "") {
  const [state, setState] = useState(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);
  const [urlOverflow, setUrlOverflow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.slice(1);
    if (hash) {
      try {
        const decompressed = LZString.decompressFromEncodedURIComponent(hash);
        if (decompressed) {
          // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional mount-time initialization from URL
          setState(decompressed);
        }
      } catch (e) {
        console.error("Failed to load state from URL", e);
      }
    }
    setIsLoaded(true);
  }, []);

  const setUrlState = useCallback((newValue: string) => {
    setState(newValue);
    setUrlOverflow(false);
    if (typeof window !== "undefined") {
      if (newValue) {
        const compressed = LZString.compressToEncodedURIComponent(newValue);
        const fullUrl = `${window.location.origin}${window.location.pathname}#${compressed}`;
        if (fullUrl.length > MAX_URL_LENGTH) {
          setUrlOverflow(true);
          window.history.replaceState(null, "", window.location.pathname);
        } else {
          window.history.replaceState(null, "", `#${compressed}`);
        }
      } else {
        window.history.replaceState(null, "", window.location.pathname);
      }
    }
  }, []);

  const clearUrl = useCallback(() => {
    setUrlOverflow(false);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  return { state, setUrlState, isLoaded, urlOverflow, clearUrl } as const;
}
