/* @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import AllToursPage from "@/features/tours/pages/AllToursPage";

const apiMocks = vi.hoisted(() => ({
  browseActiveTours: vi.fn(),
}));

vi.mock("@/features/tours/api/toursApi", () => ({
  toursApi: apiMocks,
}));

vi.mock("@/components/home/Navbar.jsx", () => ({
  default: () => <div>Navbar</div>,
}));

vi.mock("@/components/home/HeroSection.jsx", () => ({
  default: () => <div>Hero</div>,
}));

vi.mock("@/components/home/Footer.jsx", () => ({
  default: () => <div>Footer</div>,
}));

describe("AllToursPage", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    apiMocks.browseActiveTours.mockResolvedValue({
      items: [
        {
          _id: "tour-1",
          title: "Old Cairo Walk",
          destination: "Cairo",
          duration: "2 hours",
          pricing: { PRIVATE: 60 },
          guide: { _id: "guide-1", fullName: "Ahmed Mohamed" },
        },
      ],
      pagination: {
        page: 1,
        totalItems: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });
  });

  it("loads tours, shows an image placeholder, and applies filters", async () => {
    render(
      <MemoryRouter>
        <AllToursPage />
      </MemoryRouter>,
    );

    await waitFor(() =>
      expect(apiMocks.browseActiveTours).toHaveBeenCalledTimes(1),
    );
    expect(await screen.findByText("Old Cairo Walk")).toBeDefined();
    expect(screen.getByText("Tour image coming soon")).toBeDefined();
    expect(screen.queryByLabelText("Group type")).toBeNull();

    fireEvent.change(screen.getByLabelText("Destination"), {
      target: { value: "Giza" },
    });
    fireEvent.change(screen.getByLabelText("Minimum private price"), {
      target: { value: "50" },
    });
    fireEvent.change(screen.getByLabelText("Maximum private price"), {
      target: { value: "300" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Apply filters" }));

    await waitFor(() =>
      expect(apiMocks.browseActiveTours).toHaveBeenCalledTimes(2),
    );
    expect(apiMocks.browseActiveTours).toHaveBeenLastCalledWith(
      expect.objectContaining({
        destination: "Giza",
        groupType: "PRIVATE",
        minPrice: "50",
        maxPrice: "300",
        page: 1,
        limit: 9,
      }),
    );
  });
});
