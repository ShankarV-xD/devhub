"use client";

import React, { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  /** Human-readable name shown in the error header, e.g. "JSON Viewer" */
  toolName: string;
  /** Optional override for the retry button label */
  retryLabel?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * AR4: ToolErrorBoundary
 *
 * An inline, tool-scoped error boundary. When a tool crashes:
 * - Only that tool shows an error — all other tools keep working.
 * - A "Try Again" button resets the boundary (no page reload needed).
 * - In development, the error message is shown for quick debugging.
 *
 * Usage:
 *   <ToolErrorBoundary toolName="JSON Viewer">
 *     <JsonViewer data={parsedJson} />
 *   </ToolErrorBoundary>
 */
export class ToolErrorBoundary extends Component<Props, State> {
  static defaultProps = {
    retryLabel: "Try Again",
  };

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`[ToolErrorBoundary] Error in "${this.props.toolName}":`, error, errorInfo);

    // TODO: Forward to error monitoring service (Sentry, etc.)
    // if (process.env.NEXT_PUBLIC_SENTRY_DSN && window.Sentry) {
    //   Sentry.captureException(error, {
    //     tags: { tool: this.props.toolName },
    //     extra: { componentStack: errorInfo.componentStack },
    //   });
    // }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          aria-live="assertive"
          className="p-4 my-2 bg-red-500/10 border border-red-500/40 rounded-lg"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle
              className="w-5 h-5 text-red-500 shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-red-400 mb-1 text-sm">
                {this.props.toolName} encountered an error
              </h3>
              <p className="text-xs text-zinc-400 mb-3">
                This tool crashed unexpectedly. Other tools are unaffected.
              </p>

              {/* Show error details in development mode only */}
              {process.env.NODE_ENV === "development" && this.state.error && (
                <pre className="text-[11px] font-mono bg-zinc-950 border border-zinc-800 text-red-300 p-2 rounded mb-3 overflow-auto max-h-28 whitespace-pre-wrap break-all">
                  {this.state.error.name}: {this.state.error.message}
                </pre>
              )}

              <button
                onClick={this.handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded text-xs font-medium transition-colors cursor-pointer"
              >
                <RefreshCw size={12} aria-hidden="true" />
                {this.props.retryLabel}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
