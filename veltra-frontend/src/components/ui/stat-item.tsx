import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatItemProps {
  label: string;
  value: string;
  icon?: ReactNode;
  size?: "sm" | "md";
  align?: "left" | "right";
  className?: string;
}

export function StatItem({
  label,
  value,
  icon,
  size = "sm",
  align = "left",
  className,
}: StatItemProps) {
  return (
    <div
      className={cn(
        "flex flex-col",
        align === "right" ? "items-end text-right" : "items-start",
        className
      )}
    >
      <span
        className={cn(
          "flex items-center gap-1 font-geist font-semibold leading-none text-on-surface",
          size === "md" ? "text-lg" : "text-sm"
        )}
      >
        {icon}
        {value}
      </span>
      <span className="mt-0.5 font-geist text-[10px] uppercase tracking-[0.05em] text-on-surface-variant">
        {label}
      </span>
    </div>
  );
}
