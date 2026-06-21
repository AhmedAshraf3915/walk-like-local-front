import { apiClient } from "@/services/apiClient";

const unwrapResponseData = (response) =>
  response?.data?.data ?? response?.data ?? null;

const getErrorMessage = (error, fallback = "Unable to load public guides.") => {
  const message =
    error?.response?.data?.message ??
    error?.response?.data?.error ??
    error?.message;

  return typeof message === "string" && message.trim()
    ? message
    : fallback;
};

const withErrorMessage = (request, fallback) =>
  request.catch((error) => {
    throw new Error(getErrorMessage(error, fallback), { cause: error });
  });

export const guidesApi = {
  getPublicGuides: ({ page = 1, limit = 12 } = {}) =>
    apiClient
      .get("/guides", {
        params: { page, limit },
        timeout: 60000,
      })
      .then(unwrapResponseData)
      .catch((error) => {
        throw new Error(getErrorMessage(error), { cause: error });
      }),

  getPublicGuide: (guideId) =>
    apiClient
      .get(`/guides/${encodeURIComponent(guideId)}`, { timeout: 60000 })
      .then(unwrapResponseData)
      .catch((error) => {
        throw new Error(getErrorMessage(error), { cause: error });
      }),

  getReceivedReviews: ({ page = 1, limit = 10 } = {}) =>
    apiClient
      .get("/guides/reviews/received", {
        params: { page, limit },
        timeout: 60000,
      })
      .then(unwrapResponseData)
      .catch((error) => {
        throw new Error(getErrorMessage(error), { cause: error });
      }),

  getMyBookings: ({ page = 1, limit = 100, status = "" } = {}) =>
    withErrorMessage(
      apiClient
        .get("/guides/bookings", {
          params: {
            page,
            limit,
            ...(status ? { status } : {}),
          },
          timeout: 60000,
        })
        .then(unwrapResponseData),
      "Unable to load guide bookings.",
    ),

  cancelBooking: (bookingId, reason) =>
    withErrorMessage(
      apiClient
        .patch(
          `/guides/bookings/${encodeURIComponent(bookingId)}/cancel`,
          { reason },
          { timeout: 60000 },
        )
        .then(unwrapResponseData),
      "Unable to cancel this booking.",
    ),
};
