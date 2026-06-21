import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  extractCheckoutUrl,
  paymentApi,
} from "@/features/payment/api/paymentApi";

const apiMocks = vi.hoisted(() => ({
  post: vi.fn(),
  get: vi.fn(),
}));

vi.mock("@/services/apiClient", () => ({
  apiClient: apiMocks,
}));

describe("paymentApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates checkout using the documented booking endpoint", async () => {
    apiMocks.post.mockResolvedValue({
      data: {
        data: {
          session: { url: "https://checkout.stripe.com/session-1" },
        },
      },
    });

    await expect(paymentApi.createCheckoutSession("booking-1")).resolves.toEqual(
      {
        payload: {
          session: { url: "https://checkout.stripe.com/session-1" },
        },
        checkoutUrl: "https://checkout.stripe.com/session-1",
      },
    );
    expect(apiMocks.post).toHaveBeenCalledWith(
      "/payments/checkout/booking-1",
    );
  });

  it("gets payment status by booking ID", async () => {
    apiMocks.get.mockResolvedValue({
      data: { data: { status: "paid" } },
    });

    await expect(paymentApi.getPaymentStatus("booking-1")).resolves.toEqual({
      status: "paid",
    });
    expect(apiMocks.get).toHaveBeenCalledWith("/payments/status/booking-1");
  });

  it("rejects checkout responses without a Stripe URL", async () => {
    apiMocks.post.mockResolvedValue({ data: { data: { status: "pending" } } });

    await expect(
      paymentApi.createCheckoutSession("booking-1"),
    ).rejects.toThrow("did not return a checkout URL");
  });

  it("supports the documented checkout response URL variants", () => {
    expect(extractCheckoutUrl({ checkoutUrl: "https://stripe.test/one" })).toBe(
      "https://stripe.test/one",
    );
    expect(extractCheckoutUrl({ url: "https://stripe.test/two" })).toBe(
      "https://stripe.test/two",
    );
  });
});
