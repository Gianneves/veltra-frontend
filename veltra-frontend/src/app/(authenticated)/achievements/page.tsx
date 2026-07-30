"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { PerformanceCard } from "@/components/ui/performance-card";
import { getAchievements } from "@/lib/api/achievements";
import type { Achievement } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";
import type { ReactNode } from "react";

const badgeMap: Record<string, string> = {
  footprints: "/images/badge-first-step.svg",
  trophy: "/images/badge-century.svg",
  medal: "/images/badge-marathoner.svg",
  flame: "/images/badge-consistent.svg",
  zap: "/images/badge-sprinter.svg",
};


const categories = ["Todas", "Milestone", "Distance", "Consistency", "Speed"];

export default function AchievementsPage() {
  const [filter, setFilter] = useState("Todas");
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    getAchievements().then(setAchievements);
  }, []);

  const filtered = filter === "Todas"
    ? achievements
    : achievements.filter((a) => a.category === filter);

  return (
    <div>
      <Header title="Conquistas" subtitle="Troféus e badges de corrida" />

      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold tracking-wider transition-colors cursor-pointer",
              filter === cat
                ? "bg-primary text-on-primary"
                : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
            )}
          >
            {cat.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((ach) => (
          <PerformanceCard
            key={ach.id}
            label={ach.category}
            className={cn(
              !ach.earned && "opacity-50"
            )}
          >
            <div className="flex flex-col items-center text-center py-2">
              <div
                className={cn(
                  "mb-3",
                  ach.earned ? "text-primary" : "text-surface-container-highest"
                )}
              >
                {ach.earned ? (
                  <img src={badgeMap[ach.icon] ?? badgeMap.trophy} alt={ach.name} className="h-14 w-14" />
                ) : (
                  <Lock size={28} />
                )}
              </div>
              <p className="font-sora font-semibold text-sm text-on-surface mb-1">
                {ach.name}
              </p>
              <p className="text-xs text-on-surface-variant leading-tight">
                {ach.description}
              </p>
              {ach.earned && ach.earnedDate && (
                <p className="text-xs text-primary mt-2">
                  {new Date(ach.earnedDate).toLocaleDateString("pt-BR")}
                </p>
              )}
            </div>
          </PerformanceCard>
        ))}
      </div>
    </div>
  );
}
