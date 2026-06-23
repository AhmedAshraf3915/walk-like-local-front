import { apiClient } from "@/services/apiClient";

// POST /tourists/bookings
export async function createBooking({ tourId, slotId, groupSize, members = [], deselectedActivityIds = [], couponCode }) {
	const res = await apiClient.post("/tourists/bookings", {
		tourId,
		slotId,
		groupSize,
		members,
		deselectedActivityIds,
		...(couponCode ? { couponCode } : {}),
	});
	return res.data;
}

// GET /tourists/bookings  (returns bookings with all statuses)
export async function getMyBookings() {
	const res = await apiClient.get("/tourists/bookings");
	console.log("BOOKINGS RESPONSE", res);
	return res.data;
}

// GET /tourists/bookings/:bookingId
export async function getBookingById(bookingId) {
	const res = await apiClient.get(`/tourists/bookings/${bookingId}`);
	console.log("BOOKINGS RESPONSE", res);
	return res.data;
}

// PATCH /tourists/bookings/:bookingId/cancel
export async function cancelBooking(bookingId, reason) {
	const res = await apiClient.patch(`/tourists/bookings/${bookingId}/cancel`, { reason });
	return res.data;
}