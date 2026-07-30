import { cn } from "@/lib/utils";

interface ProgressSegment {
  label: string;
  filled: boolean;
}

interface ProgressBarProps {
  segments: ProgressSegment[];
  className?: string;
}

export function ProgressBar({ segments, className }: ProgressBarProps) {
  return (
    <div className={cn("flex gap-1", className)}>
      {segments.map((seg, i) => (
        <div
          key={i}
          className={cn(
            "h-2 flex-1 rounded-full transition-colors",
            seg.filled ? "bg-primary" : "bg-surface-container-highest"
          )}
          title={seg.label}
        />
      ))}
    </div>
  );
}
