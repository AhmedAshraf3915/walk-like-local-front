import { beforeEach, describe, expect, it, vi } from "vitest";

import { guideVerificationApi } from "@/features/guideVerification/api/guideVerificationApi";

const apiClientMocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  put: vi.fn(),
}));

const cloudinaryClientMocks = vi.hoisted(() => ({
  post: vi.fn(),
}));

vi.mock("axios", () => ({
  default: {
    create: () => cloudinaryClientMocks,
  },
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

  it("sends the language status filter in the documented GET body", async () => {
    apiClientMocks.get.mockResolvedValue({ data: { statuses: [] } });

    await guideVerificationApi.getLanguageTestStatus(["en"]);

    expect(apiClientMocks.get).toHaveBeenCalledWith(
      "/guides/language-test/status",
      {
        data: { languages: ["en"] },
        timeout: 60000,
      },
    );
  });

  it("submits the documented verification payload", async () => {
    const payload = {
      nationality: "Egypt",
      nationalId: { secureUrl: "https://files/id", publicId: "guides/id" },
      profilePhoto: {
        secureUrl: "https://files/profile",
        publicId: "guides/profile",
      },
      tourismLicense: {
        secureUrl: "https://files/license",
        publicId: "guides/license",
      },
      introductionVideo: {
        secureUrl: "https://files/intro",
        publicId: "guides/intro",
      },
    };
    apiClientMocks.post.mockResolvedValue({ data: { status: "PENDING" } });

    await guideVerificationApi.submitVerification(payload);

    expect(apiClientMocks.post).toHaveBeenCalledWith(
      "/guides/verification",
      payload,
      { timeout: 60000 },
    );
  });

  it("uses the rejected-only resubmission endpoint", async () => {
    const payload = {
      nationality: "Egypt",
      nationalId: { secureUrl: "https://files/id", publicId: "guides/id" },
    };
    apiClientMocks.patch.mockResolvedValue({ data: { status: "PENDING" } });

    await guideVerificationApi.resubmitVerification(payload);

    expect(apiClientMocks.patch).toHaveBeenCalledWith(
      "/guides/verification/resubmit",
      payload,
      { timeout: 60000 },
    );
  });

  it("uploads guide images with the documented Cloudinary form fields", async () => {
    const file = new Blob(["image"], { type: "image/jpeg" });
    cloudinaryClientMocks.post.mockResolvedValue({
      data: {
        secure_url: "https://res.cloudinary.com/guide.jpg",
        public_id: "walk-like-local/guides/images/guide",
      },
    });

    const result = await guideVerificationApi.uploadImage(file);
    const [url, formData, config] = cloudinaryClientMocks.post.mock.calls[0];

    expect(url).toBe(
      "https://api.cloudinary.com/v1_1/dau2lq7gn/image/upload",
    );
    expect(formData.get("file")).toMatchObject({
      size: file.size,
      type: file.type,
    });
    expect(formData.get("upload_preset")).toBe("walk_like_local");
    expect(formData.get("folder")).toBe("walk-like-local/guides/images");
    expect(config).toMatchObject({
      timeout: 90000,
      headers: { "Content-Type": "multipart/form-data" },
    });
    expect(result).toEqual({
      secureUrl: "https://res.cloudinary.com/guide.jpg",
      publicId: "walk-like-local/guides/images/guide",
    });
  });

  it("uploads introduction videos to the documented Cloudinary folder", async () => {
    const file = new Blob(["video"], { type: "video/mp4" });
    cloudinaryClientMocks.post.mockResolvedValue({
      data: {
        secure_url: "https://res.cloudinary.com/intro.mp4",
        public_id: "walk-like-local/guides/videos/intro",
      },
    });

    await guideVerificationApi.uploadVideo(file);
    const [url, formData, config] = cloudinaryClientMocks.post.mock.calls[0];

    expect(url).toBe(
      "https://api.cloudinary.com/v1_1/dau2lq7gn/auto/upload",
    );
    expect(formData.get("folder")).toBe("walk-like-local/guides/videos");
    expect(config.timeout).toBe(180000);
  });

  it("gets question audio from the documented session endpoint", async () => {
    const audioBlob = new Blob(["audio"], { type: "audio/mpeg" });
    apiClientMocks.get.mockResolvedValue({ data: audioBlob });

    await guideVerificationApi.getLanguageTestQuestionAudio(
      "session/one",
      "q4",
      "en",
    );

    expect(apiClientMocks.get).toHaveBeenCalledWith(
      "/guides/language-test/session%2Fone/questions/q4/audio",
      {
        data: { language: "en" },
        responseType: "blob",
        timeout: 60000,
      },
    );
  });

  it("submits the documented answer payload to the active session", async () => {
    apiClientMocks.post.mockResolvedValue({ data: { status: "SUBMITTED" } });
    const payload = {
      answers: [{ questionId: "q1", answer: "My answer" }],
    };

    await guideVerificationApi.submitLanguageTest("session/one", payload);

    expect(apiClientMocks.post).toHaveBeenCalledWith(
      "/guides/language-test/session%2Fone/submit",
      payload,
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
