/* @vitest-environment jsdom */
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useAiAssessment } from "@/features/guideVerification/hooks/useAiAssessment";

const apiMocks = vi.hoisted(() => ({
  updateGuideLanguages: vi.fn(),
  getLanguageTestStatus: vi.fn(),
  startLanguageTest: vi.fn(),
  getLanguageTestSession: vi.fn(),
  submitLanguageTest: vi.fn(),
  reportLanguageTestIntegrityEvents: vi.fn(),
  uploadAudio: vi.fn(),
}));

vi.mock("@/features/guideVerification/api/guideVerificationApi", () => ({
  guideVerificationApi: apiMocks,
}));

vi.mock("@/features/guideVerification/hooks/useVoiceRecorder", () => ({
  useVoiceRecorder: () => ({
    isRecording: false,
    recordingSeconds: 0,
    startRecording: vi.fn(),
    stopRecording: vi.fn(),
    formatDuration: vi.fn(() => "00:00"),
  }),
}));

describe("useAiAssessment", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    apiMocks.updateGuideLanguages.mockResolvedValue({});
    apiMocks.getLanguageTestStatus.mockResolvedValue({});
    apiMocks.startLanguageTest.mockResolvedValue({ sessionId: "session-1" });
    apiMocks.getLanguageTestSession.mockResolvedValue({
      session: {
        _id: "session-1",
        durationSeconds: 180,
        questions: [
          {
            questionId: "server-q1",
            type: "text",
            prompt: "Answer the question returned by the API.",
          },
        ],
      },
    });
    apiMocks.submitLanguageTest.mockResolvedValue({ status: "SUBMITTED" });
    apiMocks.reportLanguageTestIntegrityEvents.mockResolvedValue({});
    apiMocks.uploadAudio.mockResolvedValue({
      secureUrl: "https://example.com/answer.mp3",
    });
  });

  it("saves selected languages before checking and starting the test", async () => {
    const setErrorMessage = vi.fn();
    const { result } = renderHook(() =>
      useAiAssessment({ setErrorMessage }),
    );

    await act(async () => {
      await result.current.startSession();
    });

    expect(apiMocks.updateGuideLanguages).toHaveBeenCalledWith({
      languages: ["ar", "en"],
    });
    expect(apiMocks.getLanguageTestStatus).toHaveBeenCalledWith(["en"]);
    expect(apiMocks.startLanguageTest).toHaveBeenCalledWith({ language: "en" });
    expect(apiMocks.getLanguageTestSession).toHaveBeenCalledWith("session-1");
    expect(
      apiMocks.updateGuideLanguages.mock.invocationCallOrder[0],
    ).toBeLessThan(apiMocks.getLanguageTestStatus.mock.invocationCallOrder[0]);
    expect(
      apiMocks.getLanguageTestStatus.mock.invocationCallOrder[0],
    ).toBeLessThan(apiMocks.startLanguageTest.mock.invocationCallOrder[0]);
    expect(
      apiMocks.startLanguageTest.mock.invocationCallOrder[0],
    ).toBeLessThan(apiMocks.getLanguageTestSession.mock.invocationCallOrder[0]);
    expect(result.current.isAiSessionStarted).toBe(true);
    expect(result.current.questions[0]).toMatchObject({
      id: "server-q1",
      prompt: "Answer the question returned by the API.",
    });
  });

  it("reads the session ID from the test object returned by the start endpoint", async () => {
    apiMocks.startLanguageTest.mockResolvedValue({
      test: {
        sessionId: "nested-session",
        questions: [
          { questionId: "nested-q1", type: "text", prompt: "Nested question" },
        ],
      },
    });
    apiMocks.getLanguageTestSession.mockResolvedValue({
      session: {
        sessionId: "nested-session",
        questions: [
          { questionId: "nested-q1", type: "text", prompt: "Nested question" },
        ],
      },
    });
    const setErrorMessage = vi.fn();
    const { result } = renderHook(() =>
      useAiAssessment({ setErrorMessage }),
    );

    await act(async () => {
      await result.current.startSession();
    });

    expect(apiMocks.getLanguageTestSession).toHaveBeenCalledWith(
      "nested-session",
    );
    expect(result.current.activeSessionId).toBe("nested-session");
    expect(result.current.isAiSessionStarted).toBe(true);
    expect(setErrorMessage).not.toHaveBeenCalledWith(
      "Language test session did not return a session ID.",
    );
  });

  it("treats the API's unitless three-minute duration as 180 seconds", async () => {
    apiMocks.getLanguageTestSession.mockResolvedValue({
      session: {
        _id: "session-1",
        duration: 3,
        questions: [
          { questionId: "server-q1", type: "text", prompt: "Continue" },
        ],
      },
    });
    const { result } = renderHook(() =>
      useAiAssessment({ setErrorMessage: vi.fn() }),
    );

    await act(async () => {
      await result.current.startSession();
    });

    expect(result.current.remainingSeconds).toBe(180);
  });

  it("maps every offered language, including French, to its API code", async () => {
    const { result } = renderHook(() =>
      useAiAssessment({ setErrorMessage: vi.fn() }),
    );

    act(() => {
      result.current.handleLanguageToggle("French");
    });
    await act(async () => {
      await result.current.startSession();
    });

    expect(apiMocks.updateGuideLanguages).toHaveBeenCalledWith({
      languages: ["ar", "en", "fr"],
    });
  });

  it("does not call the test endpoints when saving languages fails", async () => {
    const setErrorMessage = vi.fn();
    apiMocks.updateGuideLanguages.mockRejectedValue(
      new Error("Unable to save guide languages."),
    );
    const { result } = renderHook(() =>
      useAiAssessment({ setErrorMessage }),
    );

    await act(async () => {
      await result.current.startSession();
    });

    expect(apiMocks.getLanguageTestStatus).not.toHaveBeenCalled();
    expect(apiMocks.startLanguageTest).not.toHaveBeenCalled();
    expect(setErrorMessage).toHaveBeenLastCalledWith(
      "Unable to save guide languages.",
    );
    expect(result.current.isAiSessionStarted).toBe(false);
  });

  it("resumes an active session instead of creating a duplicate test", async () => {
apiMocks.getLanguageTestStatus.mockResolvedValue({
      items: [{ status: "IN_PROGRESS", sessionId: "existing-session", language: "en" }],
    });
    apiMocks.getLanguageTestSession.mockResolvedValue({
      session: {
        _id: "existing-session",
        questions: [
          { questionId: "existing-q1", type: "text", prompt: "Continue" },
        ],
        language: "en",
      },
    });
    const setErrorMessage = vi.fn();
    const { result } = renderHook(() =>
      useAiAssessment({ setErrorMessage }),
    );

    await act(async () => {
      await result.current.startSession();
    });

    expect(apiMocks.startLanguageTest).not.toHaveBeenCalled();
    expect(apiMocks.getLanguageTestSession).toHaveBeenCalledWith(
      "existing-session",
    );
    expect(result.current.activeSessionId).toBe("existing-session");
  });

  it("submits answers with the question IDs returned by the session", async () => {
    const { result } = renderHook(() =>
      useAiAssessment({ setErrorMessage: vi.fn() }),
    );

    await act(async () => {
      await result.current.startSession();
    });
    act(() => {
      result.current.handleTextAnswerChange(1, "My API-backed answer");
    });
    await act(async () => {
      await result.current.handleNextQuestion();
    });

    expect(apiMocks.submitLanguageTest).toHaveBeenCalledWith("session-1", {
      answers: [
        {
          questionId: "server-q1",
          answer: "My API-backed answer",
        },
      ],
    });
    expect(result.current.aiTestCompleted).toBe(true);
  });
});
