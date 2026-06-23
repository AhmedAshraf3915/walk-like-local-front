import { useEffect, useRef, useState } from "react";

import { guideVerificationApi } from "@/features/guideVerification/api/guideVerificationApi";
import { AI_TEST_QUESTIONS } from "@/features/guideVerification/constants";
import { useVoiceRecorder } from "@/features/guideVerification/hooks/useVoiceRecorder";

const DEFAULT_TEST_DURATION_SECONDS = 180;

const LANGUAGE_TO_CODE = {
  Arabic: "ar",
  English: "en",
  German: "de",
  Italian: "it",
  Spanish: "es",
  French: "fr",
};

const SUPPORTED_LANGUAGE_CODES = new Set(Object.values(LANGUAGE_TO_CODE));

const toLanguageCode = (language) => {
  if (typeof language !== "string") return "";

  const trimmedLanguage = language.trim();
  const lowerLanguage = trimmedLanguage.toLowerCase();

  return SUPPORTED_LANGUAGE_CODES.has(lowerLanguage)
    ? lowerLanguage
    : LANGUAGE_TO_CODE[trimmedLanguage] ?? "";
};

const extractSessionId = (payload) => {
  const containers = [
    payload,
    payload?.test,
    payload?.session,
    payload?.languageTest,
    payload?.languageTestSession,
  ];

  for (const container of containers) {
    const sessionId =
      container?.sessionId ??
      container?.sessionID ??
      container?._id ??
      container?.id;

    if (sessionId) return sessionId;
  }

  return "";
};

const extractActiveSessionId = (payload) => {
  const direct =
    payload?.activeSessionId ??
    payload?.activeSession?.sessionId ??
    payload?.activeSession?._id ??
    payload?.activeSession?.id;
  if (direct) return direct;

  if (
    /active|progress|started/i.test(
      String(payload?.status ?? payload?.state ?? ""),
    )
  ) {
    return extractSessionId(payload);
  }

  const records =
    payload?.languages ??
    payload?.statuses ??
    payload?.items ??
    payload?.results ??
    Object.values(payload ?? {}).filter(
      (value) => value && typeof value === "object",
    );
  if (!Array.isArray(records)) return "";

  const activeRecord = records.find((record) =>
    /active|progress|started/i.test(
      String(record?.status ?? record?.state ?? ""),
    ),
  );

  return extractSessionId(activeRecord);
};

const normalizeQuestion = (question, index) => {
  const rawType = String(
    question?.type ??
      question?.kind ??
      question?.answerType ??
      question?.responseType ??
      "text",
  ).toLowerCase();
  const type = /voice|audio|speak|record/.test(rawType) ? "voice" : "text";

  return {
    id: String(
      question?.questionId ?? question?._id ?? question?.id ?? `q${index + 1}`,
    ),
    type,
    prompt:
      question?.prompt ??
      question?.question ??
      question?.questionText ??
      question?.instruction ??
      (type === "voice" ? "Record your spoken answer." : "Write your answer."),
    quote:
      question?.quote ??
      question?.sentence ??
      question?.content ??
      question?.text ??
      "",
    audioUrl:
      question?.audioUrl ??
      question?.audio?.secureUrl ??
      question?.audio?.url ??
      "",
  };
};

const extractQuestions = (...payloads) => {
  for (const payload of payloads) {
    const questions =
      payload?.questions ??
      payload?.session?.questions ??
      payload?.test?.questions ??
      payload?.languageTest?.questions ??
      payload?.languageTestSession?.questions;

    if (Array.isArray(questions) && questions.length > 0) {
      return questions.map(normalizeQuestion);
    }
  }

  return [];
};

const getDurationSeconds = (...payloads) => {
  for (const payload of payloads) {
    const session = payload?.session ?? payload ?? {};
    const expiresAt = session?.expiresAt ? new Date(session.expiresAt) : null;

    if (expiresAt && !Number.isNaN(expiresAt.getTime())) {
      const seconds = Math.ceil((expiresAt.getTime() - Date.now()) / 1000);
      if (seconds > 0) return seconds;
    }

    const seconds = Number(
      session?.remainingSeconds ??
        session?.timeRemainingSeconds ??
        session?.expiresIn ??
        session?.durationSeconds ??
        session?.timeLimitSeconds,
    );
    if (Number.isFinite(seconds) && seconds > 0) return seconds;

    const minutes = Number(
      session?.durationMinutes ?? session?.timeLimitMinutes,
    );
    if (Number.isFinite(minutes) && minutes > 0) return minutes * 60;

    const genericDuration = Number(session?.duration ?? session?.timeLimit);
    if (Number.isFinite(genericDuration) && genericDuration > 0) {
      // The language-test API has returned the three-minute limit as both
      // `duration: 3` and `durationSeconds: 180`. Treat small, unitless values
      // as minutes so a valid session does not expire after only three seconds.
      return genericDuration <= 30 ? genericDuration * 60 : genericDuration;
    }
  }

  return DEFAULT_TEST_DURATION_SECONDS;
};

const getSessionState = (payload) =>
  payload?.session ?? payload?.languageTestSession ?? payload ?? {};

const getInitialSessionProgress = (payload, questions) => {
  const session = getSessionState(payload);
  const progress = session?.progress ?? payload?.progress ?? {};
  const answerRecords =
    session?.answers ??
    session?.responses ??
    progress?.answers ??
    progress?.responses ??
    [];
  const textAnswers = {};
  const voiceClips = {};

  if (Array.isArray(answerRecords)) {
    answerRecords.forEach((record) => {
      const questionId = String(
        record?.questionId ?? record?.question?._id ?? record?.question?.id ?? "",
      );
      const questionIndex = questions.findIndex(
        (question) => question.id === questionId,
      );
      if (questionIndex < 0) return;

      const questionNumber = questionIndex + 1;
      const audioUrl = record?.audioUrl ?? record?.audio?.secureUrl ?? "";
      if (audioUrl) {
        voiceClips[questionNumber] = {
          asset: { secureUrl: audioUrl },
          localUrl: "",
          duration: Number(record?.duration ?? 0),
        };
      } else if (record?.answer != null) {
        textAnswers[questionNumber] = String(record.answer);
      }
    });
  }

  const currentQuestionId = String(
    progress?.currentQuestionId ?? session?.currentQuestionId ?? "",
  );
  const indexFromId = questions.findIndex(
    (question) => question.id === currentQuestionId,
  );
  const rawIndex = Number(
    progress?.currentQuestionIndex ??
      session?.currentQuestionIndex ??
      progress?.answeredCount ??
      0,
  );
  const questionIndex = Math.min(
    Math.max(indexFromId >= 0 ? indexFromId : rawIndex || 0, 0),
    Math.max(questions.length - 1, 0),
  );

  return { questionIndex, textAnswers, voiceClips };
};

const DEFAULT_QUESTIONS = AI_TEST_QUESTIONS.map(normalizeQuestion);

export const useAiAssessment = ({ setErrorMessage }) => {
  const [selectedLanguages, setSelectedLanguages] = useState([
    "Arabic",
    "English",
  ]);
  const [questions, setQuestions] = useState(DEFAULT_QUESTIONS);
  const [isAiSessionStarted, setIsAiSessionStarted] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState("");
  const [sessionLanguage, setSessionLanguage] = useState("");
  const [remainingSeconds, setRemainingSeconds] = useState(
    DEFAULT_TEST_DURATION_SECONDS,
  );
  const [aiQuestionIndex, setAiQuestionIndex] = useState(0);
  const [aiAnswers, setAiAnswers] = useState({});
  const [aiVoiceClips, setAiVoiceClips] = useState({});
  const [startingAiSession, setStartingAiSession] = useState(false);
  const [aiUploadingAudio, setAiUploadingAudio] = useState(false);
  const [submittingAiTest, setSubmittingAiTest] = useState(false);
  const [aiTestCompleted, setAiTestCompleted] = useState(false);
  const [aiSkipUsed, setAiSkipUsed] = useState(false);

  const aiVoiceClipsRef = useRef(aiVoiceClips);

  useEffect(() => {
    aiVoiceClipsRef.current = aiVoiceClips;
  }, [aiVoiceClips]);

  useEffect(() => {
    return () => {
      Object.values(aiVoiceClipsRef.current).forEach((clip) => {
        if (clip?.localUrl) URL.revokeObjectURL(clip.localUrl);
      });
    };
  }, []);

  useEffect(() => {
    if (!isAiSessionStarted || aiTestCompleted) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          setErrorMessage("The language test time has expired. Start a new session.");
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [aiTestCompleted, isAiSessionStarted, setErrorMessage]);

  useEffect(() => {
    if (!isAiSessionStarted || !activeSessionId || aiTestCompleted) {
      return undefined;
    }

    const reportEvent = (type) => {
      void guideVerificationApi
        .reportLanguageTestIntegrityEvents(activeSessionId, {
          events: [{ type, occurredAt: new Date().toISOString() }],
        })
        .catch(() => {
          // Integrity reporting must never erase the guide's assessment answers.
        });
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") reportEvent("TAB_SWITCH");
    };
    const handleBlur = () => reportEvent("FOCUS_LOSS");

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [activeSessionId, aiTestCompleted, isAiSessionStarted]);

  const handleRecordingReady = async ({
    questionNumber,
    file,
    duration,
    localUrl,
  }) => {
    setAiUploadingAudio(true);
    try {
      const uploadedAsset = await guideVerificationApi.uploadAudio(file);
      setAiVoiceClips((current) => ({
        ...current,
        [questionNumber]: { asset: uploadedAsset, localUrl, duration },
      }));
    } catch (error) {
      URL.revokeObjectURL(localUrl);
      setErrorMessage(error.message ?? "Unable to upload recording.");
    } finally {
      setAiUploadingAudio(false);
    }
  };

  const recorder = useVoiceRecorder({
    onRecordingReady: handleRecordingReady,
    onError: (message) => setErrorMessage(message),
  });

  const handleLanguageToggle = (language) => {
    setSelectedLanguages((currentLanguages) => {
      if (language === "Arabic" && currentLanguages.includes("Arabic")) {
        return currentLanguages;
      }
      return currentLanguages.includes(language)
        ? currentLanguages.filter((item) => item !== language)
        : [...currentLanguages, language];
    });
  };

  const startSession = async () => {
    const languageCodes = [
      ...new Set(selectedLanguages.map(toLanguageCode).filter(Boolean)),
    ];

    if (languageCodes.length === 0) {
      setErrorMessage("Select at least one supported language to start the test.");
      return;
    }

    const preferredLanguage =
      languageCodes.find((code) => code !== "ar") ?? languageCodes[0];

    setStartingAiSession(true);
    setErrorMessage("");

    try {
      await guideVerificationApi.updateGuideLanguages({
        languages: languageCodes,
      });
      const statusResponse = await guideVerificationApi.getLanguageTestStatus([
        preferredLanguage,
      ]);
      let nextSessionId = extractActiveSessionId(statusResponse);
      let startResponse = null;

      if (!nextSessionId) {
        startResponse = await guideVerificationApi.startLanguageTest({
          language: preferredLanguage,
        });
        nextSessionId = extractSessionId(startResponse);
      }

      if (!nextSessionId) {
        throw new Error("Language test session did not return a session ID.");
      }

      const sessionResponse =
        await guideVerificationApi.getLanguageTestSession(nextSessionId);
      const sessionQuestions = extractQuestions(sessionResponse, startResponse);

      if (sessionQuestions.length === 0) {
        throw new Error("Language test session did not return any questions.");
      }

      const sessionProgress = getInitialSessionProgress(
        sessionResponse,
        sessionQuestions,
      );
      const sessionState = getSessionState(sessionResponse);

      Object.values(aiVoiceClipsRef.current).forEach((clip) => {
        if (clip?.localUrl) URL.revokeObjectURL(clip.localUrl);
      });
      setQuestions(sessionQuestions);
      setActiveSessionId(String(nextSessionId));
      setSessionLanguage(sessionState?.language ?? preferredLanguage);
      setRemainingSeconds(getDurationSeconds(sessionResponse, startResponse));
      setAiQuestionIndex(sessionProgress.questionIndex);
      setAiAnswers(sessionProgress.textAnswers);
      setAiVoiceClips(sessionProgress.voiceClips);
      setAiTestCompleted(false);
      setIsAiSessionStarted(true);
    } catch (error) {
      setErrorMessage(error.message ?? "Unable to start language test.");
    } finally {
      setStartingAiSession(false);
    }
  };

  const handleTextAnswerChange = (questionNumber, value) => {
    setAiAnswers((current) => ({ ...current, [questionNumber]: value }));
  };

  const handleStartRecording = () => {
    const questionNumber = aiQuestionIndex + 1;
    void recorder.startRecording({
      questionNumber,
      previousClipLocalUrl: aiVoiceClips[questionNumber]?.localUrl,
    });
  };

  const handlePreviousQuestion = () => {
    setAiQuestionIndex((current) => Math.max(0, current - 1));
  };

  const resetSession = () => {
    recorder.stopRecording();
    Object.values(aiVoiceClipsRef.current).forEach((clip) => {
      if (clip?.localUrl) URL.revokeObjectURL(clip.localUrl);
    });
    setIsAiSessionStarted(false);
    setActiveSessionId("");
    setSessionLanguage("");
    setRemainingSeconds(DEFAULT_TEST_DURATION_SECONDS);
    setAiQuestionIndex(0);
    setAiAnswers({});
    setAiVoiceClips({});
    setErrorMessage("");
  };

  const submitAiAssessment = async () => {
    if (!activeSessionId) {
      setErrorMessage("Language test session is missing. Please restart the test.");
      return;
    }

    const answers = questions.map((question, index) => {
      const questionNumber = index + 1;

      return question.type === "voice"
        ? {
            questionId: question.id,
            audioUrl: aiVoiceClips[questionNumber]?.asset?.secureUrl ?? "",
          }
        : {
            questionId: question.id,
            answer: String(aiAnswers[questionNumber] ?? "").trim(),
          };
    });

    setSubmittingAiTest(true);
    setErrorMessage("");

    try {
      await guideVerificationApi.submitLanguageTest(activeSessionId, {
        answers,
      });
      setAiTestCompleted(true);
    } catch (error) {
      setErrorMessage(error.message ?? "Unable to submit AI language test.");
    } finally {
      setSubmittingAiTest(false);
    }
  };

  const handleNextQuestion = async () => {
    const currentQuestion = questions[aiQuestionIndex];
    const currentProgress = aiQuestionIndex + 1;

    if (!currentQuestion) {
      setErrorMessage("The current language-test question is unavailable.");
      return;
    }
    if (remainingSeconds <= 0) {
      setErrorMessage("The language test time has expired. Start a new session.");
      return;
    }
    if (
      currentQuestion.type === "text" &&
      !String(aiAnswers[currentProgress] ?? "").trim()
    ) {
      setErrorMessage("Please answer the current question before continuing.");
      return;
    }
    if (
      currentQuestion.type === "voice" &&
      !aiVoiceClips[currentProgress]?.asset
    ) {
      setErrorMessage("Please record and upload your voice answer before continuing.");
      return;
    }

    setErrorMessage("");

    if (currentProgress === questions.length) {
      await submitAiAssessment();
    } else {
      setAiQuestionIndex((current) => current + 1);
    }
  };

  const markSkipUsed = () => {
    setAiSkipUsed(true);
    setAiTestCompleted(true);
  };

  return {
    selectedLanguages,
    questions,
    isAiSessionStarted,
    activeSessionId,
    sessionLanguage,
    remainingSeconds,
    aiQuestionIndex,
    aiAnswers,
    aiVoiceClips,
    startingAiSession,
    aiUploadingAudio,
    submittingAiTest,
    aiTestCompleted,
    aiSkipUsed,
    isRecording: recorder.isRecording,
    recordingSeconds: recorder.recordingSeconds,
    formatDuration: recorder.formatDuration,
    handleLanguageToggle,
    startSession,
    handleTextAnswerChange,
    handleStartRecording,
    stopRecording: recorder.stopRecording,
    handlePreviousQuestion,
    handleNextQuestion,
    resetSession,
    markSkipUsed,
  };
};
