import { paymentApi } from "@/features/payment/api/paymentApi";

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

export const paymentService = {
	createCheckoutSession: paymentApi.createCheckoutSession,
	getPaymentStatus: paymentApi.getPaymentStatus,
};
