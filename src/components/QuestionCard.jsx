import { ANSWER_STATUS } from "../utils";
import { BookmarkIcon } from "./Icons";

export default function QuestionCard({ qitem, onAnswer, answered, disabled = false, isBookmarked = false, onToggleBookmark }) {
  const isAnswered = Boolean(answered);
  const hasSelection = answered?.chosen != null;

  return (
    <section className="card question-card" aria-live="polite">
      <div className="q-top">
        <div className="q-count">{qitem.topic || "Question"}</div>
        <button
          className={`bookmark-btn icon-btn ${isBookmarked ? "active" : ""}`}
          type="button"
          onClick={onToggleBookmark}
          aria-label={isBookmarked ? "Remove bookmark" : "Bookmark question"}
          title={isBookmarked ? "Remove bookmark" : "Bookmark question"}
        >
          <BookmarkIcon filled={isBookmarked} />
        </button>
      </div>

      <h2 className="question">{qitem.question}</h2>

      <div className="options" role="group" aria-label="Answer options">
        {qitem.options.map((opt, i) => {
          const isChosen = answered?.chosen === opt;
          const isCorrect = qitem.correctAnswer === opt;
          const showFeedback = hasSelection;
          const statusLabel = showFeedback && isCorrect ? "Correct answer" : isChosen ? "Your answer" : "";
          let cls = "option";

          if (showFeedback) {
            if (isCorrect) cls += " correct";
            else if (isChosen) cls += " wrong";
            else cls += " disabled";
          } else if (isAnswered) {
            cls += " disabled";
          }

          return (
            <button
              key={opt}
              className={cls}
              type="button"
              onClick={() => onAnswer(opt)}
              disabled={disabled || isAnswered}
              aria-pressed={isChosen}
            >
              <span className="dot" aria-hidden="true">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="text">{opt}</span>
              {statusLabel ? <span className="option-status">{statusLabel}</span> : null}
            </button>
          );
        })}
      </div>

      {answered?.status === ANSWER_STATUS.SKIPPED ? (
        <div className="feedback skipped">Skipped. Review this question before finishing.</div>
      ) : null}

      {isAnswered && qitem.explanation ? (
        <div className="explanation">
          <div className="explanation-label">Explanation</div>
          <p>{qitem.explanation}</p>
        </div>
      ) : null}
    </section>
  );
}
