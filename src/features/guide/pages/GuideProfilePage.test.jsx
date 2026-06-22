/* @vitest-environment jsdom */
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import GuideProfilePage from "@/features/guide/pages/GuideProfilePage";

const apiMocks = vi.hoisted(() => ({
  getPublicGuide: vi.fn(),
  getReceivedReviews: vi.fn(),
  browseActiveTours: vi.fn(),
}));

vi.mock("@/contexts/useAuth", () => ({
  default: () => ({
    user: { _id: "guide-1", fullName: "Authenticated Guide" },
  }),
}));

vi.mock("@/features/guide/api/guidesApi", () => ({
  guidesApi: {
    getPublicGuide: apiMocks.getPublicGuide,
    getReceivedReviews: apiMocks.getReceivedReviews,
  },
}));

vi.mock("@/features/tours/api/toursApi", () => ({
  toursApi: { browseActiveTours: apiMocks.browseActiveTours },
}));

vi.mock(
  "@/features/guideVerification/hooks/useGuideVerificationStatus",
  () => ({
    useGuideVerificationStatus: () => ({
      isVerified: true,
      verification: { nationality: "Egypt" },
      isLoading: false,
      errorMessage: "",
    }),
  }),
);

vi.mock("@/components/home/GuideNavbar.jsx", () => ({
  default: () => <div>Navbar</div>,
}));

vi.mock("@/components/home/Footer.jsx", () => ({
  default: () => <div>Footer</div>,
}));

describe("GuideProfilePage", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    apiMocks.getPublicGuide.mockResolvedValue({
      _id: "guide-1",
      fullName: "Database Guide",
      bio: "A biography returned by the profile endpoint.",
      interests: ["History", "Food"],
      experience: { year: "5 years" },
      languages: ["ar", "en"],
      verifiedLanguages: ["en"],
      profilePhoto: { secureUrl: "https://images.example/guide.jpg" },
      introductionVideo: { secureUrl: "https://videos.example/intro.mp4" },
      rating: 4.7,
      reviewCount: 1,
      nationality: "Egypt",
    });
    apiMocks.browseActiveTours.mockResolvedValue({
      items: [
        {
          _id: "tour-1",
          title: "Database Tour",
          status: "ACTIVE",
          pricing: { PRIVATE: 100 },
          guide: { _id: "guide-1", fullName: "Database Guide" },
        },
      ],
      pagination: { totalItems: 1 },
    });
    apiMocks.getReceivedReviews.mockResolvedValue([
      {
        _id: "review-1",
        rating: 5,
        comment: "A review returned by the reviews endpoint.",
        tourist: { fullName: "Database Traveler", nationality: "France" },
      },
    ]);
  });

  it("renders profile sections only from database responses", async () => {
    const { container } = render(
      <MemoryRouter>
        <GuideProfilePage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Database Guide")).toBeDefined();
    expect(
      screen.getByText("A biography returned by the profile endpoint."),
    ).toBeDefined();
    expect(screen.getByText("History")).toBeDefined();
    expect(screen.getByText("Database Tour")).toBeDefined();
    expect(screen.getByText("Database Traveler")).toBeDefined();
    expect(
      screen.getByText("A review returned by the reviews endpoint."),
    ).toBeDefined();
    expect(screen.queryByText("Karim Abdelrahman")).toBeNull();

    await waitFor(() =>
      expect(apiMocks.getPublicGuide).toHaveBeenCalledWith("guide-1"),
    );
    expect(apiMocks.browseActiveTours).toHaveBeenCalledWith({
      page: 1,
      limit: 100,
    });
    expect(apiMocks.getReceivedReviews).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
    });
    expect(container.querySelector("video source")?.getAttribute("src")).toBe(
      "https://videos.example/intro.mp4",
    );
  });
});
