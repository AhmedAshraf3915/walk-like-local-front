import { apiClient } from "@/services/apiClient";

const unwrapResponseData = (response) =>
  response?.data?.data ?? response?.data ?? null;

const getErrorMessage = (error) => {
  const message =
    error?.response?.data?.message ??
    error?.response?.data?.error ??
    error?.message;

  return typeof message === "string" && message.trim()
    ? message
    : "Unable to load public guides.";
};

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
};
