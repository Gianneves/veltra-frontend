"use client";

import { useEffect, useState } from "react";
import { CalendarDays, HeartPulse, ShieldCheck, UserRound } from "lucide-react";
import { Header } from "@/components/header";
import { PerformanceCard } from "@/components/ui/performance-card";
import { Button } from "@/components/ui/button";
import { HealthDisclaimer } from "@/components/ui/health-alerts";
import { useAuth } from "@/hooks/use-auth";
import { getHealthPolicy } from "@/lib/api/health";
import { getProfile, updateProfile } from "@/lib/api/users";
import type { HealthPolicy, UserProfile } from "@/lib/api/types";

export default function ProfilePage() {
  const { refreshUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [policy, setPolicy] = useState<HealthPolicy | null>(null);
  const [birthDate, setBirthDate] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      const [profileData, policyData] = await Promise.all([
        getProfile(),
        getHealthPolicy(),
      ]);
      if (!active) return;
      setProfile(profileData);
      setPolicy(policyData);
      setBirthDate(profileData?.birthDate ?? "");
      setConsent(profileData?.healthConsent ?? false);
      setLoading(false);
    }

    void load();

    return () => {
      active = false;
    };
  }, []);

  async function handleSave() {
    setSaving(true);
    setFeedback(null);

    const updated = await updateProfile({
      birthDate: birthDate || null,
      healthConsent: consent,
    });

    if (updated) {
      setProfile(updated);
      await refreshUser();
      setPolicy(await getHealthPolicy());
      setFeedback("Perfil atualizado com sucesso.");
    } else {
      setFeedback("Não foi possível salvar. Confira a data informada.");
    }

    setSaving(false);
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div>
      <Header
        title="Perfil"
        subtitle="Dados usados para personalizar seu plano e seus alertas de saúde"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PerformanceCard
          label="Dados do atleta"
          icon={<UserRound size={14} className="text-primary" />}
        >
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="birthDate"
                  className="mb-1.5 flex items-center gap-1.5 font-geist text-xs font-medium text-on-surface-variant"
                >
                  <CalendarDays size={13} />
                  Data de nascimento
                </label>
                <input
                  id="birthDate"
                  type="date"
                  max={today}
                  value={birthDate}
                  onChange={(event) => setBirthDate(event.target.value)}
                  className="w-full rounded-md border border-surface-container-highest bg-surface-container-lowest px-3 py-2.5 font-geist text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="mt-1.5 font-geist text-[11px] text-on-surface-variant">
                  Usamos a idade para limitar distâncias e volumes com segurança e
                  para personalizar alertas de saúde.
                </p>
              </div>

              <label className="flex items-start gap-2.5 rounded-lg border border-surface-container-highest bg-surface-container-low px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(event) => setConsent(event.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-[var(--color-primary)]"
                />
                <span className="font-geist text-[11px] leading-relaxed text-on-surface-variant">
                  Autorizo o uso dos meus dados para personalizar limites de treino
                  e alertas de saúde. Entendo que as orientações são educativas e
                  não substituem avaliação médica.
                </span>
              </label>

              <div className="flex flex-wrap items-center gap-3">
                <Button onClick={() => void handleSave()} loading={saving}>
                  <ShieldCheck size={16} />
                  Salvar perfil
                </Button>
                {feedback && (
                  <p className="font-geist text-xs text-on-surface-variant">
                    {feedback}
                  </p>
                )}
              </div>
            </div>
          )}
        </PerformanceCard>

        <PerformanceCard
          label="Faixa etária e recomendações"
          icon={<HeartPulse size={14} className="text-primary" />}
        >
          {policy?.age === null || policy?.age === undefined ? (
            <p className="font-geist text-sm text-on-surface-variant">
              Informe sua data de nascimento para ver as recomendações por idade e
              receber alertas personalizados.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-6">
                <div>
                  <p className="font-geist text-[11px] uppercase tracking-wide text-on-surface-variant">
                    Idade
                  </p>
                  <p className="font-sora text-2xl font-semibold text-on-surface">
                    {policy.age} anos
                  </p>
                </div>
                {policy.predictedMaxHeartRate && (
                  <div>
                    <p className="font-geist text-[11px] uppercase tracking-wide text-on-surface-variant">
                      FC máx prevista
                    </p>
                    <p className="font-sora text-2xl font-semibold text-on-surface">
                      {policy.predictedMaxHeartRate} bpm
                    </p>
                  </div>
                )}
              </div>

              {policy.planAdjustment && (
                <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
                  <p className="font-sora text-sm font-semibold text-amber-800">
                    Ajuste aplicado ao seu plano
                  </p>
                  <p className="mt-1 font-geist text-xs text-amber-800">
                    {policy.planAdjustment.reason}
                  </p>
                </div>
              )}

              <div className="overflow-hidden rounded-lg border border-surface-container-highest">
                <table className="w-full font-geist text-xs">
                  <thead className="bg-surface-container-low text-on-surface-variant">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Distância</th>
                      <th className="px-3 py-2 text-left font-medium">
                        Idade mínima
                      </th>
                      <th className="px-3 py-2 text-left font-medium">
                        Observação
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-high">
                    {policy.distanceRules.map((rule) => (
                      <tr key={rule.label}>
                        <td className="px-3 py-2 text-on-surface">
                          {rule.label}
                        </td>
                        <td className="px-3 py-2 text-on-surface">
                          {rule.minAge} anos
                        </td>
                        <td className="px-3 py-2 text-on-surface-variant">
                          {rule.clearanceBelowAge > rule.minAge
                            ? `liberação médica entre ${rule.minAge} e ${
                                rule.clearanceBelowAge - 1
                              } anos`
                            : "sem restrição adicional"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {policy.checkup && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
                  <p className="font-geist text-xs text-on-surface">
                    {policy.checkup.message}
                  </p>
                </div>
              )}
            </div>
          )}

          {policy?.disclaimer && (
            <HealthDisclaimer text={policy.disclaimer} className="mt-4" />
          )}
        </PerformanceCard>
      </div>
    </div>
  );
}
