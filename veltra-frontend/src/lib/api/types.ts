export interface User {
  id: string;
  name: string;
  stravaId: number;
}

export interface Activity {
  id: string;
  name: string;
  distance: number;
  movingTime: number;
  elapsedTime: number;
  averageSpeed: number;
  maxSpeed: number;
  averageHeartrate: number;
  maxHeartrate: number;
  totalElevationGain: number;
  startDate: string;
  type: string;
}

export type TrainingSessionType =
  | "easy"
  | "interval"
  | "tempo"
  | "fartlek"
  | "long_run"
  | "rest"
  | "recovery"
  | "race";

export interface TrainingSession {
  id: string;
  day: string;
  type: TrainingSessionType;
  plannedDistance: number;
  plannedPace: number;
  notes: string;
  completed: boolean;
  activityId?: string | null;
  actualDistance?: number | null;
  actualPace?: number | null;
  actualMovingTime?: number | null;
  matchScore?: number | null;
  matchMethod?: string | null;
  matchedAt?: string | null;
}

export interface TrainingPlan {
  id: string;
  weekStart: string;
  goalId?: string;
  focus?: string;
  coachNotes?: string;
  sessions: TrainingSession[];
}

export interface WeeklyStats {
  totalDistance: number;
  totalTime: number;
  runCount: number;
  weekStart: string;
}

export interface Goal {
  id: string;
  title: string;
  targetDistance: number;
  targetDate: string;
  startDate?: string | null;
  discipline: string;
  currentProgress: number;
  daysPerWeek: number;
  runDays?: string[];
  longRunDay?: string;
  threeKmTime: number;
  targetTime?: number | null;
  longestRunDistance?: number;
  longestRunTime?: number;
  milestones: Milestone[];
}

export interface Milestone {
  id: string;
  description: string;
  target: number;
  achieved: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  earned: boolean;
  earnedDate?: string;
}

export interface CoachInsight {
  id: string;
  title: string;
  content: string;
  topic: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "coach";
  content: string;
  timestamp: string;
}

export interface StreakData {
  currentStreak: number;
  bestStreak: number;
}
