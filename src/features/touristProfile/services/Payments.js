import { apiClient } from "@/services/apiClient";

// POST /payments/checkout/:bookingId -> returns Stripe checkout session URL
export async function createCheckoutSession(bookingId) {
	const origin = window.location.origin;
	const successUrl = `${origin}/tourist/bookings/${bookingId}/confirmation?status=success`;
	const cancelUrl = `${origin}/tourist/bookings/${bookingId}/confirmation?status=failed`;
	const res = await apiClient.post(`/payments/checkout/${bookingId}`, {
		successUrl,
		cancelUrl,
	});
	return res.data;
}

// GET /payments/status/:bookingId -> payment status for a booking (pending/paid/failed/refunded)
export async function getPaymentStatus(bookingId) {
	const res = await apiClient.get(`/payments/status/${bookingId}`);
	return res.data;
}