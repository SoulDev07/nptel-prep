import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ANSWER_STATUS,
  buildAnswer,
  calculateStats,
  createDataSignature,
  createInitialSession,
  loadSession,
  saveSession,
  validateQuestions,
} from "../utils";

const CUSTOM_DATASETS_KEY = "nptel_prep_custom_datasets";
const ACTIVE_DATASET_KEY = "nptel_prep_active_dataset";

function loadCustomDatasets() {
  try {
    const raw = globalThis.localStorage?.getItem(CUSTOM_DATASETS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function loadActiveDatasetId() {
  return globalThis.localStorage?.getItem(ACTIVE_DATASET_KEY) || "default";
}

export function useQuiz(defaultData, onFinish) {
  const [customDatasets, setCustomDatasets] = useState(loadCustomDatasets);
  const [activeDatasetId, setActiveDatasetId] = useState(loadActiveDatasetId);

  const defaultDataset = useMemo(
    () => ({
      id: "default",
      name: "Default (NPTEL)",
      isDefault: true,
      data: defaultData,
      questionCount: Array.isArray(defaultData) ? defaultData.length : 0,
    }),
    [defaultData],
  );

  const datasets = useMemo(
    () => [defaultDataset, ...customDatasets],
    [defaultDataset, customDatasets],
  );

  const activeDataset = useMemo(
    () => datasets.find((d) => d.id === activeDatasetId) || defaultDataset,
    [datasets, activeDatasetId, defaultDataset],
  );

  const { questions, errors } = useMemo(
    () => validateQuestions(activeDataset.data),
    [activeDataset.data],
  );
  const total = questions.length;
  const signature = useMemo(() => createDataSignature(questions), [questions]);

  const [prevSignature, setPrevSignature] = useState(signature);
  const [session, setSession] = useState(() => loadSession(total, signature) || createInitialSession(total));

  if (prevSignature !== signature) {
    setPrevSignature(signature);
    setSession(loadSession(total, signature) || createInitialSession(total));
  }

  useEffect(() => {
    if (errors.length === 0 && total > 0) {
      saveSession(session, signature);
    }
  }, [session, signature, errors.length, total]);

  const qIndex = session.order[session.index];
  const currentQuestion = questions[qIndex] ?? null;
  const currentAnswer = session.answers[qIndex] ?? null;
  const isBookmarked = Boolean(session.bookmarks[qIndex]);
  const stats = useMemo(() => calculateStats(total, session.answers), [session.answers, total]);

  const answer = useCallback(
    (chosen) => {
      if (!currentQuestion || currentAnswer) return;
      setSession((prev) => ({
        ...prev,
        answers: {
          ...prev.answers,
          [qIndex]: buildAnswer(currentQuestion, chosen),
        },
      }));
    },
    [currentQuestion, currentAnswer, qIndex],
  );

  const skip = useCallback(() => {
    if (!currentQuestion || currentAnswer) return;
    setSession((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [qIndex]: buildAnswer(currentQuestion, null),
      },
    }));
  }, [currentQuestion, currentAnswer, qIndex]);

  const finish = useCallback(() => {
    setSession((prev) => ({
      ...prev,
      history: [
        ...prev.history.slice(-9),
        { completedAt: new Date().toISOString(), stats: calculateStats(total, prev.answers) },
      ],
    }));
    onFinish?.();
  }, [onFinish, total]);

  const next = useCallback(() => {
    if (session.index < session.order.length - 1) {
      setSession((prev) => ({ ...prev, index: prev.index + 1 }));
    } else {
      finish();
    }
  }, [finish, session.index, session.order.length]);

  const prev = useCallback(() => {
    setSession((prev) => ({ ...prev, index: Math.max(prev.index - 1, 0) }));
  }, []);

  const skipAndNext = useCallback(() => {
    skip();
    next();
  }, [skip, next]);

  const restart = useCallback(() => {
    setSession({ ...createInitialSession(total), dataSignature: signature });
  }, [signature, total]);

  const retryMissed = useCallback(() => {
    const missed = questions
      .map((_, i) => i)
      .filter((i) => {
        const s = session.answers[i]?.status;
        return s === ANSWER_STATUS.INCORRECT || s === ANSWER_STATUS.SKIPPED;
      });

    if (missed.length === 0) return;

    setSession((prev) => {
      const answers = { ...prev.answers };
      missed.forEach((i) => delete answers[i]);
      return { ...prev, order: missed, index: 0, answers };
    });
  }, [questions, session.answers]);

  const toggleBookmark = useCallback((idx = qIndex) => {
    setSession((prev) => {
      const bookmarks = { ...prev.bookmarks };
      if (bookmarks[idx]) delete bookmarks[idx];
      else bookmarks[idx] = true;
      return { ...prev, bookmarks };
    });
  }, [qIndex]);

  const goToIndex = useCallback((targetIndex) => {
    setSession((prev) => {
      const existing = prev.order.indexOf(targetIndex);
      return {
        ...prev,
        order: existing === -1 ? [targetIndex, ...prev.order] : prev.order,
        index: existing === -1 ? 0 : existing,
      };
    });
  }, []);

  const answerByIndex = useCallback(
    (optIdx) => {
      if (currentQuestion?.options[optIdx] != null && !currentAnswer) {
        answer(currentQuestion.options[optIdx]);
      }
    },
    [currentQuestion, currentAnswer, answer],
  );

  const selectDataset = useCallback((id) => {
    setActiveDatasetId(id);
    globalThis.localStorage?.setItem(ACTIVE_DATASET_KEY, id);
  }, []);

  const uploadDataset = useCallback((name, jsonArray) => {
    const res = validateQuestions(jsonArray);
    if (res.errors.length > 0) return { success: false, errors: res.errors };

    const newDataset = {
      id: `dataset_${Date.now()}`,
      name: name.replace(/\.json$/i, ""),
      questionCount: res.questions.length,
      isDefault: false,
      data: res.questions,
      uploadedAt: new Date().toISOString(),
    };

    setCustomDatasets((prev) => {
      const next = [newDataset, ...prev];
      globalThis.localStorage?.setItem(CUSTOM_DATASETS_KEY, JSON.stringify(next));
      return next;
    });

    selectDataset(newDataset.id);
    return { success: true, count: res.questions.length };
  }, [selectDataset]);

  const deleteDataset = useCallback(
    (id) => {
      if (id === "default") return;
      setCustomDatasets((prev) => {
        const next = prev.filter((d) => d.id !== id);
        globalThis.localStorage?.setItem(CUSTOM_DATASETS_KEY, JSON.stringify(next));
        return next;
      });
      if (activeDatasetId === id) selectDataset("default");
    },
    [activeDatasetId, selectDataset],
  );

  return {
    datasets,
    activeDataset,
    activeDatasetId,
    selectDataset,
    uploadDataset,
    deleteDataset,
    questions,
    errors,
    total,
    session,
    stats,
    currentIndex: session.index,
    currentQuestion,
    currentAnswer,
    isBookmarked,
    answer,
    skip,
    next,
    prev,
    skipAndNext,
    restart,
    retryMissed,
    toggleBookmark,
    goToIndex,
    answerByIndex,
  };
}
