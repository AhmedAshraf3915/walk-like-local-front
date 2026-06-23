/* @vitest-environment jsdom */
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import GuideHomePage from "@/features/guide/pages/GuideHomePage";

const apiMocks = vi.hoisted(() => ({
  browseActiveTours: vi.fn(),
}));

vi.mock("@/contexts/useAuth", () => ({
  default: () => ({
    user: { _id: "guide-1", fullName: "Database Guide" },
  }),
}));

vi.mock("@/features/tours/api/toursApi", () => ({
  toursApi: { browseActiveTours: apiMocks.browseActiveTours },
}));

vi.mock(
  "@/features/guideVerification/hooks/useGuideVerificationStatus",
  () => ({
    useGuideVerificationStatus: () => ({
      isVerified: true,
      verification: {},
      isLoading: false,
    }),
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
  });

  it("loads marketplace tours from the active tours endpoint", async () => {
    render(
      <MemoryRouter>
        <GuideHomePage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Endpoint Marketplace Tour")).toBeDefined();

    await waitFor(() =>
      expect(apiMocks.browseActiveTours).toHaveBeenCalledWith({
        page: 1,
        limit: 6,
      }),
    );

    expect(
      screen.getByRole("link", { name: /browse all tours/i }).getAttribute("href"),
    ).toBe("/tours");
    expect(
      screen.getByRole("link", { name: /view tour/i }).getAttribute("href"),
    ).toBe("/tours/tour-1");
    expect(
      screen.getByRole("link", { name: /create new tour/i }).getAttribute("href"),
    ).toBe("/guide/tours/new");
  });
});
