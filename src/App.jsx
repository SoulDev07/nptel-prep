import { useEffect, useState } from "react";
import data from "./assets/data.json";
import Progress from "./components/Progress";
import QuestionCard from "./components/QuestionCard";

const STORAGE_KEY = "nptel_prep_state_v1";

function shuffleIndices(n) {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveState(s) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {}
}

export default function App() {
  const total = data.length;
  const [order, setOrder] = useState(() => shuffleIndices(total));
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [reveal, setReveal] = useState(false);

  useEffect(() => {
    const s = loadState();
    if (s && s.order && Array.isArray(s.order) && s.order.length === total) {
      setOrder(s.order);
      setIndex(Math.min(s.index || 0, total - 1));
      setAnswers(s.answers || {});
    } else {
      // fresh shuffle saved
      const o = shuffleIndices(total);
      setOrder(o);
      saveState({ order: o, index: 0, answers: {} });
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    saveState({ order, index, answers });
  }, [order, index, answers]);

  const qIndex = order[index];
  const current = data[qIndex];

  function handleAnswer(chosen) {
    if (!current) return;
    const isCorrect = String(chosen) === String(current.correctAnswer);
    const nextAnswers = { ...answers, [qIndex]: { chosen, correct: isCorrect } };
    setAnswers(nextAnswers);
    setReveal(true);
  }

  function next() {
    setReveal(false);
    if (index < total - 1) setIndex((i) => i + 1);
  }

  function prev() {
    if (index > 0) {
      setIndex((i) => i - 1);
      setReveal(false);
    }
  }

  function restart() {
    const o = shuffleIndices(total);
    setOrder(o);
    setIndex(0);
    setAnswers({});
    setReveal(false);
    saveState({ order: o, index: 0, answers: {} });
  }

  const doneCount = Object.keys(answers).length;
  const correctCount = Object.values(answers).filter((a) => a.correct).length;

  // helper: move focus among option elements inside current card
  function focusOption(direction) {
    try {
      const opts = Array.from(document.querySelectorAll(".card .options .option"));
      if (!opts.length) return;
      const active = document.activeElement;
      let idx = opts.indexOf(active);
      if (idx === -1) {
        // nothing focused -> choose first or last depending on direction
        idx = direction > 0 ? 0 : opts.length - 1;
        opts[idx].focus();
        return;
      }
      let next = idx + direction;
      if (next < 0) next = 0;
      if (next > opts.length - 1) next = opts.length - 1;
      opts[next].focus();
    } catch (err) {
      // ignore
    }
  }

  // Keyboard controls: arrows + 1-4 for options + w/s for focus up/down + Enter/Space to select focused
  useEffect(() => {
    function onKey(e) {
      // ignore typing in inputs/contenteditable
      const tag = e.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || e.target?.isContentEditable) return;

      // Enter / Space: if an option is focused, trigger its click (select)
      if (e.key === "Enter" || e.key === " ") {
        const active = document.activeElement;
        if (active && active.classList && active.classList.contains("option")) {
          e.preventDefault();
          // if not revealed already, clicking will call onAnswer in QuestionCard
          if (!reveal) active.click();
          return;
        }
      }

      // w -> move focus up (previous option), s -> move focus down (next option)
      if (e.key === "w" || e.key === "W") {
        e.preventDefault();
        focusOption(-1);
        return;
      }
      if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        focusOption(1);
        return;
      }

      if (e.key === "ArrowLeft" || e.key === "Left" || e.key === "A" || e.key === "a") {
        e.preventDefault();
        prev();
      } else if (e.key === "ArrowRight" || e.key === "Right" || e.key === "D" || e.key === "d") {
        e.preventDefault();
        // mimic primary Next behavior
        if (reveal) next();
        else {
          if (!answers[qIndex]) {
            setAnswers((prev) => ({ ...prev, [qIndex]: { chosen: null, correct: false } }));
          }
          next();
        }
      } else if (["1", "2", "3", "4"].includes(e.key)) {
        const optIdx = parseInt(e.key, 10) - 1;
        if (current && Array.isArray(current.options) && current.options[optIdx] != null && !reveal) {
          handleAnswer(current.options[optIdx]);
        }
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // include deps that affect handler behavior
  }, [current, index, reveal, answers, qIndex]);

  return (
    <div className="app">
      <div className="header">
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 12,
            background: "#e6f4ee",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid rgba(15,23,42,0.04)",
          }}
        >
          <div style={{ fontWeight: 800, color: "var(--accent)", fontSize: 18 }}>NP</div>
        </div>

        <div className="title">
          <h1>NPTEL Prep — Practice</h1>
          <p>One question at a time · Keyboard: ← → · 1-4</p>
        </div>

        <div style={{ flex: 1 }} />

        {/* Score + Progress + Restart moved to top */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ textAlign: "right", minWidth: 92 }}>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>Score</div>
            <div style={{ fontWeight: 800, fontSize: 16 }}>
              {correctCount} / {total}
            </div>
          </div>

          <Progress total={total} answers={answers} order={order} index={index} />

          <button className="btn" onClick={restart}>
            Restart
          </button>
        </div>
      </div>

      <div style={{ marginTop: 8 }}>
        {current ? (
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
                {/* Score removed from bottom (moved to top) */}
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
              <div>Answered: {doneCount} · Correct: {correctCount}</div>
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
