"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { PerformanceCard } from "@/components/ui/performance-card";
import { MetricChip } from "@/components/ui/metric-chip";
import { getActivities } from "@/lib/api/activities";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
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

const paceComparisonData = [
  { km: "1º", atv1: 5.1, atv2: 5.3 },
  { km: "2º", atv1: 5.0, atv2: 5.2 },
  { km: "3º", atv1: 4.55, atv2: 5.15 },
  { km: "4º", atv1: 4.5, atv2: 5.1 },
  { km: "5º", atv1: 4.4, atv2: 5.0 },
];

export default function ComparisonPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedA, setSelectedA] = useState("");
  const [selectedB, setSelectedB] = useState("");

  useEffect(() => {
    getActivities().then((acts) => {
      setActivities(acts);
      if (acts.length > 0) setSelectedA(acts[0].id);
      if (acts.length > 1) setSelectedB(acts[1].id);
    });
  }, []);

  const actA = activities.find((a) => a.id === selectedA);
  const actB = activities.find((a) => a.id === selectedB);

  return (
    <div>
      <Header title="Comparação" subtitle="Compare duas corridas lado a lado" />

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-semibold tracking-wider text-on-surface-variant mb-1.5 uppercase">
            Atividade A
          </label>
          <select
            value={selectedA}
            onChange={(e) => setSelectedA(e.target.value)}
            className="w-full rounded-md border border-surface-container-highest bg-surface-container-lowest px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {activities.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-semibold tracking-wider text-on-surface-variant mb-1.5 uppercase">
            Atividade B
          </label>
          <select
            value={selectedB}
            onChange={(e) => setSelectedB(e.target.value)}
            className="w-full rounded-md border border-surface-container-highest bg-surface-container-lowest px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {activities.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
      </div>

      {actA && actB && (
        <>
          <img src="/images/illustration-comparison.svg" alt="Comparar" className="h-16 w-auto mb-4 mx-auto" />
          <div className="grid grid-cols-2 gap-4 mb-6">
            <PerformanceCard label={actA.name}>
              <div className="flex flex-wrap gap-2">
                <MetricChip label="Distância" value={`${(actA.distance / 1000).toFixed(1)}km`} />
                <MetricChip label="Ritmo" value={formatPace(actA.averageSpeed)} />
                <MetricChip label="Duração" value={formatDuration(actA.movingTime)} />
                <MetricChip label="FC" value={`${actA.averageHeartrate}`} />
              </div>
            </PerformanceCard>
            <PerformanceCard label={actB.name}>
              <div className="flex flex-wrap gap-2">
                <MetricChip label="Distância" value={`${(actB.distance / 1000).toFixed(1)}km`} />
                <MetricChip label="Ritmo" value={formatPace(actB.averageSpeed)} />
                <MetricChip label="Duração" value={formatDuration(actB.movingTime)} />
                <MetricChip label="FC" value={`${actB.averageHeartrate}`} />
              </div>
            </PerformanceCard>
          </div>

          <PerformanceCard label="Comparação de Ritmo por KM">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={paceComparisonData}>
                <XAxis dataKey="km" tick={{ fontSize: 12, fill: "#5c4037" }} />
                <YAxis unit="/km" tick={{ fontSize: 12, fill: "#5c4037" }} />
                <Tooltip
                  contentStyle={{
                    background: "#fff",
                    border: "1px solid #e0e3e5",
                    borderRadius: 8,
                    fontSize: 14,
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="atv1"
                  name={actA.name}
                  stroke="#aa3000"
                  strokeWidth={2}
                  dot={{ fill: "#aa3000", r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="atv2"
                  name={actB.name}
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </PerformanceCard>
        </>
      )}
    </div>
  );
}
