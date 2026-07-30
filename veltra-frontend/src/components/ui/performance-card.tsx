import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PerformanceCardProps {
  label: string;
  children: ReactNode;
  className?: string;
}

export function PerformanceCard({ label, children, className }: PerformanceCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-surface-container-highest bg-surface-container-lowest p-5",
        className
      )}
    >
      <p className="font-geist text-label-sm tracking-[0.05em] text-on-surface-variant mb-3">
        {label.toUpperCase()}
      </p>
      {children}
    </div>
  );
}
