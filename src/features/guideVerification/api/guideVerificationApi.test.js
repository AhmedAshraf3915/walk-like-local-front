import { beforeEach, describe, expect, it, vi } from "vitest";

import { guideVerificationApi } from "@/features/guideVerification/api/guideVerificationApi";

const apiClientMocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  put: vi.fn(),
}));

vi.mock("@/services/apiClient", () => ({
  apiClient: apiClientMocks,
}));

describe("guideVerificationApi timeouts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows verification-status requests to survive backend cold starts", async () => {
    apiClientMocks.get.mockResolvedValue({ data: { status: "PENDING" } });

    await guideVerificationApi.getVerificationStatus();

    expect(apiClientMocks.get).toHaveBeenCalledWith(
      "/guides/verification-status",
      { timeout: 60000 },
    );
  });

  it("allows AI assessment processing more time", async () => {
    apiClientMocks.post.mockResolvedValue({ data: { sessionId: "session-1" } });

    await guideVerificationApi.startLanguageTest({ language: "en" });

    expect(apiClientMocks.post).toHaveBeenCalledWith(
      "/guides/language-test/start",
      { language: "en" },
      { timeout: 120000 },
    );
  });

  it("converts raw Axios timeout errors into a useful message", async () => {
    apiClientMocks.get.mockRejectedValue({
      code: "ECONNABORTED",
      message: "timeout of 60000ms exceeded",
    });

    await expect(guideVerificationApi.getVerificationStatus()).rejects.toThrow(
      "Unable to get verification status. The request took too long. Please check your connection and try again.",
    );
  });
});
