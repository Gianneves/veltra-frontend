"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { PerformanceCard } from "@/components/ui/performance-card";
import { DataDisplay } from "@/components/ui/data-display";
import { getGoals } from "@/lib/api/goals";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Goal } from "@/lib/api/types";

export default function GoalPage() {
  const [goal, setGoal] = useState<Goal | null>(null);

  useEffect(() => {
    getGoals().then((goals) => {
      if (goals.length > 0) setGoal(goals[0]);
    });
  }, []);

  if (!goal) {
    return (
      <div>
        <Header title="Minha Meta" subtitle="Defina seus objetivos de corrida" />
        <PerformanceCard label="Nenhuma meta">
          <p className="text-sm text-on-surface-variant">Você ainda não definiu uma meta.</p>
        </PerformanceCard>
      </div>
    );
  }

  const progressPct = Math.min(
    100,
    Math.round((goal.currentProgress / goal.targetDistance) * 100)
  );

  const circumference = 2 * Math.PI * 80;
  const offset = circumference - (progressPct / 100) * circumference;

  return (
    <div>
      <Header title="Minha Meta" subtitle={goal.title} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceCard label="Progresso">
          <div className="flex flex-col items-center py-6">
            <div className="relative flex items-center justify-center mb-4">
              <svg width="200" height="200" className="-rotate-90">
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#e0e3e5"
                  strokeWidth="12"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#aa3000"
                  strokeWidth="12"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="font-sora text-3xl font-bold text-on-surface">
                  {progressPct}%
                </span>
                <span className="text-xs text-on-surface-variant">completo</span>
              </div>
            </div>
            <div className="flex gap-8 text-center">
              <div>
                <DataDisplay value={`${(goal.currentProgress / 1000).toFixed(1)}`} unit="km" size="sm" />
                <p className="text-xs text-on-surface-variant mt-1">Atual</p>
              </div>
              <div>
                <DataDisplay value={`${(goal.targetDistance / 1000).toFixed(0)}`} unit="km" size="sm" />
                <p className="text-xs text-on-surface-variant mt-1">Meta</p>
              </div>
            </div>
          </div>
        </PerformanceCard>

        <PerformanceCard label="Detalhes da Meta">
          <img src="/images/illustration-goal.svg" alt="Meta" className="h-20 w-auto mb-4 mx-auto" />
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-on-surface-variant">Disciplina</span>
              <span className="text-sm font-medium text-on-surface">{goal.discipline}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-on-surface-variant">Data alvo</span>
              <span className="text-sm font-medium text-on-surface">
                {new Date(goal.targetDate).toLocaleDateString("pt-BR")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-on-surface-variant">Distância total</span>
              <span className="text-sm font-medium text-on-surface">
                {(goal.targetDistance / 1000).toFixed(0)}km
              </span>
            </div>
          </div>
        </PerformanceCard>
      </div>

      <PerformanceCard label="Marcos" className="mt-6">
        <div className="space-y-4">
          {goal.milestones.map((m) => (
            <div key={m.id} className="flex items-center gap-3">
              {m.achieved ? (
                <CheckCircle2 className="text-primary shrink-0" size={20} />
              ) : (
                <Circle className="text-surface-container-highest shrink-0" size={20} />
              )}
              <div>
                <p
                  className={cn(
                    "text-sm font-medium",
                    m.achieved ? "text-on-surface" : "text-on-surface-variant"
                  )}
                >
                  {m.description}
                </p>
                <p className="text-xs text-on-surface-variant">
                  {(m.target / 1000).toFixed(0)}km
                </p>
              </div>
            </div>
          ))}
        </div>
      </PerformanceCard>
    </div>
  );
}
