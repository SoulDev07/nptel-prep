import { useEffect, useState } from "react";
import data from "./assets/data.json";
import QuestionCard from "./components/QuestionCard";
import Header from "./components/Header";
import useKeyboard from "./hooks/useKeyboard";
import StatsCard from "./components/StatsCard";

import { shuffleIndices, loadState, saveState } from "./utils";

export default function App() {
  const total = data.length;
  const [order, setOrder] = useState(() => shuffleIndices(total));
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [reveal, setReveal] = useState(false);
  const [finished, setFinished] = useState(false); // new state
  const [hydrated, setHydrated] = useState(false); // <- new: prevent initial overwrite of stored state

  useEffect(() => {
    const s = loadState();
    if (s && s.order && Array.isArray(s.order) && s.order.length === total) {
      setOrder(s.order);
      setIndex(Math.min(s.index || 0, total - 1));
      setAnswers(s.answers || {});
    } else {
      const o = shuffleIndices(total);
      setOrder(o);
      saveState({ order: o, index: 0, answers: {} });
    }
    // mark hydration requested; setHydrated(true) ensures subsequent saves persist current app state
    setHydrated(true);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    // don't persist until we've performed initial load (avoid overwriting saved state on mount)
    if (!hydrated) return;
    saveState({ order, index, answers });
  }, [order, index, answers, hydrated]);

  // keep 'reveal' in sync with the currently selected question:
  // reveal should be true when that question has a recorded chosen value (non-null),
  // otherwise false (this allows reattempts when chosen === null).
  useEffect(() => {
    const qIndexForReveal = order[index];
    if (qIndexForReveal == null) return;
    const a = answers[qIndexForReveal];
    setReveal(Boolean(a && a.chosen != null));
  }, [index, order, answers]);

  const qIndex = order[index];
  const current = data[qIndex];

  // plain functions (no useCallback)
  function handleAnswer(chosen) {
    if (!current) return;
    const isCorrect = String(chosen) === String(current.correctAnswer);
    const nextAnswers = { ...answers, [qIndex]: { chosen, correct: isCorrect } };
    setAnswers(nextAnswers);
    setReveal(true);
  }

  function next() {
    if (index < total - 1) {
      setIndex((i) => i + 1);
    } else {
      setFinished(true); // reached end -> show final stats
    }
  }

  function prev() {
    if (index > 0) {
      setIndex((i) => i - 1);
      setFinished(false); // leaving final screen if navigating back
    }
  }

  function restart() {
    const o = shuffleIndices(total);
    setOrder(o);
    setIndex(0);
    setAnswers({});
    setReveal(false);
    setFinished(false); // ensure finished cleared
    saveState({ order: o, index: 0, answers: {} });
  }

  function answerByIndex(optIdx) {
    // allow numeric answer only when question is not already answered (chosen != null)
    const alreadyAnswered = answers[qIndex] && answers[qIndex].chosen != null;
    if (
      current &&
      Array.isArray(current.options) &&
      current.options[optIdx] != null &&
      !reveal &&
      !alreadyAnswered
    ) {
      handleAnswer(current.options[optIdx]);
    }
  }

  // focus movement helper (keeps existing behavior)
  function focusOption(direction) {
    try {
      const opts = Array.from(document.querySelectorAll(".card .options .option"));
      if (!opts.length) return;
      const active = document.activeElement;
      let idx = opts.indexOf(active);
      if (idx === -1) {
        idx = direction > 0 ? 0 : opts.length - 1;
        opts[idx].focus();
        return;
      }
      let nextIdx = idx + direction;
      if (nextIdx < 0) nextIdx = 0;
      if (nextIdx > opts.length - 1) nextIdx = opts.length - 1;
      opts[nextIdx].focus();
    } catch (err) {
      /* ignore */
    }
  }

  // Setup keyboard handlers via modular hook (includes 'R' for restart)
  useKeyboard({
    onPrev: prev,
    onNext: () => {
      // mimic Next button behavior
      if (reveal) next();
      else {
        if (!answers[qIndex]) {
          setAnswers((prev) => ({ ...prev, [qIndex]: { chosen: null, correct: false } }));
        }
        next();
      }
    },
    onAnswerByIndex: answerByIndex,
    onFocusMove: (dir) => focusOption(dir),
    onSelectFocused: () => {
      const active = document.activeElement;
      if (active && active.classList && active.classList.contains("option") && !reveal) {
        active.click();
      }
    },
    onRestart: restart,
  });

  const doneCount = Object.keys(answers).length;
  const correctCount = Object.values(answers).filter((a) => a.correct).length;
  // separate progress % (how many answered) and accuracy % (correct of answered)
  const progressPct = total === 0 ? 0 : Math.round((doneCount / total) * 100);
  const accuracyPct = doneCount === 0 ? 0 : Math.round((correctCount / doneCount) * 100);

  return (
    <div className="app">
      <Header
        total={total}
        correctCount={correctCount}
        doneCount={doneCount}
        index={index}
        answers={answers}
        order={order}
        onRestart={restart}
      />

      <div style={{ marginTop: 8 }}>
        {finished ? (
          <StatsCard
            total={total}
            done={doneCount}
            correct={correctCount}
            progressPct={progressPct}
            accuracyPct={accuracyPct}
            onRestart={restart}
            onReview={() => {
              setFinished(false);
              setIndex(0);
            }}
          />
        ) : current ? (
          <>
            <QuestionCard qitem={current} onAnswer={handleAnswer} answered={answers[qIndex]} reveal={reveal} />

            <div className="actions">
              <div>
                <button className="btn small" onClick={prev} disabled={index === 0}>
                  Prev
                </button>
                <button
                  className="btn small"
                  onClick={() => {
                    if (!answers[qIndex]) {
                      setAnswers((prev) => ({ ...prev, [qIndex]: { chosen: null, correct: false } }));
                    }
                    next();
                  }}
                  style={{ marginLeft: 8 }}
                >
                  Skip / Next
                </button>
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button
                  className="btn primary"
                  onClick={() => {
                    if (reveal) next();
                    else {
                      if (!answers[qIndex]) {
                        setAnswers((prev) => ({ ...prev, [qIndex]: { chosen: null, correct: false } }));
                      }
                      next();
                    }
                  }}
                >
                  {index === total - 1 ? "Finish" : reveal ? "Next" : "Next"}
                </button>
              </div>
            </div>

            <div className="summary">
              <div>
                Answered: {doneCount} · Correct: {correctCount}
              </div>
              <div style={{ color: "var(--muted)" }}>
                Q {index + 1} / {total}
              </div>
            </div>
          </>
        ) : (
          <div className="card">
            <div style={{ fontSize: 18, fontWeight: 700 }}>No questions found</div>
            <p style={{ color: "var(--muted)" }}>Make sure src/assets/data.json has some questions.</p>
          </div>
        )}
      </div>
    </div>
  );
}
