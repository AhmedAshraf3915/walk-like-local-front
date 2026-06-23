/* @vitest-environment jsdom */
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { EGYPT_GOVERNORATES } from "@/features/tours/constants/tourOptions";
import GuideSettingsPage from "@/features/guide/pages/GuideSettingsPage";
import { writeCachedGuideProfile } from "@/features/guide/utils/guideProfileCache";

const mocks = vi.hoisted(() => ({
  user: {
    _id: "user-1",
    guideProfile: { _id: "guide-1" },
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
  afterEach(() => {
    cleanup();
    window.sessionStorage.clear();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
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

  it("hydrates settings form from cached profile data", async () => {
    writeCachedGuideProfile({
      city: "Alexandria",
      bio: "Cached settings bio",
      interests: ["Adventure"],
      languages: ["en"],
      experience: { year: "3 - 5 years" },
    });

    render(
      <MemoryRouter>
        <GuideSettingsPage />
      </MemoryRouter>,
    );

    const cityField = await screen.findByRole("combobox", { name: "City" });
    expect(cityField.textContent).toContain("Alexandria");
    expect(screen.getByDisplayValue("Cached settings bio")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Adventure" }).className,
    ).toContain("bg-[#010170]");
    expect(screen.getByRole("button", { name: "English" }).className).toContain(
      "bg-[#010170]",
    );
  });

  it("offers all Egyptian governorates and saves the selected city", async () => {
    render(
      <MemoryRouter>
        <GuideSettingsPage />
      </MemoryRouter>,
    );

    const cityField = await screen.findByRole("combobox", { name: "City" });
    await waitFor(() => {
      expect(mocks.getPublicGuide).toHaveBeenCalledWith("guide-1");
    });
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

    fireEvent.click(
      within(governorateList).getByRole("option", { name: "Cairo" }),
    );
    expect(cityField.textContent).toContain("Cairo");

    const saveButtons = screen.getAllByRole("button", {
      name: /save changes/i,
    });
    const enabledSaveButton =
      saveButtons.find((button) => !button.hasAttribute("disabled")) ??
      saveButtons[0];
    fireEvent.click(enabledSaveButton);

    await waitFor(() => {
      expect(mocks.completeGuideProfile).toHaveBeenCalledWith({
        bio: "",
        city: "Cairo",
        governorate: "Cairo",
        interests: [],
        experience: { year: "" },
      });
    });
  });
});
