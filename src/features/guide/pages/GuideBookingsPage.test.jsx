/* @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import GuideBookingsPage from "@/features/guide/pages/GuideBookingsPage";

const apiMocks = vi.hoisted(() => ({
  getMyBookings: vi.fn(),
  cancelBooking: vi.fn(),
}));

vi.mock("@/features/guide/api/guidesApi", () => ({
  guidesApi: apiMocks,
}));

vi.mock("@/features/guide/components/GuideAccountShell", () => ({
  default: ({ children }) => <div>{children}</div>,
}));

describe("GuideBookingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiMocks.getMyBookings.mockResolvedValue({
      items: [
        {
          _id: "booking-1",
          status: "active",
          total: 60,
          paymentStatus: "paid",
          tour: { title: "Database Upcoming Tour", destination: "Cairo" },
          tourist: { fullName: "Database Traveler" },
          slot: { date: "2026-07-10", startTime: "09:00" },
        },
        {
          _id: "booking-2",
          status: "completed",
          tour: { title: "Database Past Tour" },
        },
      ],
    });
    apiMocks.cancelBooking.mockResolvedValue({ status: "cancelled" });
  });

  afterEach(() => cleanup());

  it("loads database bookings and uses the documented guide cancellation route", async () => {
    render(
      <MemoryRouter>
        <GuideBookingsPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Database Upcoming Tour")).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "Cancel booking" }));
    fireEvent.click(screen.getByRole("radio", { name: "Schedule conflict" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Confirm cancellation" }),
    );

    await waitFor(() =>
      expect(apiMocks.cancelBooking).toHaveBeenCalledWith(
        "booking-1",
        "Schedule conflict",
      ),
    );
    expect(apiMocks.getMyBookings).toHaveBeenCalledWith({ page: 1, limit: 100 });
  });
});
