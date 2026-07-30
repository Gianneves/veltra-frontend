"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/header";
import { PerformanceCard } from "@/components/ui/performance-card";
import { MetricChip } from "@/components/ui/metric-chip";
import { DataDisplay } from "@/components/ui/data-display";
import { getActivities } from "@/lib/api/activities";
import { getTrainingPlan } from "@/lib/api/training";
import { getWeeklyStats } from "@/lib/api/analytics";
import { ArrowRight } from "lucide-react";
import type { Activity, TrainingPlan, WeeklyStats } from "@/lib/api/types";

function formatPace(secondsPerKm: number): string {
  const min = Math.floor(secondsPerKm / 60);
  const sec = secondsPerKm % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h${m}min`;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [weekly, setWeekly] = useState<WeeklyStats | null>(null);

  useEffect(() => {
    getActivities().then(setActivities);
    getTrainingPlan().then(setPlan);
    getWeeklyStats().then(setWeekly);
  }, []);

  const lastRun = activities[0];
  const nextSession = plan?.sessions?.find((s) => !s.completed);
  const streak = activities.length;

  return (
    <div>
      <Header
        title={`Olá, ${user?.name?.split(" ")[0] ?? "Corredor"}!`}
        subtitle="Resumo da sua semana de treinos"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PerformanceCard label="Streak">
          <div className="flex items-center gap-4">
            <img src="/images/dashboard-streak.svg" alt="Streak" className="h-10 w-10" />
            <div>
              <DataDisplay value={`${streak}`} unit="atividades" size="lg" />
              <p className="text-xs text-on-surface-variant mt-1">
                Total de corridas registradas
              </p>
            </div>
          </div>
        </PerformanceCard>

        <PerformanceCard label="Esta Semana">
          <div className="space-y-2">
            <DataDisplay value={`${weekly ? (weekly.totalDistance / 1000).toFixed(1) : "0"}`} unit="km" size="lg" />
            <p className="text-xs text-on-surface-variant">
              {weekly?.runCount ?? 0} corridas | {formatTime(weekly?.totalTime ?? 0)}
            </p>
          </div>
        </PerformanceCard>

        <PerformanceCard label="Próximo Treino">
          {nextSession ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-sora font-semibold text-base text-on-surface capitalize">
                  {nextSession.type.replace("_", " ")}
                </p>
                <p className="text-sm text-on-surface-variant mt-1">
                  {nextSession.day} • {(nextSession.plannedDistance / 1000).toFixed(0)}km
                  {nextSession.plannedPace > 0 && ` • ${formatPace(nextSession.plannedPace)}/km`}
                </p>
              </div>
              <ArrowRight className="text-primary" size={20} />
            </div>
          ) : (
            <p className="text-sm text-on-surface-variant">Nenhum treino agendado</p>
          )}
        </PerformanceCard>
      </div>

      {lastRun && (
        <PerformanceCard label="Última Corrida" className="mt-6">
          <div className="flex flex-wrap items-end gap-6">
            <div>
              <p className="font-sora font-semibold text-lg text-on-surface">{lastRun.name}</p>
              <p className="text-sm text-on-surface-variant">
                {new Date(lastRun.startDate).toLocaleDateString("pt-BR")}
              </p>
            </div>
            <MetricChip label="Distância" value={`${(lastRun.distance / 1000).toFixed(1)}km`} />
            <MetricChip label="Ritmo" value={formatPace(Math.round(lastRun.averageSpeed ? 1000 / lastRun.averageSpeed : 0))} />
            <MetricChip label="Duração" value={formatTime(lastRun.movingTime)} />
            <MetricChip label="FC média" value={`${lastRun.averageHeartrate}`} />
            <MetricChip label="Elevação" value={`${lastRun.totalElevationGain}m`} />
          </div>
        </PerformanceCard>
      )}
    </div>
  );
}
