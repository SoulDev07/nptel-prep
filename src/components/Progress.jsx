import React from "react";

export default function Progress({ total, answers = {}, order = null, index = 0 }) {
  // total: number of questions
  // answers: map qIndex -> { chosen, correct }
  const done = Object.keys(answers).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <div className="progress-wrap" aria-hidden>
      <div style={{ minWidth: 110, textAlign: "right" }}>
        <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>
          Progress
        </div>
        <div style={{ color: "var(--muted)", fontSize: 12 }}>{done} / {total}</div>
      </div>

      <div
        className="progress-bar"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label="Quiz progress"
      >
        <i style={{ width: `${pct}%` }} />
      </div>

      <div
        style={{ minWidth: 56, textAlign: "right", color: "var(--muted)", fontSize: 13, fontWeight: 700 }}
      >
        {pct}%
      </div>
    </div>
  );
}
