"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity as ActivityIcon,
  ArrowRight,
  CalendarClock,
  CalendarDays,
  ChevronRight,
  Flame,
  Heart,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/header";
import { PerformanceCard } from "@/components/ui/performance-card";
import { DataDisplay } from "@/components/ui/data-display";
import { StatItem } from "@/components/ui/stat-item";
import { getActivities } from "@/lib/api/activities";
import { getPlanByWeek, getTrainingPlan } from "@/lib/api/training";
import { getWeeklyStats } from "@/lib/api/analytics";
import {
  formatActivityDate,
  formatPace,
  formatPaceFromMps,
  formatTime,
} from "@/lib/format";
import {
  DAY_ORDER,
  typeColors,
  typeIcons,
  typeLabels,
} from "@/lib/training-display";
import { cn } from "@/lib/utils";
import type {
  Activity,
  TrainingPlan,
  TrainingSession,
  WeeklyStats,
} from "@/lib/api/types";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function sessionDayOrder(session: TrainingSession): number {
  return session.dayOrder ?? DAY_ORDER[session.day] ?? 0;
}

function isWorkout(session: TrainingSession): boolean {
  return session.type !== "rest";
}

function relativeDayLabel(
  session: TrainingSession,
  isNextWeek: boolean,
  todayOrder: number,
): string {
  if (isNextWeek) return `Próxima ${session.day}`;

  const order = sessionDayOrder(session);
  if (order === todayOrder) return "Hoje";
  if (order === (todayOrder + 1) % 7) return "Amanhã";
  return session.day;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [nextWeekPlan, setNextWeekPlan] = useState<TrainingPlan | null>(null);
  const [weekly, setWeekly] = useState<WeeklyStats | null>(null);

  useEffect(() => {
    let active = true;

    getActivities().then((acts) => {
      if (!active) return;
      const sorted = [...acts].sort(
        (a, b) =>
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
      );
      setActivities(sorted);
    });

    getTrainingPlan().then((current) => {
      if (!active) return;
      setPlan(current);

      if (!current?.weekStart) return;
      const nextWeekStart = new Date(
        new Date(current.weekStart).getTime() + WEEK_MS,
      ).toISOString();

      getPlanByWeek(nextWeekStart).then((next) => {
        if (active) setNextWeekPlan(next);
      });
    });

    getWeeklyStats().then((stats) => {
      if (active) setWeekly(stats);
    });

    return () => {
      active = false;
    };
  }, []);

  const todayOrder = new Date().getDay();

  const { nextSession, nextSessionIsNextWeek } = useMemo(() => {
    const byDay = (sessions: TrainingSession[]) =>
      [...sessions].sort((a, b) => sessionDayOrder(a) - sessionDayOrder(b));

    const upcoming = byDay(
      (plan?.sessions ?? []).filter(
        (session) =>
          isWorkout(session) &&
          !session.completed &&
          sessionDayOrder(session) >= todayOrder,
      ),
    );

    if (upcoming.length > 0) {
      return { nextSession: upcoming[0], nextSessionIsNextWeek: false };
    }

    const nextWeek = byDay(
      (nextWeekPlan?.sessions ?? []).filter(
        (session) => isWorkout(session) && !session.completed,
      ),
    );

    return {
      nextSession: nextWeek[0] ?? null,
      nextSessionIsNextWeek: nextWeek.length > 0,
    };
  }, [plan, nextWeekPlan, todayOrder]);

  const lastRuns = activities.slice(0, 3);
  const totalKm =
    activities.reduce((sum, activity) => sum + activity.distance, 0) / 1000;
  const plannedWeekKm =
    (plan?.sessions ?? [])
      .filter(isWorkout)
      .reduce((sum, session) => sum + session.plannedDistance, 0) / 1000;
  const weekDistanceKm = (weekly?.totalDistance ?? 0) / 1000;
  const weekProgress =
    plannedWeekKm > 0
      ? Math.min(100, (weekDistanceKm / plannedWeekKm) * 100)
      : 0;

  return (
    <div>
      <Header
        title={`Olá, ${user?.name?.split(" ")[0] ?? "Corredor"}!`}
        subtitle="Resumo da sua semana de treinos"
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <PerformanceCard
          label="Esta Semana"
          icon={<CalendarDays size={14} className="text-primary" />}
        >
          <div className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <DataDisplay
                value={weekDistanceKm.toFixed(1)}
                unit="km"
                size="lg"
              />
              <p className="font-geist text-xs text-on-surface-variant">
                {weekly?.runCount ?? 0} corridas &bull;{" "}
                {formatTime(weekly?.totalTime ?? 0)}
              </p>
            </div>

            {plannedWeekKm > 0 ? (
              <div className="space-y-1.5">
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${weekProgress}%` }}
                  />
                </div>
                <p className="font-geist text-[11px] text-on-surface-variant">
                  {Math.round(weekProgress)}% do planejado &bull; meta de{" "}
                  {plannedWeekKm.toFixed(0)}km
                </p>
              </div>
            ) : (
              <p className="font-geist text-[11px] text-on-surface-variant">
                Sem plano ativo para esta semana
              </p>
            )}
          </div>
        </PerformanceCard>

        <PerformanceCard
          label="Total de Corridas"
          icon={<Flame size={14} className="text-primary" />}
        >
          <div className="space-y-2">
            <DataDisplay
              value={`${activities.length}`}
              unit="corridas"
              size="lg"
            />
            <p className="font-geist text-xs text-on-surface-variant">
              {totalKm.toFixed(0)}km acumulados no histórico
            </p>
          </div>
        </PerformanceCard>

        <PerformanceCard
          label="Próximo Treino"
          icon={<CalendarClock size={14} className="text-primary" />}
          className="border-primary/30 bg-gradient-to-br from-primary/5 via-surface-container-lowest to-surface-container-lowest"
        >
          {nextSession ? (
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                      typeColors[nextSession.type],
                    )}
                  >
                    <img
                      src={typeIcons[nextSession.type]}
                      alt=""
                      className="h-3.5 w-3.5"
                    />
                    {typeLabels[nextSession.type]}
                  </span>
                  <p className="mt-2 font-sora text-lg font-semibold text-on-surface">
                    {relativeDayLabel(
                      nextSession,
                      nextSessionIsNextWeek,
                      todayOrder,
                    )}
                  </p>
                </div>
                <span className="shrink-0 font-geist text-[11px] text-on-surface-variant">
                  {nextSessionIsNextWeek ? "Próxima semana" : "Esta semana"}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-baseline gap-4">
                  <DataDisplay
                    value={(nextSession.plannedDistance / 1000).toFixed(1)}
                    unit="km"
                    size="md"
                  />
                  {nextSession.plannedPace > 0 && (
                    <span className="font-geist text-sm text-on-surface-variant">
                      {formatPace(nextSession.plannedPace)}/km
                    </span>
                  )}
                </div>
                <Link
                  href="/training-plan"
                  className="inline-flex items-center gap-1 font-geist text-sm font-medium text-primary transition-colors hover:text-primary-hover"
                >
                  Ver plano <ArrowRight size={16} />
                </Link>
              </div>

              {nextSession.notes && (
                <p className="line-clamp-2 font-geist text-xs text-on-surface-variant">
                  {nextSession.notes}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="font-geist text-sm text-on-surface-variant">
                {plan
                  ? "Nenhum treino restante nesta semana."
                  : "Você ainda não tem um plano ativo."}
              </p>
              <Link
                href={plan ? "/training-plan" : "/goal"}
                className="inline-flex items-center gap-1 font-geist text-sm font-medium text-primary transition-colors hover:text-primary-hover"
              >
                {plan ? "Ver plano" : "Definir meta"} <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </PerformanceCard>
      </div>

      <PerformanceCard
        label="Últimas Corridas"
        icon={<ActivityIcon size={14} className="text-primary" />}
        action={
          lastRuns.length > 0 ? (
            <Link
              href="/activities"
              className="font-geist text-xs font-medium text-primary transition-colors hover:text-primary-hover"
            >
              Ver todas
            </Link>
          ) : undefined
        }
        className="mt-6"
      >
        {lastRuns.length > 0 ? (
          <div className="divide-y divide-surface-container-high">
            {lastRuns.map((activity) => (
              <Link
                key={activity.id}
                href={`/activities/${activity.id}`}
                className="group flex flex-wrap items-center justify-between gap-3 py-3 first:pt-1 last:pb-0"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <ActivityIcon size={16} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-sora text-sm font-semibold text-on-surface transition-colors group-hover:text-primary">
                      {activity.name}
                    </p>
                    <p className="font-geist text-xs text-on-surface-variant">
                      {formatActivityDate(activity.startDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-5">
                  <StatItem
                    align="right"
                    label="distância"
                    value={`${(activity.distance / 1000).toFixed(1)}km`}
                  />
                  <StatItem
                    align="right"
                    label="ritmo"
                    value={`${formatPaceFromMps(activity.averageSpeed)}/km`}
                  />
                  <StatItem
                    align="right"
                    label="tempo"
                    value={formatTime(activity.movingTime)}
                  />
                  <span className="hidden items-center gap-1 font-geist text-sm text-on-surface-variant sm:flex">
                    <Heart size={13} className="text-primary" />
                    {activity.averageHeartrate != null
                      ? activity.averageHeartrate
                      : "-"}
                  </span>
                  <ChevronRight
                    size={16}
                    className="text-surface-container-highest transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                  />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="font-geist text-sm text-on-surface-variant">
            Nenhuma corrida registrada ainda.
          </p>
        )}
      </PerformanceCard>
    </div>
  );
}
