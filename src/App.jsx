import { Fragment, StrictMode, useCallback, useState } from "react";
import { createRoot } from "react-dom/client";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TooltipProvider } from "@/components/ui/tooltip";
import defaultData from "./assets/data.json";
import DatasetDialog from "./components/DatasetDialog";
import Header from "./components/Header";
import InvalidData from "./components/InvalidData";
import QuestionCard from "./components/QuestionCard";
import QuizControls from "./components/QuizControls";
import ReviewPanel from "./components/ReviewPanel";
import ShortcutsDialog from "./components/ShortcutsDialog";
import StatsCard from "./components/StatsCard";
import useKeyboard from "./hooks/useKeyboard";
import { useQuiz } from "./hooks/useQuiz";
import { useTheme } from "./hooks/useTheme";
import "./index.css";

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [view, setView] = useState("quiz");
  const [reviewFilter, setReviewFilter] = useState("all");
  const [showDatasets, setShowDatasets] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const quiz = useQuiz(defaultData, () => setView("stats"));

  const announcement = (() => {
    if (view === "stats") {
      return `Session complete! Score: ${quiz.stats.correct} out of ${quiz.stats.total} correct. Accuracy: ${quiz.stats.accuracyPct} percent.`;
    }
    if (view === "review") {
      return "Reviewing questions session.";
    }
    if (view === "quiz" && quiz.currentQuestion) {
      if (quiz.currentAnswer) {
        if (quiz.currentAnswer.status === "correct") {
          return "Correct!";
        }
        if (quiz.currentAnswer.status === "incorrect") {
          return `Incorrect. Correct answer is: ${quiz.currentQuestion.correctAnswer}.`;
        }
        if (quiz.currentAnswer.status === "skipped") {
          return "Question skipped.";
        }
      }
      return `Question ${quiz.currentIndex + 1} of ${quiz.total}: ${quiz.currentQuestion.question}`;
    }
    return "";
  })();

  const handleRestart = useCallback(() => {
    if (quiz.stats.attempted === 0) {
      quiz.restart();
      setView("quiz");
    } else {
      setShowRestartConfirm(true);
    }
  }, [quiz]);

  const confirmRestart = useCallback(() => {
    quiz.restart();
    setView("quiz");
    setShowRestartConfirm(false);
  }, [quiz]);

  const handleRetryMissed = useCallback(() => {
    quiz.retryMissed();
    setView("quiz");
  }, [quiz]);

  const handleJumpToQuestion = useCallback((index) => {
    quiz.goToIndex(index);
    setView("quiz");
  }, [quiz]);

  useKeyboard({
    onPrev: quiz.prev,
    onNext: quiz.currentAnswer ? quiz.next : quiz.skipAndNext,
    onAnswerByIndex: quiz.answerByIndex,
    onRestart: handleRestart,
    onHelp: () => setShowShortcuts(true),
  });

  if (quiz.errors.length > 0) {
    return <InvalidData errors={quiz.errors} />;
  }

  return (
    <div className="w-full max-w-4xl mx-auto my-0 sm:my-5 p-3.5 sm:p-5 flex flex-col gap-4 border-0 sm:border border-border rounded-none sm:rounded-2xl bg-card shadow-none sm:shadow-lg min-h-dvh sm:min-h-0">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:shadow-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 font-medium text-sm"
      >
        Skip to main content
      </a>

      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      <Header
        total={quiz.total}
        stats={quiz.stats}
        answers={quiz.session.answers}
        theme={theme}
        activeDatasetName={quiz.activeDataset.name}
        onToggleTheme={toggleTheme}
        onOpenDatasets={() => setShowDatasets(true)}
        onRestart={handleRestart}
        onReview={() => setView("review")}
        onOpenHelp={() => setShowShortcuts(true)}
      />

      <main id="main-content" tabIndex={-1} className="flex flex-col gap-4 outline-none">
        {view === "stats" && (
          <StatsCard
            stats={quiz.stats}
            onRestart={handleRestart}
            onReview={() => setView("review")}
            onRetryMissed={handleRetryMissed}
          />
        )}

        {view === "review" && (
          <ReviewPanel
            questions={quiz.questions}
            answers={quiz.session.answers}
            bookmarks={quiz.session.bookmarks}
            filter={reviewFilter}
            onFilterChange={setReviewFilter}
            onBack={() => setView("quiz")}
            onJumpToQuestion={handleJumpToQuestion}
            onToggleBookmark={quiz.toggleBookmark}
          />
        )}

        {view === "quiz" && (
          <>
            <QuestionCard
              question={quiz.currentQuestion}
              answered={quiz.currentAnswer}
              isBookmarked={quiz.isBookmarked}
              onAnswer={quiz.answer}
              onToggleBookmark={() => quiz.toggleBookmark()}
            />
            <QuizControls
              currentIndex={quiz.currentIndex}
              total={quiz.session.order.length}
              answered={quiz.currentAnswer}
              stats={quiz.stats}
              onPrev={quiz.prev}
              onSkipAndNext={quiz.skipAndNext}
              onNext={quiz.next}
            />
          </>
        )}
      </main>

      <DatasetDialog
        open={showDatasets}
        onOpenChange={setShowDatasets}
        datasets={quiz.datasets}
        activeDatasetId={quiz.activeDatasetId}
        onSelectDataset={quiz.selectDataset}
        onUploadDataset={quiz.uploadDataset}
        onDeleteDataset={quiz.deleteDataset}
      />

      <ShortcutsDialog open={showShortcuts} onOpenChange={setShowShortcuts} />

      <Dialog open={showRestartConfirm} onOpenChange={setShowRestartConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="gap-3 sm:gap-3.5">
            <div className="flex items-start gap-3 sm:gap-3.5">
              <div className="size-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20 mt-0.5" aria-hidden="true">
                <AlertTriangle className="size-5" />
              </div>
              <div className="space-y-1 text-left min-w-0">
                <DialogTitle className="text-base font-semibold text-foreground tracking-tight">
                  Restart this session?
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed text-pretty">
                  Your current progress ({quiz.stats.attempted} attempted) will be cleared, and questions will be reshuffled. This action cannot be undone.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRestartConfirm(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-600 dark:hover:bg-amber-700 font-semibold gap-1.5 shadow-xs"
              onClick={confirmRestart}
            >
              <RotateCcw className="size-3.5" aria-hidden="true" />
              Restart now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const rootElement = document.getElementById("root");
if (rootElement) {
  const Wrapper = import.meta.env.DEV ? StrictMode : Fragment;
  const root = rootElement._reactRoot ?? (rootElement._reactRoot = createRoot(rootElement));
  root.render(
    <Wrapper>
      <TooltipProvider delayDuration={250}>
        <App />
      </TooltipProvider>
    </Wrapper>,
  );
}
