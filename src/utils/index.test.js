import { describe, expect, it, vi } from "vitest";
import {
  ANSWER_STATUS,
  buildAnswer,
  calculateStats,
  createDataSignature,
  filterQuestionIndices,
  loadSession,
  normalizeSavedSession,
  saveSession,
  validateQuestions,
} from "./index";

const questions = [
  {
    id: "0",
    question: "Capital?",
    options: ["Delhi", "Mumbai", "Chennai"],
    correctAnswer: "Delhi",
  },
  {
    id: "1",
    question: "Year?",
    options: ["1990", "1991", "1992"],
    correctAnswer: "1992",
  },
];

describe("validateQuestions", () => {
  it("normalizes valid question data", () => {
    const result = validateQuestions([{ question: " Q ", options: [" A ", "B", "C"], correctAnswer: "A" }]);

    expect(result.errors).toEqual([]);
    expect(result.questions[0]).toMatchObject({
      id: "0",
      question: "Q",
      options: ["A", "B", "C"],
      correctAnswer: "A",
    });
  });

  it("reports actionable invalid data errors", () => {
    const result = validateQuestions([{ question: "", options: ["A", "A"], correctAnswer: "Z" }]);

    expect(result.errors).toEqual(
      expect.arrayContaining([
        "Question 1: missing question text.",
        "Question 1: expected 3 to 5 options.",
        "Question 1: options must be unique.",
        "Question 1: correctAnswer must exactly match one option.",
      ]),
    );
  });
});

describe("answers and stats", () => {
  it("builds explicit answer statuses", () => {
    expect(buildAnswer(questions[0], "Delhi").status).toBe(ANSWER_STATUS.CORRECT);
    expect(buildAnswer(questions[0], "Mumbai").status).toBe(ANSWER_STATUS.INCORRECT);
    expect(buildAnswer(questions[0], null).status).toBe(ANSWER_STATUS.SKIPPED);
  });

  it("separates completion from accuracy", () => {
    const stats = calculateStats(4, {
      0: { status: ANSWER_STATUS.CORRECT },
      1: { status: ANSWER_STATUS.INCORRECT },
      2: { status: ANSWER_STATUS.SKIPPED, chosen: null },
    });

    expect(stats).toMatchObject({
      attempted: 3,
      correct: 1,
      incorrect: 1,
      skipped: 1,
      unanswered: 1,
      progressPct: 75,
      accuracyPct: 50,
    });
  });
});

describe("persistence", () => {
  it("rejects stale saved sessions", () => {
    const signature = createDataSignature(questions);

    expect(normalizeSavedSession({ version: 1 }, 2, signature)).toBeNull();
    expect(normalizeSavedSession({ version: 2, dataSignature: "old", order: [0, 1] }, 2, signature)).toBeNull();
  });

  it("loads and saves versioned sessions", () => {
    const storage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
    };
    const signature = createDataSignature(questions);
    const session = { version: 2, dataSignature: signature, order: [1, 0], index: 1, answers: {}, bookmarks: {}, history: [] };

    storage.getItem.mockReturnValue(JSON.stringify(session));
    expect(loadSession(2, signature, storage)).toMatchObject({ order: [1, 0], index: 1 });

    saveSession(session, signature, storage);
    expect(storage.setItem).toHaveBeenCalledWith(expect.any(String), expect.stringContaining(signature));
  });
});

describe("filterQuestionIndices", () => {
  it("filters review questions by status and bookmarks", () => {
    const answers = {
      0: { status: ANSWER_STATUS.CORRECT },
      1: { status: ANSWER_STATUS.SKIPPED, chosen: null },
    };

    expect(filterQuestionIndices({ filter: "correct", questions, answers, bookmarks: {} })).toEqual([0]);
    expect(filterQuestionIndices({ filter: "skipped", questions, answers, bookmarks: {} })).toEqual([1]);
    expect(filterQuestionIndices({ filter: "bookmarked", questions, answers, bookmarks: { 1: true } })).toEqual([1]);
  });
});
