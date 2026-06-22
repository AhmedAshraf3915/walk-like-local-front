/* @vitest-environment jsdom */
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useGuideProfile } from "@/features/guideVerification/hooks/useGuideProfile";

const apiMocks = vi.hoisted(() => ({
  updateGuideLanguages: vi.fn(),
  completeGuideProfile: vi.fn(),
}));

vi.mock("@/features/guideVerification/api/guideVerificationApi", () => ({
  guideVerificationApi: apiMocks,
}));

describe("useGuideProfile", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    apiMocks.completeGuideProfile.mockResolvedValue(null);
  });

  it("hydrates and saves location and nested interests", async () => {
    const { result } = renderHook(() =>
      useGuideProfile({
        initialProfile: {
          guideProfile: {
            bio: "Local guide biography",
            city: "Cairo",
            experience: { year: "3 - 5 years" },
            interests: ["History", "Food"],
          },
        },
      }),
    );

    expect(result.current.profile.city).toBe("Cairo");
    expect(result.current.profile.interests).toEqual(["History", "Food"]);
    expect(result.current.isProfileReady).toBe(true);

    await act(async () => {
      await result.current.submitProfile();
    });

    expect(apiMocks.completeGuideProfile).toHaveBeenCalledWith({
      bio: "Local guide biography",
      city: "Cairo",
      interests: ["History", "Food"],
      experience: { year: "3 - 5 years" },
    });
  });
});
