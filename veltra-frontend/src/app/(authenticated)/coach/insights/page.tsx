"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Lightbulb, RefreshCw } from "lucide-react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { InsightSections } from "@/components/ui/insight-sections";
import { PerformanceCard } from "@/components/ui/performance-card";
import { getInsightsFeed } from "@/lib/api/insights";
import { formatNumber, formatPace } from "@/lib/format";
import type { AdherenceVerdict, InsightFeedItem } from "@/lib/api/types";
import { cn } from "@/lib/utils";

type Filter = "all" | AdherenceVerdict;

const VERDICT_LABELS: Record<AdherenceVerdict, string> = {
  no_plano: "No plano",
  proximo: "Próximo",
  diferente: "Diferente",
};

const VERDICT_STYLES: Record<AdherenceVerdict, string> = {
  no_plano: "bg-primary/10 text-primary",
  proximo: "bg-secondary-container text-on-secondary-container",
  diferente: "bg-error-container text-on-error-container",
};

function CardSkeleton() {
  return (
    <div className="rounded-lg border border-surface-container-highest bg-surface-container-lowest p-5">
      <div className="mb-4 h-3 w-24 animate-pulse rounded bg-surface-container-high" />
      <div className="mb-3 h-4 w-40 animate-pulse rounded bg-surface-container-high" />
      <div className="mb-2 h-3 w-full animate-pulse rounded bg-surface-container-high" />
      <div className="h-3 w-2/3 animate-pulse rounded bg-surface-container-high" />
    </div>
  );
}

function InsightCard({ insight }: { insight: InsightFeedItem }) {
  return (
    <PerformanceCard
      label={
        insight.activityDate
          ? new Date(insight.activityDate).toLocaleDateString("pt-BR", {
              day: "numeric",
              month: "long",
            })
          : "Corrida"
      }
    >
      <div className="flex gap-4">
        <img
          src="/images/avatar-coach.svg"
          alt="Coach"
          className="h-10 w-10 shrink-0 rounded-full"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Link
              href={`/activities/${insight.activityId}`}
              className="truncate font-sora text-base font-semibold text-on-surface transition-colors hover:text-primary"
            >
              {insight.activityName}
            </Link>

            {insight.verdict && (
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                  VERDICT_STYLES[insight.verdict],
                )}
              >
                {VERDICT_LABELS[insight.verdict]}
              </span>
            )}
          </div>

          <p className="mt-0.5 font-geist text-xs text-on-surface-variant">
            {formatNumber(insight.distanceKm, 2)} km ·{" "}
            {formatPace(insight.paceSecondsPerKm)}/km
            {insight.activityType ? ` · ${insight.activityType}` : ""}
          </p>

          {insight.content && (
            <div className="mt-4">
              <InsightSections content={insight.content} />
            </div>
          )}
        </div>
      </div>
    </PerformanceCard>
  );
}

export default function CoachInsightsPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [insights, setInsights] = useState<InsightFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      setInsights(await getInsightsFeed());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered =
    filter === "all"
      ? insights
      : insights.filter((insight) => insight.verdict === filter);

  const filters: Filter[] = ["all", "no_plano", "proximo", "diferente"];

  return (
    <div>
      <Header
        title="Insights do Coach"
        subtitle="Análises das corridas com foco em evolução e plano de treino"
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={cn(
              "cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold tracking-wider transition-colors",
              filter === item
                ? "bg-primary text-on-primary"
                : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high",
            )}
          >
            {(item === "all" ? "Todos" : VERDICT_LABELS[item]).toUpperCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }, (_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-surface-container-highest bg-surface-container-lowest p-10 text-center">
          <p className="mb-4 font-geist text-sm text-on-surface-variant">
            Não foi possível carregar os insights.
          </p>
          <Button size="sm" onClick={load}>
            <RefreshCw size={14} />
            Tentar novamente
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-surface-container-highest bg-surface-container-lowest p-10 text-center">
          <Lightbulb size={24} className="mx-auto mb-3 text-primary" />
          <p className="font-geist text-sm text-on-surface-variant">
            {insights.length === 0
              ? "Nenhuma análise ainda. Abra uma corrida para o coach analisar seu desempenho."
              : "Nenhum insight com esse filtro."}
          </p>
          {insights.length === 0 && (
            <Link href="/activities" className="mt-4 inline-block">
              <Button size="sm">Ver atividades</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      )}
    </div>
  );
}
