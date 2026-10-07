import NumberFlow from "@number-flow/react";
import { FolderOpen, Keyboard, ListTodo, Moon, RotateCcw, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Progress from "./Progress";

export default function Header({
  total,
  stats,
  answers,
  theme,
  activeDatasetName = "Default",
  onToggleTheme,
  onOpenDatasets,
  onRestart,
  onReview,
  onOpenHelp,
}) {
  const isDark = theme === "dark";

  return (
    <header className="flex flex-col gap-3 pb-3 border-b border-border/60">
      <div className="flex items-center justify-between gap-2.5 sm:gap-3">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <img src="/logo.svg" alt="" aria-hidden="true" className="size-7 sm:size-8 shrink-0" />
          <h1 className="text-base sm:text-xl font-bold tracking-tight text-foreground truncate">
            NPTEL Prep
          </h1>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={onToggleTheme}
                aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
                className="text-muted-foreground hover:text-foreground size-8"
              >
                {isDark ? <Sun className="size-4" aria-hidden="true" /> : <Moon className="size-4" aria-hidden="true" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {isDark ? "Switch to light mode" : "Switch to dark mode"}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={onOpenHelp}
                aria-label="Keyboard shortcuts"
                className="text-muted-foreground hover:text-foreground hidden sm:inline-flex size-8 keyboard-only"
              >
                <Keyboard className="size-4" aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Keyboard shortcuts (?)
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenDatasets}
                aria-label={`Current quiz: ${activeDatasetName}. Switch or upload question sets`}
                className="gap-1.5 text-xs font-semibold px-2 sm:px-2.5 h-8 text-foreground"
              >
                <FolderOpen className="size-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                <span className="hidden sm:inline max-w-28 truncate">{activeDatasetName}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Switch or upload question sets (JSON)
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={onReview}
                aria-label="Review answered and bookmarked questions"
                className="gap-1.5 text-xs font-semibold px-2 sm:px-2.5 h-8"
              >
                <ListTodo className="size-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Review</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Review answered & bookmarked questions
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                size="sm"
                aria-label="Restart quiz and reshuffle questions"
                className="bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-600 dark:text-slate-950 font-semibold gap-1.5 text-xs px-2 sm:px-2.5 h-8 shadow-xs"
                onClick={onRestart}
              >
                <RotateCcw className="size-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Restart</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Restart quiz & reshuffle questions (R)
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-0.5">
        <div
          role="status"
          aria-label={`Current score: ${stats.correct} out of ${total}`}
          className="flex items-center gap-1.5 text-xs font-semibold bg-surface-strong/80 px-2.5 py-1 rounded-md border border-border/70 shrink-0"
        >
          <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Score</span>
          <span className="tabular-nums font-bold text-foreground flex items-center gap-0.5" aria-hidden="true">
            <NumberFlow value={stats.correct} />
            <span className="text-muted-foreground font-normal">/{total}</span>
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <Progress total={total} answers={answers} />
        </div>
      </div>
    </header>
  );
}
