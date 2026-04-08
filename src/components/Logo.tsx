import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className}: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="font-bold text-xl tracking-tight text-white">
        Dev<span className="text-emerald-500">Hub</span>
      </span>
    </div>
  );
}
