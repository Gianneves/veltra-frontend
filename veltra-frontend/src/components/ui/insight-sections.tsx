import type { ActivityInsightContent } from "@/lib/api/types";

interface InsightSectionsProps {
  content: ActivityInsightContent;
}

export function InsightSections({ content }: InsightSectionsProps) {
  return (
    <div className="space-y-4">
      <p className="font-geist text-sm leading-relaxed text-on-surface">
        {content.summary}
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Desempenho
          </p>
          <p className="mt-1 font-geist text-sm leading-relaxed text-on-surface-variant">
            {content.performance}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Tipo de treino
          </p>
          <p className="mt-1 font-geist text-sm leading-relaxed text-on-surface-variant">
            {content.workoutType}
          </p>
        </div>
      </div>

      {content.plan && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Plano de treino
          </p>
          <p className="mt-1 font-geist text-sm leading-relaxed text-on-surface-variant">
            {content.plan}
          </p>
        </div>
      )}

      {content.tips.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Dicas para melhorar
          </p>
          <ul className="mt-2 space-y-1.5">
            {content.tips.map((tip, index) => (
              <li
                key={index}
                className="flex gap-2 font-geist text-sm leading-relaxed text-on-surface-variant"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
