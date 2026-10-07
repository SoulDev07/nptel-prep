import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  ANSWER_STATUS,
  STORAGE_KEY,
  STORAGE_VERSION,
  buildAnswer,
  calculateStats,
  createDataSignature,
  filterQuestionIndices,
  loadSession,
  normalizeSavedSession,
  saveSession,
  validateQuestions,
} from "./index";

const mockQuestions = [
  {
    id: "0",
    question: "What is React?",
    options: ["Library", "Framework", "Language"],
    correctAnswer: "Library",
    topic: "Frontend",
    explanation: "React is a UI library.",
  },
  {
    id: "1",
    question: "What is Vitest?",
    options: ["Test Runner", "Compiler", "Bundler"],
    correctAnswer: "Test Runner",
    topic: "Testing",
    explanation: "Vitest is a Vite-native test runner.",
  },
];

describe("validateQuestions", () => {
  it("normalizes and sanitizes valid questions", () => {
    const raw = [
      {
        question: "  Capital of France?  ",
        options: [" Paris ", " London ", " Berlin "],
        correctAnswer: " Paris ",
      },
    ];

    const result = validateQuestions(raw);
    expect(result.errors).toEqual([]);
    expect(result.questions[0]).toMatchObject({
      id: "0",
      question: "Capital of France?",
      options: ["Paris", "London", "Berlin"],
      correctAnswer: "Paris",
    });
  });

  it("catches structural validation errors", () => {
    const invalid = [
      {
        question: "",
        options: ["A", "A"],
        correctAnswer: "Z",
      },
    ];

    const result = validateQuestions(invalid);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        "Question 1: missing question text.",
        "Question 1: expected 3 to 5 options.",
        "Question 1: options must be unique.",
        "Question 1: correctAnswer must exactly match one option.",
      ]),
    );
  });

  it("rejects non-array or empty data inputs", () => {
    expect(validateQuestions(null).errors).toContain("Question data must be an array.");
    expect(validateQuestions([]).errors).toContain("Question data is empty.");
  });
});

describe("calculateStats", () => {
  it("accurately calculates accuracy and progress metrics", () => {
    const answers = {
      0: { status: ANSWER_STATUS.CORRECT },
      1: { status: ANSWER_STATUS.INCORRECT },
      2: { status: ANSWER_STATUS.SKIPPED, chosen: null },
    };

    const stats = calculateStats(5, answers);
    expect(stats).toMatchObject({
      total: 5,
      attempted: 3,
      correct: 1,
      incorrect: 1,
      skipped: 1,
      unanswered: 2,
      progressPct: 60,
      accuracyPct: 50,
    });
  });

  it("avoids division by zero when questions are unattempted or only skipped", () => {
    expect(calculateStats(0, {})).toMatchObject({ progressPct: 0, accuracyPct: 0 });

    const allSkipped = {
      0: { status: ANSWER_STATUS.SKIPPED },
      1: { status: ANSWER_STATUS.SKIPPED },
    };
    expect(calculateStats(2, allSkipped).accuracyPct).toBe(0);
  });
});

describe("session persistence & recovery", () => {
  const signature = createDataSignature(mockQuestions);
  let storage;

  beforeEach(() => {
    storage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
    };
  });

  it("rejects corrupted, outdated, or mismatched session data", () => {
    expect(normalizeSavedSession({ version: 1, dataSignature: signature, order: [0, 1] }, 2, signature)).toBeNull();
    expect(normalizeSavedSession({ version: STORAGE_VERSION, dataSignature: "old_sig", order: [0, 1] }, 2, signature)).toBeNull();
    expect(normalizeSavedSession({ version: STORAGE_VERSION, dataSignature: signature, order: [0, 99] }, 2, signature)).toBeNull();
  });

  it("loads and saves sessions with versioning and data signatures", () => {
    const session = {
      version: STORAGE_VERSION,
      dataSignature: signature,
      order: [1, 0],
      index: 1,
      answers: { 1: { chosen: "Test Runner", status: ANSWER_STATUS.CORRECT } },
      bookmarks: { 0: true },
      history: [],
    };

    storage.getItem.mockReturnValue(JSON.stringify(session));
    const loaded = loadSession(2, signature, storage);
    expect(loaded).toMatchObject({ order: [1, 0], index: 1 });

    saveSession(session, signature, storage);
    expect(storage.setItem).toHaveBeenCalledWith(
      `${STORAGE_KEY}_${signature}`,
      expect.stringContaining(signature),
    );
  });
});

describe("review filters & answers", () => {
  it("builds correct answer statuses with timestamps", () => {
    expect(buildAnswer(mockQuestions[0], "Library").status).toBe(ANSWER_STATUS.CORRECT);
    expect(buildAnswer(mockQuestions[0], "Framework").status).toBe(ANSWER_STATUS.INCORRECT);
    expect(buildAnswer(mockQuestions[0], null).status).toBe(ANSWER_STATUS.SKIPPED);
  });

  it("filters review questions by status, bookmarks, and unanswered", () => {
    const answers = {
      0: { status: ANSWER_STATUS.CORRECT },
      1: { status: ANSWER_STATUS.INCORRECT },
    };
    const bookmarks = { 1: true };

    expect(filterQuestionIndices({ filter: "correct", questions: mockQuestions, answers, bookmarks })).toEqual([0]);
    expect(filterQuestionIndices({ filter: "incorrect", questions: mockQuestions, answers, bookmarks })).toEqual([1]);
    expect(filterQuestionIndices({ filter: "bookmarked", questions: mockQuestions, answers, bookmarks })).toEqual([1]);
    expect(filterQuestionIndices({ filter: "all", questions: mockQuestions, answers, bookmarks })).toEqual([0, 1]);
  });
});
