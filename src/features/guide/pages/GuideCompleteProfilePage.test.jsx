/* @vitest-environment jsdom */
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import GuideCompleteProfilePage from "@/features/guide/pages/GuideCompleteProfilePage";

const mocks = vi.hoisted(() => ({
  updateUser: vi.fn(),
  submitVerification: vi.fn(),
  completeGuideProfile: vi.fn(),
}));

vi.mock("@/contexts/useAuth", () => ({
  default: () => ({
    user: {
      guideProfile: {
        bio: "A guide who knows Cairo well.",
        city: "Cairo",
        experience: { year: "3 - 5 years" },
        interests: ["Adventure"],
      },
    },
    updateUser: mocks.updateUser,
  }),
}));

vi.mock("@/features/guide/components/GuideAccountShell", () => ({
  default: ({ children }) => <main>{children}</main>,
}));

vi.mock("@/features/guideVerification/hooks/useVerificationAssets", () => ({
  useVerificationAssets: () => ({
    loadingStatus: false,
    verificationStatus: "none",
    assets: {},
    uploadingField: "",
    submittingVerification: false,
    hasAllUploadedAssets: false,
    openFilePicker: vi.fn(),
    nationalIdInputRef: { current: null },
    licenseInputRef: { current: null },
    profilePhotoInputRef: { current: null },
    introVideoInputRef: { current: null },
    handleUpload: vi.fn(),
    submitVerification: mocks.submitVerification,
  }),
}));

vi.mock("@/features/guideVerification/hooks/useAiAssessment", () => ({
  useAiAssessment: () => ({ aiTestCompleted: false, selectedLanguages: [] }),
}));

vi.mock("@/features/guideVerification/api/guideVerificationApi", () => ({
  guideVerificationApi: {
    updateGuideLanguages: vi.fn(),
    completeGuideProfile: mocks.completeGuideProfile,
  },
}));

describe("GuideCompleteProfilePage", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.completeGuideProfile.mockResolvedValue({ city: "Cairo" });
  });

  it("keeps document submission clickable so empty-state validation can run", () => {
    render(
      <MemoryRouter initialEntries={["/guide/complete-profile"]}>
        <GuideCompleteProfilePage />
      </MemoryRouter>,
    );

    const submitButton = screen.getByRole("button", {
      name: "Submit for verification",
    });
    expect(submitButton.disabled).toBe(false);
    expect(screen.queryByRole("button", { name: /skip/i })).toBeNull();

    fireEvent.click(submitButton);
    expect(mocks.submitVerification).toHaveBeenCalledOnce();
  });

  it("shows and saves guide location in the profile-details tab", async () => {
    render(
      <MemoryRouter initialEntries={["/guide/complete-profile/details"]}>
        <GuideCompleteProfilePage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("combobox", { name: "Guide location" }).value).toBe(
      "Cairo",
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Save profile details" }),
    );

    await waitFor(() =>
      expect(mocks.completeGuideProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          city: "Cairo",
          interests: ["Adventure"],
        }),
      ),
    );
    expect((await screen.findByRole("status")).textContent).toContain(
      "Your public profile details were saved.",
    );
  });
});
