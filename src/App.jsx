import { useCallback, useEffect, useMemo, useState } from "react";
import data from "./assets/data.json";
import Header from "./components/Header";
import InvalidData from "./components/InvalidData";
import QuestionCard from "./components/QuestionCard";
import ReviewPanel from "./components/ReviewPanel";
import StatsCard from "./components/StatsCard";
import useKeyboard from "./hooks/useKeyboard";
import {
  ANSWER_STATUS,
  buildAnswer,
  calculateStats,
  createDataSignature,
  createInitialSession,
  loadSession,
  saveSession,
  validateQuestions,
} from "./utils";

function makeSession(total, dataSignature) {
  return loadSession(total, dataSignature) || createInitialSession(total);
}

function getInitialTheme() {
  const saved = globalThis.localStorage?.getItem("nptel_prep_theme");
  if (saved === "light" || saved === "dark") return saved;
  return globalThis.matchMedia?.("(prefers-color-scheme: dark)")?.matches ? "dark" : "light";
}

export default function App() {
  const { questions, errors } = useMemo(() => {
    const result = validateData(data);
    return result;
  }, []);
  const total = questions.length;
  const dataSignature = useMemo(() => createDataSignature(questions), [questions]);
  const [session, setSession] = useState(() => makeSession(total, dataSignature));
  const [view, setView] = useState("quiz");
  const [reviewFilter, setReviewFilter] = useState("all");
  const [showHelp, setShowHelp] = useState(false);
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    if (errors.length === 0) saveSession(session, dataSignature);
  }, [dataSignature, errors.length, session]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    globalThis.localStorage?.setItem("nptel_prep_theme", theme);
  }, [theme]);

  const stats = useMemo(() => calculateStats(total, session.answers), [session.answers, total]);
  const qIndex = session.order[session.index];
  const current = questions[qIndex];
  const answered = session.answers[qIndex];

  const updateSession = useCallback((updater) => {
    setSession((prev) => ({ ...prev, ...updater(prev) }));
  }, []);

  const goToQuestionIndex = useCallback(
    (questionIndex) => {
      setSession((prev) => {
        const existingIndex = prev.order.indexOf(questionIndex);
        const nextOrder = existingIndex === -1 ? [questionIndex, ...prev.order] : prev.order;
        const nextIndex = existingIndex === -1 ? 0 : existingIndex;
        return { ...prev, order: nextOrder, index: nextIndex };
      });
      setView("quiz");
    },
    [setView],
  );

  const toggleBookmark = useCallback((questionIndex) => {
    updateSession((prev) => {
      const bookmarks = { ...prev.bookmarks };
      if (bookmarks[questionIndex]) delete bookmarks[questionIndex];
      else bookmarks[questionIndex] = true;
      return { bookmarks };
    });
  }, [updateSession]);

  const handleAnswer = useCallback(
    (chosen) => {
      if (!current || answered) return;
      updateSession((prev) => ({
        answers: {
          ...prev.answers,
          [qIndex]: buildAnswer(current, chosen),
        },
      }));
    },
    [answered, current, qIndex, updateSession],
  );

  const skipCurrent = useCallback(() => {
    if (!current || answered) return;
    updateSession((prev) => ({
      answers: {
        ...prev.answers,
        [qIndex]: buildAnswer(current, null),
      },
    }));
  }, [answered, current, qIndex, updateSession]);

  const finishSession = useCallback(() => {
    setSession((prev) => ({
      ...prev,
      history: [
        ...prev.history.slice(-9),
        {
          completedAt: new Date().toISOString(),
          stats: calculateStats(total, prev.answers),
        },
      ],
    }));
    setView("stats");
  }, [total]);

  const next = useCallback(() => {
    setSession((prev) => {
      if (prev.index < prev.order.length - 1) return { ...prev, index: prev.index + 1 };
      return prev;
    });
    if (session.index >= session.order.length - 1) finishSession();
  }, [finishSession, session.index, session.order.length]);

  const prev = useCallback(() => {
    setSession((currentSession) => ({
      ...currentSession,
      index: Math.max(currentSession.index - 1, 0),
    }));
    setView("quiz");
  }, []);

  const skipAndNext = useCallback(() => {
    skipCurrent();
    next();
  }, [next, skipCurrent]);

  const restart = useCallback(() => {
    const shouldRestart = stats.attempted === 0 || window.confirm("Restart this session and clear current progress?");
    if (!shouldRestart) return;
    setSession({ ...createInitialSession(total), dataSignature });
    setView("quiz");
    setReviewFilter("all");
  }, [dataSignature, stats.attempted, total]);

  const retryMissed = useCallback(() => {
    const missed = questions
      .map((_, index) => index)
      .filter((index) => {
        const status = session.answers[index]?.status;
        return status === ANSWER_STATUS.INCORRECT || status === ANSWER_STATUS.SKIPPED;
      });

    if (missed.length === 0) return;

    setSession((prev) => {
      const answers = { ...prev.answers };
      missed.forEach((index) => {
        delete answers[index];
      });
      return { ...prev, order: missed, index: 0, answers };
    });
    setView("quiz");
  }, [questions, session.answers]);

  const answerByIndex = useCallback(
    (optIdx) => {
      if (current?.options[optIdx] != null && !answered) handleAnswer(current.options[optIdx]);
    },
    [answered, current, handleAnswer],
  );

  const focusOption = useCallback((direction) => {
    const opts = Array.from(document.querySelectorAll(".option"));
    if (!opts.length) return;
    const active = document.activeElement;
    let index = opts.indexOf(active);
    if (index === -1) index = direction > 0 ? -1 : opts.length;
    opts[Math.min(Math.max(index + direction, 0), opts.length - 1)]?.focus();
  }, []);

  useKeyboard({
    onPrev: prev,
    onNext: answered ? next : skipAndNext,
    onAnswerByIndex: answerByIndex,
    onFocusMove: focusOption,
    onRestart: restart,
    onHelp: () => setShowHelp(true),
  });

  if (errors.length > 0) return <InvalidData errors={errors} />;

  return (
    <div className="app">
      <Header
        total={total}
        stats={stats}
        answers={session.answers}
        theme={theme}
        onToggleTheme={() => setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"))}
        onRestart={restart}
        onReview={() => setView("review")}
      />

      {view === "stats" ? (
        <StatsCard stats={stats} onRestart={restart} onReview={() => setView("review")} onRetryMissed={retryMissed} />
      ) : view === "review" ? (
        <ReviewPanel
          questions={questions}
          answers={session.answers}
          bookmarks={session.bookmarks}
          filter={reviewFilter}
          onFilterChange={setReviewFilter}
          onBack={() => setView("quiz")}
          onJumpToQuestion={goToQuestionIndex}
          onToggleBookmark={toggleBookmark}
        />
      ) : current ? (
        <>
          <QuestionCard
            qitem={current}
            onAnswer={handleAnswer}
            answered={answered}
            isBookmarked={Boolean(session.bookmarks[qIndex])}
            onToggleBookmark={() => toggleBookmark(qIndex)}
          />

          <div className="actions">
            <button className="btn small" type="button" onClick={prev} disabled={session.index === 0}>
              Prev
            </button>
            <div className="action-group">
              <button className="btn small" type="button" onClick={skipAndNext} disabled={Boolean(answered)}>
                Skip
              </button>
              <button className="btn primary" type="button" onClick={next}>
                {session.index === session.order.length - 1 ? "Finish" : "Next"}
              </button>
            </div>
          </div>

          <div className="summary">
            <div>
              Attempted: {stats.attempted} · Correct: {stats.correct} · Skipped: {stats.skipped}
            </div>
            <div>
              Q {session.index + 1} / {session.order.length}
            </div>
          </div>
        </>
      ) : (
        <div className="card empty-state">No questions found.</div>
      )}

      {showHelp ? (
        <div className="modal-backdrop" role="presentation" onClick={() => setShowHelp(false)}>
          <section className="help-dialog" role="dialog" aria-modal="true" aria-labelledby="help-title" onClick={(event) => event.stopPropagation()}>
            <h2 id="help-title">Keyboard shortcuts</h2>
            <dl>
              <div>
                <dt>1-5</dt>
                <dd>Choose an answer</dd>
              </div>
              <div>
                <dt>W / S</dt>
                <dd>Move option focus</dd>
              </div>
              <div>
                <dt>A / D</dt>
                <dd>Previous or next</dd>
              </div>
              <div>
                <dt>R</dt>
                <dd>Restart with confirmation</dd>
              </div>
            </dl>
            <button className="btn primary" type="button" onClick={() => setShowHelp(false)}>
              Close
            </button>
          </section>
        </div>
      ) : null}
    </div>
  );
}

function validateData(rawData) {
  return validateQuestions(rawData);
}
