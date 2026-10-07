import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ANSWER_STATUS } from "../utils";
import { useQuiz } from "./useQuiz";

const sampleQuestions = [
  {
    id: "q0",
    question: "Question 1?",
    options: ["Option A", "Option B", "Option C"],
    correctAnswer: "Option A",
    topic: "Topic 1",
    explanation: "Exp 1",
  },
  {
    id: "q1",
    question: "Question 2?",
    options: ["Alpha", "Beta", "Gamma"],
    correctAnswer: "Beta",
    topic: "Topic 2",
    explanation: "Exp 2",
  },
  {
    id: "q2",
    question: "Question 3?",
    options: ["Red", "Green", "Blue"],
    correctAnswer: "Blue",
    topic: "Topic 3",
    explanation: "Exp 3",
  },
];

describe("useQuiz hook", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("initializes quiz state correctly with default questions", () => {
    const { result } = renderHook(() => useQuiz(sampleQuestions));

    expect(result.current.total).toBe(3);
    expect(result.current.errors).toEqual([]);
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.currentQuestion).toBeDefined();
    expect(result.current.currentAnswer).toBeNull();
    expect(result.current.isBookmarked).toBe(false);
    expect(result.current.stats).toMatchObject({
      total: 3,
      attempted: 0,
      correct: 0,
      incorrect: 0,
      skipped: 0,
      unanswered: 3,
    });
  });

  it("records answers correctly and prevents changing answered questions", () => {
    const { result } = renderHook(() => useQuiz(sampleQuestions));
    const currentQ = result.current.currentQuestion;

    act(() => {
      result.current.answer(currentQ.correctAnswer);
    });

    expect(result.current.currentAnswer).toMatchObject({
      chosen: currentQ.correctAnswer,
      status: ANSWER_STATUS.CORRECT,
    });
    expect(result.current.stats.correct).toBe(1);
    expect(result.current.stats.attempted).toBe(1);

    act(() => {
      result.current.answer("Different Answer");
    });
    expect(result.current.currentAnswer.chosen).toBe(currentQ.correctAnswer);
  });

  it("answers by index using answerByIndex", () => {
    const { result } = renderHook(() => useQuiz(sampleQuestions));
    const currentQ = result.current.currentQuestion;

    act(() => {
      result.current.answerByIndex(0);
    });

    expect(result.current.currentAnswer.chosen).toBe(currentQ.options[0]);
  });

  it("skips questions and updates stats", () => {
    const { result } = renderHook(() => useQuiz(sampleQuestions));

    act(() => {
      result.current.skip();
    });

    expect(result.current.currentAnswer).toMatchObject({
      chosen: null,
      status: ANSWER_STATUS.SKIPPED,
    });
    expect(result.current.stats.skipped).toBe(1);
  });

  it("navigates forward and backward, clamping at boundary", () => {
    const { result } = renderHook(() => useQuiz(sampleQuestions));

    expect(result.current.currentIndex).toBe(0);

    act(() => {
      result.current.prev();
    });
    expect(result.current.currentIndex).toBe(0);

    act(() => {
      result.current.next();
    });
    expect(result.current.currentIndex).toBe(1);

    act(() => {
      result.current.prev();
    });
    expect(result.current.currentIndex).toBe(0);
  });

  it("skipAndNext skips the current question and moves to next", () => {
    const { result } = renderHook(() => useQuiz(sampleQuestions));

    act(() => {
      result.current.skipAndNext();
    });

    expect(result.current.currentIndex).toBe(1);
    expect(result.current.stats.skipped).toBe(1);
  });

  it("calls onFinish and records history when advancing beyond last question", () => {
    const onFinish = vi.fn();
    const { result } = renderHook(() => useQuiz(sampleQuestions, onFinish));

    act(() => {
      result.current.next();
    });
    act(() => {
      result.current.next();
    });
    expect(result.current.currentIndex).toBe(2);

    act(() => {
      result.current.next();
    });

    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(result.current.session.history).toHaveLength(1);
  });

  it("toggles bookmark on current question", () => {
    const { result } = renderHook(() => useQuiz(sampleQuestions));

    expect(result.current.isBookmarked).toBe(false);

    act(() => {
      result.current.toggleBookmark();
    });
    expect(result.current.isBookmarked).toBe(true);

    act(() => {
      result.current.toggleBookmark();
    });
    expect(result.current.isBookmarked).toBe(false);
  });

  it("navigates to question using goToIndex", () => {
    const { result } = renderHook(() => useQuiz(sampleQuestions));

    act(() => {
      result.current.goToIndex(2);
    });

    expect(result.current.currentQuestion.id).toBe(sampleQuestions[2].id);
  });

  it("restarts session and resets answers", () => {
    const { result } = renderHook(() => useQuiz(sampleQuestions));

    act(() => {
      result.current.answer("Option A");
    });
    expect(result.current.stats.attempted).toBe(1);

    act(() => {
      result.current.restart();
    });

    expect(result.current.currentIndex).toBe(0);
    expect(result.current.stats.attempted).toBe(0);
    expect(result.current.currentAnswer).toBeNull();
  });

  it("retries missed questions", () => {
    const { result } = renderHook(() => useQuiz(sampleQuestions));
    const currentQ = result.current.currentQuestion;

    const wrongOpt = currentQ.options.find((o) => o !== currentQ.correctAnswer);
    act(() => {
      result.current.answer(wrongOpt);
    });

    act(() => {
      result.current.next();
    });
    act(() => {
      result.current.skip();
    });

    expect(result.current.stats.incorrect).toBe(1);
    expect(result.current.stats.skipped).toBe(1);

    act(() => {
      result.current.retryMissed();
    });

    expect(result.current.session.order).toHaveLength(2);
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.stats.attempted).toBe(0);
  });

  it("handles custom dataset upload, selection, and deletion", () => {
    const { result } = renderHook(() => useQuiz(sampleQuestions));

    let uploadRes;
    act(() => {
      uploadRes = result.current.uploadDataset("invalid.json", [{ question: "Too few options", options: ["A"] }]);
    });
    expect(uploadRes.success).toBe(false);
    expect(uploadRes.errors.length).toBeGreaterThan(0);

    const validCustom = [
      {
        question: "Custom Q1?",
        options: ["Ans 1", "Ans 2", "Ans 3"],
        correctAnswer: "Ans 1",
      },
    ];

    act(() => {
      uploadRes = result.current.uploadDataset("custom-data.json", validCustom);
    });

    expect(uploadRes.success).toBe(true);
    expect(result.current.datasets).toHaveLength(2);
    expect(result.current.activeDataset.name).toBe("custom-data");
    expect(result.current.total).toBe(1);

    const customId = result.current.activeDataset.id;
    act(() => {
      result.current.deleteDataset(customId);
    });

    expect(result.current.datasets).toHaveLength(1);
    expect(result.current.activeDataset.id).toBe("default");
  });
});
