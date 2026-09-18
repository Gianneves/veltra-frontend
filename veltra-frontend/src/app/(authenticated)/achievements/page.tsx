"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Lock, RefreshCw, Timer, TrendingUp, Trophy } from "lucide-react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { DataDisplay } from "@/components/ui/data-display";
import { PerformanceCard } from "@/components/ui/performance-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { getAchievements } from "@/lib/api/achievements";
import {
  achievementCategories,
  achievementCategoryLabels,
  badgeMap,
  formatDistanceLabel,
  formatProgressText,
  progressSegments,
} from "@/lib/achievement-display";
import { formatNumber, formatPace, formatRaceTime } from "@/lib/format";
import type {
  Achievement,
  AchievementCategory,
  AchievementsResponse,
  BestEffort,
  TimePrediction,
} from "@/lib/api/types";
import { cn } from "@/lib/utils";

const EMPTY: AchievementsResponse = {
  trophies: [],
  bestEfforts: [],
  predictions: [],
};

type Filter = "all" | AchievementCategory;

function formatShortDate(value?: string | null): string {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("pt-BR");
}

function CardSkeleton() {
  return (
    <div className="rounded-lg border border-surface-container-highest bg-surface-container-lowest p-5">
      <div className="mb-4 h-3 w-20 animate-pulse rounded bg-surface-container-high" />
      <div className="mb-3 h-8 w-24 animate-pulse rounded bg-surface-container-high" />
      <div className="h-3 w-16 animate-pulse rounded bg-surface-container-high" />
    </div>
  );
}

function TrophyCard({ trophy }: { trophy: Achievement }) {
  return (
    <PerformanceCard
      label={achievementCategoryLabels[trophy.category]}
      className={cn(!trophy.earned && "opacity-70")}
    >
      <div className="flex flex-col items-center py-2 text-center">
        <div
          className={cn(
            "mb-3",
            trophy.earned
              ? "text-primary"
              : "text-surface-container-highest",
          )}
        >
          {trophy.earned ? (
            <img
              src={badgeMap[trophy.icon] ?? badgeMap.trophy}
              alt={trophy.name}
              className="h-14 w-14"
            />
          ) : (
            <Lock size={28} />
          )}
        </div>

        <p className="mb-1 font-sora text-sm font-semibold text-on-surface">
          {trophy.name}
        </p>
        <p className="text-xs leading-tight text-on-surface-variant">
          {trophy.description}
        </p>

        {trophy.earned && trophy.earnedDate ? (
          <p className="mt-2 text-xs text-primary">
            Conquistado em {formatShortDate(trophy.earnedDate)}
          </p>
        ) : trophy.progress ? (
          <div className="mt-3 w-full">
            <ProgressBar
              segments={progressSegments(
                trophy.progress,
                trophy.progress.unit === "weeks" ? 12 : 10,
              )}
            />
            <p className="mt-2 text-xs text-on-surface-variant">
              {formatProgressText(trophy.progress)}
            </p>
          </div>
        ) : null}
      </div>
    </PerformanceCard>
  );
}

function BestEffortCard({
  distanceKm,
  effort,
}: {
  distanceKm: number;
  effort?: BestEffort;
}) {
  return (
    <PerformanceCard label={formatDistanceLabel(distanceKm)}>
      {effort ? (
        <>
          <DataDisplay value={formatRaceTime(effort.timeSeconds)} size="lg" />
          <p className="mt-1 font-geist text-sm text-on-surface-variant">
            {formatPace(effort.paceSecondsPerKm)} /km
          </p>
          <Link
            href={`/activities/${effort.activityId}`}
            className="mt-3 inline-block max-w-full truncate text-xs text-primary hover:underline"
          >
            {effort.activityName}
            {effort.achievedAt && ` · ${formatShortDate(effort.achievedAt)}`}
          </Link>
        </>
      ) : (
        <>
          <DataDisplay
            value="—"
            size="lg"
            className="text-on-surface-variant"
          />
          <p className="mt-3 text-xs text-on-surface-variant">
            Sem corrida nessa distância ainda
          </p>
        </>
      )}
    </PerformanceCard>
  );
}

function PredictionCard({ prediction }: { prediction: TimePrediction }) {
  return (
    <PerformanceCard label={formatDistanceLabel(prediction.distanceKm)}>
      <DataDisplay value={formatRaceTime(prediction.timeSeconds)} size="lg" />
      <p className="mt-1 font-geist text-sm text-on-surface-variant">
        {formatPace(prediction.paceSecondsPerKm)} /km
      </p>
      <p className="mt-3 text-xs text-on-surface-variant">
        Base: {formatRaceTime(prediction.basedOnTimeSeconds)} em{" "}
        {formatNumber(prediction.basedOnDistanceKm, 1)} km
      </p>
    </PerformanceCard>
  );
}

export default function AchievementsPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [data, setData] = useState<AchievementsResponse>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      setData(await getAchievements());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const earnedCount = data.trophies.filter((trophy) => trophy.earned).length;

  const filteredTrophies =
    filter === "all"
      ? data.trophies
      : data.trophies.filter((trophy) => trophy.category === filter);

  const distances = Array.from(
    new Set([
      ...data.bestEfforts.map((effort) => effort.distanceKm),
      ...data.predictions.map((prediction) => prediction.distanceKm),
    ]),
  ).sort((a, b) => a - b);

  if (error) {
    return (
      <div>
        <Header title="Conquistas" subtitle="Troféus, melhores tempos e previsões" />
        <div className="rounded-lg border border-surface-container-highest bg-surface-container-lowest p-10 text-center">
          <p className="mb-4 text-sm text-on-surface-variant">
            Não foi possível carregar suas conquistas.
          </p>
          <Button size="sm" onClick={load}>
            <RefreshCw size={14} />
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Conquistas" subtitle="Troféus, melhores tempos e previsões" />

      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-sora text-lg font-semibold text-on-surface">
            <Trophy size={18} className="text-primary" />
            Troféus
          </h2>
          {!loading && (
            <span className="text-xs text-on-surface-variant">
              {earnedCount} de {data.trophies.length} conquistados
            </span>
          )}
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {(["all", ...achievementCategories] as Filter[]).map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={cn(
                "cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold tracking-wider transition-colors",
                filter === category
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high",
              )}
            >
              {(category === "all"
                ? "Todas"
                : achievementCategoryLabels[category]
              ).toUpperCase()}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }, (_, index) => (
                <CardSkeleton key={index} />
              ))
            : filteredTrophies.map((trophy) => (
                <TrophyCard key={trophy.id} trophy={trophy} />
              ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="flex items-center gap-2 font-sora text-lg font-semibold text-on-surface">
          <Timer size={18} className="text-primary" />
          Melhores Tempos
        </h2>
        <p className="mb-4 mt-1 text-xs text-on-surface-variant">
          Projeção do seu melhor pace nas corridas que cobriram cada distância.
        </p>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <CardSkeleton key={index} />
            ))}
          </div>
        ) : distances.length === 0 ? (
          <div className="rounded-lg border border-surface-container-highest bg-surface-container-lowest p-8 text-center text-sm text-on-surface-variant">
            Registre corridas para acompanhar suas melhores marcas.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {distances.map((distanceKm) => (
              <BestEffortCard
                key={distanceKm}
                distanceKm={distanceKm}
                effort={data.bestEfforts.find(
                  (effort) => effort.distanceKm === distanceKm,
                )}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="flex items-center gap-2 font-sora text-lg font-semibold text-on-surface">
          <TrendingUp size={18} className="text-primary" />
          Previsões de Tempo
        </h2>
        <p className="mb-4 mt-1 text-xs text-on-surface-variant">
          Estimativa para cada distância com base nos seus treinos dos últimos
          90 dias.
        </p>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <CardSkeleton key={index} />
            ))}
          </div>
        ) : data.predictions.length === 0 ? (
          <div className="rounded-lg border border-surface-container-highest bg-surface-container-lowest p-8 text-center text-sm text-on-surface-variant">
            Sem corridas nos últimos 90 dias para gerar previsões.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {data.predictions.map((prediction) => (
              <PredictionCard key={prediction.distanceKm} prediction={prediction} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
