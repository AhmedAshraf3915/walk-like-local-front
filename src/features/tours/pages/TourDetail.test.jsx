/* @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import TourDetail from "@/features/tours/pages/TourDetail";

const apiMocks = vi.hoisted(() => ({
  getTourDetails: vi.fn(),
  getPublicGuide: vi.fn(),
  createBooking: vi.fn(),
  createCheckoutSession: vi.fn(),
  redirectToCheckout: vi.fn(),
}));

const authMock = vi.hoisted(() => ({
  state: { isAuthenticated: true, userRole: "tourist" },
}));

vi.mock("@/features/tours/api/toursApi", () => ({
  toursApi: { getTourDetails: apiMocks.getTourDetails },
}));

vi.mock("@/features/touristVerification/api/touristApi", () => ({
  touristApi: { createBooking: apiMocks.createBooking },
}));

vi.mock("@/features/guide/api/guidesApi", () => ({
  guidesApi: { getPublicGuide: apiMocks.getPublicGuide },
}));

vi.mock("@/features/payment/api/paymentApi", () => ({
  paymentApi: {
    createCheckoutSession: apiMocks.createCheckoutSession,
    redirectToCheckout: apiMocks.redirectToCheckout,
  },
}));

vi.mock("@/contexts/useAuth", () => ({
  default: () => authMock.state,
}));

vi.mock("@/components/home/Navbar.jsx", () => ({
  default: () => <div>Navbar</div>,
}));

vi.mock("@/components/home/Footer.jsx", () => ({
  default: () => <div>Footer</div>,
}));

vi.mock("@/features/bookingTour/components/CheckoutReviewModal", () => ({
  default: ({ onContinue, continueLabel }) => (
    <button type="button" onClick={onContinue}>
      {continueLabel}
    </button>
  ),
}));

describe("TourDetail payment flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    authMock.state = { isAuthenticated: true, userRole: "tourist" };
    apiMocks.getTourDetails.mockResolvedValue({
          _id: "tour-1",
          title: "Database Tour",
          guideId: "guide-1",
          pricing: { PRIVATE: 100 },
          coverImage: { secureUrl: "https://images.example/cover.jpg" },
          galleryImages: [
            { secureUrl: "https://images.example/gallery.jpg" },
          ],
          activities: [
            { _id: "included-1", name: "Guide", included: true },
            {
              _id: "optional-1",
              name: "Lunch",
              pricing: { PRIVATE: 20 },
              removable: true,
            },
          ],
          slots: [
            {
              _id: "slot-1",
              date: "2026-07-01T00:00:00.000Z",
              startTime: "09:00",
              endTime: "11:00",
              available: true,
            },
          ],
    });
    apiMocks.getPublicGuide.mockResolvedValue({
      _id: "guide-1",
      fullName: "Database Guide",
      bio: "Profile loaded from the public guide endpoint.",
      profilePhoto: { secureUrl: "https://images.example/guide.jpg" },
      averageRating: 4.8,
      reviewsCount: 12,
      totalTours: 6,
    });
    apiMocks.createBooking.mockResolvedValue({ bookingId: "booking-1" });
    apiMocks.createCheckoutSession.mockResolvedValue({
      checkoutUrl: "https://checkout.stripe.com/session-1",
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("creates the booking, starts checkout, and redirects to Stripe", async () => {
    render(
      <MemoryRouter initialEntries={["/tours/tour-1"]}>
        <Routes>
          <Route path="/tours/:id" element={<TourDetail />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText("Database Tour")).toBeDefined();
    expect(await screen.findByText("Database Guide")).toBeDefined();
    expect(apiMocks.getTourDetails).toHaveBeenCalledWith("tour-1");
    expect(
      document.querySelector('img[src="https://images.example/gallery.jpg"]'),
    ).toBeTruthy();
    expect(screen.getByText("$20")).toBeDefined();
    fireEvent.click(screen.getByText("09:00 - 11:00").parentElement);
    fireEvent.click(screen.getByRole("button", { name: "Proceed to booking" }));
    fireEvent.click(screen.getByRole("button", { name: "Continue to payment" }));

    await waitFor(() => expect(apiMocks.createBooking).toHaveBeenCalled());
    expect(apiMocks.createBooking).toHaveBeenCalledWith(
      expect.objectContaining({
        tourId: "tour-1",
        slotId: "slot-1",
        groupSize: 1,
        members: [],
        deselectedActivityIds: ["optional-1"],
      }),
    );
    expect(apiMocks.createCheckoutSession).toHaveBeenCalledWith("booking-1");
    expect(apiMocks.redirectToCheckout).toHaveBeenCalledWith(
      "https://checkout.stripe.com/session-1",
    );
  });

  it("keeps tour details read-only for guides and does not expose booking", async () => {
    authMock.state = { isAuthenticated: true, userRole: "guide" };

    render(
      <MemoryRouter initialEntries={["/tours/tour-1"]}>
        <Routes>
          <Route path="/tours/:id" element={<TourDetail />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText("Database Guide")).toBeDefined();
    expect(apiMocks.getPublicGuide).toHaveBeenCalledWith("guide-1");
    expect(
      screen.getByRole("button", {
        name: /available to tourist accounts only/i,
      }).disabled,
    ).toBe(true);
    expect(
      screen.getByRole("button", { name: /not included: lunch/i }).disabled,
    ).toBe(true);
    expect(screen.getByText("Read-only")).toBeDefined();
    expect(
      screen.getByRole("link", { name: /back to tours/i }).getAttribute("href"),
    ).toBe("/tours");
    expect(
      screen.getByText(/view our cancellation policy/i),
    ).toBeDefined();
    expect(apiMocks.createBooking).not.toHaveBeenCalled();
  });
});
