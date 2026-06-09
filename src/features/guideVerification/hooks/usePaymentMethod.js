import { useState } from "react";
import { initialPaymentState } from "@/features/guideVerification/constants";

/**
 * Manages payment form state: field values, form open/close, and saved status.
 * savePayment() validates required fields and returns an error string on failure,
 * or null on success (and updates state).
 */
export const usePaymentMethod = () => {
	const [payment, setPayment] = useState(initialPaymentState);
	const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
	const [isPaymentSaved, setIsPaymentSaved] = useState(false);

	const setPaymentField = (field, value) => {
		setPayment((current) => ({ ...current, [field]: value }));
	};

	const togglePaymentForm = () => {
		setIsPaymentFormOpen((open) => !open);
	};

	const savePayment = () => {
		const { nameOnCard, cardNumber, expiryDate, cvv } = payment;
		if (!nameOnCard || !cardNumber || !expiryDate || !cvv) {
			return "Please complete card details before saving.";
		}
		setIsPaymentSaved(true);
		setIsPaymentFormOpen(false);
		return null;
	};

	return {
		payment,
		isPaymentFormOpen,
		isPaymentSaved,
		setPaymentField,
		togglePaymentForm,
		savePayment,
	};
};
