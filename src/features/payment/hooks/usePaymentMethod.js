import { useState } from "react";
import { initialPaymentState, PAYMENT_MESSAGES } from "@/features/payment/constants";
import {
	formatCardNumber,
	formatExpiryDate,
	validateCardNumber,
	validateExpiryDate,
	validateCVV,
	validateCardholderName,
} from "@/services/paymentService";

/**
 * Manages payment form state: field values, form open/close, submission state.
 * Handles card validation and can be extended to call Stripe/backend APIs.
 */
export const usePaymentMethod = () => {
	const [payment, setPayment] = useState(initialPaymentState);
	const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
	const [isPaymentSaved, setIsPaymentSaved] = useState(false);
	const [isSavingPayment, setIsSavingPayment] = useState(false);
	const [paymentError, setPaymentError] = useState("");

	const setPaymentField = (field, value) => {
		setPaymentError("");

		let formatted = value;

		// Auto-format based on field type
		if (field === "cardNumber") {
			formatted = formatCardNumber(value);
		} else if (field === "expiryDate") {
			formatted = formatExpiryDate(value);
		}

		setPayment((current) => ({ ...current, [field]: formatted }));
	};

	const togglePaymentForm = () => {
		setIsPaymentFormOpen((open) => !open);
		setPaymentError("");
	};

	const validatePaymentDetails = () => {
		const { nameOnCard, cardNumber, expiryDate, cvv } = payment;

		if (!nameOnCard?.trim()) {
			return PAYMENT_MESSAGES.CARDHOLDER_NAME_REQUIRED;
		}

		if (!validateCardholderName(nameOnCard)) {
			return PAYMENT_MESSAGES.CARDHOLDER_NAME_INVALID;
		}

		if (!cardNumber?.trim()) {
			return PAYMENT_MESSAGES.CARD_NUMBER_REQUIRED;
		}

		if (!validateCardNumber(cardNumber)) {
			return PAYMENT_MESSAGES.CARD_NUMBER_INVALID;
		}

		if (!expiryDate?.trim()) {
			return PAYMENT_MESSAGES.EXPIRY_DATE_REQUIRED;
		}

		if (!validateExpiryDate(expiryDate)) {
			return PAYMENT_MESSAGES.EXPIRY_DATE_INVALID;
		}

		if (!cvv?.trim()) {
			return PAYMENT_MESSAGES.CVV_REQUIRED;
		}

		if (!validateCVV(cvv)) {
			return PAYMENT_MESSAGES.CVV_INVALID;
		}

		return null;
	};

	const savePayment = async () => {
		const error = validatePaymentDetails();
		if (error) {
			setPaymentError(error);
			return error;
		}

		setIsSavingPayment(true);
		setPaymentError("");

		try {
			// TODO: Integrate with Stripe here
			// 1. Tokenize card with Stripe Elements or Stripe.js
			// 2. Call paymentApi.savePaymentMethod(paymentMethodId)
			// 3. Handle response/errors
			// For now, simulate successful save
			await new Promise((resolve) => setTimeout(resolve, 500));

			setIsPaymentSaved(true);
			setIsPaymentFormOpen(false);
			return null;
		} catch (err) {
			const errorMsg = err.message ?? PAYMENT_MESSAGES.PAYMENT_SAVE_ERROR;
			setPaymentError(errorMsg);
			return errorMsg;
		} finally {
			setIsSavingPayment(false);
		}
	};

	return {
		payment,
		isPaymentFormOpen,
		isPaymentSaved,
		isSavingPayment,
		paymentError,
		setPaymentField,
		togglePaymentForm,
		savePayment,
		validatePaymentDetails,
	};
};
