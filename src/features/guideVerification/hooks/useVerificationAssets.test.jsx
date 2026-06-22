/* @vitest-environment jsdom */
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useVerificationAssets } from "@/features/guideVerification/hooks/useVerificationAssets";

const apiMocks = vi.hoisted(() => ({
  getVerificationStatus: vi.fn(),
  submitVerification: vi.fn(),
  resubmitVerification: vi.fn(),
  uploadImage: vi.fn(),
  uploadVideo: vi.fn(),
}));

vi.mock("@/features/guideVerification/api/guideVerificationApi", () => ({
  guideVerificationApi: apiMocks,
}));

describe("useVerificationAssets", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    apiMocks.getVerificationStatus.mockResolvedValue({ status: "NONE" });
    apiMocks.submitVerification.mockResolvedValue({ status: "PENDING" });
    apiMocks.resubmitVerification.mockResolvedValue({ status: "PENDING" });
  });

  it("restores previously submitted documents from the verification status", async () => {
    apiMocks.getVerificationStatus.mockResolvedValue({
      isVerified: false,
      verification: {
        status: "SUBMITTED",
        verificationDocuments: {
          nationalId: {
            secure_url: "https://files.example/national-id.jpg",
            public_id: "guides/national-id",
          },
          tourismLicense: {
            secureUrl: "https://files.example/license.jpg",
            publicId: "guides/license",
          },
          profilePhoto: "https://files.example/profile.jpg",
          introductionVideo: {
            url: "https://files.example/introduction.mp4",
          },
        },
      },
    });
    const { result } = renderHook(() =>
      useVerificationAssets({ setErrorMessage: vi.fn() }),
    );

    await waitFor(() => expect(result.current.loadingStatus).toBe(false));

    expect(result.current.verificationStatus).toBe("pending");
    expect(result.current.assets.nationalId).toMatchObject({
      secureUrl: "https://files.example/national-id.jpg",
      publicId: "guides/national-id",
    });
    expect(result.current.assets.profilePhoto.secureUrl).toBe(
      "https://files.example/profile.jpg",
    );
    expect(result.current.hasAllUploadedAssets).toBe(true);
  });

  it("shows a required-files error when submission is attempted empty", async () => {
    const setErrorMessage = vi.fn();
    const { result } = renderHook(() =>
      useVerificationAssets({ setErrorMessage }),
    );

    await waitFor(() => expect(result.current.loadingStatus).toBe(false));

    let submitted;
    await act(async () => {
      submitted = await result.current.submitVerification();
    });

    expect(submitted).toBe(false);
    expect(setErrorMessage).toHaveBeenLastCalledWith(
      "Please upload all required files before continuing.",
    );
    expect(apiMocks.submitVerification).not.toHaveBeenCalled();
  });

  it("uploads and submits all four documented verification assets", async () => {
    apiMocks.uploadImage.mockImplementation(async (file) => ({
      secureUrl: `https://files.example/${file.name}`,
      publicId: `guides/${file.name}`,
    }));
    apiMocks.uploadVideo.mockImplementation(async (file) => ({
      secureUrl: `https://files.example/${file.name}`,
      publicId: `guides/${file.name}`,
    }));
    const { result } = renderHook(() =>
      useVerificationAssets({ setErrorMessage: vi.fn() }),
    );

    await waitFor(() => expect(result.current.loadingStatus).toBe(false));

    const uploads = [
      ["nationalId", new File(["id"], "id.jpg"), "image"],
      ["tourismLicense", new File(["license"], "license.jpg"), "image"],
      ["profilePhoto", new File(["profile"], "profile.jpg"), "image"],
      ["introductionVideo", new File(["video"], "intro.mp4"), "video"],
    ];

    for (const [field, file, type] of uploads) {
      await act(async () => {
        await result.current.handleUpload(field, file, type);
      });
    }

    await act(async () => {
      await result.current.submitVerification();
    });

    expect(apiMocks.submitVerification).toHaveBeenCalledWith({
      nationality: "Egypt",
      nationalId: {
        secureUrl: "https://files.example/id.jpg",
        publicId: "guides/id.jpg",
      },
      tourismLicense: {
        secureUrl: "https://files.example/license.jpg",
        publicId: "guides/license.jpg",
      },
      profilePhoto: {
        secureUrl: "https://files.example/profile.jpg",
        publicId: "guides/profile.jpg",
      },
      introductionVideo: {
        secureUrl: "https://files.example/intro.mp4",
        publicId: "guides/intro.mp4",
      },
    });
    expect(result.current.verificationStatus).toBe("pending");
  });

  it("resubmits through the documented endpoint only after rejection", async () => {
    const verificationDocuments = Object.fromEntries(
      ["nationalId", "tourismLicense", "profilePhoto", "introductionVideo"].map(
        (field) => [
          field,
          {
            secureUrl: `https://files.example/${field}`,
            publicId: `guides/${field}`,
          },
        ],
      ),
    );
    apiMocks.getVerificationStatus.mockResolvedValue({
      status: "REJECTED",
      nationality: "Egypt",
      verificationDocuments,
    });
    const { result } = renderHook(() =>
      useVerificationAssets({ setErrorMessage: vi.fn() }),
    );

    await waitFor(() => expect(result.current.loadingStatus).toBe(false));
    await act(async () => {
      await result.current.submitVerification();
    });

    expect(apiMocks.resubmitVerification).toHaveBeenCalledWith({
      nationality: "Egypt",
      ...verificationDocuments,
    });
    expect(apiMocks.submitVerification).not.toHaveBeenCalled();
    expect(result.current.verificationStatus).toBe("pending");
  });
});
