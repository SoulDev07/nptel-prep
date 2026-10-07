import { useMemo } from "react";
import { ArrowLeft, ArrowRight, Bookmark, CheckCircle2, HelpCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ANSWER_STATUS, filterQuestionIndices } from "../utils";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "correct", label: "Correct" },
  { key: "incorrect", label: "Incorrect" },
  { key: "skipped", label: "Skipped" },
  { key: "unanswered", label: "Unanswered" },
  { key: "bookmarked", label: "Bookmarked" },
];

export default function ReviewPanel({
  questions,
  answers,
  bookmarks,
  filter,
  onFilterChange,
  onBack,
  onJumpToQuestion,
  onToggleBookmark,
}) {
  const indices = useMemo(
    () => filterQuestionIndices({ filter, questions, answers, bookmarks }),
    [answers, bookmarks, filter, questions],
  );

  const counts = useMemo(() => {
    let correct = 0, incorrect = 0, skipped = 0, unanswered = 0, bookmarked = 0;
    questions.forEach((_, idx) => {
      const a = answers[idx];
      if (bookmarks[idx]) bookmarked++;
      if (!a) unanswered++;
      else if (a.status === ANSWER_STATUS.CORRECT) correct++;
      else if (a.status === ANSWER_STATUS.INCORRECT) incorrect++;
      else if (a.status === ANSWER_STATUS.SKIPPED) skipped++;
    });
    return { all: questions.length, correct, incorrect, skipped, unanswered, bookmarked };
  }, [answers, bookmarks, questions]);

  return (
    <section aria-labelledby="review-heading" className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 id="review-heading" className="text-lg sm:text-xl font-bold tracking-tight text-foreground">Review session</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 text-pretty">
            Compare your answers, review explanations, or jump back to any question.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          aria-label="Back to quiz"
          className="gap-1.5 shrink-0 w-full sm:w-auto justify-center"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to quiz
        </Button>
      </div>

      <Tabs value={filter} onValueChange={onFilterChange} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto py-1 h-auto flex-wrap gap-1 bg-muted/60 p-1 rounded-xl">
          {FILTERS.map((item) => (
            <TabsTrigger
              key={item.key}
              value={item.key}
              aria-label={`${item.label} (${counts[item.key]} questions)`}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg data-active:bg-card data-active:shadow-xs gap-1.5"
            >
              <span>{item.label}</span>
              <span className="tabular-nums text-xs font-semibold px-1.5 py-0.5 rounded-full bg-foreground/10 text-muted-foreground" aria-hidden="true">
                {counts[item.key]}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {indices.length === 0 ? (
        <Card className="p-8 text-center border-dashed">
          <p className="text-muted-foreground text-sm font-medium">
            No questions found for the &ldquo;{filter}&rdquo; filter.
          </p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {indices.map((idx) => {
            const q = questions[idx];
            const a = answers[idx];
            const status = a?.status || "unanswered";
            const isBookmarked = Boolean(bookmarks[idx]);

            return (
              <Card key={q.id || idx} className="border-border/80">
                <CardHeader className="p-3.5 sm:p-4 pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold tabular-nums text-muted-foreground">Q{idx + 1}</span>
                      {status === ANSWER_STATUS.CORRECT && (
                        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 gap-1 font-semibold">
                          <CheckCircle2 className="size-3" aria-hidden="true" /> Correct
                        </Badge>
                      )}
                      {status === ANSWER_STATUS.INCORRECT && (
                        <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 gap-1 font-semibold">
                          <XCircle className="size-3" aria-hidden="true" /> Incorrect
                        </Badge>
                      )}
                      {status === ANSWER_STATUS.SKIPPED && (
                        <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 gap-1 font-semibold">
                          <HelpCircle className="size-3" aria-hidden="true" /> Skipped
                        </Badge>
                      )}
                      {status === "unanswered" && (
                        <Badge variant="secondary" className="gap-1 font-semibold">Unanswered</Badge>
                      )}
                    </div>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={isBookmarked ? "secondary" : "ghost"}
                          size="icon-xs"
                          className={cn(isBookmarked ? "text-amber-600 bg-amber-50 dark:bg-amber-950/40" : "text-muted-foreground")}
                          onClick={() => onToggleBookmark(idx)}
                          aria-pressed={isBookmarked}
                          aria-label={isBookmarked ? `Remove bookmark for question ${idx + 1}` : `Bookmark question ${idx + 1}`}
                        >
                          <Bookmark className={cn("size-3.5", isBookmarked && "fill-current")} aria-hidden="true" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left">{isBookmarked ? "Remove bookmark" : "Bookmark"}</TooltipContent>
                    </Tooltip>
                  </div>

                  <h3 className="text-base font-semibold leading-snug tracking-tight mt-2 text-foreground text-pretty">{q.question}</h3>
                </CardHeader>

                <CardContent className="p-3.5 sm:p-4 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-2 text-sm">
                    <div className={cn(
                      "p-2.5 rounded-lg border text-xs",
                      status === ANSWER_STATUS.CORRECT && "bg-emerald-500/10 border-emerald-500/20 text-emerald-950 dark:text-emerald-200",
                      status === ANSWER_STATUS.INCORRECT && "bg-rose-500/10 border-rose-500/20 text-rose-950 dark:text-rose-200",
                      status !== ANSWER_STATUS.CORRECT && status !== ANSWER_STATUS.INCORRECT && "bg-muted/40 border-border text-muted-foreground",
                    )}>
                      <div className="font-semibold tracking-wider uppercase text-xs mb-0.5 text-muted-foreground">Your answer</div>
                      <div className="font-medium text-sm text-pretty break-words">{!a ? "Unanswered" : a.status === ANSWER_STATUS.SKIPPED ? "Skipped" : a.chosen}</div>
                    </div>

                    <div className="p-2.5 rounded-lg border bg-emerald-500/10 border-emerald-500/20 text-emerald-950 dark:text-emerald-200 text-xs">
                      <div className="font-semibold tracking-wider uppercase text-xs mb-0.5 text-muted-foreground">Correct answer</div>
                      <div className="font-medium text-sm text-pretty break-words">{q.correctAnswer}</div>
                    </div>
                  </div>

                  {q.explanation && (
                    <p className="text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-lg mt-2 leading-relaxed text-pretty">
                      <strong className="text-foreground">Explanation:</strong> {q.explanation}
                    </p>
                  )}

                  <div className="mt-3 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onJumpToQuestion(idx)}
                      aria-label={`Open question ${idx + 1}`}
                      className="gap-1 text-xs w-full sm:w-auto"
                    >
                      Open question <ArrowRight className="size-3" aria-hidden="true" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
