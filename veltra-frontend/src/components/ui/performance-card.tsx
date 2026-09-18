import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PerformanceCardProps {
  label: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function PerformanceCard({
  label,
  icon,
  action,
  children,
  className,
}: PerformanceCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-surface-container-highest bg-surface-container-lowest p-5",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <p className="flex items-center gap-1.5 font-geist text-label-sm tracking-[0.05em] text-on-surface-variant">
          {icon}
          {label.toUpperCase()}
        </p>
        {action}
      </div>
      {children}
    </div>
  );
}
