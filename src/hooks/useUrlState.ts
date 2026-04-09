import { useState, useEffect, useCallback, useRef } from "react";
import LZString from "lz-string";

const MAX_URL_LENGTH = 2000;

export function useUrlState(initialValue: string = "") {
  const [state, setState] = useState(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);
  const [urlOverflow, setUrlOverflow] = useState(false);
  const [shareableUrl, setShareableUrl] = useState<string | null>(null);
  const pendingShareId = useRef<string | null>(null);

  // Load from URL on mount: check ?s=<id> first, then #<hash>
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const shareId = params.get("s");

    if (shareId) {
      fetch(`/api/share?id=${encodeURIComponent(shareId)}`)
        .then((res) => {
          if (!res.ok) throw new Error("Share not found");
          return res.json();
        })
        .then((data) => {
          if (data.content) {
            setState(data.content);
            // Keep the share ID in the URL so users can copy/share it
            window.history.replaceState(null, "", `?s=${shareId}`);
          }
        })
        .catch(() => {
          // Share not found or expired, fall through to hash
          const hash = window.location.hash.slice(1);
          if (hash) {
            try {
              const decompressed =
                LZString.decompressFromEncodedURIComponent(hash);
              if (decompressed) {
                setState(decompressed);
              }
            } catch (e) {
              console.error("Failed to load state from URL", e);
            }
          }
        })
        .finally(() => setIsLoaded(true));
      return;
    }

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
  }, []);

  const setUrlState = useCallback((newValue: string) => {
    setState(newValue);
    setUrlOverflow(false);
    setShareableUrl(null);

    if (typeof window === "undefined") return;

    if (!newValue) {
      window.history.replaceState(null, "", window.location.pathname);
      return;
    }

    const compressed = LZString.compressToEncodedURIComponent(newValue);
    const fullUrl = `${window.location.origin}${window.location.pathname}#${compressed}`;

    if (fullUrl.length <= MAX_URL_LENGTH) {
      window.history.replaceState(null, "", `#${compressed}`);
      setShareableUrl(fullUrl);
    } else {
      // Content too large for URL - store on server for sharing
      // Clear hash for now, upload happens lazily via getShareableUrl()
      window.history.replaceState(null, "", window.location.pathname);
      setUrlOverflow(true);
    }
  }, []);

  // Get a shareable URL. For small content, returns URL immediately.
  // For large content, uploads to server and returns short URL.
  const getShareableUrl = useCallback(
    async (content: string): Promise<string> => {
      if (!content) return window.location.href;

      const compressed = LZString.compressToEncodedURIComponent(content);
      const hashUrl = `${window.location.origin}${window.location.pathname}#${compressed}`;

      if (hashUrl.length <= MAX_URL_LENGTH) {
        return hashUrl;
      }

      // Check if we already have a pending upload for this content
      if (pendingShareId.current) {
        const baseUrl = `${window.location.origin}${window.location.pathname}`;
        return `${baseUrl}?s=${pendingShareId.current}`;
      }

      try {
        const res = await fetch("/api/share", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        });
        if (!res.ok) throw new Error("Failed to upload content");
        const data = await res.json();
        pendingShareId.current = data.id;
        const baseUrl = `${window.location.origin}${window.location.pathname}`;
        const url = `${baseUrl}?s=${data.id}`;
        setShareableUrl(url);
        window.history.replaceState(null, "", `?s=${data.id}`);
        return url;
      } catch (e) {
        console.error("Failed to create share link:", e);
        return "";
      }
    },
    []
  );

  const clearUrl = useCallback(() => {
    setUrlOverflow(false);
    setShareableUrl(null);
    pendingShareId.current = null;
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  return {
    state,
    setUrlState,
    isLoaded,
    urlOverflow,
    clearUrl,
    getShareableUrl,
    shareableUrl,
  } as const;
}
