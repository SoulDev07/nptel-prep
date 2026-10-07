import { ChevronLeft, ChevronRight, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function QuizControls({
  currentIndex,
  total,
  answered,
  stats,
  onPrev,
  onSkipAndNext,
  onNext,
}) {
  const isLast = currentIndex >= total - 1;

  return (
    <div className="flex flex-col gap-3 pt-1">
      <div className="flex items-center justify-between gap-2.5 sm:gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrev}
          disabled={currentIndex === 0}
          aria-label="Previous question"
          className="gap-1.5 h-9 px-3 text-xs sm:text-sm font-medium"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          <span>Prev</span>
          <kbd className="keyboard-only hidden sm:inline-flex opacity-50 ml-0.5 font-mono text-xs" aria-hidden="true">A</kbd>
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onSkipAndNext}
            disabled={Boolean(answered)}
            aria-label="Skip question and advance"
            className="gap-1.5 h-9 px-3 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <SkipForward className="size-4" aria-hidden="true" />
            <span>Skip</span>
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={onNext}
            aria-label={isLast ? "Finish session and view results" : "Next question"}
            className="bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-600 dark:text-slate-950 font-semibold gap-1.5 h-9 px-3.5 sm:px-4 shadow-xs text-xs sm:text-sm"
          >
            <span>{isLast ? "Finish" : "Next"}</span>
            <ChevronRight className="size-4" aria-hidden="true" />
            <kbd className="keyboard-only hidden sm:inline-flex opacity-75 ml-0.5 bg-white/20 border-white/30 text-white dark:text-slate-950 font-mono text-xs" aria-hidden="true">
              D
            </kbd>
          </Button>
        </div>
      </div>

      <div
        role="status"
        aria-label={`Attempted: ${stats.attempted}, Correct: ${stats.correct}, Skipped: ${stats.skipped}. Question ${currentIndex + 1} of ${total}`}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm text-muted-foreground pt-3 border-t border-border/60"
      >
        <div className="flex items-center flex-wrap gap-1.5 sm:gap-2.5" aria-hidden="true">
          <span>Attempted: <strong className="text-foreground tabular-nums font-semibold">{stats.attempted}</strong></span>
          <span className="opacity-40">·</span>
          <span>Correct: <strong className="text-emerald-600 dark:text-emerald-400 tabular-nums font-semibold">{stats.correct}</strong></span>
          <span className="opacity-40">·</span>
          <span>Skipped: <strong className="text-amber-600 dark:text-amber-400 tabular-nums font-semibold">{stats.skipped}</strong></span>
        </div>
        <div className="font-medium text-foreground text-xs sm:text-sm shrink-0 whitespace-nowrap self-end sm:self-auto" aria-hidden="true">
          Question <span className="tabular-nums font-semibold">{currentIndex + 1}</span> of <span className="tabular-nums font-semibold">{total}</span>
        </div>
      </div>
    </div>
  );
}
