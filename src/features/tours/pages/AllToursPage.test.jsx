/* @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import {
  MemoryRouter,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
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

function NavigateFromHero() {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() =>
        navigate("/tours?destination=Aswan&search=Adventure")
      }
    >
      Search from hero
    </button>
  );
}

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
          slots: [{ date: "2026-07-01T00:00:00.000Z", available: true }],
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

    fireEvent.change(screen.getByLabelText("Search"), {
      target: { value: "Pyramids" },
    });
    fireEvent.click(screen.getByRole("combobox", { name: "Destination" }));
    fireEvent.click(screen.getByRole("option", { name: "Giza" }));
    const minimumPrice = screen.getByLabelText("Minimum private price");
    const maximumPrice = screen.getByLabelText("Maximum private price");
    expect(minimumPrice.getAttribute("step")).toBe("1");
    expect(maximumPrice.getAttribute("step")).toBe("1");

    fireEvent.change(minimumPrice, {
      target: { value: "50.75" },
    });
    expect(minimumPrice.value).toBe("50");
    fireEvent.change(minimumPrice, {
      target: { value: "50" },
    });
    fireEvent.change(maximumPrice, {
      target: { value: "300" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Apply filters" }));

    await waitFor(() =>
      expect(apiMocks.browseActiveTours).toHaveBeenCalledTimes(2),
    );
    expect(apiMocks.browseActiveTours).toHaveBeenLastCalledWith(
      expect.objectContaining({
        search: "Pyramids",
        destination: "Giza",
        groupType: "PRIVATE",
        minPrice: "50",
        maxPrice: "300",
        page: 1,
        limit: 9,
      }),
    );
  });

  it("uses filters submitted from the landing-page hero", async () => {
    render(
      <MemoryRouter
        initialEntries={["/tours?destination=Luxor&search=Food%20Tour"]}
      >
        <AllToursPage />
      </MemoryRouter>,
    );

    await waitFor(() =>
      expect(apiMocks.browseActiveTours).toHaveBeenCalledWith(
        expect.objectContaining({
          destination: "Luxor",
          search: "Food Tour",
          page: 1,
          limit: 9,
        }),
      ),
    );
  });

  it("filters landing-page results by an available tour date", async () => {
    render(
      <MemoryRouter
        initialEntries={["/tours?destination=Cairo&date=2026-07-01"]}
      >
        <AllToursPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Old Cairo Walk")).toBeDefined();
    expect(screen.getByLabelText("Available date").value).toBe("2026-07-01");
    expect(apiMocks.browseActiveTours).toHaveBeenCalledWith(
      expect.objectContaining({
        destination: "Cairo",
        page: 1,
        limit: 100,
      }),
    );
  });

  it("refreshes filters when the hero searches from the existing tours route", async () => {
    render(
      <MemoryRouter initialEntries={["/tours"]}>
        <NavigateFromHero />
        <Routes>
          <Route path="/tours" element={<AllToursPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() =>
      expect(apiMocks.browseActiveTours).toHaveBeenCalledTimes(1),
    );
    fireEvent.click(screen.getByRole("button", { name: "Search from hero" }));

    await waitFor(() =>
      expect(apiMocks.browseActiveTours).toHaveBeenCalledTimes(2),
    );
    expect(apiMocks.browseActiveTours).toHaveBeenLastCalledWith(
      expect.objectContaining({
        destination: "Aswan",
        search: "Adventure",
        page: 1,
        limit: 9,
      }),
    );
  });
});
