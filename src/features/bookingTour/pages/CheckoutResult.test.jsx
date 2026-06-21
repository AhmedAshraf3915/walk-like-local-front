/* @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import CheckoutResult from "@/features/bookingTour/pages/CheckoutResult";

const paymentMocks = vi.hoisted(() => ({
  getPaymentStatus: vi.fn(),
  createCheckoutSession: vi.fn(),
  redirectToCheckout: vi.fn(),
}));

vi.mock("@/features/payment/api/paymentApi", () => ({
  paymentApi: paymentMocks,
}));

vi.mock("@/components/home/Navbar.jsx", () => ({
  default: () => <div>Navbar</div>,
}));

vi.mock("@/components/home/Footer.jsx", () => ({
  default: () => <div>Footer</div>,
}));

const renderResult = () =>
  render(
    <MemoryRouter
      initialEntries={["/tourist/bookings/booking-1/confirmation"]}
    >
      <Routes>
        <Route
          path="/tourist/bookings/:bookingId/confirmation"
          element={<CheckoutResult />}
        />
      </Routes>
    </MemoryRouter>,
  );

describe("CheckoutResult", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders success only after the payment status endpoint reports paid", async () => {
    paymentMocks.getPaymentStatus.mockResolvedValue({
      status: "paid",
      paymentIntentId: "pi_123",
    });

    renderResult();

    expect(await screen.findByText("Payment confirmed")).toBeDefined();
    expect(paymentMocks.getPaymentStatus).toHaveBeenCalledWith("booking-1");
    expect(screen.getByText(/pi_123/)).toBeDefined();
  });

  it("can restart Stripe checkout for a failed payment", async () => {
    paymentMocks.getPaymentStatus.mockResolvedValue({ status: "failed" });
    paymentMocks.createCheckoutSession.mockResolvedValue({
      checkoutUrl: "https://checkout.stripe.com/retry",
    });

    renderResult();

    fireEvent.click(await screen.findByRole("button", {
      name: "Try payment again",
    }));

    await waitFor(() =>
      expect(paymentMocks.createCheckoutSession).toHaveBeenCalledWith(
        "booking-1",
      ),
    );
    expect(paymentMocks.redirectToCheckout).toHaveBeenCalledWith(
      "https://checkout.stripe.com/retry",
    );
  });
});
