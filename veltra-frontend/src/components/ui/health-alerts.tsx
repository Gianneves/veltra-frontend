"use client";

import { AlertTriangle, HeartPulse, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HealthAlert, HealthAlertSeverity } from "@/lib/api/types";

const SEVERITY_STYLES: Record<
  HealthAlertSeverity,
  { container: string; icon: string; label: string }
> = {
  info: {
    container: "border-primary/20 bg-primary/5",
    icon: "text-primary",
    label: "Informação",
  },
  attention: {
    container: "border-amber-300 bg-amber-50",
    icon: "text-amber-600",
    label: "Atenção",
  },
  medical: {
    container: "border-red-300 bg-red-50",
    icon: "text-red-600",
    label: "Saúde",
  },
};

function SeverityIcon({
  severity,
  className,
}: {
  severity: HealthAlertSeverity;
  className?: string;
}) {
  if (severity === "medical") return <HeartPulse size={16} className={className} />;
  if (severity === "attention")
    return <AlertTriangle size={16} className={className} />;
  return <Info size={16} className={className} />;
}

export function HealthAlertList({
  alerts,
  className,
}: {
  alerts: HealthAlert[];
  className?: string;
}) {
  if (alerts.length === 0) return null;

  return (
    <div className={cn("space-y-3", className)}>
      {alerts.map((alert) => {
        const styles = SEVERITY_STYLES[alert.severity];
        return (
          <div
            key={alert.key}
            className={cn("rounded-lg border px-4 py-3", styles.container)}
          >
            <div className="flex items-start gap-3">
              <SeverityIcon
                severity={alert.severity}
                className={cn("mt-0.5 shrink-0", styles.icon)}
              />
              <div className="min-w-0">
                <p className="font-sora text-sm font-semibold text-on-surface">
                  {alert.title}
                  <span
                    className={cn(
                      "ml-2 rounded-full bg-white/70 px-2 py-0.5 font-geist text-[10px] font-semibold uppercase tracking-wide",
                      styles.icon,
                    )}
                  >
                    {styles.label}
                  </span>
                </p>
                <p className="mt-1 font-geist text-xs text-on-surface-variant">
                  {alert.message}
                </p>
                <p className="mt-1.5 font-geist text-xs text-on-surface">
                  {alert.recommendation}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function HealthDisclaimer({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "font-geist text-[11px] leading-relaxed text-on-surface-variant",
        className,
      )}
    >
      {text}
    </p>
  );
}
