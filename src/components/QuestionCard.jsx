import { Bookmark, Check, HelpCircle, Info, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ANSWER_STATUS } from "../utils";

export default function QuestionCard({
  question,
  answered,
  isBookmarked,
  onAnswer,
  onToggleBookmark,
}) {
  if (!question) return null;

  const isAnswered = Boolean(answered);
  const hasSelection = answered?.chosen != null;

  return (
    <article
      aria-labelledby="question-title"
      className="flex flex-col rounded-2xl border border-border/80 bg-card p-3.5 sm:p-5 shadow-xs"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex flex-col gap-1.5 min-w-0 flex-1">
          {question.topic && (
            <Badge
              variant="secondary"
              className="w-fit font-semibold text-xs px-2.5 py-0.5 bg-surface-strong text-muted-foreground border border-border/60"
            >
              {question.topic}
            </Badge>
          )}
          <h2
            id="question-title"
            className="text-foreground text-base sm:text-lg font-semibold leading-relaxed tracking-tight text-pretty"
          >
            {question.question}
          </h2>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isBookmarked ? "secondary" : "ghost"}
              size="icon-xs"
              className={cn(
                "shrink-0 transition-colors mt-0.5",
                isBookmarked
                  ? "text-amber-600 dark:text-amber-400 bg-amber-500/15 border border-amber-500/30 shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
              onClick={onToggleBookmark}
              aria-pressed={isBookmarked}
              aria-label={isBookmarked ? "Remove bookmark" : "Bookmark question"}
            >
              <Bookmark className={cn("size-3.5", isBookmarked && "fill-current scale-105")} aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            {isBookmarked ? "Remove bookmark" : "Bookmark for review"}
          </TooltipContent>
        </Tooltip>
      </div>

      <div
        className="flex flex-col gap-2 sm:gap-2.5 w-full"
        role="radiogroup"
        aria-labelledby="question-title"
      >
        {question.options.map((opt, i) => {
          const isChosen = answered?.chosen === opt;
          const isCorrect = question.correctAnswer === opt;
          const isRevealedCorrect = hasSelection && isCorrect;
          const isRevealedWrong = hasSelection && isChosen && !isCorrect;
          const letter = String.fromCharCode(65 + i);

          let accessibleStatus = "";
          if (isRevealedCorrect) {
            accessibleStatus = isChosen ? ", Correct, Your answer" : ", Correct answer";
          } else if (isRevealedWrong) {
            accessibleStatus = ", Your answer, Incorrect";
          }

          return (
            <button
              key={opt}
              type="button"
              role="radio"
              aria-checked={isChosen}
              aria-disabled={isAnswered ? "true" : undefined}
              aria-label={`Option ${letter}: ${opt}${accessibleStatus}`}
              onClick={() => {
                if (!isAnswered) onAnswer(opt);
              }}
              className={cn(
                "group relative w-full flex items-center justify-between gap-2.5 px-3 py-2 sm:py-2.5 rounded-xl border text-left select-none outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 min-h-10 sm:min-h-11 transition-colors",
                isAnswered ? "cursor-default" : "cursor-pointer active:scale-95 transition-transform",
                isRevealedCorrect && "border-emerald-500/80 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100 ring-1 ring-emerald-500/40",
                isRevealedWrong && "border-rose-500/80 bg-rose-500/10 text-rose-950 dark:text-rose-100 ring-1 ring-rose-500/40",
                isAnswered && !isRevealedCorrect && !isRevealedWrong && "border-border/60 bg-muted/25 text-muted-foreground",
                !isAnswered && "border-border/80 bg-card hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10",
              )}
            >
              <span className="flex items-center gap-2.5 min-w-0 flex-1">
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-7 shrink-0 flex items-center justify-center rounded-lg font-semibold text-xs tabular-nums transition-colors",
                    isRevealedCorrect && "bg-emerald-600 text-white",
                    isRevealedWrong && "bg-rose-600 text-white",
                    !isRevealedCorrect && !isRevealedWrong && "bg-surface-strong text-foreground border border-border group-hover:border-primary/40",
                  )}
                >
                  {letter}
                </span>
                <span className="text-sm sm:text-base font-normal leading-normal text-foreground break-words flex-1 text-pretty">
                  {opt}
                </span>
              </span>

              <span className="flex items-center gap-2 shrink-0 ml-2" aria-hidden="true">
                {!isAnswered && (
                  <kbd className="keyboard-only hidden sm:inline-flex opacity-50 group-hover:opacity-100 font-mono text-xs px-1.5 py-0.5">
                    {i + 1}
                  </kbd>
                )}

                {isRevealedCorrect && (
                  <Badge variant="outline" className="border-emerald-500/50 bg-emerald-100/90 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 gap-1 text-xs py-0.5 px-2">
                    <Check className="size-3" /> Correct
                  </Badge>
                )}
                {isRevealedWrong && (
                  <Badge variant="outline" className="border-rose-500/50 bg-rose-100/90 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 gap-1 text-xs py-0.5 px-2">
                    <X className="size-3" /> Your answer
                  </Badge>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {answered?.status === ANSWER_STATUS.SKIPPED && (
        <div
          role="status"
          className="mt-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-900 dark:text-amber-200 text-xs sm:text-sm flex items-center gap-2"
        >
          <HelpCircle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
          <span className="font-medium">Skipped. You can review and re-attempt this question later.</span>
        </div>
      )}

      {isAnswered && question.explanation && (
        <aside
          aria-label="Explanation"
          className="mt-2.5 p-3 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/25 text-xs sm:text-sm"
        >
          <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-bold text-xs uppercase tracking-wider mb-1">
            <Info className="size-3.5" aria-hidden="true" /> Explanation
          </div>
          <p className="text-foreground/90 leading-relaxed m-0 font-normal text-pretty">{question.explanation}</p>
        </aside>
      )}
    </article>
  );
}
