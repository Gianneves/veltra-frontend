import { cn } from "@/lib/utils";

interface DataDisplayProps {
  value: string;
  unit?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function DataDisplay({ value, unit, size = "md", className }: DataDisplayProps) {
  return (
    <span
      className={cn(
        "font-geist font-semibold leading-none tracking-tight",
        size === "lg" && "text-4xl",
        size === "md" && "text-2xl",
        size === "sm" && "text-lg",
        className
      )}
    >
      {value}
      {unit && <span className="text-sm font-normal text-on-surface-variant ml-1">{unit}</span>}
    </span>
  );
}
