/* @vitest-environment jsdom */
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useAiAssessment } from "@/features/guideVerification/hooks/useAiAssessment";

const apiMocks = vi.hoisted(() => ({
  updateGuideLanguages: vi.fn(),
  getLanguageTestStatus: vi.fn(),
  startLanguageTest: vi.fn(),
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
    expect(apiMocks.getLanguageTestStatus).toHaveBeenCalledWith(["ar", "en"]);
    expect(apiMocks.startLanguageTest).toHaveBeenCalledWith({ language: "en" });
    expect(
      apiMocks.updateGuideLanguages.mock.invocationCallOrder[0],
    ).toBeLessThan(apiMocks.getLanguageTestStatus.mock.invocationCallOrder[0]);
    expect(
      apiMocks.getLanguageTestStatus.mock.invocationCallOrder[0],
    ).toBeLessThan(apiMocks.startLanguageTest.mock.invocationCallOrder[0]);
    expect(result.current.isAiSessionStarted).toBe(true);
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
});
