export default function StatsCard({ stats, onRestart, onReview, onRetryMissed }) {
  return (
    <section className="card stats-card" role="status" aria-live="polite">
      <div className="stats-header">
        <h2>Session complete</h2>
        <p className="small-muted">Review missed questions or retry the ones that need more work.</p>
      </div>

      <div className="stats-grid">
        <div className="stat">
          <div className="stat-value">{stats.attempted}</div>
          <div className="stat-label">Attempted</div>
        </div>
        <div className="stat">
          <div className="stat-value">{stats.correct}</div>
          <div className="stat-label">Correct</div>
        </div>
        <div className="stat">
          <div className="stat-value">{stats.skipped}</div>
          <div className="stat-label">Skipped</div>
        </div>
        <div className="stat pct">
          <div className="stat-value">{stats.accuracyPct}%</div>
          <div className="stat-label">Accuracy</div>
        </div>
      </div>

      <div className="stats-bar">
        <div
          className="progress-bar small"
          role="progressbar"
          aria-label="Completion progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={stats.progressPct}
        >
          <i style={{ width: `${stats.progressPct}%` }} />
        </div>
        <div className="muted-line">
          Completion: {stats.progressPct}% ({stats.attempted}/{stats.total}) · Unanswered: {stats.unanswered}
        </div>
      </div>

      <div className="stats-actions">
        <button className="btn small" type="button" onClick={onReview}>
          Review
        </button>
        <button className="btn small" type="button" onClick={onRetryMissed} disabled={stats.incorrect + stats.skipped === 0}>
          Retry missed
        </button>
        <button className="btn primary big-cta" type="button" onClick={onRestart}>
          Restart
        </button>
      </div>
    </section>
  );
}
