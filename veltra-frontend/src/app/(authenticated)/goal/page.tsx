"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { PerformanceCard } from "@/components/ui/performance-card";
import { DataDisplay } from "@/components/ui/data-display";
import { Button } from "@/components/ui/button";
import { getGoals, createGoal, updateGoal, deleteGoal } from "@/lib/api/goals";
import { CheckCircle2, Circle, ChevronRight, ChevronLeft, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Goal } from "@/lib/api/types";
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

const ALL_DAYS = [
  { short: "Seg", full: "Segunda" },
  { short: "Ter", full: "Terça" },
  { short: "Qua", full: "Quarta" },
  { short: "Qui", full: "Quinta" },
  { short: "Sex", full: "Sexta" },
  { short: "Sáb", full: "Sábado" },
  { short: "Dom", full: "Domingo" },
];

const DISTANCE_OPTIONS = [
  { label: "5km", value: 5000 },
  { label: "10km", value: 10000 },
  { label: "Meia Maratona", value: 21097 },
  { label: "Maratona", value: 42195 },
  { label: "Custom", value: 0 },
];

const DEFAULT_RUN_DAYS = ["Seg", "Ter", "Qui", "Sex", "Sáb"];

function formatDuration(hours: string, minutes: string): string {
  const h = Number(hours) || 0;
  const m = Number(minutes) || 0;
  if (!h) return `${m}min`;
  return m ? `${h}h ${m}min` : `${h}h`;
}

function formatRaceTime(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatPace(secondsPerKm: number | undefined): string {
  if (!secondsPerKm || !Number.isFinite(secondsPerKm) || secondsPerKm <= 0) {
    return "-";
  }
  const total = Math.round(secondsPerKm);
  const min = Math.floor(total / 60);
  const sec = total % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

function normalizeClockField(value: string, max: number): string {
  if (value === "") return value;
  const n = Math.min(max, Math.max(0, Math.floor(Number(value) || 0)));
  return String(n);
}

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold",
              s <= step
                ? "bg-primary text-on-primary"
                : "bg-surface-container-highest text-on-surface-variant"
            )}
          >
            {s}
          </div>
          <span className={cn("text-sm", s <= step ? "text-on-surface font-medium" : "text-on-surface-variant")}>
            {s === 1 ? "Meta" : s === 2 ? "Preferências" : "Perfil"}
          </span>
          {s < 3 && <ChevronRight size={16} className="text-on-surface-variant" />}
        </div>
      ))}
    </div>
  );
}

function GoalForm({ goal, onComplete }: { goal?: Goal; onComplete: () => void }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState(goal?.title ?? "");
  const [distanceOption, setDistanceOption] = useState<number | null>(() => {
    if (!goal) return null;
    return DISTANCE_OPTIONS.some((opt) => opt.value === goal.targetDistance && opt.value !== 0)
      ? goal.targetDistance
      : 0;
  });
  const [customDistance, setCustomDistance] = useState(() => {
    if (!goal) return "";
    const known = DISTANCE_OPTIONS.some((opt) => opt.value === goal.targetDistance && opt.value !== 0);
    return known ? "" : String(goal.targetDistance / 1000);
  });
  const [targetDate, setTargetDate] = useState(() => (goal ? goal.targetDate.slice(0, 10) : ""));
  const [cycleStart, setCycleStart] = useState(() =>
    goal?.startDate ? goal.startDate.slice(0, 10) : ""
  );
  const [discipline, setDiscipline] = useState(goal?.discipline ?? "");

  const [targetHours, setTargetHours] = useState(() =>
    goal?.targetTime ? String(Math.floor(goal.targetTime / 3600)) : ""
  );
  const [targetMin, setTargetMin] = useState(() =>
    goal?.targetTime ? String(Math.floor((goal.targetTime % 3600) / 60)) : ""
  );
  const [targetSec, setTargetSec] = useState(() =>
    goal?.targetTime ? String(goal.targetTime % 60) : ""
  );

  const [runDays, setRunDays] = useState<string[]>(
    goal?.runDays?.length ? goal.runDays : DEFAULT_RUN_DAYS
  );
  const [longRunDay, setLongRunDay] = useState(goal?.longRunDay ?? "Sáb");

  const [threeKmMin, setThreeKmMin] = useState(() =>
    goal ? String(Math.floor(goal.threeKmTime / 60)) : ""
  );
  const [threeKmSeg, setThreeKmSeg] = useState(() =>
    goal ? String(goal.threeKmTime % 60).padStart(2, "0") : "00"
  );
  const [longestKm, setLongestKm] = useState(() =>
    goal?.longestRunDistance ? String(goal.longestRunDistance / 1000) : ""
  );
  const [longestHours, setLongestHours] = useState(() =>
    goal?.longestRunTime ? String(Math.floor(goal.longestRunTime / 3600)) : ""
  );
  const [longestMin, setLongestMin] = useState(() =>
    goal?.longestRunTime ? String(Math.floor((goal.longestRunTime % 3600) / 60)) : ""
  );

  const targetDistance = distanceOption === 0 ? Number(customDistance) * 1000 : (distanceOption || 0);
  const threeKmMinValid = Number(threeKmMin) > 0;
  const threeKmTime = Number(threeKmMin) * 60 + (Number(threeKmSeg) || 0);
  const longestRunDistance = longestKm ? Number(longestKm) * 1000 : undefined;
  const longestRunTime =
    longestHours || longestMin
      ? (Number(longestHours) || 0) * 3600 + (Number(longestMin) || 0) * 60
      : undefined;
  const targetTime =
    targetHours || targetMin || targetSec
      ? (Number(targetHours) || 0) * 3600 +
        (Number(targetMin) || 0) * 60 +
        (Number(targetSec) || 0)
      : undefined;
  const targetTimePace =
    targetTime && targetDistance ? targetTime / (targetDistance / 1000) : undefined;

  const toggleDay = (short: string) => {
    setRunDays((prev) =>
      prev.includes(short) ? prev.filter((d) => d !== short) : [...prev, short]
    );
  };

  const handleSubmit = async () => {
    if (!title || !targetDistance || !targetDate || !threeKmMinValid) return;
    setLoading(true);

    const data = {
      title,
      targetDistance,
      targetDate: new Date(`${targetDate}T12:00:00`).toISOString(),
      startDate: cycleStart
        ? new Date(`${cycleStart}T12:00:00`).toISOString()
        : null,
      discipline: discipline || title,
      threeKmTime,
      targetTime: targetTime ?? null,
      longestRunDistance,
      longestRunTime,
      runDays,
      longRunDay,
      daysPerWeek: runDays.length,
    };

    try {
      if (goal) {
        const result = await updateGoal(goal.id, data);
        if (!result) {
          alert("Erro ao atualizar meta no servidor. Verifique se o backend está rodando.");
          return;
        }
        onComplete();
      } else {
        const result = await createGoal(data);
        if (!result) {
          alert("Erro ao criar meta no servidor. Verifique se o backend está rodando.");
          return;
        }
        onComplete();
        router.push("/training-plan");
      }
    } catch (err: unknown) {
      console.error("Erro ao salvar meta:", err);
      alert("Erro ao salvar meta. Verifique se o servidor está rodando.");
    } finally {
      setLoading(false);
    }
  };

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 14);
  const minDateStr = minDate.toISOString().split("T")[0];
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  return (
    <div>
      <StepIndicator step={step} />

      {step === 1 && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1.5">Título da meta</label>
            <input
              type="text"
              placeholder="Ex: Maratona de São Paulo"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl bg-surface-container-highest border-0 px-4 py-3 text-on-surface placeholder:text-on-surface-variant outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-1.5">Distância alvo</label>
            <div className="grid grid-cols-5 gap-2">
              {DISTANCE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDistanceOption(opt.value)}
                  className={cn(
                    "rounded-xl border-2 px-3 py-2 text-sm font-medium transition-colors",
                    distanceOption === opt.value
                      ? "border-primary bg-primary text-on-primary"
                      : "border-surface-container-highest bg-surface-container-highest text-on-surface hover:border-primary"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {distanceOption === 0 && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-on-surface mb-1.5">Distância em km</label>
                <input
                  type="number"
                  min="1"
                  placeholder="Ex: 15"
                  value={customDistance}
                  onChange={(e) => setCustomDistance(e.target.value)}
                  className="w-full rounded-xl bg-surface-container-highest border-0 px-4 py-3 text-on-surface placeholder:text-on-surface-variant outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-1.5">Data alvo</label>
            <input
              type="date"
              min={minDateStr}
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full rounded-xl bg-surface-container-highest border-0 px-4 py-3 text-on-surface outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-1.5">
              Início do ciclo (opcional)
            </label>
            <p className="text-xs text-on-surface-variant mb-3">
              Quando você quer começar o plano? Deixe vazio para começar já. O plano
              começa na semana da data escolhida e analisa os treinos que você já fez
              para vinculá-los automaticamente.
            </p>
            <input
              type="date"
              min={todayStr}
              max={targetDate || undefined}
              value={cycleStart}
              onChange={(e) => setCycleStart(e.target.value)}
              className="w-full rounded-xl bg-surface-container-highest border-0 px-4 py-3 text-on-surface outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-1.5">
              Tempo alvo na prova (opcional)
            </label>
            <p className="text-xs text-on-surface-variant mb-3">
              Informe o tempo que você quer fazer. O coach valida contra seu teste dos 3km
              e seu histórico antes de montar o plano.
            </p>
            <div className="flex gap-3 items-center">
              <div className="flex-1">
                <label className="block text-xs text-on-surface-variant mb-1">Horas</label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  placeholder="1"
                  value={targetHours}
                  onChange={(e) => setTargetHours(e.target.value)}
                  onBlur={() => setTargetHours((v) => normalizeClockField(v, 24))}
                  className="w-full rounded-xl bg-surface-container-highest border-0 px-4 py-3 text-on-surface placeholder:text-on-surface-variant outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <span className="text-lg font-medium text-on-surface mt-6">:</span>
              <div className="flex-1">
                <label className="block text-xs text-on-surface-variant mb-1">Minutos</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  placeholder="45"
                  value={targetMin}
                  onChange={(e) => setTargetMin(e.target.value)}
                  onBlur={() => setTargetMin((v) => normalizeClockField(v, 59))}
                  className="w-full rounded-xl bg-surface-container-highest border-0 px-4 py-3 text-on-surface placeholder:text-on-surface-variant outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <span className="text-lg font-medium text-on-surface mt-6">:</span>
              <div className="flex-1">
                <label className="block text-xs text-on-surface-variant mb-1">Segundos</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  placeholder="00"
                  value={targetSec}
                  onChange={(e) => setTargetSec(e.target.value)}
                  onBlur={() =>
                    setTargetSec((v) =>
                      v === "" ? v : normalizeClockField(v, 59).padStart(2, "0")
                    )
                  }
                  className="w-full rounded-xl bg-surface-container-highest border-0 px-4 py-3 text-on-surface placeholder:text-on-surface-variant outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            {targetTimePace && (
              <p className="mt-2 text-xs text-on-surface-variant">
                Pace alvo: <span className="font-medium text-on-surface">{formatPace(targetTimePace)}/km</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-1.5">Disciplina (opcional)</label>
            <input
              type="text"
              placeholder="Ex: Corrida de rua, Trilha"
              value={discipline}
              onChange={(e) => setDiscipline(e.target.value)}
              className="w-full rounded-xl bg-surface-container-highest border-0 px-4 py-3 text-on-surface placeholder:text-on-surface-variant outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex justify-end">
            <Button
              variant="primary"
              onClick={() => setStep(2)}
              disabled={!title || !targetDistance || !targetDate}
            >
              Próximo <ChevronRight size={18} />
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1.5">Quais dias você corre?</label>
            <div className="flex flex-wrap gap-2">
              {ALL_DAYS.map((day) => {
                const selected = runDays.includes(day.short);
                return (
                  <button
                    key={day.short}
                    type="button"
                    onClick={() => toggleDay(day.short)}
                    className={cn(
                      "rounded-xl border-2 px-4 py-2 text-sm font-medium transition-colors",
                      selected
                        ? "border-primary bg-primary text-on-primary"
                        : "border-surface-container-highest bg-surface-container-highest text-on-surface-variant hover:border-primary"
                    )}
                  >
                    {day.full}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-1.5">Dia do longão</label>
            <div className="flex flex-wrap gap-2">
              {runDays.map((short) => {
                const day = ALL_DAYS.find((d) => d.short === short);
                if (!day) return null;
                return (
                  <button
                    key={short}
                    type="button"
                    onClick={() => setLongRunDay(short)}
                    className={cn(
                      "rounded-xl border-2 px-4 py-2 text-sm font-medium transition-colors",
                      longRunDay === short
                        ? "border-primary bg-primary text-on-primary"
                        : "border-surface-container-highest bg-surface-container-highest text-on-surface-variant hover:border-primary"
                    )}
                  >
                    {day.full}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(1)}>
              <ChevronLeft size={18} /> Voltar
            </Button>
            <Button variant="primary" onClick={() => setStep(3)}>
              Próximo <ChevronRight size={18} />
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1.5">
              Teste dos 3km <span className="text-primary">*</span>
            </label>
            <p className="text-xs text-on-surface-variant mb-3">
              Corra 3km o mais rápido possível e informe seu tempo abaixo.
            </p>
            <div className="flex gap-3 items-center">
              <div className="flex-1">
                <label className="block text-xs text-on-surface-variant mb-1">Minutos</label>
                <input
                  type="number"
                  min="8"
                  max="60"
                  placeholder="20"
                  value={threeKmMin}
                  onChange={(e) => setThreeKmMin(e.target.value)}
                  className="w-full rounded-xl bg-surface-container-highest border-0 px-4 py-3 text-on-surface placeholder:text-on-surface-variant outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <span className="text-lg font-medium text-on-surface mt-6">:</span>
              <div className="flex-1">
                <label className="block text-xs text-on-surface-variant mb-1">Segundos</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  placeholder="00"
                  value={threeKmSeg}
                  onChange={(e) => setThreeKmSeg(e.target.value)}
                  onBlur={() =>
                    setThreeKmSeg((v) => {
                      if (v === "") return "00";
                      const n = Math.min(59, Math.max(0, Math.floor(Number(v) || 0)));
                      return String(n).padStart(2, "0");
                    })
                  }
                  className="w-full rounded-xl bg-surface-container-highest border-0 px-4 py-3 text-on-surface placeholder:text-on-surface-variant outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-surface-container-highest pt-5">
            <p className="text-sm font-medium text-on-surface mb-3">Histórico (opcional)</p>
            <p className="text-xs text-on-surface-variant mb-3">
              Preencha para o Coach entender melhor seu nível.
            </p>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs text-on-surface-variant mb-1">Maior distância (km)</label>
                <input
                  type="number"
                  min="1"
                  placeholder="Ex: 15"
                  value={longestKm}
                  onChange={(e) => setLongestKm(e.target.value)}
                  className="w-full rounded-xl bg-surface-container-highest border-0 px-4 py-3 text-on-surface placeholder:text-on-surface-variant outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-on-surface-variant mb-1">Horas (h)</label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  placeholder="1"
                  value={longestHours}
                  onChange={(e) => setLongestHours(e.target.value)}
                  className="w-full rounded-xl bg-surface-container-highest border-0 px-4 py-3 text-on-surface placeholder:text-on-surface-variant outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-on-surface-variant mb-1">Minutos (min)</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  placeholder="35"
                  value={longestMin}
                  onChange={(e) => setLongestMin(e.target.value)}
                  onBlur={() =>
                    setLongestMin((v) => {
                      if (v === "") return v;
                      const n = Math.min(59, Math.max(0, Math.floor(Number(v) || 0)));
                      return String(n);
                    })
                  }
                  className="w-full rounded-xl bg-surface-container-highest border-0 px-4 py-3 text-on-surface placeholder:text-on-surface-variant outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          <div className="bg-surface-container-highest rounded-xl p-4">
            <p className="text-sm font-medium text-on-surface mb-2">Resumo</p>
            <ul className="text-sm text-on-surface-variant space-y-1">
              <li>Meta: {title || "(sem título)"}</li>
              <li>Distância: {targetDistance / 1000}km</li>
              {targetTime && (
                <li>
                  Tempo alvo: {formatRaceTime(targetTime)}
                  {targetTimePace ? ` (${formatPace(targetTimePace)}/km)` : ""}
                </li>
              )}
              <li>Data: {targetDate ? new Date(targetDate).toLocaleDateString("pt-BR") : "-"}</li>
              <li>
                Início do ciclo:{" "}
                {cycleStart
                  ? new Date(`${cycleStart}T12:00:00`).toLocaleDateString("pt-BR")
                  : "imediato"}
              </li>
              <li>Dias de treino: {runDays.length}x por semana</li>
              <li>Longão: {ALL_DAYS.find((d) => d.short === longRunDay)?.full}</li>
              <li>Teste 3km: {threeKmMin || "?"}min {threeKmSeg.padStart(2, "0")}seg</li>
              {longestKm && (
                <li>
                  Maior distância: {longestKm}km
                  {longestRunTime ? ` em ${formatDuration(longestHours, longestMin)}` : ""}
                </li>
              )}
              <li>Plano de treino será gerado automaticamente</li>
            </ul>
          </div>

          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(2)}>
              <ChevronLeft size={18} /> Voltar
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={loading}
              disabled={!threeKmMinValid}
            >
              {loading ? "Salvando..." : goal ? "Salvar Alterações" : "Salvar Meta e Gerar Plano"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function GoalDisplay({
  goal,
  onEdit,
  onDeleted,
}: {
  goal: Goal;
  onEdit: () => void;
  onDeleted: () => void;
}) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const progressPct = Math.min(
    100,
    Math.round((goal.currentProgress / goal.targetDistance) * 100)
  );

  const circumference = 2 * Math.PI * 80;
  const offset = circumference - (progressPct / 100) * circumference;

  const handleDelete = async () => {
    setDeleting(true);
    const ok = await deleteGoal(goal.id);
    setDeleting(false);
    if (ok) {
      setDeleteOpen(false);
      onDeleted();
    } else {
      alert("Erro ao excluir meta. Verifique se o servidor está rodando.");
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <Header title="Minha Meta" subtitle={goal.title} />
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={onEdit}>
            <Pencil size={18} /> Editar
          </Button>
          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="outline">
                <Trash2 size={18} /> Excluir
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir meta?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. A meta "{goal.title}" e seu plano de
                  treino associado serão removidos.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete();
                  }}
                  disabled={deleting}
                >
                  {deleting ? "Excluindo..." : "Excluir"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button variant="primary" onClick={() => router.push("/training-plan")}>
            Ver Plano de Treino <ChevronRight size={18} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceCard label="Progresso">
          <div className="flex flex-col items-center py-6">
            <div className="relative flex items-center justify-center mb-4">
              <svg width="200" height="200" className="-rotate-90">
                <circle cx="100" cy="100" r="80" fill="none" stroke="#e0e3e5" strokeWidth="12" />
                <circle
                  cx="100" cy="100" r="80"
                  fill="none" stroke="#bb3619" strokeWidth="12"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="font-sora text-3xl font-bold text-on-surface">{progressPct}%</span>
                <span className="text-xs text-on-surface-variant">completo</span>
              </div>
            </div>
            <div className="flex gap-8 text-center">
              <div>
                <DataDisplay value={`${(goal.currentProgress / 1000).toFixed(1)}`} unit="km" size="sm" />
                <p className="text-xs text-on-surface-variant mt-1">Atual</p>
              </div>
              <div>
                <DataDisplay value={`${(goal.targetDistance / 1000).toFixed(0)}`} unit="km" size="sm" />
                <p className="text-xs text-on-surface-variant mt-1">Meta</p>
              </div>
            </div>
          </div>
        </PerformanceCard>

        <PerformanceCard label="Detalhes da Meta">
          <img src="/images/illustration-goal.svg" alt="Meta" className="h-20 w-auto mb-4 mx-auto" />
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-on-surface-variant">Disciplina</span>
              <span className="text-sm font-medium text-on-surface">{goal.discipline}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-on-surface-variant">Data alvo</span>
              <span className="text-sm font-medium text-on-surface">
                {new Date(goal.targetDate).toLocaleDateString("pt-BR")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-on-surface-variant">Início do ciclo</span>
              <span className="text-sm font-medium text-on-surface">
                {goal.startDate
                  ? new Date(goal.startDate).toLocaleDateString("pt-BR")
                  : "Imediato"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-on-surface-variant">Distância total</span>
              <span className="text-sm font-medium text-on-surface">{(goal.targetDistance / 1000).toFixed(0)}km</span>
            </div>
            {goal.targetTime && (
              <div className="flex justify-between">
                <span className="text-sm text-on-surface-variant">Tempo alvo</span>
                <span className="text-sm font-medium text-on-surface">
                  {formatRaceTime(goal.targetTime)}
                  {goal.targetDistance > 0
                    ? ` (${formatPace(goal.targetTime / (goal.targetDistance / 1000))}/km)`
                    : ""}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm text-on-surface-variant">Dias por semana</span>
              <span className="text-sm font-medium text-on-surface">{goal.daysPerWeek}x</span>
            </div>
            {goal.longRunDay && (
              <div className="flex justify-between">
                <span className="text-sm text-on-surface-variant">Dia do longão</span>
                <span className="text-sm font-medium text-on-surface">{goal.longRunDay}</span>
              </div>
            )}
          </div>
        </PerformanceCard>
      </div>

      <PerformanceCard label="Marcos" className="mt-6">
        <div className="space-y-4">
          {goal.milestones.map((m) => (
            <div key={m.id} className="flex items-center gap-3">
              {m.achieved ? (
                <CheckCircle2 className="text-primary shrink-0" size={20} />
              ) : (
                <Circle className="text-surface-container-highest shrink-0" size={20} />
              )}
              <div>
                <p className={cn("text-sm font-medium", m.achieved ? "text-on-surface" : "text-on-surface-variant")}>
                  {m.description}
                </p>
                <p className="text-xs text-on-surface-variant">{(m.target / 1000).toFixed(0)}km</p>
              </div>
            </div>
          ))}
        </div>
      </PerformanceCard>
    </div>
  );
}

export default function GoalPage() {
  const [goal, setGoal] = useState<Goal | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const fetchGoal = async () => {
    const goals = await getGoals();
    if (goals.length > 0) setGoal(goals[0]);
    else setGoal(null);
  };

  useEffect(() => {
    fetchGoal();
  }, []);

  const handleEdit = (g: Goal) => {
    setEditingGoal(g);
    setShowForm(true);
  };

  const handleDeleted = () => {
    setGoal(null);
    setEditingGoal(null);
    setShowForm(false);
  };

  if (showForm || !goal) {
    return (
      <div>
        <Header
          title={editingGoal ? "Editar Meta" : "Definir Meta"}
          subtitle={
            editingGoal
              ? "Atualize seu objetivo de corrida"
              : "Configure seu objetivo de corrida"
          }
        />
        <GoalForm
          goal={editingGoal ?? undefined}
          onComplete={async () => {
            await fetchGoal();
            setEditingGoal(null);
            setShowForm(false);
          }}
        />
      </div>
    );
  }

  return <GoalDisplay goal={goal} onEdit={() => handleEdit(goal)} onDeleted={handleDeleted} />;
}
