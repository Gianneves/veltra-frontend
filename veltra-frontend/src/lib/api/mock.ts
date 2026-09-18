import type {
  User,
  Activity,
  TrainingPlan,
  Goal,
  ChatMessage,
  StreakData,
} from "./types";

export const mockUser: User = {
  id: "user-001",
  name: "Rafael Silva",
  stravaId: 12345678,
};

export const mockStreak: StreakData = {
  currentStreak: 12,
  bestStreak: 24,
};

export const mockActivities: Activity[] = [
  {
    id: "act-001",
    name: "Corrida Matinal",
    distance: 10_500,
    movingTime: 3150,
    elapsedTime: 3420,
    averageSpeed: 3.33,
    maxSpeed: 4.2,
    averageHeartrate: 152,
    maxHeartrate: 172,
    totalElevationGain: 85,
    startDate: "2026-06-29T06:30:00Z",
    type: "Run",
  },
  {
    id: "act-002",
    name: "Intervalado 5x1km",
    distance: 8_000,
    movingTime: 2400,
    elapsedTime: 2700,
    averageSpeed: 3.33,
    maxSpeed: 4.8,
    averageHeartrate: 165,
    maxHeartrate: 185,
    totalElevationGain: 45,
    startDate: "2026-06-27T07:00:00Z",
    type: "Run",
  },
  {
    id: "act-003",
    name: "Longão de Domingo",
    distance: 21_100,
    movingTime: 6300,
    elapsedTime: 6600,
    averageSpeed: 3.35,
    maxSpeed: 4.0,
    averageHeartrate: 148,
    maxHeartrate: 168,
    totalElevationGain: 210,
    startDate: "2026-06-25T06:00:00Z",
    type: "Run",
  },
  {
    id: "act-004",
    name: "Recuperação",
    distance: 5_000,
    movingTime: 1800,
    elapsedTime: 1950,
    averageSpeed: 2.78,
    maxSpeed: 3.3,
    averageHeartrate: 135,
    maxHeartrate: 148,
    totalElevationGain: 20,
    startDate: "2026-06-24T18:00:00Z",
    type: "Run",
  },
];

export const mockTrainingPlan: TrainingPlan = {
  id: "plan-001",
  weekStart: "2026-06-29",
  sessions: [
    { id: "s-001", day: "Seg", type: "easy", plannedDistance: 8000, plannedPace: 330, notes: "Trote leve", completed: true },
    { id: "s-002", day: "Ter", type: "interval", plannedDistance: 10000, plannedPace: 300, notes: "5x1km com 2min de descanso", completed: false },
    { id: "s-003", day: "Qua", type: "recovery", plannedDistance: 5000, plannedPace: 345, notes: "Recuperação ativa", completed: false },
    { id: "s-004", day: "Qui", type: "easy", plannedDistance: 8000, plannedPace: 330, notes: "Ritmo confortável", completed: false },
    { id: "s-005", day: "Sex", type: "rest", plannedDistance: 0, plannedPace: 0, notes: "Descanso total", completed: false },
    { id: "s-006", day: "Sáb", type: "easy", plannedDistance: 6000, plannedPace: 335, notes: "Pré-prova leve", completed: false },
    { id: "s-007", day: "Dom", type: "long_run", plannedDistance: 25000, plannedPace: 320, notes: "Longão de resistência", completed: false },
  ],
};

export const mockGoals: Goal[] = [
  {
    id: "goal-001",
    title: "Maratona de São Paulo",
    targetDistance: 42_195,
    targetDate: "2026-09-15",
    discipline: "Maratona",
    currentProgress: 25000,
    daysPerWeek: 5,
    runDays: ["Seg", "Ter", "Qui", "Sex", "Sáb"],
    longRunDay: "Sáb",
    threeKmTime: 1080,
    longestRunDistance: 25000,
    longestRunTime: 7500,
    milestones: [
      { id: "m-001", description: "Base de 30km/semana", target: 30_000, achieved: true },
      { id: "m-002", description: "Longão de 21km", target: 21_000, achieved: true },
      { id: "m-003", description: "Longão de 32km", target: 32_000, achieved: false },
    ],
  },
];


