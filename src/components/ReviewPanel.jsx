import { ANSWER_STATUS, filterQuestionIndices } from "../utils";
import { BookmarkIcon } from "./Icons";

const FILTERS = ["all", "correct", "incorrect", "skipped", "unanswered", "bookmarked"];

export default function ReviewPanel({ questions, answers, bookmarks, filter, onFilterChange, onBack, onJumpToQuestion, onToggleBookmark }) {
  const indices = filterQuestionIndices({ filter, questions, answers, bookmarks });

  return (
    <section className="review-view">
      <div className="review-header">
        <div>
          <h2>Review</h2>
          <p>Compare your answers with the correct answers and mark questions for later.</p>
        </div>
        <button className="btn" type="button" onClick={onBack}>
          Back to quiz
        </button>
      </div>

      <div className="filter-tabs" role="tablist" aria-label="Review filters">
        {FILTERS.map((item) => (
          <button
            key={item}
            className={`filter-tab ${filter === item ? "active" : ""}`}
            type="button"
            onClick={() => onFilterChange(item)}
            role="tab"
            aria-selected={filter === item}
          >
            {item}
          </button>
        ))}
      </div>

      {indices.length === 0 ? (
        <div className="card empty-state">No questions match this filter.</div>
      ) : (
        <div className="review-list">
          {indices.map((questionIndex) => {
            const question = questions[questionIndex];
            const answer = answers[questionIndex];
            const status = answer?.status || "unanswered";
            const isSkipped = status === ANSWER_STATUS.SKIPPED || answer?.chosen == null;

            return (
              <article className={`review-item ${status}`} key={question.id}>
                <div className="review-item-top">
                  <span className="status-pill">{status}</span>
                  <button
                    className={`link-btn icon-btn ${bookmarks[questionIndex] ? "active" : ""}`}
                    type="button"
                    onClick={() => onToggleBookmark(questionIndex)}
                    aria-label={bookmarks[questionIndex] ? "Remove bookmark" : "Bookmark question"}
                    title={bookmarks[questionIndex] ? "Remove bookmark" : "Bookmark question"}
                  >
                    <BookmarkIcon filled={Boolean(bookmarks[questionIndex])} />
                  </button>
                </div>
                <h3>{question.question}</h3>
                <dl className="answer-pairs">
                  <div>
                    <dt>Your answer</dt>
                    <dd>{!answer ? "Unanswered" : isSkipped ? "Skipped" : answer.chosen}</dd>
                  </div>
                  <div>
                    <dt>Correct answer</dt>
                    <dd>{question.correctAnswer}</dd>
                  </div>
                </dl>
                {question.explanation ? <p className="review-explanation">{question.explanation}</p> : null}
                <button className="btn small" type="button" onClick={() => onJumpToQuestion(questionIndex)}>
                  Open question
                </button>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
