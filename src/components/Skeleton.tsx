import { clsx } from "clsx";

interface SkeletonProps {
  className?: string;
  variant?: "pulse" | "shimmer";
}

export function Skeleton({ className, variant = "pulse" }: SkeletonProps) {
  return (
    <div
      className={clsx(
        "bg-zinc-900 rounded",
        variant === "pulse" && "animate-pulse",
        variant === "shimmer" &&
          "animate-shimmer bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 bg-[length:1000px_100%]",
        className
      )}
    />
  );
}

export function EditorSkeleton() {
  return (
    <div className="w-full h-full p-4 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="pt-4 space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );
}

export function TypeBadgeSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <Skeleton className="h-5 w-20" />
      <Skeleton className="h-4 w-4 rounded-full" variant="shimmer" />
    </div>
  );
}
