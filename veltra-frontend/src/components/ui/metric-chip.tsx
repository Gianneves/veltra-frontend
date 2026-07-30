import { cn } from "@/lib/utils";

interface MetricChipProps {
  label: string;
  value: string;
  className?: string;
}

export function MetricChip({ label, value, className }: MetricChipProps) {
  return (
    <div
      className={cn(
        "inline-flex flex-col items-center gap-0.5 rounded-md bg-surface-container px-3 py-1.5",
        className
      )}
    >
      <span className="font-geist text-xl font-semibold leading-none tracking-tight text-on-surface">
        {value}
      </span>
      <span className="font-geist text-label-sm tracking-[0.05em] text-on-surface-variant">
        {label.toUpperCase()}
      </span>
    </div>
  );
}
