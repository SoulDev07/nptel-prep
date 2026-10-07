import { useEffect } from "react";

export default function useKeyboard({
  onPrev = () => {},
  onNext = () => {},
  onAnswerByIndex = () => {},
  onFocusMove = () => {},
  onRestart = () => {},
  onHelp = () => {},
}) {
  useEffect(() => {
    function onKey(e) {
      const tag = e.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || e.target?.isContentEditable) return;

      if (
        document.querySelector('[role="dialog"][data-state="open"]') ||
        document.querySelector('[role="alertdialog"][data-state="open"]') ||
        e.target?.closest?.('[role="dialog"]') ||
        e.target?.closest?.('[role="alertdialog"]')
      ) {
        return;
      }

      if (e.key === "w" || e.key === "W") {
        e.preventDefault();
        onFocusMove(-1);
        return;
      }
      if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        onFocusMove(1);
        return;
      }

      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        e.preventDefault();
        onPrev();
        return;
      }
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        e.preventDefault();
        onNext();
        return;
      }

      if (["1", "2", "3", "4", "5"].includes(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        e.preventDefault();
        onAnswerByIndex(idx);
        return;
      }

      if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        onRestart();
        return;
      }

      if (e.key === "?" || e.key === "h" || e.key === "H") {
        e.preventDefault();
        onHelp();
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onPrev, onNext, onAnswerByIndex, onFocusMove, onRestart, onHelp]);
}
