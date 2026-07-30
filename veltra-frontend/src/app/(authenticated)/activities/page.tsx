"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { PerformanceCard } from "@/components/ui/performance-card";
import { MetricChip } from "@/components/ui/metric-chip";
import { getActivities } from "@/lib/api/activities";
import { ArrowRight } from "lucide-react";
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
  return h > 0 ? `${h}h${m}min` : `${m}min`;
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    getActivities().then(setActivities);
  }, []);

  return (
    <div>
      <Header title="Atividades" subtitle="Histórico de corridas" />

      <div className="space-y-4">
        {activities.map((activity) => (
          <Link key={activity.id} href={`/activities/${activity.id}`}>
            <PerformanceCard
              label={new Date(activity.startDate).toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
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
                    <MetricChip label="FC" value={`${activity.averageHeartrate}`} />
                    <MetricChip label="Elevação" value={`${activity.totalElevationGain}m`} />
                  </div>
                </div>
                <ArrowRight className="text-on-surface-variant shrink-0" size={20} />
              </div>
            </PerformanceCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
