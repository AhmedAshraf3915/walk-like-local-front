import { describe, expect, it } from "vitest";

import {
  mapGuideBookings,
  summarizeGuideBookings,
} from "@/features/guide/utils/guideAccountMappers";

describe("guide account booking mappers", () => {
  it("maps database bookings and derives real dashboard totals", () => {
    const bookings = mapGuideBookings({
      items: [
        {
          _id: "active-1",
          status: "active",
          total: 100,
          paymentStatus: "paid",
          tour: { title: "Cairo Walk", destination: "Cairo" },
          tourist: { fullName: "Database Tourist" },
          slot: { date: "2026-07-01", startTime: "09:00" },
        },
        {
          _id: "complete-1",
          status: "completed",
          totalAmount: 80,
          payment: { status: "paid" },
        },
        {
          _id: "cancelled-1",
          status: "cancelled",
          total: 50,
        },
      ],
    });

    expect(bookings[0]).toMatchObject({
      id: "active-1",
      title: "Cairo Walk",
      touristName: "Database Tourist",
      status: "upcoming",
      total: 100,
    });
    expect(summarizeGuideBookings(bookings)).toEqual({
      totalBookings: 3,
      activeBookings: 1,
      completedBookings: 1,
      cancelledBookings: 1,
      totalEarnings: 180,
    });
  });
});
