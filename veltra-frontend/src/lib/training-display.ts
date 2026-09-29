export const typeColors: Record<string, string> = {
  easy: "bg-emerald-100 text-emerald-700 border-emerald-200",
  interval: "bg-orange-100 text-orange-700 border-orange-200",
  tempo: "bg-amber-100 text-amber-700 border-amber-200",
  fartlek: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200",
  long_run: "bg-blue-100 text-blue-700 border-blue-200",
  rest: "bg-surface-container-highest text-on-surface-variant border-surface-container-highest",
  recovery: "bg-purple-100 text-purple-700 border-purple-200",
  race: "bg-red-100 text-red-700 border-red-200",
};

export const typeLabels: Record<string, string> = {
  easy: "Leve",
  interval: "Intervalado",
  tempo: "Tempo",
  fartlek: "Fartlek",
  long_run: "Longão",
  rest: "Descanso",
  recovery: "Recuperação",
  race: "Prova",
};

export const typeIcons: Record<string, string> = {
  easy: "/images/icon-training-easy.svg",
  interval: "/images/icon-training-interval.svg",
  tempo: "/images/icon-training-interval.svg",
  fartlek: "/images/icon-training-interval.svg",
  long_run: "/images/icon-training-long.svg",
  rest: "/images/icon-training-rest.svg",
  recovery: "/images/icon-training-recovery.svg",
  race: "/images/icon-training-long.svg",
};

export const DAY_ORDER: Record<string, number> = {
  Seg: 0,
  Ter: 1,
  Qua: 2,
  Qui: 3,
  Sex: 4,
  Sáb: 5,
  Dom: 6,
};
