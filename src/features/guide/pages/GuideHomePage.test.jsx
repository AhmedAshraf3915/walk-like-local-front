/* @vitest-environment jsdom */
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import GuideHomePage from "@/features/guide/pages/GuideHomePage";

const apiMocks = vi.hoisted(() => ({
  browseActiveTours: vi.fn(),
  getPublicGuides: vi.fn(),
}));

const verificationState = vi.hoisted(() => ({
  isVerified: true,
  verification: {},
  isLoading: false,
}));

vi.mock("@/contexts/useAuth", () => ({
  default: () => ({
    user: { _id: "guide-1", fullName: "Database Guide" },
  }),
}));

vi.mock("@/features/tours/api/toursApi", () => ({
  toursApi: { browseActiveTours: apiMocks.browseActiveTours },
}));

vi.mock("@/features/guide/api/guidesApi", () => ({
  guidesApi: { getPublicGuides: apiMocks.getPublicGuides },
}));

vi.mock(
  "@/features/guideVerification/hooks/useGuideVerificationStatus",
  () => ({
    useGuideVerificationStatus: () => verificationState,
  }),
);

vi.mock("@/components/home/GuideNavbar.jsx", () => ({
  default: () => <div>Navbar</div>,
}));

vi.mock("@/components/home/Footer.jsx", () => ({
  default: () => <div>Footer</div>,
}));

describe("GuideHomePage marketplace", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    verificationState.isVerified = true;
    verificationState.isLoading = false;
    verificationState.verification = {};
    apiMocks.browseActiveTours.mockResolvedValue({
      items: [
        {
          _id: "tour-1",
          title: "Endpoint Marketplace Tour",
          destination: "Luxor",
          duration: "3 hours",
          pricing: { PRIVATE: 75 },
          guide: { _id: "guide-1", fullName: "Database Guide" },
        },
      ],
      pagination: { totalItems: 1 },
    });
    apiMocks.getPublicGuides.mockResolvedValue({
      guides: [
        {
          _id: "guide-2",
          fullName: "API Dynamic Guide",
          city: "Alexandria",
          languages: ["en"],
          rating: 4.9,
          reviewCount: 12,
        },
      ],
    });
  });

  it("loads marketplace tours from the active tours endpoint", async () => {
    render(
      <MemoryRouter>
        <GuideHomePage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Endpoint Marketplace Tour")).toBeDefined();
    expect(await screen.findByText("API Dynamic Guide")).toBeDefined();

    await waitFor(() =>
      expect(apiMocks.browseActiveTours).toHaveBeenCalledWith({
        page: 1,
        limit: 6,
      }),
    );
    await waitFor(() =>
      expect(apiMocks.getPublicGuides).toHaveBeenCalledWith({
        page: 1,
        limit: 3,
      }),
    );

    expect(
      screen
        .getByRole("link", { name: /browse all tours/i })
        .getAttribute("href"),
    ).toBe("/tours");
    expect(
      screen
        .getByRole("link", { name: /view all guides/i })
        .getAttribute("href"),
    ).toBe("/guides");
    expect(
      screen.getByRole("link", { name: /view tour/i }).getAttribute("href"),
    ).toBe("/tours/tour-1");
    expect(
      screen
        .getByRole("link", { name: /create new tour/i })
        .getAttribute("href"),
    ).toBe("/guide/tours/new");
    expect(screen.getByLabelText("Guide profile placeholder")).toBeDefined();
  });

  it("routes create-tour CTA to complete profile when guide is not verified", async () => {
    verificationState.isVerified = false;

    render(
      <MemoryRouter>
        <GuideHomePage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Endpoint Marketplace Tour")).toBeDefined();
    expect(await screen.findByText("API Dynamic Guide")).toBeDefined();

    expect(
      screen
        .getByRole("link", { name: /create new tour/i })
        .getAttribute("href"),
    ).toBe("/guide/complete-profile");
  });
});
