"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { PerformanceCard } from "@/components/ui/performance-card";
import { DataDisplay } from "@/components/ui/data-display";
import { Button } from "@/components/ui/button";
import { getGoals, createGoal } from "@/lib/api/goals";
import { CheckCircle2, Circle, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Goal } from "@/lib/api/types";

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

function GoalForm({ onComplete }: { onComplete: () => void }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [distanceOption, setDistanceOption] = useState<number | null>(null);
  const [customDistance, setCustomDistance] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [discipline, setDiscipline] = useState("");

  const [runDays, setRunDays] = useState<string[]>(DEFAULT_RUN_DAYS);
  const [longRunDay, setLongRunDay] = useState("Sáb");

  const [threeKmMin, setThreeKmMin] = useState("");
  const [threeKmSeg, setThreeKmSeg] = useState("");
  const [longestKm, setLongestKm] = useState("");
  const [longestMin, setLongestMin] = useState("");

  const targetDistance = distanceOption === 0 ? Number(customDistance) * 1000 : (distanceOption || 0);
  const threeKmTime = Number(threeKmMin) * 60 + Number(threeKmSeg);
  const longestRunDistance = longestKm ? Number(longestKm) * 1000 : undefined;
  const longestRunTime = longestMin ? Number(longestMin) * 60 : undefined;

  const toggleDay = (short: string) => {
    setRunDays((prev) =>
      prev.includes(short) ? prev.filter((d) => d !== short) : [...prev, short]
    );
  };

  const handleSubmit = async () => {
    if (!title || !targetDistance || !targetDate || !threeKmMin || !threeKmSeg) return;
    setLoading(true);

    try {
      const result = await createGoal({
        title,
        targetDistance,
        targetDate: new Date(targetDate).toISOString(),
        discipline: discipline || title,
        threeKmTime,
        longestRunDistance,
        longestRunTime,
        runDays,
        longRunDay,
        daysPerWeek: runDays.length,
      });
      if (!result) {
        alert("Erro ao criar meta no servidor. Verifique se o backend está rodando.");
        return;
      }
      onComplete();
      router.push("/training-plan");
    } catch (err: unknown) {
      console.error("Erro ao criar meta:", err);
      alert("Erro ao criar meta. Verifique se o servidor está rodando.");
    } finally {
      setLoading(false);
    }
  };

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 14);
  const minDateStr = minDate.toISOString().split("T")[0];

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
                <label className="block text-xs text-on-surface-variant mb-1">Tempo (minutos)</label>
                <input
                  type="number"
                  min="5"
                  placeholder="Ex: 90"
                  value={longestMin}
                  onChange={(e) => setLongestMin(e.target.value)}
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
              <li>Data: {targetDate ? new Date(targetDate).toLocaleDateString("pt-BR") : "-"}</li>
              <li>Dias de treino: {runDays.length}x por semana</li>
              <li>Longão: {ALL_DAYS.find((d) => d.short === longRunDay)?.full}</li>
              <li>Teste 3km: {threeKmMin || "?"}min {threeKmSeg || "00"}seg</li>
              {longestKm && <li>Maior distância: {longestKm}km{longestMin ? ` em ${longestMin}min` : ""}</li>}
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
              disabled={!threeKmMin || !threeKmSeg}
            >
              {loading ? "Criando..." : "Salvar Meta e Gerar Plano"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function GoalDisplay({ goal }: { goal: Goal }) {
  const router = useRouter();

  const progressPct = Math.min(
    100,
    Math.round((goal.currentProgress / goal.targetDistance) * 100)
  );

  const circumference = 2 * Math.PI * 80;
  const offset = circumference - (progressPct / 100) * circumference;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Header title="Minha Meta" subtitle={goal.title} />
        <Button variant="primary" onClick={() => router.push("/training-plan")}>
          Ver Plano de Treino <ChevronRight size={18} />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceCard label="Progresso">
          <div className="flex flex-col items-center py-6">
            <div className="relative flex items-center justify-center mb-4">
              <svg width="200" height="200" className="-rotate-90">
                <circle cx="100" cy="100" r="80" fill="none" stroke="#e0e3e5" strokeWidth="12" />
                <circle
                  cx="100" cy="100" r="80"
                  fill="none" stroke="#aa3000" strokeWidth="12"
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
              <span className="text-sm text-on-surface-variant">Distância total</span>
              <span className="text-sm font-medium text-on-surface">{(goal.targetDistance / 1000).toFixed(0)}km</span>
            </div>
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

  const fetchGoal = async () => {
    const goals = await getGoals();
    if (goals.length > 0) setGoal(goals[0]);
  };

  useEffect(() => {
    fetchGoal();
  }, []);

  if (!goal || showForm) {
    return (
      <div>
        <Header title="Definir Meta" subtitle="Configure seu objetivo de corrida" />
        <GoalForm onComplete={fetchGoal} />
      </div>
    );
  }

  return <GoalDisplay goal={goal} />;
}
