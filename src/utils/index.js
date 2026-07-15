export const STORAGE_KEY = "nptel_prep_state_v2";
export const STORAGE_VERSION = 2;

export const ANSWER_STATUS = {
  CORRECT: "correct",
  INCORRECT: "incorrect",
  SKIPPED: "skipped",
};

export function shuffleIndices(n) {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function validateQuestions(data) {
  if (!Array.isArray(data)) {
    return { questions: [], errors: ["Question data must be an array."] };
  }

  const errors = [];
  const questions = [];

  data.forEach((item, index) => {
    const label = `Question ${index + 1}`;
    const question = normalizeText(item?.question);
    const correctAnswer = normalizeText(item?.correctAnswer);
    const options = Array.isArray(item?.options) ? item.options.map(normalizeText).filter(Boolean) : [];
    const uniqueOptions = new Set(options);

    if (!question) errors.push(`${label}: missing question text.`);
    if (options.length < 3 || options.length > 5) errors.push(`${label}: expected 3 to 5 options.`);
    if (uniqueOptions.size !== options.length) errors.push(`${label}: options must be unique.`);
    if (!correctAnswer) errors.push(`${label}: missing correctAnswer.`);
    if (correctAnswer && !uniqueOptions.has(correctAnswer)) {
      errors.push(`${label}: correctAnswer must exactly match one option.`);
    }

    questions.push({
      id: String(item?.id ?? index),
      question,
      options,
      correctAnswer,
      explanation: normalizeText(item?.explanation),
      topic: normalizeText(item?.topic),
    });
  });

  if (questions.length === 0) errors.push("Question data is empty.");

  return { questions, errors };
}

export function createDataSignature(questions) {
  return questions
    .map((question) => `${question.id}:${question.question}:${question.correctAnswer}:${question.options.length}`)
    .join("|");
}

export function createInitialSession(total) {
  return {
    version: STORAGE_VERSION,
    order: shuffleIndices(total),
    index: 0,
    answers: {},
    bookmarks: {},
    history: [],
  };
}

export function isValidOrder(order, total) {
  if (!Array.isArray(order) || order.length !== total) return false;
  const values = new Set(order);
  return values.size === total && order.every((item) => Number.isInteger(item) && item >= 0 && item < total);
}

export function normalizeSavedSession(saved, total, dataSignature) {
  if (
    !saved ||
    saved.version !== STORAGE_VERSION ||
    saved.dataSignature !== dataSignature ||
    !isValidOrder(saved.order, total)
  ) {
    return null;
  }

  return {
    version: STORAGE_VERSION,
    dataSignature,
    order: saved.order,
    index: Math.min(Math.max(Number(saved.index) || 0, 0), Math.max(total - 1, 0)),
    answers: saved.answers && typeof saved.answers === "object" ? saved.answers : {},
    bookmarks: saved.bookmarks && typeof saved.bookmarks === "object" ? saved.bookmarks : {},
    history: Array.isArray(saved.history) ? saved.history : [],
  };
}

export function loadSession(total, dataSignature, storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (!raw) return null;
    return normalizeSavedSession(JSON.parse(raw), total, dataSignature);
  } catch {
    return null;
  }
}

export function saveSession(session, dataSignature, storage = globalThis.localStorage) {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify({ ...session, version: STORAGE_VERSION, dataSignature }));
  } catch (error) {
    console.warn("Unable to save quiz session", error);
  }
}

export function getAnswerStatus(question, chosen) {
  if (chosen == null) return ANSWER_STATUS.SKIPPED;
  return String(chosen) === String(question.correctAnswer) ? ANSWER_STATUS.CORRECT : ANSWER_STATUS.INCORRECT;
}

export function buildAnswer(question, chosen) {
  const status = getAnswerStatus(question, chosen);
  return {
    chosen,
    status,
    correct: status === ANSWER_STATUS.CORRECT,
    answeredAt: new Date().toISOString(),
  };
}

export function calculateStats(total, answers = {}) {
  const values = Object.values(answers);
  const correct = values.filter((answer) => answer.status === ANSWER_STATUS.CORRECT || answer.correct === true).length;
  const incorrect = values.filter((answer) => answer.status === ANSWER_STATUS.INCORRECT).length;
  const skipped = values.filter((answer) => answer.status === ANSWER_STATUS.SKIPPED || (!answer.status && answer.chosen == null)).length;
  const attempted = values.length;
  const unanswered = Math.max(total - attempted, 0);

  return {
    total,
    attempted,
    correct,
    incorrect,
    skipped,
    unanswered,
    progressPct: total === 0 ? 0 : Math.round((attempted / total) * 100),
    accuracyPct: attempted - skipped <= 0 ? 0 : Math.round((correct / (attempted - skipped)) * 100),
  };
}

export function filterQuestionIndices({ filter, questions, answers, bookmarks }) {
  return questions
    .map((_, index) => index)
    .filter((index) => {
      const answer = answers[index];
      const isBookmarked = Boolean(bookmarks[index]);

      if (filter === "correct") return answer?.status === ANSWER_STATUS.CORRECT || answer?.correct === true;
      if (filter === "incorrect") return answer?.status === ANSWER_STATUS.INCORRECT;
      if (filter === "skipped") return answer?.status === ANSWER_STATUS.SKIPPED || (answer && !answer.status && answer.chosen == null);
      if (filter === "unanswered") return !answer;
      if (filter === "bookmarked") return isBookmarked;
      return true;
    });
}
