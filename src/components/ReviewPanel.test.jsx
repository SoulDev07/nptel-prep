import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ANSWER_STATUS } from "../utils";
import ReviewPanel from "./ReviewPanel";

const mockQuestions = [
  {
    id: "0",
    question: "Question 1?",
    options: ["A", "B", "C"],
    correctAnswer: "A",
    explanation: "Explanation 1",
  },
  {
    id: "1",
    question: "Question 2?",
    options: ["X", "Y", "Z"],
    correctAnswer: "Y",
    explanation: "Explanation 2",
  },
];

function renderWithTooltip(ui) {
  return render(<TooltipProvider>{ui}</TooltipProvider>);
}

describe("ReviewPanel component", () => {
  const answers = {
    0: { chosen: "A", status: ANSWER_STATUS.CORRECT },
    1: { chosen: "X", status: ANSWER_STATUS.INCORRECT },
  };
  const bookmarks = { 0: true };

  it("renders review heading, tabs, and question cards", () => {
    renderWithTooltip(
      <ReviewPanel
        questions={mockQuestions}
        answers={answers}
        bookmarks={bookmarks}
        filter="all"
        onFilterChange={vi.fn()}
        onBack={vi.fn()}
        onJumpToQuestion={vi.fn()}
        onToggleBookmark={vi.fn()}
      />,
    );

    expect(screen.getByText("Review session")).toBeInTheDocument();
    expect(screen.getByText("Question 1?")).toBeInTheDocument();
    expect(screen.getByText("Question 2?")).toBeInTheDocument();
  });

  it("calls onBack when back button is clicked", () => {
    const onBack = vi.fn();
    renderWithTooltip(
      <ReviewPanel
        questions={mockQuestions}
        answers={answers}
        bookmarks={bookmarks}
        filter="all"
        onFilterChange={vi.fn()}
        onBack={onBack}
        onJumpToQuestion={vi.fn()}
        onToggleBookmark={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Back to quiz/i }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("displays empty state when filter matches no questions", () => {
    renderWithTooltip(
      <ReviewPanel
        questions={mockQuestions}
        answers={answers}
        bookmarks={bookmarks}
        filter="skipped"
        onFilterChange={vi.fn()}
        onBack={vi.fn()}
        onJumpToQuestion={vi.fn()}
        onToggleBookmark={vi.fn()}
      />,
    );

    expect(screen.getByText(/No questions found for the “skipped” filter/i)).toBeInTheDocument();
  });

  it("calls onJumpToQuestion when 'Open question' button is clicked", () => {
    const onJumpToQuestion = vi.fn();
    renderWithTooltip(
      <ReviewPanel
        questions={mockQuestions}
        answers={answers}
        bookmarks={bookmarks}
        filter="all"
        onFilterChange={vi.fn()}
        onBack={vi.fn()}
        onJumpToQuestion={onJumpToQuestion}
        onToggleBookmark={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Open question 1/i }));
    expect(onJumpToQuestion).toHaveBeenCalledWith(0);
  });

  it("calls onToggleBookmark when bookmark button is clicked", () => {
    const onToggleBookmark = vi.fn();
    renderWithTooltip(
      <ReviewPanel
        questions={mockQuestions}
        answers={answers}
        bookmarks={bookmarks}
        filter="all"
        onFilterChange={vi.fn()}
        onBack={vi.fn()}
        onJumpToQuestion={vi.fn()}
        onToggleBookmark={onToggleBookmark}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Remove bookmark for question 1/i }));
    expect(onToggleBookmark).toHaveBeenCalledWith(0);
  });
});
