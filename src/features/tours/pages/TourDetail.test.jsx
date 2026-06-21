/* @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import TourDetail from "@/features/tours/pages/TourDetail";

const apiMocks = vi.hoisted(() => ({
  get: vi.fn(),
  createBooking: vi.fn(),
  createCheckoutSession: vi.fn(),
  redirectToCheckout: vi.fn(),
}));

vi.mock("@/services/apiClient", () => ({
  apiClient: { get: apiMocks.get },
}));

vi.mock("@/features/touristVerification/api/touristApi", () => ({
  touristApi: { createBooking: apiMocks.createBooking },
}));

vi.mock("@/features/payment/api/paymentApi", () => ({
  paymentApi: {
    createCheckoutSession: apiMocks.createCheckoutSession,
    redirectToCheckout: apiMocks.redirectToCheckout,
  },
}));

vi.mock("@/contexts/useAuth", () => ({
  default: () => ({ isAuthenticated: true, userRole: "tourist" }),
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
    apiMocks.get.mockResolvedValue({
      data: {
        data: {
          _id: "tour-1",
          title: "Database Tour",
          pricing: { PRIVATE: 100 },
          activities: [
            { _id: "included-1", name: "Guide", included: true },
            { _id: "optional-1", name: "Lunch", price: 20 },
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
        },
      },
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
    fireEvent.click(screen.getByText("09:00 - 11:00").parentElement);
    fireEvent.click(screen.getByRole("button", { name: "Proceed to booking" }));
    fireEvent.click(screen.getByRole("button", { name: "Continue to payment" }));

    await waitFor(() => expect(apiMocks.createBooking).toHaveBeenCalled());
    expect(apiMocks.createBooking).toHaveBeenCalledWith(
      expect.objectContaining({
        tourId: "tour-1",
        slotId: "slot-1",
        deselectedActivityIds: ["optional-1"],
      }),
    );
    expect(apiMocks.createCheckoutSession).toHaveBeenCalledWith("booking-1");
    expect(apiMocks.redirectToCheckout).toHaveBeenCalledWith(
      "https://checkout.stripe.com/session-1",
    );
  });
});
