"use client";

import dynamic from "next/dynamic";
import { ErrorBoundary } from "./ErrorBoundary";

const SmartInput = dynamic(() => import("./smart-input"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-svh bg-black text-zinc-500 font-mono text-xs">
      INITIALIZING DEVHUB...
    </div>
  ),
});

export default function SmartInputWrapper() {
  return (
    <ErrorBoundary>
      <SmartInput />
    </ErrorBoundary>
  );
}
