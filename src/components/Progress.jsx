export default function Progress({ total, answers = {} }) {
  const done = Object.keys(answers).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <div className="progress-wrap">
      <div className="progress-info">
        <div className="progress-label">Progress</div>
        <div className="progress-count">
          {done} / {total}
        </div>
      </div>

      <div
        className="progress-bar"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label={`Quiz progress: ${done} of ${total} questions attempted`}
      >
        <i style={{ width: `${pct}%` }} />
      </div>

      <div className="progress-pct">{pct}%</div>
    </div>
  );
}
