"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { PerformanceCard } from "@/components/ui/performance-card";
import { MetricChip } from "@/components/ui/metric-chip";
import { getActivitiesPaginated, getActivityYears } from "@/lib/api/activities";
import { ArrowRight } from "lucide-react";
import type { Activity } from "@/lib/api/types";

const PERIODS = [
  { key: "all", label: "Todas" },
  { key: "week", label: "Semana" },
  { key: "month", label: "Mês" },
  { key: "year", label: "Ano" },
] as const;

function formatPace(mps: number): string {
  if (!mps) return "-";
  const pace = 1000 / mps;
  const min = Math.floor(pace / 60);
  const sec = Math.round(pace % 60);
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

function formatDuration(seconds: number): string {
  if (!seconds) return "0min";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h${m}min` : `${m}min`;
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [period, setPeriod] = useState("all");
  const [year, setYear] = useState("");
  const [years, setYears] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const LIMIT = 20;

  useEffect(() => {
    getActivityYears().then((yearsList) => {
      setYears(yearsList);
      if (yearsList.length > 0) setYear(String(yearsList[0]));
    });
  }, []);

  const fetchPage = useCallback(
    async (pageNum: number, periodFilter: string, yearFilter: string | undefined, append = false) => {
      setLoading(true);
      try {
        const res = await getActivitiesPaginated(pageNum, LIMIT, periodFilter, yearFilter);
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
    fetchPage(1, period, period === "year" ? year || undefined : undefined, false);
  }, [period, year, fetchPage]);

  const handleLoadMore = () => {
    fetchPage(page + 1, period, period === "year" ? year || undefined : undefined, true);
  };

  const hasMore = activities.length < total;

  return (
    <div>
      <Header title="Atividades" subtitle="Histórico de corridas" />

      <div className="flex flex-wrap items-center gap-2 mb-6">
        {PERIODS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setPeriod(key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
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

      <div className="space-y-4">
        {activities.map((activity) => (
          <Link key={activity.id} href={`/activities/${activity.id}`}>
            <PerformanceCard
              label={
                activity.startDate
                  ? new Date(activity.startDate).toLocaleDateString("pt-BR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })
                  : "-"
              }
              className="hover:shadow-sm transition-shadow cursor-pointer"
            >
              <div className="flex flex-wrap items-center justify-between">
                <div>
                  <p className="font-sora font-semibold text-base text-on-surface mb-2">
                    {activity.name}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <MetricChip label="Distância" value={`${(activity.distance / 1000).toFixed(1)}km`} />
                    <MetricChip label="Ritmo" value={formatPace(activity.averageSpeed)} />
                    <MetricChip label="Duração" value={formatDuration(activity.movingTime)} />
                    <MetricChip label="FC" value={activity.averageHeartrate != null ? `${activity.averageHeartrate}` : "-"} />
                    <MetricChip label="Elevação" value={activity.totalElevationGain != null ? `${activity.totalElevationGain}m` : "-"} />
                  </div>
                </div>
                <ArrowRight className="text-on-surface-variant shrink-0" size={20} />
              </div>
            </PerformanceCard>
          </Link>
        ))}
      </div>

      {loading && (
        <p className="text-center text-on-surface-variant mt-6">Carregando...</p>
      )}

      {hasMore && !loading && (
        <div className="flex justify-center mt-6">
          <button
            onClick={handleLoadMore}
            className="px-6 py-3 rounded-full bg-primary text-on-primary font-semibold hover:brightness-110 transition-all"
          >
            Carregar mais
          </button>
        </div>
      )}

      {!loading && activities.length === 0 && (
        <p className="text-center text-on-surface-variant mt-12">
          Nenhuma atividade encontrada.
        </p>
      )}
    </div>
  );
}
