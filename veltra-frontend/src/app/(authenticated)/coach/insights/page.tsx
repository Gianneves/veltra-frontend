"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { PerformanceCard } from "@/components/ui/performance-card";
import { getInsights } from "@/lib/api/coach";
import type { CoachInsight } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { Lightbulb } from "lucide-react";

const topics = ["Todos", "performance", "recovery", "form"];

const topicLabels: Record<string, string> = {
  Todos: "Todos",
  performance: "Performance",
  recovery: "Recuperação",
  form: "Forma",
};

export default function CoachInsightsPage() {
  const [topic, setTopic] = useState("Todos");
  const [insights, setInsights] = useState<CoachInsight[]>([]);

  useEffect(() => {
    getInsights().then(setInsights);
  }, []);

  const filtered = topic === "Todos"
    ? insights
    : insights.filter((i) => i.topic === topic);

  return (
    <div>
      <Header title="Insights do Coach" subtitle="Análises inteligentes sobre sua evolução" />

      <div className="flex flex-wrap gap-2 mb-6">
        {topics.map((t) => (
          <button
            key={t}
            onClick={() => setTopic(t)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold tracking-wider transition-colors cursor-pointer",
              topic === t
                ? "bg-primary text-on-primary"
                : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
            )}
          >
            {topicLabels[t]?.toUpperCase() ?? t.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map((insight) => (
          <PerformanceCard key={insight.id} label={topicLabels[insight.topic] ?? insight.topic}>
            <div className="flex gap-4">
              <img
                src="/images/avatar-coach.svg"
                alt="Coach"
                className="h-10 w-10 shrink-0 rounded-full"
              />
              <div className="flex-1">
                <p className="font-sora font-semibold text-base text-on-surface mb-1">
                  {insight.title}
                </p>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  {insight.content}
                </p>
                <p className="text-xs text-on-surface-variant mt-2">
                  {new Date(insight.createdAt).toLocaleDateString("pt-BR", {
                    day: "numeric",
                    month: "long",
                  })}
                </p>
              </div>
            </div>
          </PerformanceCard>
        ))}
      </div>
    </div>
  );
}
