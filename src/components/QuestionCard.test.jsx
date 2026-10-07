import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ANSWER_STATUS } from "../utils";
import QuestionCard from "./QuestionCard";

const sampleQuestion = {
  id: "0",
  question: "What is the capital of France?",
  options: ["Paris", "London", "Berlin", "Rome"],
  correctAnswer: "Paris",
  topic: "Geography",
  explanation: "Paris is the capital and most populous city of France.",
};

function renderWithTooltip(ui) {
  return render(<TooltipProvider>{ui}</TooltipProvider>);
}

describe("QuestionCard component", () => {
  it("renders null if no question is provided", () => {
    const { container } = renderWithTooltip(<QuestionCard question={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders question text, topic, and options", () => {
    renderWithTooltip(
      <QuestionCard
        question={sampleQuestion}
        answered={null}
        isBookmarked={false}
        onAnswer={vi.fn()}
        onToggleBookmark={vi.fn()}
      />,
    );

    expect(screen.getByText("Geography")).toBeInTheDocument();
    expect(screen.getByText("What is the capital of France?")).toBeInTheDocument();
    expect(screen.getByText("Paris")).toBeInTheDocument();
    expect(screen.getByText("London")).toBeInTheDocument();
    expect(screen.getByText("Berlin")).toBeInTheDocument();
    expect(screen.getByText("Rome")).toBeInTheDocument();
  });

  it("calls onAnswer when an option is clicked on an unanswered question", () => {
    const onAnswer = vi.fn();
    renderWithTooltip(
      <QuestionCard
        question={sampleQuestion}
        answered={null}
        isBookmarked={false}
        onAnswer={onAnswer}
        onToggleBookmark={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText("Paris"));
    expect(onAnswer).toHaveBeenCalledWith("Paris");
  });

  it("does not call onAnswer when an option is clicked if already answered", () => {
    const onAnswer = vi.fn();
    renderWithTooltip(
      <QuestionCard
        question={sampleQuestion}
        answered={{ chosen: "Paris", status: ANSWER_STATUS.CORRECT }}
        isBookmarked={false}
        onAnswer={onAnswer}
        onToggleBookmark={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText("London"));
    expect(onAnswer).not.toHaveBeenCalled();
  });

  it("renders correct badge and explanation when answered correctly", () => {
    renderWithTooltip(
      <QuestionCard
        question={sampleQuestion}
        answered={{ chosen: "Paris", status: ANSWER_STATUS.CORRECT }}
        isBookmarked={false}
        onAnswer={vi.fn()}
        onToggleBookmark={vi.fn()}
      />,
    );

    expect(screen.getByText("Correct")).toBeInTheDocument();
    expect(screen.getByText(sampleQuestion.explanation)).toBeInTheDocument();
  });

  it("renders your answer badge when answered incorrectly", () => {
    renderWithTooltip(
      <QuestionCard
        question={sampleQuestion}
        answered={{ chosen: "London", status: ANSWER_STATUS.INCORRECT }}
        isBookmarked={false}
        onAnswer={vi.fn()}
        onToggleBookmark={vi.fn()}
      />,
    );

    expect(screen.getByText("Your answer")).toBeInTheDocument();
    expect(screen.getByText("Correct")).toBeInTheDocument();
  });

  it("renders skipped status banner when question is skipped", () => {
    renderWithTooltip(
      <QuestionCard
        question={sampleQuestion}
        answered={{ chosen: null, status: ANSWER_STATUS.SKIPPED }}
        isBookmarked={false}
        onAnswer={vi.fn()}
        onToggleBookmark={vi.fn()}
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent(/Skipped/i);
  });

  it("calls onToggleBookmark when bookmark button is clicked", () => {
    const onToggleBookmark = vi.fn();
    renderWithTooltip(
      <QuestionCard
        question={sampleQuestion}
        answered={null}
        isBookmarked={false}
        onAnswer={vi.fn()}
        onToggleBookmark={onToggleBookmark}
      />,
    );

    const bookmarkBtn = screen.getByRole("button", { name: /Bookmark question/i });
    fireEvent.click(bookmarkBtn);
    expect(onToggleBookmark).toHaveBeenCalledTimes(1);
  });
});
