/* @vitest-environment jsdom */
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  normalizeGuideVerificationStatus,
  useGuideVerificationStatus,
} from "@/features/guideVerification/hooks/useGuideVerificationStatus";

const apiMocks = vi.hoisted(() => ({
  getVerificationStatus: vi.fn(),
}));

vi.mock("@/features/guideVerification/api/guideVerificationApi", () => ({
  guideVerificationApi: apiMocks,
}));

describe("useGuideVerificationStatus", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("normalizes the verification values returned by the backend", () => {
    expect(normalizeGuideVerificationStatus("APPROVED")).toBe("approved");
    expect(normalizeGuideVerificationStatus("submitted")).toBe("pending");
    expect(normalizeGuideVerificationStatus("REJECTED")).toBe("rejected");
    expect(normalizeGuideVerificationStatus(true)).toBe("approved");
    expect(normalizeGuideVerificationStatus("true")).toBe("approved");
    expect(normalizeGuideVerificationStatus("UNVERIFIED")).toBe("none");
  });

  it("recognizes the approved status when the endpoint returns a bare value", async () => {
    apiMocks.getVerificationStatus.mockResolvedValue("APPROVED");
    const { result } = renderHook(() =>
      useGuideVerificationStatus({ user: { role: "guide" } }),
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isVerified).toBe(true);
  });

  it("prefers a pending status over a false verification boolean", async () => {
    apiMocks.getVerificationStatus.mockResolvedValue({
      isVerified: false,
      status: "SUBMITTED",
    });
    const { result } = renderHook(() =>
      useGuideVerificationStatus({ user: { role: "guide" } }),
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.status).toBe("pending");
  });

  it("loads uploaded guide data with the approved status", async () => {
    apiMocks.getVerificationStatus.mockResolvedValue({
      verification: {
        status: "APPROVED",
        nationality: "Egypt",
        profilePhoto: {
          secureUrl: "https://images.example/guide.jpg",
          publicId: "guides/guide",
        },
      },
    });

    const { result } = renderHook(() =>
      useGuideVerificationStatus({ user: { role: "guide" } }),
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isVerified).toBe(true);
    expect(result.current.verification.profilePhoto.secureUrl).toBe(
      "https://images.example/guide.jpg",
    );
  });

  it("fails closed when verification cannot be confirmed", async () => {
    apiMocks.getVerificationStatus.mockRejectedValue(
      new Error("Unable to load verification status."),
    );

    const { result } = renderHook(() =>
      useGuideVerificationStatus({
        user: { role: "guide", isVerified: true },
      }),
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isVerified).toBe(false);
    expect(result.current.errorMessage).toBe(
      "Unable to load verification status.",
    );
  });
});
