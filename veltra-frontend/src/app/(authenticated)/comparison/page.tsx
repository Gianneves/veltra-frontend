"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeftRight,
  GitCompareArrows,
  Heart,
  Mountain,
  Timer,
  TrendingUp,
} from "lucide-react";
import { Header } from "@/components/header";
import { PerformanceCard } from "@/components/ui/performance-card";
import { DataDisplay } from "@/components/ui/data-display";
import { StatItem } from "@/components/ui/stat-item";
import { Button } from "@/components/ui/button";
import { getActivities } from "@/lib/api/activities";
import {
  formatActivityDate,
  formatActivityDateTime,
  formatElevation,
  formatPace,
  formatPaceFromMps,
  formatTime,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Activity, ActivityLap } from "@/lib/api/types";
import {
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COLOR_A = "#bb3619";
const COLOR_B = "#3b82f6";

const TOOLTIP_STYLE = {
  background: "#fff",
  border: "1px solid #e0e3e5",
  borderRadius: 8,
  fontSize: 14,
} as const;

interface MetricRow {
  key: string;
  label: string;
  a?: number;
  b?: number;
  format: (value: number) => string;
  delta: (value: number) => string;
}

function metric(value: number | null | undefined): number | undefined {
  if (value === null || value === undefined) return undefined;
  if (!Number.isFinite(value)) return undefined;
  return value;
}

function paceOf(activity: Activity): number | undefined {
  const speed = metric(activity.averageSpeed);
  if (!speed || speed <= 0) return undefined;
  return 1000 / speed;
}

function validLaps(activity: Activity): ActivityLap[] {
  return (activity.laps ?? []).filter(
    (lap) => lap.distance >= 200 && lap.movingTime > 0,
  );
}

function collectPacePoints(
  activity: Activity,
  key: "a" | "b",
  points: Map<number, { km: number; a?: number; b?: number }>,
) {
  let cumulativeKm = 0;

  for (const lap of validLaps(activity)) {
    cumulativeKm += lap.distance / 1000;
    const km = Math.round(cumulativeKm * 10) / 10;
    const pace = lap.movingTime / (lap.distance / 1000);
    const point = points.get(km) ?? { km };
    point[key] = Math.round(pace);
    points.set(km, point);
  }
}

function ActivityColumn({
  activity,
  color,
  tag,
}: {
  activity: Activity;
  color: string;
  tag: string;
}) {
  const pace = paceOf(activity);
  const cadence = metric(activity.averageCadence);

  return (
    <PerformanceCard
      label={`Corrida ${tag}`}
      icon={
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ background: color }}
        />
      }
    >
      <p className="font-sora text-base font-semibold text-on-surface">
        {activity.name}
      </p>
      <p className="mt-0.5 font-geist text-xs text-on-surface-variant">
        {formatActivityDateTime(activity.startDate)}
      </p>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <DataDisplay
          value={(activity.distance / 1000).toFixed(2)}
          unit="km"
          size="lg"
        />
        {pace !== undefined && (
          <StatItem
            align="right"
            size="md"
            label="ritmo médio"
            value={`${formatPace(pace)}/km`}
          />
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatItem
          label="tempo"
          value={formatTime(activity.movingTime)}
          icon={<Timer size={13} className="text-primary" />}
        />
        <StatItem
          label="FC média"
          value={
            activity.averageHeartrate != null
              ? `${activity.averageHeartrate} bpm`
              : "-"
          }
          icon={<Heart size={13} className="text-primary" />}
        />
        <StatItem
          label="FC máx"
          value={
            activity.maxHeartrate != null
              ? `${activity.maxHeartrate} bpm`
              : "-"
          }
        />
        <StatItem
          label="pace máx"
          value={`${formatPaceFromMps(activity.maxSpeed)}/km`}
        />
        <StatItem
          label="elevação"
          value={
            activity.totalElevationGain != null
              ? `${formatElevation(activity.totalElevationGain)} m`
              : "-"
          }
          icon={<Mountain size={13} className="text-primary" />}
        />
        {cadence !== undefined && cadence > 0 && (
          <StatItem label="cadência" value={`${cadence} spm`} />
        )}
      </div>
    </PerformanceCard>
  );
}

function ComparisonSkeleton() {
  return (
    <div className="space-y-6">
      <PerformanceCard label="Escolha as corridas">
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="h-11 animate-pulse rounded-lg bg-surface-container"
            />
          ))}
        </div>
      </PerformanceCard>
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <PerformanceCard key={index} label={`Corrida ${index === 0 ? "A" : "B"}`}>
            <div className="space-y-4">
              <div className="h-4 w-40 animate-pulse rounded bg-surface-container" />
              <div className="h-9 w-28 animate-pulse rounded bg-surface-container" />
              <div className="grid grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, cell) => (
                  <div
                    key={cell}
                    className="h-8 animate-pulse rounded bg-surface-container"
                  />
                ))}
              </div>
            </div>
          </PerformanceCard>
        ))}
      </div>
    </div>
  );
}

export default function ComparisonPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedA, setSelectedA] = useState("");
  const [selectedB, setSelectedB] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getActivities()
      .then((acts) => {
        if (!active) return;
        setActivities(acts);
        if (acts.length > 0) setSelectedA(acts[0].id);
        if (acts.length > 1) setSelectedB(acts[1].id);
      })
      .catch((err) => {
        console.error("Erro ao carregar atividades:", err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const actA = activities.find((a) => a.id === selectedA);
  const actB = activities.find((a) => a.id === selectedB);

  const handleSelectA = (id: string) => {
    if (id === selectedB) setSelectedB(selectedA);
    setSelectedA(id);
  };

  const handleSelectB = (id: string) => {
    if (id === selectedA) setSelectedA(selectedB);
    setSelectedB(id);
  };

  const handleSwap = () => {
    setSelectedA(selectedB);
    setSelectedB(selectedA);
  };

  const metrics = useMemo<MetricRow[]>(() => {
    if (!actA || !actB) return [];

    return [
      {
        key: "distance",
        label: "Distância",
        a: metric(actA.distance),
        b: metric(actB.distance),
        format: (value) => `${(value / 1000).toFixed(2)} km`,
        delta: (value) => `${(value / 1000).toFixed(2)} km`,
      },
      {
        key: "pace",
        label: "Ritmo médio",
        a: paceOf(actA),
        b: paceOf(actB),
        format: (value) => `${formatPace(value)}/km`,
        delta: (value) => `${Math.round(value)} s/km`,
      },
      {
        key: "time",
        label: "Tempo em movimento",
        a: metric(actA.movingTime),
        b: metric(actB.movingTime),
        format: formatTime,
        delta: formatTime,
      },
      {
        key: "hr",
        label: "FC média",
        a: metric(actA.averageHeartrate),
        b: metric(actB.averageHeartrate),
        format: (value) => `${Math.round(value)} bpm`,
        delta: (value) => `${Math.round(value)} bpm`,
      },
      {
        key: "hrMax",
        label: "FC máxima",
        a: metric(actA.maxHeartrate),
        b: metric(actB.maxHeartrate),
        format: (value) => `${Math.round(value)} bpm`,
        delta: (value) => `${Math.round(value)} bpm`,
      },
      {
        key: "elevation",
        label: "Elevação",
        a: metric(actA.totalElevationGain),
        b: metric(actB.totalElevationGain),
        format: (value) => `${formatElevation(value)} m`,
        delta: (value) => `${formatElevation(value)} m`,
      },
    ];
  }, [actA, actB]);

  const hasSplits =
    !!actA &&
    !!actB &&
    validLaps(actA).length >= 2 &&
    validLaps(actB).length >= 2;

  const paceSeries = useMemo(() => {
    if (!actA || !actB) return [];

    const points = new Map<number, { km: number; a?: number; b?: number }>();
    collectPacePoints(actA, "a", points);
    collectPacePoints(actB, "b", points);

    return [...points.values()].sort((x, y) => x.km - y.km);
  }, [actA, actB]);

  return (
    <div>
      <Header
        title="Comparação"
        subtitle="Compare duas corridas lado a lado"
      />

      {loading ? (
        <ComparisonSkeleton />
      ) : activities.length < 2 ? (
        <PerformanceCard
          label="Comparação"
          icon={<GitCompareArrows size={14} className="text-primary" />}
        >
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <img
              src="/images/illustration-comparison.svg"
              alt=""
              className="h-24 w-auto"
            />
            <p className="font-geist text-sm text-on-surface-variant">
              Você precisa de pelo menos duas corridas para comparar.
            </p>
            <Link href="/activities">
              <Button variant="outline" size="sm">
                Ver atividades
              </Button>
            </Link>
          </div>
        </PerformanceCard>
      ) : (
        <>
          <PerformanceCard
            label="Escolha as corridas"
            icon={<GitCompareArrows size={14} className="text-primary" />}
            className="mb-6"
          >
            <div className="grid items-end gap-3 md:grid-cols-[1fr_auto_1fr]">
              <div>
                <label
                  htmlFor="activity-a"
                  className="mb-1.5 flex items-center gap-1.5 font-geist text-xs font-medium text-on-surface-variant"
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: COLOR_A }}
                  />
                  Corrida A
                </label>
                <select
                  id="activity-a"
                  value={selectedA}
                  onChange={(event) => handleSelectA(event.target.value)}
                  className="w-full rounded-lg border border-surface-container-highest bg-surface-container-lowest px-3 py-2.5 font-geist text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {activities.map((activity) => (
                    <option key={activity.id} value={activity.id}>
                      {activity.name} · {formatActivityDate(activity.startDate)}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleSwap}
                title="Inverter corridas"
                aria-label="Inverter corridas"
                className="mx-auto hidden h-10 w-10 items-center justify-center rounded-full border border-surface-container-highest text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary md:inline-flex"
              >
                <ArrowLeftRight size={16} />
              </button>

              <div>
                <label
                  htmlFor="activity-b"
                  className="mb-1.5 flex items-center gap-1.5 font-geist text-xs font-medium text-on-surface-variant"
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: COLOR_B }}
                  />
                  Corrida B
                </label>
                <select
                  id="activity-b"
                  value={selectedB}
                  onChange={(event) => handleSelectB(event.target.value)}
                  className="w-full rounded-lg border border-surface-container-highest bg-surface-container-lowest px-3 py-2.5 font-geist text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {activities.map((activity) => (
                    <option key={activity.id} value={activity.id}>
                      {activity.name} · {formatActivityDate(activity.startDate)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </PerformanceCard>

          {actA && actB && (
            <>
              <div className="grid gap-6 md:grid-cols-2">
                <ActivityColumn activity={actA} color={COLOR_A} tag="A" />
                <ActivityColumn activity={actB} color={COLOR_B} tag="B" />
              </div>

              <PerformanceCard label="Comparativo" className="mt-6">
                <div className="divide-y divide-surface-container-high">
                  {metrics.map((row) => {
                    const hasBoth = row.a !== undefined && row.b !== undefined;
                    const delta =
                      hasBoth && row.a !== undefined && row.b !== undefined
                        ? row.b - row.a
                        : undefined;
                    const showDelta =
                      delta !== undefined && Math.abs(delta) > 0.0001;

                    return (
                      <div
                        key={row.key}
                        className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-3"
                      >
                        <span className="text-right font-geist text-sm font-semibold text-on-surface">
                          {row.a !== undefined ? row.format(row.a) : "-"}
                        </span>
                        <div className="flex min-w-[110px] flex-col items-center gap-1">
                          <span className="font-geist text-[10px] uppercase tracking-[0.08em] text-on-surface-variant">
                            {row.label}
                          </span>
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 font-geist text-[10px] font-medium",
                              !hasBoth
                                ? "bg-surface-container text-on-surface-variant"
                                : showDelta
                                  ? "bg-primary/10 text-primary"
                                  : "bg-surface-container text-on-surface-variant",
                            )}
                          >
                            {!hasBoth
                              ? "—"
                              : showDelta && delta !== undefined
                                ? `Δ ${row.delta(Math.abs(delta))}`
                                : "igual"}
                          </span>
                        </div>
                        <span className="text-left font-geist text-sm font-semibold text-on-surface">
                          {row.b !== undefined ? row.format(row.b) : "-"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </PerformanceCard>

              <PerformanceCard
                label="Ritmo ao longo da distância"
                icon={<TrendingUp size={14} className="text-primary" />}
                className="mt-6"
              >
                {hasSplits && paceSeries.length >= 2 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={paceSeries}>
                      <XAxis
                        dataKey="km"
                        tickFormatter={(value) => `${value} km`}
                        tick={{ fontSize: 12, fill: "#5c4037" }}
                        minTickGap={28}
                      />
                      <YAxis
                        tickFormatter={(value) => formatPace(Number(value))}
                        domain={["auto", "auto"]}
                        tick={{ fontSize: 12, fill: "#5c4037" }}
                        width={52}
                      />
                      <Tooltip
                        contentStyle={TOOLTIP_STYLE}
                        formatter={(value, name) => [
                          `${formatPace(Number(value))}/km`,
                          String(name),
                        ]}
                        labelFormatter={(label) => `${label} km`}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="a"
                        name={actA.name}
                        stroke={COLOR_A}
                        strokeWidth={2}
                        dot={{ fill: COLOR_A, r: 3 }}
                        connectNulls
                      />
                      <Line
                        type="monotone"
                        dataKey="b"
                        name={actB.name}
                        stroke={COLOR_B}
                        strokeWidth={2}
                        dot={{ fill: COLOR_B, r: 3 }}
                        connectNulls
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center gap-3 py-12 text-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container text-on-surface-variant">
                      <TrendingUp size={20} />
                    </span>
                    <p className="font-geist text-sm text-on-surface-variant">
                      Sem voltas suficientes nas duas corridas para comparar o
                      ritmo ao longo da distância.
                    </p>
                    <p className="max-w-md font-geist text-xs text-on-surface-variant">
                      O gráfico aparece automaticamente quando as duas corridas
                      têm voltas registradas no Strava.
                    </p>
                  </div>
                )}
              </PerformanceCard>
            </>
          )}
        </>
      )}
    </div>
  );
}
