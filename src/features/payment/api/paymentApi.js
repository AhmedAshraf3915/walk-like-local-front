import { apiClient } from "@/services/apiClient";

const unwrapResponseData = (response) =>
  response?.data?.data ?? response?.data ?? response;

const getErrorMessage = (error, fallbackMessage) => {
  const responseMessage =
    error?.response?.data?.message ??
    error?.response?.data?.error ??
    error?.message;
  return typeof responseMessage === "string" && responseMessage.trim()
    ? responseMessage
    : fallbackMessage;
};

const requireBookingId = (bookingId) => {
  const normalized = String(bookingId ?? "").trim();
  if (!normalized) throw new Error("A booking ID is required to process payment.");
  return normalized;
};

export const extractCheckoutUrl = (payload) => {
  if (typeof payload === "string") return payload.trim();
  if (!payload || typeof payload !== "object") return "";
  return String(
    payload.checkoutUrl ??
      payload.checkoutURL ??
      payload.url ??
      payload.sessionUrl ??
      payload.checkoutSessionUrl ??
      payload.session?.url ??
      payload.checkout?.url ??
      "",
  ).trim();
};

export const paymentApi = {
  /**
   * POST /payments/checkout/:bookingId
   *
   * Sends successUrl + cancelUrl so the backend can pass them to Stripe.
   * Both point to the same CheckoutResult page — we verify the real
   * payment status there instead of trusting Stripe query params.
   */
  createCheckoutSession: async (bookingId) => {
    const id = requireBookingId(bookingId);
    const origin = window.location.origin;
    const returnUrl = `${origin}/tourist/bookings/${id}/confirmation`;

    try {
      const response = await apiClient.post(
        `/payments/checkout/${encodeURIComponent(id)}`,
        { successUrl: returnUrl, cancelUrl: returnUrl },
      );
      const payload = unwrapResponseData(response);
      const checkoutUrl = extractCheckoutUrl(payload);

      if (!checkoutUrl)
        throw new Error("The payment provider did not return a checkout URL.");

      return { payload, checkoutUrl };
    } catch (error) {
      throw new Error(
        getErrorMessage(error, "Unable to start secure checkout."),
        { cause: error },
      );
    }
  },

  /** GET /payments/status/:bookingId */
  getPaymentStatus: async (bookingId) => {
    const id = requireBookingId(bookingId);
    try {
      const response = await apiClient.get(
        `/payments/status/${encodeURIComponent(id)}`,
      );
      return unwrapResponseData(response);
    } catch (error) {
      throw new Error(
        getErrorMessage(error, "Unable to retrieve payment status."),
        { cause: error },
      );
    }
  },

  redirectToCheckout: (checkoutUrl) => {
    window.location.assign(checkoutUrl);
  },

getPaymentStatusBySessionId: async (sessionId) => {
    if (!sessionId || typeof sessionId !== "string" || !sessionId.trim()) {
      throw new Error("A valid session ID is required.");
    }

    try {
      const response = await apiClient.get(
        `/payments/status-by-session?session_id=${encodeURIComponent(sessionId.trim())}`
      );
      return unwrapResponseData(response);
    } catch (error) {
      throw new Error(
        getErrorMessage(error, "Unable to retrieve payment status from session."),
        { cause: error },
      );
    }
  }
};

export default paymentApi;


// import { apiClient } from "@/services/apiClient";

// const unwrapResponseData = (response) =>
//   response?.data?.data ?? response?.data ?? response;

// const getErrorMessage = (error, fallbackMessage) => {
//   const responseMessage =
//     error?.response?.data?.message ??
//     error?.response?.data?.error ??
//     error?.message;

//   return typeof responseMessage === "string" && responseMessage.trim()
//     ? responseMessage
//     : fallbackMessage;
// };

// const requireBookingId = (bookingId) => {
//   const normalized = String(bookingId ?? "").trim();

//   if (!normalized) {
//     throw new Error("A booking ID is required to process payment.");
//   }

//   return normalized;
// };

// export const extractCheckoutUrl = (payload) => {
//   if (typeof payload === "string") {
//     return payload.trim();
//   }

//   if (!payload || typeof payload !== "object") return "";

//   return String(
//     payload.checkoutUrl ??
//       payload.checkoutURL ??
//       payload.url ??
//       payload.sessionUrl ??
//       payload.checkoutSessionUrl ??
//       payload.session?.url ??
//       payload.checkout?.url ??
//       "",
//   ).trim();
// };

// export const paymentApi = {
//   /** POST /payments/checkout/:bookingId */
//   createCheckoutSession: async (bookingId) => {
//     const id = requireBookingId(bookingId);

//     try {
//       const response = await apiClient.post(
//         `/payments/checkout/${encodeURIComponent(id)}`,
//       );
//       const payload = unwrapResponseData(response);
//       const checkoutUrl = extractCheckoutUrl(payload);

//       if (!checkoutUrl) {
//         throw new Error("The payment provider did not return a checkout URL.");
//       }

//       return { payload, checkoutUrl };
//     } catch (error) {
//       throw new Error(
//         getErrorMessage(error, "Unable to start secure checkout."),
//         { cause: error },
//       );
//     }
//   },

//   /** GET /payments/status/:bookingId */
//   getPaymentStatus: async (bookingId) => {
//     const id = requireBookingId(bookingId);

//     try {
//       const response = await apiClient.get(
//         `/payments/status/${encodeURIComponent(id)}`,
//       );
//       return unwrapResponseData(response);
//     } catch (error) {
//       throw new Error(
//         getErrorMessage(error, "Unable to retrieve payment status."),
//         { cause: error },
//       );
//     }
//   },

//   redirectToCheckout: (checkoutUrl) => {
//     window.location.assign(checkoutUrl);
//   },
// };

// export default paymentApi;
