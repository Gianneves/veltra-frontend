"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Activity as ActivityIcon,
  ChevronRight,
  Heart,
  SearchX,
} from "lucide-react";
import { Header } from "@/components/header";
import { PerformanceCard } from "@/components/ui/performance-card";
import { StatItem } from "@/components/ui/stat-item";
import { Button } from "@/components/ui/button";
import { getActivitiesPaginated, getActivityYears } from "@/lib/api/activities";
import {
  formatActivityDateTime,
  formatMonthLabel,
  formatPaceFromMps,
  formatTime,
} from "@/lib/format";
import type { Activity } from "@/lib/api/types";

const PERIODS = [
  { key: "all", label: "Todas" },
  { key: "week", label: "Semana" },
  { key: "month", label: "Mês" },
  { key: "year", label: "Ano" },
] as const;

const LIMIT = 20;

function monthKey(value: string): string {
  const date = new Date(value);
  return `${date.getFullYear()}-${date.getMonth()}`;
}

function groupByMonth(activities: Activity[]) {
  return activities.reduce<
    { key: string; label: string; items: Activity[] }[]
  >((groups, activity) => {
    const key = monthKey(activity.startDate);
    const last = groups[groups.length - 1];

    if (last && last.key === key) {
      last.items.push(activity);
    } else {
      groups.push({
        key,
        label: formatMonthLabel(activity.startDate),
        items: [activity],
      });
    }

    return groups;
  }, []);
}

function ActivityRow({ activity }: { activity: Activity }) {
  return (
    <Link
      href={`/activities/${activity.id}`}
      className="group flex flex-wrap items-center justify-between gap-3 py-3"
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
            {formatActivityDateTime(activity.startDate)}
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
        <StatItem
          align="right"
          label="FC"
          value={
            activity.averageHeartrate != null
              ? String(activity.averageHeartrate)
              : "-"
          }
          icon={<Heart size={12} className="text-primary" />}
          className="hidden sm:flex"
        />
        <ChevronRight
          size={16}
          className="text-surface-container-highest transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
        />
      </div>
    </Link>
  );
}

function RowSkeleton() {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 animate-pulse rounded-full bg-surface-container" />
        <div className="space-y-2">
          <div className="h-3.5 w-40 animate-pulse rounded bg-surface-container" />
          <div className="h-3 w-28 animate-pulse rounded bg-surface-container" />
        </div>
      </div>
      <div className="hidden items-center gap-5 sm:flex">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-8 w-14 animate-pulse rounded bg-surface-container"
          />
        ))}
      </div>
    </div>
  );
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [period, setPeriod] = useState("all");
  const [year, setYear] = useState("");
  const [years, setYears] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActivityYears().then((yearsList) => {
      setYears(yearsList);
      if (yearsList.length > 0) setYear(String(yearsList[0]));
    });
  }, []);

  const fetchPage = useCallback(
    async (
      pageNum: number,
      periodFilter: string,
      yearFilter: string | undefined,
      append = false,
    ) => {
      setLoading(true);
      try {
        const res = await getActivitiesPaginated(
          pageNum,
          LIMIT,
          periodFilter,
          yearFilter,
        );
        if (append) {
          setActivities((prev) => [...prev, ...res.data]);
        } else {
          setActivities(res.data);
        }
        setTotal(res.total);
        setPage(pageNum);
      } catch (err) {
        console.error("Erro ao carregar atividades:", err);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    setPage(1);
    fetchPage(
      1,
      period,
      period === "year" ? year || undefined : undefined,
      false,
    );
  }, [period, year, fetchPage]);

  const handleLoadMore = () => {
    fetchPage(
      page + 1,
      period,
      period === "year" ? year || undefined : undefined,
      true,
    );
  };

  const handleClearFilters = () => {
    setPeriod("all");
  };

  const hasMore = activities.length < total;
  const groups = groupByMonth(activities);
  const showSkeleton = loading && activities.length === 0;

  return (
    <div>
      <Header title="Atividades" subtitle="Histórico de corridas" />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        {PERIODS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setPeriod(key)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              period === key
                ? "bg-primary text-on-primary"
                : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            {label}
          </button>
        ))}

        {period === "year" && years.length > 0 && (
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="ml-1 rounded-full border border-surface-container-highest bg-surface-container-lowest px-4 py-2 text-sm font-medium text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        )}
      </div>

      <PerformanceCard
        label="Corridas"
        icon={<ActivityIcon size={14} className="text-primary" />}
        action={
          total > 0 ? (
            <span className="font-geist text-xs text-on-surface-variant">
              Mostrando {activities.length} de {total}
            </span>
          ) : undefined
        }
      >
        {showSkeleton ? (
          <div className="divide-y divide-surface-container-high">
            {Array.from({ length: 5 }).map((_, index) => (
              <RowSkeleton key={index} />
            ))}
          </div>
        ) : groups.length > 0 ? (
          <div className="space-y-5">
            {groups.map((group) => (
              <div key={group.key}>
                <p className="mb-1 font-geist text-[11px] uppercase tracking-[0.08em] text-on-surface-variant">
                  {group.label}
                </p>
                <div className="divide-y divide-surface-container-high">
                  {group.items.map((activity) => (
                    <ActivityRow key={activity.id} activity={activity} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container text-on-surface-variant">
              <SearchX size={20} />
            </span>
            <p className="font-geist text-sm text-on-surface-variant">
              Nenhuma atividade encontrada para este filtro.
            </p>
            {period !== "all" && (
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                Limpar filtros
              </Button>
            )}
          </div>
        )}
      </PerformanceCard>

      {hasMore && activities.length > 0 && (
        <div className="mt-6 flex justify-center">
          <Button variant="outline" onClick={handleLoadMore} loading={loading}>
            Carregar mais
          </Button>
        </div>
      )}
    </div>
  );
}
