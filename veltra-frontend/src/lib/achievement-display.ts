import type {
  AchievementCategory,
  AchievementProgress,
} from "./api/types";
import { formatNumber, formatRaceTime } from "./format";

export const achievementCategoryLabels: Record<AchievementCategory, string> = {
  milestone: "Marcos",
  distance: "Distância",
  consistency: "Consistência",
  speed: "Velocidade",
};

export const achievementCategories = Object.keys(
  achievementCategoryLabels,
) as AchievementCategory[];

export const badgeMap: Record<string, string> = {
  footprints: "/images/badge-first-step.svg",
  trophy: "/images/badge-century.svg",
  medal: "/images/badge-marathoner.svg",
  flame: "/images/badge-consistent.svg",
  zap: "/images/badge-sprinter.svg",
};

const NAMED_DISTANCES: Record<number, string> = {
  21.0975: "Meia maratona",
  42.195: "Maratona",
};

export function formatDistanceLabel(distanceKm: number): string {
  return NAMED_DISTANCES[distanceKm] ?? `${distanceKm} km`;
}

export function formatProgressText(progress: AchievementProgress): string {
  switch (progress.unit) {
    case "runs":
      return `${progress.current} de ${progress.target} corrida`;
    case "weeks":
      return `${progress.current} de ${progress.target} semanas`;
    case "seconds":
      return `Melhor 5 km: ${formatRaceTime(progress.current)} · meta ${formatRaceTime(progress.target)}`;
    case "km":
      return `${formatNumber(progress.current, 1)} de ${formatNumber(progress.target, 1)} km`;
  }
}

export function progressSegments(
  progress: AchievementProgress,
  count = 10,
): { label: string; filled: boolean }[] {
  let ratio = 0;

  if (progress.current > 0 && progress.target > 0) {
    ratio = progress.higherIsBetter
      ? progress.current / progress.target
      : progress.target / progress.current;
  }

  const filled = Math.round(Math.min(1, Math.max(0, ratio)) * count);

  return Array.from({ length: count }, (_, index) => ({
    label: `${index + 1}/${count}`,
    filled: index < filled,
  }));
}
