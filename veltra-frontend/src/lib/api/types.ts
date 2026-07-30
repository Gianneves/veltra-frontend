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

export interface TrainingSession {
  id: string;
  day: string;
  type: "easy" | "interval" | "long_run" | "rest" | "recovery";
  plannedDistance: number;
  plannedPace: number;
  notes: string;
  completed: boolean;
}

export interface TrainingPlan {
  id: string;
  weekStart: string;
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
  discipline: string;
  currentProgress: number;
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
