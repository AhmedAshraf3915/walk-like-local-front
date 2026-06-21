/* @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import GuideSettingsPage from "@/features/guide/pages/GuideSettingsPage";

const mocks = vi.hoisted(() => ({
  user: { _id: "guide-1", fullName: "Auth Guide", email: "guide@test.com" },
  updateUser: vi.fn(),
  getPublicGuides: vi.fn(),
  updateGuideLanguages: vi.fn(),
  completeGuideProfile: vi.fn(),
}));

vi.mock("@/contexts/useAuth", () => ({
  default: () => ({ user: mocks.user, updateUser: mocks.updateUser }),
}));

vi.mock("@/features/guide/api/guidesApi", () => ({
  guidesApi: { getPublicGuides: mocks.getPublicGuides },
}));

vi.mock("@/features/guideVerification/api/guideVerificationApi", () => ({
  guideVerificationApi: {
    updateGuideLanguages: mocks.updateGuideLanguages,
    completeGuideProfile: mocks.completeGuideProfile,
  },
}));

vi.mock(
  "@/features/guideVerification/hooks/useGuideVerificationStatus",
  () => ({
    useGuideVerificationStatus: () => ({
      isVerified: true,
      verification: {},
    }),
  }),
);

vi.mock("@/features/guide/components/GuideAccountShell", () => ({
  default: ({ children }) => <div>{children}</div>,
}));

describe("GuideSettingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getPublicGuides.mockResolvedValue([
      {
        _id: "guide-1",
        fullName: "Database Guide",
        email: "database@test.com",
        bio: "Database biography",
        languages: ["en"],
        interests: ["Safari"],
        experience: { year: "3 - 5 years" },
      },
    ]);
    mocks.updateGuideLanguages.mockResolvedValue({});
    mocks.completeGuideProfile.mockResolvedValue({ bio: "Updated biography" });
  });

  afterEach(() => cleanup());

  it("loads database profile data and saves only supported profile fields", async () => {
    render(
      <MemoryRouter>
        <GuideSettingsPage />
      </MemoryRouter>,
    );

    expect(await screen.findByDisplayValue("Database Guide")).toBeDefined();
    fireEvent.change(screen.getByLabelText("About"), {
      target: { value: "Updated biography" },
    });
    fireEvent.click(screen.getByRole("button", { name: "French" }));
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() =>
      expect(mocks.updateGuideLanguages).toHaveBeenCalledWith({
        languages: ["en", "fr"],
      }),
    );
    expect(mocks.completeGuideProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        bio: "Updated biography",
        interests: ["Safari"],
      }),
    );
  });
});
