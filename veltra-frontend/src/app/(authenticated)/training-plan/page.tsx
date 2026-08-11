"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { PerformanceCard } from "@/components/ui/performance-card";
import { DataDisplay } from "@/components/ui/data-display";
import { Button } from "@/components/ui/button";
import { getAllPlans, updateSession } from "@/lib/api/training";
import type { TrainingPlan, TrainingSession } from "@/lib/api/types";
import {
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  CheckCircle2, Circle, Pencil, Check, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const typeColors: Record<string, string> = {
  easy: "bg-emerald-100 text-emerald-700 border-emerald-200",
  interval: "bg-orange-100 text-orange-700 border-orange-200",
  long_run: "bg-blue-100 text-blue-700 border-blue-200",
  rest: "bg-surface-container-highest text-on-surface-variant border-surface-container-highest",
  recovery: "bg-purple-100 text-purple-700 border-purple-200",
};

const typeLabels: Record<string, string> = {
  easy: "Leve",
  interval: "Intervalado",
  long_run: "Longão",
  rest: "Descanso",
  recovery: "Recuperação",
};

const typeIcons: Record<string, string> = {
  easy: "/images/icon-training-easy.svg",
  interval: "/images/icon-training-interval.svg",
  long_run: "/images/icon-training-long.svg",
  rest: "/images/icon-training-rest.svg",
  recovery: "/images/icon-training-recovery.svg",
};

function formatPace(secondsPerKm: number): string {
  if (!secondsPerKm) return "-";
  const min = Math.floor(secondsPerKm / 60);
  const sec = secondsPerKm % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

function weekLabel(weekStart: string, index: number): string {
  if (index === 0) return "Esta Semana";
  if (index === 1) return "Próxima Semana";
  return `Semana +${index}`;
}

function EditableField({
  value,
  label,
  onSave,
  type = "text",
}: {
  value: string;
  label: string;
  onSave: (val: string) => void;
  type?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const handleSave = () => {
    onSave(draft);
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(value);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <input
          type={type}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="w-20 rounded-lg bg-surface-container-highest border-0 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-primary"
          autoFocus
        />
        <button onClick={handleSave} className="text-primary hover:text-primary-hover">
          <Check size={14} />
        </button>
        <button onClick={handleCancel} className="text-on-surface-variant hover:text-on-surface">
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 group">
      <span>{value}</span>
      <button
        onClick={() => setEditing(true)}
        className="opacity-0 group-hover:opacity-100 text-on-surface-variant hover:text-on-surface transition-opacity"
      >
        <Pencil size={12} />
      </button>
    </div>
  );
}

function SessionCard({
  session,
  planId,
  onUpdated,
}: {
  session: TrainingSession;
  planId: string;
  onUpdated: () => void;
}) {
  const distKm = (session.plannedDistance / 1000).toFixed(1);

  const handleSaveDistance = async (val: string) => {
    const meters = Math.round(parseFloat(val) * 1000);
    if (isNaN(meters)) return;
    await updateSession(planId, session.id, { plannedDistance: meters });
    onUpdated();
  };

  const handleSavePace = async (val: string) => {
    const parts = val.split(":").map(Number);
    const seconds = parts[0] * 60 + (parts[1] || 0);
    if (isNaN(seconds)) return;
    await updateSession(planId, session.id, { plannedPace: seconds });
    onUpdated();
  };

  return (
    <PerformanceCard label={session.day}>
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
              typeColors[session.type]
            )}
          >
            <img src={typeIcons[session.type]} alt="" className="h-3.5 w-3.5" />
            {typeLabels[session.type]}
          </span>
          {session.completed ? (
            <CheckCircle2 className="text-primary" size={18} />
          ) : (
            <Circle className="text-surface-container-highest" size={18} />
          )}
        </div>
        {session.type !== "rest" && (
          <div className="flex gap-4">
            <div>
              <p className="text-xs text-on-surface-variant">Distância</p>
              <EditableField
                value={distKm}
                label="km"
                type="number"
                onSave={handleSaveDistance}
              />
            </div>
            <div>
              <p className="text-xs text-on-surface-variant">Ritmo</p>
              <EditableField
                value={formatPace(session.plannedPace)}
                label="pace"
                onSave={handleSavePace}
              />
            </div>
          </div>
        )}
        {session.notes && (
          <p className="text-xs text-on-surface-variant italic">{session.notes}</p>
        )}
      </div>
    </PerformanceCard>
  );
}

const WEEKS_PER_PAGE = 5;

export default function TrainingPlanPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([0]));
  const [page, setPage] = useState(0);

  const totalPages = Math.max(1, Math.ceil(plans.length / WEEKS_PER_PAGE));

  useEffect(() => {
    getAllPlans().then(setPlans);
  }, []);

  useEffect(() => {
    if (page > totalPages - 1) setPage(totalPages - 1);
  }, [plans.length, page, totalPages]);

  const toggleWeek = (index: number) => {
    setExpandedWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const refresh = async () => {
    const data = await getAllPlans();
    setPlans(data);
  };

  if (plans.length === 0) {
    return (
      <div>
        <Header title="Plano de Treino" subtitle="Sua programação semanal" />
        <PerformanceCard label="Nenhum plano ainda">
          <p className="text-sm text-on-surface-variant mb-4">
            Você ainda não definiu uma meta. Defina sua meta para gerar seu plano de
            treino personalizado.
          </p>
          <Button variant="primary" onClick={() => router.push("/goal")}>
            Definir Meta
          </Button>
        </PerformanceCard>
      </div>
    );
  }

  return (
    <div>
      <Header title="Plano de Treino" subtitle="Sua programação até a meta" />

      <div className="space-y-3">
        {plans
          .slice(page * WEEKS_PER_PAGE, (page + 1) * WEEKS_PER_PAGE)
          .map((plan, i) => {
          const index = page * WEEKS_PER_PAGE + i;
          const isExpanded = expandedWeeks.has(index);
          const runSessions = plan.sessions.filter((s) => s.type !== "rest");
          const totalDist = runSessions.reduce((acc, s) => acc + s.plannedDistance, 0);

          return (
            <div
              key={plan.id}
              className="rounded-2xl bg-surface-container-low border border-surface-container-highest overflow-hidden"
            >
              <button
                onClick={() => toggleWeek(index)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface-container-highest/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="font-sora font-semibold text-on-surface">
                    {weekLabel(plan.weekStart, index)}
                  </span>
                  <span className="text-sm text-on-surface-variant">
                    {runSessions.length} treinos · {(totalDist / 1000).toFixed(0)}km
                  </span>
                </div>
                {isExpanded ? <ChevronUp size={20} className="text-on-surface-variant" /> : <ChevronDown size={20} className="text-on-surface-variant" />}
              </button>

              {isExpanded && (
                <div className="px-5 pb-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {plan.sessions.map((session) => (
                      <SessionCard
                        key={session.id}
                        session={session}
                        planId={plan.id}
                        onUpdated={refresh}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {plans.length > WEEKS_PER_PAGE && (
        <div className="flex items-center justify-center gap-4 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            <ChevronLeft size={16} /> Anterior
          </Button>
          <span className="text-sm text-on-surface-variant">
            Semanas {page * WEEKS_PER_PAGE + 1}–
            {Math.min((page + 1) * WEEKS_PER_PAGE, plans.length)} de {plans.length}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
          >
            Próxima <ChevronRight size={16} />
          </Button>
        </div>
      )}
    </div>
  );
}
