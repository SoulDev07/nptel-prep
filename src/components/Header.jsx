import { ListIcon, MoonIcon, RotateIcon, SunIcon } from "./Icons";
import Progress from "./Progress";

export default function Header({ total, stats, answers, theme, onToggleTheme, onRestart, onReview }) {
  const isDark = theme === "dark";

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
                {stats.correct} / {total}
              </div>
            </div>
            <Progress total={total} answers={answers} />
          </div>
          <div className="header-actions">
            <button
              className="btn icon-btn"
              type="button"
              onClick={onToggleTheme}
              aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
              title={isDark ? "Switch to light theme" : "Switch to dark theme"}
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>
            <button className="btn" type="button" onClick={onReview}>
              <ListIcon />
              Review
            </button>
            <button className="btn restart-btn" type="button" onClick={onRestart}>
              <RotateIcon />
              Restart
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
