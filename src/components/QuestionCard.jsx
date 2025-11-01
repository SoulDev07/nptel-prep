export default function QuestionCard({
  qitem,
  onAnswer,
  answered, // { chosen, correct } or undefined
  reveal,
}) {
  // qitem: { question, options:[], correctAnswer: "..." }
  return (
    <div className="card" aria-live="polite">
      <div className="q-top">
        <div className="q-count">Question</div>
        <div style={{ color: "var(--muted)", fontSize: 13 }}>Practice · Instant feedback</div>
      </div>

      <div className="question" dangerouslySetInnerHTML={{ __html: qitem.question }} />

      <div className="options">
        {qitem.options.map((opt, i) => {
          const isChosen = answered && answered.chosen === opt;
          const isCorrect = qitem.correctAnswer === opt;
          let cls = "option";
          if (reveal) {
            if (isCorrect) cls += " correct";
            else if (isChosen && !isCorrect) cls += " wrong";
            else cls += " disabled";
          }

          return (
            <div
              key={i}
              className={cls}
              role="button"
              tabIndex={0}
              onClick={() => {
                if (!reveal) onAnswer(opt);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (!reveal) onAnswer(opt);
                }
              }}
              aria-pressed={isChosen ? "true" : "false"}
              aria-disabled={reveal ? "true" : "false"}
            >
              <div className="dot">{String.fromCharCode(65 + i)}</div>
              <div className="text" dangerouslySetInnerHTML={{ __html: opt }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
