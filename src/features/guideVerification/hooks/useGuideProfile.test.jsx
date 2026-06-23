/* @vitest-environment jsdom */
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useGuideProfile } from "@/features/guideVerification/hooks/useGuideProfile";
import { writeCachedGuideProfile } from "@/features/guide/utils/guideProfileCache";

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
    window.sessionStorage.clear();
    apiMocks.completeGuideProfile.mockResolvedValue(null);
  });

  it("hydrates profile fields from cache when initial profile is empty", () => {
    writeCachedGuideProfile({
      bio: "Cached guide bio",
      city: "Giza",
      interests: ["Food"],
      experience: { year: "1 - 3 years" },
    });

    const { result } = renderHook(() =>
      useGuideProfile({ initialProfile: {} }),
    );

    expect(result.current.profile).toMatchObject({
      bio: "Cached guide bio",
      city: "Giza",
      interests: ["Food"],
      yearsOfExperience: "1 - 3 years",
    });
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
      governorate: "Cairo",
      interests: ["History", "Food"],
      experience: { year: "3 - 5 years" },
    });
  });
});
