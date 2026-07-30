"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { PerformanceCard } from "@/components/ui/performance-card";
import { MetricChip } from "@/components/ui/metric-chip";
import { DataDisplay } from "@/components/ui/data-display";
import { Button } from "@/components/ui/button";
import { getActivity } from "@/lib/api/activities";
import { ArrowLeft } from "lucide-react";
import type { Activity } from "@/lib/api/types";

function formatPace(mps: number): string {
  if (!mps) return "-";
  const pace = 1000 / mps;
  const min = Math.floor(pace / 60);
  const sec = Math.round(pace % 60);
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h${m}min${s}s`;
}

export default function ActivityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [activity, setActivity] = useState<Activity | null>(null);

  useEffect(() => {
    if (typeof params.id === "string") {
      getActivity(params.id).then(setActivity);
    }
  }, [params.id]);

  if (!activity) {
    return (
      <div>
        <Header title="Atividade não encontrada" />
        <Button variant="ghost" onClick={() => router.push("/activities")}>
          <ArrowLeft size={16} /> Voltar
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Button variant="ghost" size="sm" onClick={() => router.push("/activities")} className="mb-4">
        <ArrowLeft size={16} /> Voltar
      </Button>

      <Header
        title={activity.name}
        subtitle={new Date(activity.startDate).toLocaleDateString("pt-BR", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <MetricChip label="Distância" value={`${(activity.distance / 1000).toFixed(2)}km`} />
        <MetricChip label="Ritmo médio" value={formatPace(activity.averageSpeed)} />
        <MetricChip label="Ritmo máx" value={formatPace(activity.maxSpeed)} />
        <MetricChip label="Duração" value={formatDuration(activity.movingTime)} />
        <MetricChip label="FC média" value={`${activity.averageHeartrate}`} />
        <MetricChip label="FC máx" value={`${activity.maxHeartrate}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceCard label="Detalhes">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-on-surface-variant">Tipo</span>
              <span className="text-sm font-medium text-on-surface">{activity.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-on-surface-variant">Tempo total</span>
              <span className="text-sm font-medium text-on-surface">{formatDuration(activity.elapsedTime)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-on-surface-variant">Elevação total</span>
              <span className="text-sm font-medium text-on-surface">{activity.totalElevationGain}m</span>
            </div>
          </div>
        </PerformanceCard>

        <PerformanceCard label="Mapa">
          <div className="flex flex-col items-center justify-center">
            <img src="/images/map-placeholder.svg" alt="Mapa da atividade" className="w-full h-auto max-h-48" />
          </div>
        </PerformanceCard>
      </div>
    </div>
  );
}
