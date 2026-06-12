/**
 * Payment feature constants
 */

export const initialPaymentState = {
	nameOnCard: "",
	cardNumber: "",
	expiryDate: "",
	cvv: "",
};

export const CARD_LIMITS = {
	nameOnCard: 50,
	cardNumber: 19,
	expiryDate: 5,
	cvv: 4,
};

export const PAYMENT_MESSAGES = {
	CARDHOLDER_NAME_REQUIRED: "Cardholder name is required.",
	CARDHOLDER_NAME_INVALID: "Cardholder name must be at least 2 letters.",
	CARD_NUMBER_REQUIRED: "Card number is required.",
	CARD_NUMBER_INVALID: "Card number is invalid. Please check and try again.",
	EXPIRY_DATE_REQUIRED: "Expiry date is required.",
	EXPIRY_DATE_INVALID: "Expiry date is invalid (use MM/YY format and a future date).",
	CVV_REQUIRED: "CVV is required.",
	CVV_INVALID: "CVV must be 3 or 4 digits.",
	PAYMENT_SAVE_SUCCESS: "Card saved successfully!",
	PAYMENT_SAVE_ERROR: "Unable to save payment method.",
	PAYMENT_SUCCESS_TITLE: "Payout Method Added Successfully!",
	PAYMENT_SUCCESS_MESSAGE: (last4) =>
		`Card ending in ${last4} is now connected to your Locale wallet.`,
};
