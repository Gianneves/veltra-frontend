export function formatPace(secondsPerKm: number): string {
  if (!secondsPerKm || !Number.isFinite(secondsPerKm) || secondsPerKm <= 0) {
    return "-";
  }
  const total = Math.round(secondsPerKm);
  const min = Math.floor(total / 60);
  const sec = total % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export function formatPaceFromMps(mps: number): string {
  if (!mps || !Number.isFinite(mps) || mps <= 0) return "-";
  return formatPace(1000 / mps);
}

export function formatTime(seconds: number): string {
  if (!seconds) return "0min";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h${m}min` : `${m}min`;
}

export function formatElevation(meters: number): string {
  if (!meters || !Number.isFinite(meters) || meters <= 0) return "0";
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 0,
  }).format(meters);
}

export function formatDuration(seconds: number): string {
  if (!seconds) return "0s";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}h${m}min${s}s`;
}

export function formatActivityDate(value: string): string {
  if (!value) return "-";
  const formatted = new Date(value).toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function formatActivityDateTime(value: string): string {
  if (!value) return "-";
  const date = new Date(value);
  const day = date.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
  const time = date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const formatted = `${day} · ${time}`;
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function formatLongDate(value: string): string {
  if (!value) return "-";
  return new Date(value).toLocaleString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatMonthLabel(value: string): string {
  if (!value) return "-";
  const formatted = new Date(value).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}
