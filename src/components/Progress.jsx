import NumberFlow from "@number-flow/react";
import { Progress as ShadcnProgress } from "@/components/ui/progress";

export default function Progress({ total, answers = {} }) {
  const done = Object.keys(answers).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <div className="flex items-center gap-2 sm:gap-3 w-full">
      <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground shrink-0 font-medium" aria-hidden="true">
        <span>Progress</span>
        <span className="tabular-nums font-semibold text-foreground">
          <NumberFlow value={done} />/{total}
        </span>
      </div>

      <div className="flex-1 flex items-center">
        <ShadcnProgress
          value={pct}
          className="w-full h-2 sm:h-2.5 bg-surface-strong border border-border/80 rounded-full"
          aria-label={`Quiz progress: ${done} of ${total} questions attempted`}
          aria-valuetext={`${done} of ${total} questions completed, ${pct}%`}
        />
      </div>

      <div className="tabular-nums font-bold text-xs text-muted-foreground shrink-0 min-w-9 text-right" aria-hidden="true">
        <NumberFlow value={pct} suffix="%" />
      </div>
    </div>
  );
}
