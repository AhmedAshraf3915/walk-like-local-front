import { beforeEach, describe, expect, it, vi } from "vitest";

import { authApi } from "@/features/auth/api/authApi";

const apiClientMocks = vi.hoisted(() => ({
  post: vi.fn(),
  get: vi.fn(),
}));

vi.mock("@/services/apiClient", () => ({
  apiClient: apiClientMocks,
}));

describe("authApi resend verification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("turns the server's raw wait seconds into a structured cooldown", async () => {
    apiClientMocks.post.mockRejectedValue({
      response: {
        status: 429,
        data: {
          message:
            "A verification email was already sent and is still valid. Please wait 10748 seconds before requesting another.",
        },
      },
    });

    const resendPromise = authApi.resendVerificationEmail("guide@example.com");

    await expect(resendPromise).rejects.toMatchObject({
      cooldownSeconds: 10748,
      message:
        "A verification email is already active. You can request another in 2 hours, 59 minutes, 8 seconds.",
    });
    expect(apiClientMocks.post).toHaveBeenCalledWith(
      "/auth/resend-verification-email",
      { email: "guide@example.com" },
    );
  });
});
