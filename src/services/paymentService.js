import { apiClient } from "@/services/apiClient";

/**
 * Payment Service - Handles all payment processing operations
 * Integrates with Stripe for PCI compliance
 */

// Format card number with spaces (XXXX XXXX XXXX XXXX)
export const formatCardNumber = (value) => {
	const cleaned = value.replace(/\D/g, "");
	const formatted = cleaned
		.slice(0, 16)
		.replace(/(.{4})/g, "$1 ")
		.trim();
	return formatted;
};

// Format expiry date (MM/YY)
export const formatExpiryDate = (value) => {
	const cleaned = value.replace(/\D/g, "");
	if (cleaned.length >= 2) {
		return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
	}
	return cleaned;
};

// Validate card number using Luhn algorithm
export const validateCardNumber = (cardNumber) => {
	const cleaned = cardNumber.replace(/\D/g, "");
	if (cleaned.length !== 16) return false;

	let sum = 0;
	let isEven = false;

	for (let i = cleaned.length - 1; i >= 0; i--) {
		let digit = parseInt(cleaned[i], 10);

		if (isEven) {
			digit *= 2;
			if (digit > 9) {
				digit -= 9;
			}
		}

		sum += digit;
		isEven = !isEven;
	}

	return sum % 10 === 0;
};

// Validate expiry date (MM/YY format and future date)
export const validateExpiryDate = (expiryDate) => {
	const match = expiryDate.match(/^(\d{2})\/(\d{2})$/);
	if (!match) return false;

	const month = parseInt(match[1], 10);
	const year = parseInt(`20${match[2]}`, 10);

	if (month < 1 || month > 12) return false;

	const now = new Date();
	const currentYear = now.getFullYear();
	const currentMonth = now.getMonth() + 1;

	if (year < currentYear) return false;
	if (year === currentYear && month < currentMonth) return false;

	return true;
};

// Validate CVV (3 or 4 digits)
export const validateCVV = (cvv) => {
	const cleaned = cvv.replace(/\D/g, "");
	return cleaned.length === 3 || cleaned.length === 4;
};

// Validate cardholder name (at least 2 characters, letters and spaces only)
export const validateCardholderName = (name) => {
	const trimmed = name.trim();
	return trimmed.length >= 2 && /^[a-zA-Z\s]+$/.test(trimmed);
};

/**
 * Create a payment intent with the backend
 * The backend will use Stripe's Payment Intent API
 * Frontend sends: amount, currency
 * Backend returns: clientSecret for Stripe confirmation
 */
export const paymentService = {
	// Create payment intent - call backend which talks to Stripe
	createPaymentIntent: (amount, currency = "USD") =>
		apiClient.post("/payments/create-intent", { amount, currency }),

	// Confirm payment with Stripe token from frontend
	// In production with Stripe Elements, this happens on the backend
	confirmPayment: (paymentIntentId, paymentMethodId) =>
		apiClient.post("/payments/confirm", { paymentIntentId, paymentMethodId }),

	// Save payment method for future use (tokenized, not stored directly)
	savePaymentMethod: (paymentMethodId, isDefault = true) =>
		apiClient.post("/payments/save-method", { paymentMethodId, isDefault }),

	// Get saved payment methods for the authenticated user
	getSavedPaymentMethods: () =>
		apiClient.get("/payments/saved-methods"),

	// Delete saved payment method
	deletePaymentMethod: (paymentMethodId) =>
		apiClient.delete(`/payments/saved-methods/${paymentMethodId}`),

	// Get payment history
	getPaymentHistory: () =>
		apiClient.get("/payments/history"),

	// Get payment status
	getPaymentStatus: (paymentIntentId) =>
		apiClient.get(`/payments/status/${paymentIntentId}`),

	// For now: Simple backend validation endpoint (remove once Stripe Elements integrated)
	validatePaymentDetails: (cardDetails) =>
		apiClient.post("/payments/validate", cardDetails),
};

/**
 * Stripe initialization helper
 * Call this once in your app initialization
 */
export const initializeStripe = async () => {
	if (window.Stripe) {
		return window.Stripe;
	}

	return new Promise((resolve) => {
		const script = document.createElement("script");
		script.src = "https://js.stripe.com/v3/";
		script.onload = () => {
			resolve(window.Stripe);
		};
		document.body.appendChild(script);
	});
};
