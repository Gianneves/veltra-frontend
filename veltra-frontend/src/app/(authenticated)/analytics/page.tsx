"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { PerformanceCard } from "@/components/ui/performance-card";
import { DataDisplay } from "@/components/ui/data-display";
import { getAllActivities } from "@/lib/api/analytics";
import type { Activity } from "@/lib/api/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const weeklyData = [
  { week: "Sem 1", km: 45 },
  { week: "Sem 2", km: 48 },
  { week: "Sem 3", km: 52 },
  { week: "Sem 4", km: 55 },
];

const paceData = [
  { date: "24/06", pace: 5.32 },
  { date: "25/06", pace: 5.35 },
  { date: "27/06", pace: 5.0 },
  { date: "29/06", pace: 5.15 },
];

const hrZones = [
  { name: "Z1 (Leve)", value: 25, color: "#22c55e" },
  { name: "Z2 (Resistência)", value: 35, color: "#3b82f6" },
  { name: "Z3 (Moderado)", value: 22, color: "#eab308" },
  { name: "Z4 (Intenso)", value: 13, color: "#f97316" },
  { name: "Z5 (Máximo)", value: 5, color: "#ef4444" },
];

export default function AnalyticsPage() {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    getAllActivities().then(setActivities);
  }, []);

  const totalElevation = activities.reduce((s, a) => s + a.totalElevationGain, 0);

  return (
    <div>
      <Header title="Análises" subtitle="Métricas e evolução dos seus treinos" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceCard label="Distância Semanal">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyData}>
              <XAxis dataKey="week" tick={{ fontSize: 12, fill: "#5c4037" }} />
              <YAxis unit=" km" tick={{ fontSize: 12, fill: "#5c4037" }} />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #e0e3e5",
                  borderRadius: 8,
                  fontSize: 14,
                }}
              />
              <Bar dataKey="km" fill="#aa3000" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </PerformanceCard>

        <PerformanceCard label="Evolução do Ritmo">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={paceData}>
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#5c4037" }} />
              <YAxis unit="/km" tick={{ fontSize: 12, fill: "#5c4037" }} domain={["auto", "auto"]} />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #e0e3e5",
                  borderRadius: 8,
                  fontSize: 14,
                }}
              />
              <Line
                type="monotone"
                dataKey="pace"
                stroke="#aa3000"
                strokeWidth={2}
                dot={{ fill: "#aa3000", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </PerformanceCard>

        <PerformanceCard label="Distribuição de FC por Zona">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={hrZones}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
              >
                {hrZones.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #e0e3e5",
                  borderRadius: 8,
                  fontSize: 14,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </PerformanceCard>

        <PerformanceCard label="Elevação Total">
          <div className="flex flex-col items-center justify-center py-8">
            <img src="/images/illustration-analytics.svg" alt="Analytics" className="h-24 w-auto mb-4" />
            <DataDisplay value={`${totalElevation}`} unit="m" size="lg" />
            <p className="text-sm text-on-surface-variant mt-2">Acumulado em todas as corridas</p>
          </div>
        </PerformanceCard>
      </div>
    </div>
  );
}
