"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Activity as ActivityIcon,
  ArrowLeft,
  Heart,
  Mountain,
  RefreshCw,
  Sparkles,
  Timer,
  TrendingUp,
} from "lucide-react";
import { Header } from "@/components/header";
import { PerformanceCard } from "@/components/ui/performance-card";
import { DataDisplay } from "@/components/ui/data-display";
import { InsightSections } from "@/components/ui/insight-sections";
import { StatItem } from "@/components/ui/stat-item";
import { Button } from "@/components/ui/button";
import { getActivity } from "@/lib/api/activities";
import {
  generateActivityInsight,
  getActivityInsight,
} from "@/lib/api/insights";
import {
  formatDuration,
  formatLongDate,
  formatPace,
  formatPaceFromMps,
} from "@/lib/format";
import type { Activity, ActivityInsight } from "@/lib/api/types";

export default function ActivityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [insight, setInsight] = useState<ActivityInsight | null>(null);
  const [insightLoading, setInsightLoading] = useState(true);
  const [insightReload, setInsightReload] = useState(0);

  useEffect(() => {
    if (typeof params.id !== "string") return;

    let active = true;
    setLoading(true);

    getActivity(params.id)
      .then((data) => {
        if (active) setActivity(data);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [params.id]);

  useEffect(() => {
    if (typeof params.id !== "string") return;

    const activityId = params.id;
    let active = true;
    setInsightLoading(true);

    async function loadInsight() {
      try {
        const existing = await getActivityInsight(activityId);
        if (!active) return;

        if (existing?.status === "completed") {
          setInsight(existing);
          return;
        }

        const generated = await generateActivityInsight(activityId);
        if (active) setInsight(generated);
      } catch {
        if (active) setInsight(null);
      } finally {
        if (active) setInsightLoading(false);
      }
    }

    void loadInsight();

    return () => {
      active = false;
    };
  }, [params.id, insightReload]);

  if (loading) {
    return (
      <div>
        <Header title="Atividade" subtitle="Carregando detalhes..." />
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div>
        <Header title="Atividade não encontrada" />
        <Button variant="ghost" onClick={() => router.push("/activities")}>
          <ArrowLeft size={16} /> Voltar para atividades
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/activities")}
        className="mb-4"
      >
        <ArrowLeft size={16} /> Voltar para atividades
      </Button>

      <PerformanceCard
        label="Atividade"
        icon={<ActivityIcon size={14} className="text-primary" />}
        className="border-primary/30 bg-gradient-to-br from-primary/5 via-surface-container-lowest to-surface-container-lowest"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              <ActivityIcon size={12} />
              {activity.type}
            </span>
            <p className="mt-2 font-sora text-xl font-semibold text-on-surface">
              {activity.name}
            </p>
            <p className="mt-1 font-geist text-sm text-on-surface-variant">
              {formatLongDate(activity.startDate)}
            </p>
          </div>

          <div className="flex items-baseline gap-6">
            <DataDisplay
              value={(activity.distance / 1000).toFixed(2)}
              unit="km"
              size="lg"
            />
            <StatItem
              size="md"
              label="ritmo médio"
              value={`${formatPaceFromMps(activity.averageSpeed)}/km`}
            />
          </div>
        </div>
      </PerformanceCard>

      <PerformanceCard label="Resumo" className="mt-6">
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
          <StatItem
            size="md"
            label="ritmo máx"
            value={`${formatPace(activity.maxSpeed)}/km`}
            icon={<TrendingUp size={14} className="text-primary" />}
          />
          <StatItem
            size="md"
            label="duração"
            value={formatDuration(activity.movingTime)}
            icon={<Timer size={14} className="text-primary" />}
          />
          <StatItem
            size="md"
            label="tempo total"
            value={formatDuration(activity.elapsedTime)}
          />
          <StatItem
            size="md"
            label="FC média"
            value={
              activity.averageHeartrate != null
                ? String(activity.averageHeartrate)
                : "-"
            }
            icon={<Heart size={14} className="text-primary" />}
          />
          <StatItem
            size="md"
            label="FC máx"
            value={
              activity.maxHeartrate != null
                ? String(activity.maxHeartrate)
                : "-"
            }
          />
          <StatItem
            size="md"
            label="elevação"
            value={
              activity.totalElevationGain != null
                ? `${activity.totalElevationGain}m`
                : "-"
            }
            icon={<Mountain size={14} className="text-primary" />}
          />
        </div>
      </PerformanceCard>

      <PerformanceCard
        label="Insight do Coach"
        icon={<Sparkles size={14} className="text-primary" />}
        className="mt-6"
      >
        {insightLoading ? (
          <div className="flex items-center gap-4 py-2">
            <img
              src="/images/avatar-coach.svg"
              alt="Coach"
              className="h-10 w-10 shrink-0 rounded-full"
            />
            <div className="flex-1">
              <p className="font-geist text-sm text-on-surface">
                Analisando sua corrida...
              </p>
              <p className="font-geist text-xs text-on-surface-variant">
                O coach está revisando pace, distância e plano de treino.
              </p>
            </div>
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : insight?.content ? (
          <div className="flex gap-4">
            <img
              src="/images/avatar-coach.svg"
              alt="Coach"
              className="h-10 w-10 shrink-0 rounded-full"
            />
            <div className="min-w-0 flex-1">
              <InsightSections content={insight.content} />
              {insight.updatedAt && (
                <p className="mt-3 text-xs text-on-surface-variant">
                  {new Date(insight.updatedAt).toLocaleDateString("pt-BR", {
                    day: "numeric",
                    month: "long",
                  })}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-geist text-sm text-on-surface-variant">
              Não foi possível gerar a análise desta corrida.
            </p>
            <Button size="sm" onClick={() => setInsightReload((k) => k + 1)}>
              <RefreshCw size={14} />
              Tentar novamente
            </Button>
          </div>
        )}
      </PerformanceCard>

      <PerformanceCard label="Mapa" className="mt-6">
        <div className="flex flex-col items-center justify-center">
          <img
            src="/images/map-placeholder.svg"
            alt="Mapa da atividade"
            className="h-auto max-h-64 w-full"
          />
        </div>
      </PerformanceCard>
    </div>
  );
}
