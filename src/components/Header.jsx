import React from "react";
import Progress from "./Progress";

export default function Header({ total, correctCount, doneCount, index, answers, order, onRestart }) {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <div className="logo">
            <img src="/logo.svg" alt="NPTEL Prep logo" />
          </div>
          <div className="title">
            <h1>NPTEL Prep</h1>
            <p>One question at a time · Keyboard: ← → · 1-5</p>
          </div>
        </div>
        <div className="header-right">
          <div className="score-progress">
            <div className="score-block">
              <div className="small-muted">Score</div>
              <div className="big">
                {correctCount} / {total}
              </div>
            </div>
            <Progress total={total} answers={answers} order={order} index={index} />
          </div>
          <button className="btn restart-btn" onClick={onRestart}>
            Restart
          </button>
        </div>
      </div>
    </header>
  );
}
