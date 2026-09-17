"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { PerformanceCard } from "@/components/ui/performance-card";
import { DataDisplay } from "@/components/ui/data-display";
import { Button } from "@/components/ui/button";
import { getActivities } from "@/lib/api/activities";
import {
  getAllPlans,
  linkSessionActivity,
  regeneratePlan,
  updateSession,
} from "@/lib/api/training";
import type { Activity, TrainingPlan, TrainingSession } from "@/lib/api/types";
import {
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  CheckCircle2, Circle, Pencil, Check, X, RefreshCw, History, Link2, Unlink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

const typeColors: Record<string, string> = {
  easy: "bg-emerald-100 text-emerald-700 border-emerald-200",
  interval: "bg-orange-100 text-orange-700 border-orange-200",
  tempo: "bg-amber-100 text-amber-700 border-amber-200",
  fartlek: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200",
  long_run: "bg-blue-100 text-blue-700 border-blue-200",
  rest: "bg-surface-container-highest text-on-surface-variant border-surface-container-highest",
  recovery: "bg-purple-100 text-purple-700 border-purple-200",
  race: "bg-red-100 text-red-700 border-red-200",
};

const typeLabels: Record<string, string> = {
  easy: "Leve",
  interval: "Intervalado",
  tempo: "Tempo",
  fartlek: "Fartlek",
  long_run: "Longão",
  rest: "Descanso",
  recovery: "Recuperação",
  race: "Prova",
};

const typeIcons: Record<string, string> = {
  easy: "/images/icon-training-easy.svg",
  interval: "/images/icon-training-interval.svg",
  tempo: "/images/icon-training-interval.svg",
  fartlek: "/images/icon-training-interval.svg",
  long_run: "/images/icon-training-long.svg",
  rest: "/images/icon-training-rest.svg",
  recovery: "/images/icon-training-recovery.svg",
  race: "/images/icon-training-long.svg",
};

function formatPace(secondsPerKm: number): string {
  if (!secondsPerKm || !Number.isFinite(secondsPerKm) || secondsPerKm <= 0) {
    return "-";
  }
  const total = Math.round(secondsPerKm);
  const min = Math.floor(total / 60);
  const sec = total % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

function getCurrentWeekStart(): Date {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  start.setHours(0, 0, 0, 0);
  return start;
}

function isCurrentWeek(weekStart: string): boolean {
  return new Date(weekStart).getTime() === getCurrentWeekStart().getTime();
}

function isPastWeek(weekStart: string): boolean {
  return new Date(weekStart).getTime() < getCurrentWeekStart().getTime();
}

function weekLabel(weekStart: string): string {
  const start = new Date(weekStart);
  const diffWeeks = Math.round(
    (start.getTime() - getCurrentWeekStart().getTime()) /
      (7 * 24 * 60 * 60 * 1000)
  );

  if (diffWeeks === 0) return "Esta Semana";
  if (diffWeeks === 1) return "Próxima Semana";
  if (diffWeeks === -1) return "Semana Passada";

  const dateStr = start.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
  return `Semana de ${dateStr}`;
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

function adherenceInfo(session: TrainingSession): {
  label: string;
  className: string;
} {
  const plannedKm = session.plannedDistance / 1000;
  const actualKm = (session.actualDistance ?? 0) / 1000;
  const distDiff =
    plannedKm > 0 ? Math.abs(actualKm - plannedKm) / plannedKm : 0;
  const paceDiff =
    session.plannedPace > 0 && session.actualPace
      ? Math.abs(session.actualPace - session.plannedPace) /
        session.plannedPace
      : 0;

  if (distDiff <= 0.1 && paceDiff <= 0.05) {
    return { label: "No plano", className: "bg-emerald-100 text-emerald-700" };
  }
  if (distDiff <= 0.2 || paceDiff <= 0.1) {
    return { label: "Próximo", className: "bg-amber-100 text-amber-700" };
  }
  return { label: "Diferente", className: "bg-red-100 text-red-700" };
}

function SessionCard({
  session,
  planId,
  candidates,
  onLink,
  onUnlink,
  onUpdated,
}: {
  session: TrainingSession;
  planId: string;
  candidates: Activity[];
  onLink: (activityId: string) => void;
  onUnlink: () => void;
  onUpdated: () => void;
}) {
  const distKm = (session.plannedDistance / 1000).toFixed(1);
  const [showLink, setShowLink] = useState(false);
  const adherence = adherenceInfo(session);
  const hasActual =
    session.completed && session.actualDistance !== null && session.actualDistance !== undefined;

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

        {hasActual && (
          <div className="rounded-xl bg-surface-container-highest/70 px-3 py-2 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-xs text-on-surface-variant">
                Realizado:{" "}
                <span className="font-medium text-on-surface">
                  {((session.actualDistance ?? 0) / 1000).toFixed(1)}km @{" "}
                  {formatPace(session.actualPace ?? 0)}/km
                </span>
              </p>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                  adherence.className
                )}
              >
                {adherence.label}
              </span>
            </div>
            <button
              onClick={onUnlink}
              className="inline-flex items-center gap-1 text-[11px] text-on-surface-variant hover:text-primary transition-colors"
            >
              <Unlink size={12} /> Desvincular atividade
            </button>
          </div>
        )}

        {!session.completed && session.type !== "rest" && (
          <div>
            <button
              onClick={() => setShowLink((prev) => !prev)}
              className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary-hover transition-colors"
            >
              <Link2 size={13} /> Vincular atividade
            </button>
            {showLink && (
              <div className="mt-2 space-y-1">
                {candidates.length === 0 && (
                  <p className="text-[11px] text-on-surface-variant">
                    Nenhuma atividade do Strava na semana para vincular.
                  </p>
                )}
                {candidates.map((activity) => (
                  <button
                    key={activity.id}
                    onClick={() => onLink(activity.id)}
                    className="w-full rounded-lg bg-surface-container-highest px-2.5 py-1.5 text-left text-[11px] text-on-surface hover:bg-surface-container transition-colors"
                  >
                    {activity.name} · {(activity.distance / 1000).toFixed(1)}km
                    {activity.startDate
                      ? ` · ${new Date(activity.startDate).toLocaleDateString(
                          "pt-BR",
                          { day: "2-digit", month: "2-digit" }
                        )}`
                      : ""}
                  </button>
                ))}
              </div>
            )}
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

const DAY_ORDER: Record<string, number> = {
  Dom: 0,
  Seg: 1,
  Ter: 2,
  Qua: 3,
  Qui: 4,
  Sex: 5,
  Sáb: 6,
};

function dayTimestamp(date: Date): number {
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  return day.getTime();
}

export default function TrainingPlanPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([0]));
  const [page, setPage] = useState(0);
  const [regenOpen, setRegenOpen] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const pastPlans = plans.filter((p) => isPastWeek(p.weekStart));
  const hasFuturePlans = plans.some((p) => !isPastWeek(p.weekStart));
  const visiblePlans =
    showHistory || !hasFuturePlans ? plans : plans.filter((p) => !isPastWeek(p.weekStart));

  const totalPages = Math.max(
    1,
    Math.ceil(visiblePlans.length / WEEKS_PER_PAGE)
  );

  const focusCurrentWeek = (data: TrainingPlan[], withHistory: boolean) => {
    const future = data.filter((p) => !isPastWeek(p.weekStart));
    const list = withHistory || future.length === 0 ? data : future;
    const index = list.findIndex((p) => isCurrentWeek(p.weekStart));

    setPage(index >= 0 ? Math.floor(index / WEEKS_PER_PAGE) : 0);
    setExpandedWeeks(new Set([index >= 0 ? index : 0]));
  };

  useEffect(() => {
    Promise.all([getAllPlans(), getActivities()]).then(([data, acts]) => {
      setPlans(data);
      setActivities(acts);
      if (!initialized) {
        focusCurrentWeek(data, false);
        setInitialized(true);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized]);

  useEffect(() => {
    if (page > totalPages - 1) setPage(totalPages - 1);
  }, [visiblePlans.length, page, totalPages]);

  const handleToggleHistory = () => {
    const next = !showHistory;
    setShowHistory(next);
    focusCurrentWeek(plans, next);
  };

  const toggleWeek = (index: number) => {
    setExpandedWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const refresh = async () => {
    const [data, acts] = await Promise.all([getAllPlans(), getActivities()]);
    setPlans(data);
    setActivities(acts);
  };

  const handleLinkActivity = async (
    planId: string,
    sessionId: string,
    activityId: string | null
  ) => {
    const result = await linkSessionActivity(planId, sessionId, activityId);
    if (!result) {
      alert(
        "Não foi possível atualizar o vínculo. Verifique se o backend está rodando."
      );
      return;
    }
    await refresh();
  };

  const weekActivities = (plan: TrainingPlan) => {
    const start = new Date(plan.weekStart);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    return activities.filter((activity) => {
      if (!activity.startDate) return false;
      const date = new Date(activity.startDate);
      return date >= start && date < end;
    });
  };

  const activityCandidates = (
    plan: TrainingPlan,
    session: TrainingSession
  ) => {
    const linked = new Set(
      plan.sessions.map((s) => s.activityId).filter((id): id is string => !!id)
    );

    const sessionDate = new Date(plan.weekStart);
    sessionDate.setDate(sessionDate.getDate() + (DAY_ORDER[session.day] ?? 0));

    return weekActivities(plan).filter((activity) => {
      if (linked.has(activity.id) || !activity.startDate) return false;
      const date = new Date(activity.startDate);
      const diffDays = Math.abs(
        Math.round(
          (dayTimestamp(date) - dayTimestamp(sessionDate)) / 86400000
        )
      );
      return diffDays <= 1;
    });
  };

  const extraActivities = (plan: TrainingPlan) => {
    const linked = new Set(
      plan.sessions.map((s) => s.activityId).filter((id): id is string => !!id)
    );
    return weekActivities(plan).filter((activity) => !linked.has(activity.id));
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    const result = await regeneratePlan();
    setRegenerating(false);

    if (!result) {
      alert("Erro ao regenerar o plano. Verifique se o backend está rodando.");
      return;
    }

    if (!result.regenerated) {
      alert("Defina uma meta ativa antes de regenerar o plano.");
      setRegenOpen(false);
      return;
    }

    setRegenOpen(false);
    const data = await getAllPlans();
    setPlans(data);
    focusCurrentWeek(data, showHistory);
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
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <Header title="Plano de Treino" subtitle="Sua programação até a meta" />
        <div className="flex flex-wrap items-center gap-2">
        {pastPlans.length > 0 && (
          <Button variant="ghost" onClick={handleToggleHistory}>
            <History size={18} />
            {showHistory
              ? "Ocultar semanas anteriores"
              : `Mostrar semanas anteriores (${pastPlans.length})`}
          </Button>
        )}
        <AlertDialog open={regenOpen} onOpenChange={setRegenOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="outline" disabled={regenerating}>
              <RefreshCw size={18} className={regenerating ? "animate-spin" : ""} />
              {regenerating ? "Regerando..." : "Regerar plano"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Regerar plano de treino?</AlertDialogTitle>
              <AlertDialogDescription>
                O plano atual será recalculado com base nos seus dados mais recentes
                (atividades, meta e nível). A semana atual e as semanas futuras serão
                substituídas, incluindo edições manuais.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  handleRegenerate();
                }}
                disabled={regenerating}
              >
                {regenerating ? "Regerando..." : "Regerar"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        </div>
      </div>

      <div className="space-y-3">
        {visiblePlans
          .slice(page * WEEKS_PER_PAGE, (page + 1) * WEEKS_PER_PAGE)
          .map((plan, i) => {
          const index = page * WEEKS_PER_PAGE + i;
          const isExpanded = expandedWeeks.has(index);
          const runSessions = plan.sessions.filter((s) => s.type !== "rest");
          const totalDist = runSessions.reduce((acc, s) => acc + s.plannedDistance, 0);

          const isCurrent = isCurrentWeek(plan.weekStart);
          const extras = extraActivities(plan);

          return (
            <div
              key={plan.id}
              className={cn(
                "rounded-2xl bg-surface-container-low border overflow-hidden",
                isCurrent ? "border-primary" : "border-surface-container-highest"
              )}
            >
              <button
                onClick={() => toggleWeek(index)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface-container-highest/50 transition-colors"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={cn(
                      "font-sora font-semibold",
                      isCurrent ? "text-primary" : "text-on-surface"
                    )}
                  >
                    {weekLabel(plan.weekStart)}
                  </span>
                  <span className="text-sm text-on-surface-variant">
                    {runSessions.length} treinos · {(totalDist / 1000).toFixed(0)}km
                  </span>
                  {plan.focus && (
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      {plan.focus}
                    </span>
                  )}
                </div>
                {isExpanded ? <ChevronUp size={20} className="text-on-surface-variant" /> : <ChevronDown size={20} className="text-on-surface-variant" />}
              </button>

              {isExpanded && (
                <div className="px-5 pb-5">
                  {plan.coachNotes && (
                    <div className="mb-4 rounded-xl border border-surface-container-highest bg-surface-container-highest/60 p-4">
                      <p className="mb-1 text-xs font-semibold text-on-surface">
                        Análise do Coach
                      </p>
                      <p className="whitespace-pre-line text-xs text-on-surface-variant">
                        {plan.coachNotes}
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {plan.sessions.map((session) => (
                      <SessionCard
                        key={session.id}
                        session={session}
                        planId={plan.id}
                        candidates={activityCandidates(plan, session)}
                        onLink={(activityId) =>
                          handleLinkActivity(plan.id, session.id, activityId)
                        }
                        onUnlink={() =>
                          handleLinkActivity(plan.id, session.id, null)
                        }
                        onUpdated={refresh}
                      />
                    ))}
                  </div>

                  {extras.length > 0 && (
                    <div className="mt-4">
                      <p className="mb-2 text-xs font-semibold text-on-surface">
                        Atividades extras (sem treino vinculado)
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {extras.map((activity) => (
                          <span
                            key={activity.id}
                            className="rounded-full bg-surface-container-highest px-3 py-1 text-xs text-on-surface-variant"
                          >
                            {activity.name} ·{" "}
                            {(activity.distance / 1000).toFixed(1)}km
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {visiblePlans.length > WEEKS_PER_PAGE && (
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
            {Math.min((page + 1) * WEEKS_PER_PAGE, visiblePlans.length)} de{" "}
            {visiblePlans.length}
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
