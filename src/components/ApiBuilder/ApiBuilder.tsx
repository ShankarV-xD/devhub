import { useState, useEffect } from "react";
import { Send, History as HistoryIcon, X, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { MethodSelector } from "./MethodSelector";
import { HeadersEditor } from "./HeadersEditor";
import { BodyEditor } from "./BodyEditor";
import { ResponsePanel } from "./ResponsePanel";
import { HistoryPanel } from "./HistoryPanel";
import {
  ApiRequest,
  ApiResponse,
  HeaderRow,
  HttpMethod,
  BodyType,
} from "./types";

const HISTORY_KEY = "devhub-api-history";

interface ApiBuilderProps {
  onClose?: () => void;
}

export function ApiBuilder({ onClose }: ApiBuilderProps = {}) {
  const [method, setMethod] = useState<HttpMethod>("GET");
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState<HeaderRow[]>([
    { key: "Content-Type", value: "application/json", enabled: true },
  ]);
  const [bodyType, setBodyType] = useState<BodyType>("none");
  const [body, setBody] = useState("");
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<ApiRequest[]>([]);

  // Load history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem(HISTORY_KEY);
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to load history:", e);
      }
    }
  }, []);

  const saveToHistory = (request: ApiRequest) => {
    const newHistory = [request, ...history].slice(0, 50); // Keep last 50
    setHistory(newHistory);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
    toast.success("History cleared");
  };

  const loadFromHistory = (request: ApiRequest) => {
    setMethod(request.method);
    setUrl(request.url);
    setHeaders(
      Object.entries(request.headers).map(([key, value]) => ({
        key,
        value,
        enabled: true,
      }))
    );
    setBodyType(request.bodyType);
    setBody(request.body);
    setShowHistory(false);
    toast.success("Request loaded from history");
  };

  const sendRequest = async () => {
    if (!url) {
      toast.error("Please enter a URL");
      return;
    }

    setLoading(true);
    setResponse(null);
    const startTime = Date.now();

    try {
      // Build headers object
      const requestHeaders: Record<string, string> = {};
      headers.forEach((h) => {
        if (h.enabled && h.key && h.value) {
          requestHeaders[h.key] = h.value;
        }
      });

      // Prepare body
      let requestBody: string | undefined;
      if (method !== "GET" && method !== "HEAD" && bodyType !== "none") {
        if (bodyType === "json") {
          try {
            JSON.parse(body); // Validate JSON before sending
            requestBody = body;
          } catch {
            toast.error("Invalid JSON in body");
            setLoading(false);
            return;
          }
        } else {
          requestBody = body;
        }
      }

      /**
       * Route through the server-side proxy (/api/proxy) instead of fetching
       * the URL directly from the browser.
       *
       * WHY: Browsers block cross-origin requests unless the target server
       * includes Access-Control-Allow-Origin headers. Postman works because
       * it's not a browser. Our proxy runs the fetch in Node.js (server-side)
       * where CORS is not enforced, then returns the result to the browser.
       */
      const proxyRes = await fetch("/api/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          method,
          headers: requestHeaders,
          body: requestBody,
        }),
      });

      const data = await proxyRes.json();
      const time = Date.now() - startTime;

      const apiResponse: ApiResponse = {
        status: data.status,
        statusText: data.statusText,
        headers: data.headers ?? {},
        body: data.body ?? "",
        time: data.time ?? time,
        size: data.size ?? (data.body?.length ?? 0),
        error: data.error,
      };

      setResponse(apiResponse);

      // Save to history
      const request: ApiRequest = {
        id: Date.now().toString(),
        method,
        url,
        headers: requestHeaders,
        body: requestBody ?? "",
        bodyType,
        timestamp: Date.now(),
      };
      saveToHistory(request);

      if (data.error) {
        toast.error(`Request failed: ${data.error}`);
      } else {
        toast.success(`${data.status} · ${data.time}ms`);
      }
    } catch (error: unknown) {
      const time = Date.now() - startTime;
      const message =
        error instanceof Error ? error.message : "Request failed";
      setResponse({
        status: 0,
        statusText: "Error",
        headers: {},
        body: "",
        time,
        size: 0,
        error: message,
      });
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const clearRequest = () => {
    setMethod("GET");
    setUrl("");
    setHeaders([
      { key: "Content-Type", value: "application/json", enabled: true },
    ]);
    setBodyType("none");
    setBody("");
    setResponse(null);
    toast.success("Request cleared");
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950">
      {/* Header */}
      <div className="flex items-center justify-end gap-3 p-4 border-b border-zinc-800">
        <button
          onClick={clearRequest}
          className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition-colors"
          title="Clear request"
        >
          <RotateCcw size={16} />
          Clear
        </button>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition-colors"
        >
          <HistoryIcon size={16} />
          History
        </button>
        <button
          onClick={() => onClose?.()}
          className="cursor-pointer p-2 hover:bg-zinc-800 rounded transition-colors text-zinc-400 hover:text-zinc-200"
          title="Back to Editor"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content — min-w-0 lets flex-1 shrink when history opens */}
        <div className="flex-1 min-w-0 flex flex-col overflow-auto custom-scrollbar p-6 space-y-6">
          {/* URL Bar */}
          <div className="flex gap-2">
            <MethodSelector value={method} onChange={setMethod} />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.example.com/endpoint"
              className="flex-1 px-4 py-2 bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  sendRequest();
                }
              }}
            />
            <button
              onClick={sendRequest}
              disabled={loading || !url}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-r transition-colors"
            >
              <Send size={16} />
              {loading ? "Sending..." : "Send"}
            </button>
          </div>

          {/* Request Configuration — single column when history is open to avoid overlap */}
          <div className={`grid gap-6 ${showHistory ? "grid-cols-1" : "grid-cols-2"}`}>
            <HeadersEditor headers={headers} onChange={setHeaders} />
            <BodyEditor
              bodyType={bodyType}
              body={body}
              onBodyTypeChange={setBodyType}
              onBodyChange={setBody}
            />
          </div>

          {/* Divider */}
          <div className="border-t border-zinc-800"></div>

          {/* Response Section */}
          <div>
            <h3 className="text-sm font-medium text-zinc-300 mb-3">Response</h3>
            <ResponsePanel response={response} loading={loading} />
          </div>
        </div>

        {/* History Sidebar */}
        {showHistory && (
          <div className="w-80 border-l border-zinc-800 p-4 overflow-auto custom-scrollbar">
            <HistoryPanel
              history={history}
              onSelect={loadFromHistory}
              onClear={clearHistory}
            />
          </div>
        )}
      </div>
    </div>
  );
}
