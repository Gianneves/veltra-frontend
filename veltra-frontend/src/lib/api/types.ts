export interface User {
  id: string;
  name: string;
  avatarUrl?: string | null;
  stravaId: number;
  birthDate?: string | null;
}

export interface UserProfile {
  id: string;
  name: string;
  avatarUrl?: string | null;
  stravaId: number;
  birthDate: string | null;
  healthConsent: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type HealthAlertSeverity = "info" | "attention" | "medical";

export interface HealthAlert {
  key: string;
  severity: HealthAlertSeverity;
  title: string;
  message: string;
  recommendation: string;
  activityId?: string;
  evidence?: Record<string, number | string>;
}

export interface HealthOverview {
  age: number | null;
  birthDate: string | null;
  predictedMaxHeartRate: number | null;
  alerts: HealthAlert[];
  disclaimer: string;
}

export interface DistanceAgeRule {
  label: string;
  minKm: number;
  maxKm: number | null;
  minAge: number;
  clearanceBelowAge: number;
}

export interface AgePlanAdjustment {
  age: number;
  maxLongRunKm?: number;
  maxWeeklyKm?: number;
  maxQualitySessions?: number;
  volumeFactor?: number;
  reason: string;
}

export interface AgeDistanceAssessment {
  age?: number;
  distanceKm: number;
  allowed: boolean;
  requiresMedicalClearance: boolean;
  recommendedMinAge: number;
  message?: string;
}

export interface HealthPolicy {
  age: number | null;
  birthDate: string | null;
  predictedMaxHeartRate: number | null;
  planAdjustment: AgePlanAdjustment | null;
  distanceRules: DistanceAgeRule[];
  assessment: AgeDistanceAssessment | null;
  checkup: { severity: "info" | "medical"; message: string } | null;
  disclaimer: string;
}

export interface ActivityLap {
  id?: number;
  name?: string;
  distance: number;
  movingTime: number;
  elapsedTime?: number;
  averageSpeed?: number;
  maxSpeed?: number;
  averageCadence?: number;
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
  sportType?: string;
  startDateLocal?: string | null;
  averageCadence?: number | null;
  maxWatts?: number | null;
  laps?: ActivityLap[] | null;
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
  dayOrder?: number;
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

export interface TypicalQuality {
  count: number;
  km: number;
  pace: number;
  repPace?: number;
  reps: string[];
}

export interface TrainingPattern {
  hasData: boolean;
  confidence: "low" | "medium" | "high";
  sampleSize: number;
  weeksAnalyzed: number;
  runsPerWeek: number;
  qualityPerWeek: number;
  weekdayRate: Record<string, number>;
  preferredRunDays: string[];
  preferredLongRunDay?: string | null;
  qualityDayRate: Record<string, number>;
  preferredQualityDays: string[];
  typeMix: Record<string, number>;
  typicalQuality: Partial<Record<"interval" | "tempo" | "fartlek", TypicalQuality>>;
  easyPace?: number | null;
  longRun?: { km: number; pace: number } | null;
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

export type AchievementCategory =
  | "milestone"
  | "distance"
  | "consistency"
  | "speed";

export type AchievementProgressUnit = "km" | "weeks" | "seconds" | "runs";

export interface AchievementProgress {
  current: number;
  target: number;
  unit: AchievementProgressUnit;
  higherIsBetter: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  earned: boolean;
  earnedDate?: string | null;
  progress?: AchievementProgress | null;
}

export interface BestEffort {
  distanceKm: number;
  timeSeconds: number;
  paceSecondsPerKm: number;
  activityId: string;
  activityName: string;
  achievedAt?: string | null;
}

export interface TimePrediction {
  distanceKm: number;
  timeSeconds: number;
  paceSecondsPerKm: number;
  basedOnDistanceKm: number;
  basedOnTimeSeconds: number;
}

export interface AchievementsResponse {
  trophies: Achievement[];
  bestEfforts: BestEffort[];
  predictions: TimePrediction[];
}

export type AdherenceVerdict = "no_plano" | "proximo" | "diferente";

export interface ActivityInsightContent {
  summary: string;
  performance: string;
  workoutType: string;
  plan: string | null;
  tips: string[];
}

export interface ActivityInsight {
  id: string;
  activityId: string;
  status: "pending" | "completed" | "failed";
  content: ActivityInsightContent | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface InsightFeedItem extends ActivityInsight {
  activityName: string;
  activityDate: string | null;
  activityType: string | null;
  distanceKm: number;
  paceSecondsPerKm: number;
  verdict: AdherenceVerdict | null;
}

export interface ChatMessage {
  id: string;
  role: "user" | "coach";
  content: string;
  timestamp: string;
}

export interface CoachConversation {
  id: string;
  title: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CoachProposal {
  session: number;
  sessionId: string;
  planId: string;
  before: {
    day: string;
    type: string;
    plannedDistance: number;
    plannedPace: number;
  };
  changes: {
    type?: TrainingSessionType;
    plannedDistance?: number;
    plannedPace?: number;
    day?: string;
    notes?: string;
  };
  reason: string;
}

export interface StreakData {
  currentStreak: number;
  bestStreak: number;
}
