import React from "react";
import Progress from "./Progress";

export default function Header({ total, correctCount, doneCount, index, answers, order, onRestart }) {
  return (
    <div className="header">
      <div
        className="logo"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img src="/logo.svg" alt="NPTEL Prep logo" style={{ width: "56px", height: "56px", objectFit: "contain", display: "block" }} />
      </div>

      <div className="title">
        <h1>NPTEL Prep - Practice</h1>
        <p>One question at a time · Keyboard: ← → · 1-5</p>
      </div>

      <div style={{ flex: 1 }} />

      <div className="header-actions" style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div className="score-block" style={{ textAlign: "right", minWidth: 92 }}>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>Score</div>
          <div style={{ fontWeight: 800, fontSize: 16 }}>
            {correctCount} / {total}
          </div>
        </div>

        <Progress total={total} answers={answers} order={order} index={index} />

        <button className="btn" onClick={onRestart}>
          Restart
        </button>
      </div>
    </div>
  );
}
