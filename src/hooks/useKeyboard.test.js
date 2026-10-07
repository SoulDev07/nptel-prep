import { fireEvent, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import useKeyboard from "./useKeyboard";

describe("useKeyboard hook", () => {
  let handlers;

  beforeEach(() => {
    handlers = {
      onPrev: vi.fn(),
      onNext: vi.fn(),
      onAnswerByIndex: vi.fn(),
      onFocusMove: vi.fn(),
      onRestart: vi.fn(),
      onHelp: vi.fn(),
    };
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("handles navigation shortcuts: ArrowLeft, a, A, ArrowRight, d, D", () => {
    renderHook(() => useKeyboard(handlers));

    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(handlers.onPrev).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: "a" });
    expect(handlers.onPrev).toHaveBeenCalledTimes(2);

    fireEvent.keyDown(window, { key: "A" });
    expect(handlers.onPrev).toHaveBeenCalledTimes(3);

    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(handlers.onNext).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: "d" });
    expect(handlers.onNext).toHaveBeenCalledTimes(2);

    fireEvent.keyDown(window, { key: "D" });
    expect(handlers.onNext).toHaveBeenCalledTimes(3);
  });

  it("handles number shortcuts for answering options 1-5", () => {
    renderHook(() => useKeyboard(handlers));

    fireEvent.keyDown(window, { key: "1" });
    expect(handlers.onAnswerByIndex).toHaveBeenCalledWith(0);

    fireEvent.keyDown(window, { key: "3" });
    expect(handlers.onAnswerByIndex).toHaveBeenCalledWith(2);

    fireEvent.keyDown(window, { key: "5" });
    expect(handlers.onAnswerByIndex).toHaveBeenCalledWith(4);

    fireEvent.keyDown(window, { key: "6" });
    expect(handlers.onAnswerByIndex).toHaveBeenCalledTimes(3);
  });

  it("handles focus movement shortcuts: w, W, s, S", () => {
    renderHook(() => useKeyboard(handlers));

    fireEvent.keyDown(window, { key: "w" });
    expect(handlers.onFocusMove).toHaveBeenCalledWith(-1);

    fireEvent.keyDown(window, { key: "W" });
    expect(handlers.onFocusMove).toHaveBeenCalledWith(-1);

    fireEvent.keyDown(window, { key: "s" });
    expect(handlers.onFocusMove).toHaveBeenCalledWith(1);

    fireEvent.keyDown(window, { key: "S" });
    expect(handlers.onFocusMove).toHaveBeenCalledWith(1);
  });

  it("handles restart and help shortcuts: r, R, ?, h, H", () => {
    renderHook(() => useKeyboard(handlers));

    fireEvent.keyDown(window, { key: "r" });
    expect(handlers.onRestart).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: "R" });
    expect(handlers.onRestart).toHaveBeenCalledTimes(2);

    fireEvent.keyDown(window, { key: "?" });
    expect(handlers.onHelp).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: "h" });
    expect(handlers.onHelp).toHaveBeenCalledTimes(2);

    fireEvent.keyDown(window, { key: "H" });
    expect(handlers.onHelp).toHaveBeenCalledTimes(3);
  });

  it("ignores key events when focus is inside input or textarea", () => {
    renderHook(() => useKeyboard(handlers));

    const input = document.createElement("input");
    document.body.appendChild(input);

    fireEvent.keyDown(input, { key: "a" });
    fireEvent.keyDown(input, { key: "1" });
    fireEvent.keyDown(input, { key: "r" });

    expect(handlers.onPrev).not.toHaveBeenCalled();
    expect(handlers.onAnswerByIndex).not.toHaveBeenCalled();
    expect(handlers.onRestart).not.toHaveBeenCalled();
  });

  it("ignores key events when open dialog is present", () => {
    const dialog = document.createElement("div");
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("data-state", "open");
    document.body.appendChild(dialog);

    renderHook(() => useKeyboard(handlers));

    fireEvent.keyDown(window, { key: "ArrowLeft" });
    fireEvent.keyDown(window, { key: "1" });

    expect(handlers.onPrev).not.toHaveBeenCalled();
    expect(handlers.onAnswerByIndex).not.toHaveBeenCalled();
  });

  it("removes event listener on unmount", () => {
    const { unmount } = renderHook(() => useKeyboard(handlers));

    unmount();

    fireEvent.keyDown(window, { key: "a" });
    expect(handlers.onPrev).not.toHaveBeenCalled();
  });
});
