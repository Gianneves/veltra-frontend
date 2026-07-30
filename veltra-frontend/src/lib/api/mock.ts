import type {
  User,
  Activity,
  TrainingPlan,
  Goal,
  Achievement,
  CoachInsight,
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
    milestones: [
      { id: "m-001", description: "Base de 30km/semana", target: 30_000, achieved: true },
      { id: "m-002", description: "Longão de 21km", target: 21_000, achieved: true },
      { id: "m-003", description: "Longão de 32km", target: 32_000, achieved: false },
    ],
  },
];

export const mockAchievements: Achievement[] = [
  { id: "ach-001", name: "Primeiro Passo", description: "Completou seu primeiro treino", icon: "footprints", category: "Milestone", earned: true, earnedDate: "2026-01-15" },
  { id: "ach-002", name: "Centenário", description: "Acumulou 100km de corrida", icon: "trophy", category: "Distance", earned: true, earnedDate: "2026-03-20" },
  { id: "ach-003", name: "Maratonista", description: "Completou uma maratona", icon: "medal", category: "Distance", earned: false },
  { id: "ach-004", name: "Consistente", description: "Manteve streak de 30 dias", icon: "flame", category: "Consistency", earned: true, earnedDate: "2026-05-01" },
  { id: "ach-005", name: "Velocista", description: "Correu 5km abaixo de 20min", icon: "zap", category: "Speed", earned: false },
];

export const mockInsights: CoachInsight[] = [
  {
    id: "ins-001",
    title: "Evolução no ritmo",
    content: "Seu ritmo médio melhorou 8% nas últimas 4 semanas. Continue com os treinos intervalados que você tem se destacado.",
    topic: "performance",
    createdAt: "2026-06-29T08:00:00Z",
  },
  {
    id: "ins-002",
    title: "Sinais de fadiga",
    content: "Sua variabilidade de frequência cardíaca (HRV) está 12% abaixo da sua média. Considere um dia extra de descanso esta semana.",
    topic: "recovery",
    createdAt: "2026-06-28T08:00:00Z",
  },
  {
    id: "ins-003",
    title: "Impacto do treino de força",
    content: "Corredores que incorporam 2 sessões de força por semana têm 30% menos lesões. Que tal adicionar um treino de core amanhã?",
    topic: "form",
    createdAt: "2026-06-27T08:00:00Z",
  },
];

export const mockChatMessages: ChatMessage[] = [
  {
    id: "msg-001",
    role: "coach",
    content: "Olá, Rafael! Como foi seu treino de hoje? Estou aqui para ajudar com qualquer dúvida.",
    timestamp: "2026-06-29T10:00:00Z",
  },
  {
    id: "msg-002",
    role: "user",
    content: "Foi bom! Completei 10km, mas senti cansaço no último km. Devo aumentar a quilometragem ou focar em ritmo?",
    timestamp: "2026-06-29T10:01:00Z",
  },
  {
    id: "msg-003",
    role: "coach",
    content: "Ótimo trabalho! Pelo que você descreve, seu corpo está se adaptando bem. Sugiro manter a quilometragem por mais uma semana e focar em consistência de ritmo. Na próxima semana a gente incrementa.",
    timestamp: "2026-06-29T10:02:00Z",
  },
];
