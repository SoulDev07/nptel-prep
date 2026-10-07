import NumberFlow from "@number-flow/react";
import { CheckCircle2, ListTodo, RotateCcw, Sparkles, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function StatsCard({ stats, onRestart, onReview, onRetryMissed }) {
  const isHighAccuracy = stats.accuracyPct >= 75;

  return (
    <section aria-labelledby="stats-heading" className="flex flex-col gap-5 py-2">
      <div className="text-center space-y-1.5">
        <div className="mx-auto size-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2" aria-hidden="true">
          {isHighAccuracy ? <Trophy className="size-6" /> : <Sparkles className="size-6" />}
        </div>
        <h2 id="stats-heading" className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Session complete!</h2>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed text-pretty">
          {isHighAccuracy
            ? "Outstanding performance! Review your responses or restart for more practice."
            : "Good effort! Take some time to review the missed questions to reinforce concepts."}
        </p>
      </div>

      <div className="space-y-4 pt-1">
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl border bg-surface text-center">
            <dd className="text-2xl sm:text-3xl font-bold tabular-nums tracking-tight text-foreground">
              <NumberFlow value={stats.attempted} />
            </dd>
            <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-1">
              Attempted
            </dt>
          </div>

          <div className="p-3.5 rounded-xl border bg-emerald-500/10 border-emerald-500/20 text-center">
            <dd className="text-2xl sm:text-3xl font-bold tabular-nums tracking-tight text-emerald-700 dark:text-emerald-300">
              <NumberFlow value={stats.correct} />
            </dd>
            <dt className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mt-1">
              Correct
            </dt>
          </div>

          <div className="p-3.5 rounded-xl border bg-amber-500/10 border-amber-500/20 text-center">
            <dd className="text-2xl sm:text-3xl font-bold tabular-nums tracking-tight text-amber-700 dark:text-amber-300">
              <NumberFlow value={stats.skipped} />
            </dd>
            <dt className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider mt-1">
              Skipped
            </dt>
          </div>

          <div className="p-3.5 rounded-xl border bg-teal-500/10 border-teal-500/20 text-center">
            <dd className="text-2xl sm:text-3xl font-bold tabular-nums tracking-tight text-teal-700 dark:text-teal-300">
              <NumberFlow value={stats.accuracyPct} suffix="%" />
            </dd>
            <dt className="text-xs font-semibold text-teal-700 dark:text-teal-400 uppercase tracking-wider mt-1">
              Accuracy
            </dt>
          </div>
        </dl>

        <div className="space-y-2 p-3.5 rounded-xl bg-muted/40 border">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-muted-foreground">Completion progress</span>
            <span className="tabular-nums font-bold text-foreground" aria-hidden="true">
              <NumberFlow value={stats.progressPct} suffix="%" /> ({stats.attempted}/{stats.total})
            </span>
          </div>
          <Progress
            value={stats.progressPct}
            className="w-full h-2.5 bg-surface-strong border border-border rounded-full"
            aria-label="Completion progress"
            aria-valuetext={`${stats.progressPct}% completed, ${stats.attempted} of ${stats.total} questions attempted`}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-2.5 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onReview}
            aria-label="Review all questions"
            className="w-full sm:w-auto gap-1.5"
          >
            <ListTodo className="size-4" aria-hidden="true" />
            Review all
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onRetryMissed}
            disabled={stats.incorrect + stats.skipped === 0}
            aria-label={`Retry ${stats.incorrect + stats.skipped} missed questions`}
            className="w-full sm:w-auto gap-1.5"
          >
            <CheckCircle2 className="size-4" aria-hidden="true" />
            Retry missed ({stats.incorrect + stats.skipped})
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={onRestart}
            aria-label="Restart session and reshuffle questions"
            className="w-full sm:w-auto gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-600 dark:text-slate-950 font-semibold"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Restart session
          </Button>
        </div>
      </div>
    </section>
  );
}
