"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { PerformanceCard } from "@/components/ui/performance-card";
import { DataDisplay } from "@/components/ui/data-display";
import { Button } from "@/components/ui/button";
import { getTrainingPlan } from "@/lib/api/training";
import type { TrainingPlan } from "@/lib/api/types";
import { ChevronLeft, ChevronRight, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

const typeColors: Record<string, string> = {
  easy: "bg-emerald-100 text-emerald-700 border-emerald-200",
  interval: "bg-orange-100 text-orange-700 border-orange-200",
  long_run: "bg-blue-100 text-blue-700 border-blue-200",
  rest: "bg-surface-container-highest text-on-surface-variant border-surface-container-highest",
  recovery: "bg-purple-100 text-purple-700 border-purple-200",
};

const typeLabels: Record<string, string> = {
  easy: "Leve",
  interval: "Intervalado",
  long_run: "Longão",
  rest: "Descanso",
  recovery: "Recuperação",
};

const typeIcons: Record<string, string> = {
  easy: "/images/icon-training-easy.svg",
  interval: "/images/icon-training-interval.svg",
  long_run: "/images/icon-training-long.svg",
  rest: "/images/icon-training-rest.svg",
  recovery: "/images/icon-training-recovery.svg",
};

function formatPace(secondsPerKm: number): string {
  if (!secondsPerKm) return "-";
  const min = Math.floor(secondsPerKm / 60);
  const sec = secondsPerKm % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export default function TrainingPlanPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [plan, setPlan] = useState<TrainingPlan | null>(null);

  useEffect(() => {
    getTrainingPlan().then(setPlan);
  }, []);

  if (!plan) return null;

  const weekLabel = weekOffset === 0
    ? "Esta Semana"
    : weekOffset === -1
    ? "Semana Passada"
    : weekOffset === 1
    ? "Próxima Semana"
    : `Semana ${weekOffset > 0 ? "+" : ""}${weekOffset}`;

  return (
    <div>
      <Header title="Plano de Treino" subtitle="Sua programação semanal" />

      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setWeekOffset((p) => p - 1)}
        >
          <ChevronLeft size={18} />
        </Button>
        <span className="font-sora font-semibold text-base text-on-surface">{weekLabel}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setWeekOffset((p) => p + 1)}
          disabled={weekOffset > 0}
        >
          <ChevronRight size={18} />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {plan.sessions.map((session) => (
          <PerformanceCard key={session.id} label={session.day}>
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                    typeColors[session.type]
                  )}
                >
                  <img src={typeIcons[session.type]} alt="" className="h-3.5 w-3.5" />
                  {typeLabels[session.type]}
                </span>
                {session.completed ? (
                  <CheckCircle2 className="text-primary" size={18} />
                ) : (
                  <Circle className="text-surface-container-highest" size={18} />
                )}
              </div>
              {session.type !== "rest" && (
                <div className="flex gap-4">
                  <div>
                    <p className="text-xs text-on-surface-variant">Distância</p>
                    <DataDisplay value={`${(session.plannedDistance / 1000).toFixed(1)}`} unit="km" size="sm" />
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant">Ritmo</p>
                    <DataDisplay value={formatPace(session.plannedPace)} unit="/km" size="sm" />
                  </div>
                </div>
              )}
              {session.notes && (
                <p className="text-xs text-on-surface-variant italic">{session.notes}</p>
              )}
            </div>
          </PerformanceCard>
        ))}
      </div>
    </div>
  );
}
