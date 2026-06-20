import { apiClient } from "@/services/apiClient";

// POST /payments/checkout/:bookingId -> returns Stripe checkout session URL
export async function createCheckoutSession(bookingId) {
	const res = await apiClient.post(`/payments/checkout/${bookingId}`);
	return res.data;
}

// GET /payments/status/:bookingId -> payment status for a booking (pending/paid/failed/refunded)
export async function getPaymentStatus(bookingId) {
	const res = await apiClient.get(`/payments/status/${bookingId}`);
	return res.data;
}