/* @vitest-environment jsdom */
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { EGYPT_GOVERNORATES } from "@/features/tours/constants/tourOptions";
import GuideSettingsPage from "@/features/guide/pages/GuideSettingsPage";

const mocks = vi.hoisted(() => ({
  user: {
    _id: "guide-1",
    fullName: "Marwa Guide",
    email: "guide@example.com",
  },
  updateUser: vi.fn(),
  getPublicGuide: vi.fn(),
  updateGuideLanguages: vi.fn(),
  completeGuideProfile: vi.fn(),
}));

vi.mock("@/contexts/useAuth", () => ({
  default: () => ({ user: mocks.user, updateUser: mocks.updateUser }),
}));

vi.mock("@/features/guide/components/GuideAccountShell", () => ({
  default: ({ children }) => <div>{children}</div>,
}));

vi.mock("@/features/guide/api/guidesApi", () => ({
  guidesApi: { getPublicGuide: mocks.getPublicGuide },
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

describe("GuideSettingsPage governorate field", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getPublicGuide.mockResolvedValue({
      _id: "guide-1",
      fullName: "Marwa Guide",
      email: "guide@example.com",
      city: "",
      bio: "",
      interests: [],
      languages: [],
      experience: { year: "" },
    });
    mocks.updateGuideLanguages.mockResolvedValue({});
    mocks.completeGuideProfile.mockResolvedValue({ city: "Cairo" });
  });

  it("offers all Egyptian governorates and saves the selected city", async () => {
    render(<GuideSettingsPage />);

    const cityField = await screen.findByRole("combobox", { name: "City" });
    fireEvent.click(cityField);
    const governorateList = screen.getByRole("listbox", {
      name: "Egyptian governorates",
    });

    expect(within(governorateList).getAllByRole("option")).toHaveLength(
      EGYPT_GOVERNORATES.length,
    );
    for (const governorate of EGYPT_GOVERNORATES) {
      expect(
        within(governorateList).getByRole("option", { name: governorate }),
      ).toBeTruthy();
    }

    fireEvent.click(within(governorateList).getByRole("option", { name: "Cairo" }));
    expect(cityField.textContent).toContain("Cairo");

    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(mocks.completeGuideProfile).toHaveBeenCalledWith({
        bio: "",
        city: "Cairo",
        interests: [],
        experience: { year: "" },
      });
    });
  });
});
