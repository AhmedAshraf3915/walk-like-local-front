import apiClient from "@/services/apiClient";

/**
 * Payment API layer - handles all payment-related requests
 * Currently includes stubs for Stripe integration
 */

export const paymentApi = {
	/**
	 * Create a payment intent for processing payment
	 * @param {number} amount - Amount in cents (e.g., 5000 for $50.00)
	 * @param {string} currency - Currency code (default: USD)
	 * @returns {Promise<{clientSecret: string, paymentIntentId: string}>}
	 */
	createPaymentIntent: async (amount, currency = "USD") => {
		return withErrorMessage(() =>
			apiClient.post("/payments/create-intent", { amount, currency })
		);
	},

	/**
	 * Confirm a payment intent with a payment method
	 * @param {string} paymentIntentId - Stripe payment intent ID
	 * @param {string} paymentMethodId - Stripe payment method ID
	 * @returns {Promise<{success: boolean, paymentIntent: object}>}
	 */
	confirmPayment: async (paymentIntentId, paymentMethodId) => {
		return withErrorMessage(() =>
			apiClient.post("/payments/confirm", {
				paymentIntentId,
				paymentMethodId,
			})
		);
	},

	/**
	 * Save a payment method for future charges
	 * @param {string} paymentMethodId - Stripe payment method ID
	 * @param {boolean} isDefault - Set as default payment method
	 * @returns {Promise<{success: boolean, customer: object}>}
	 */
	savePaymentMethod: async (paymentMethodId, isDefault = true) => {
		return withErrorMessage(() =>
			apiClient.post("/payments/save-method", {
				paymentMethodId,
				isDefault,
			})
		);
	},

	/**
	 * Get list of saved payment methods for current user
	 * @returns {Promise<{methods: Array}>}
	 */
	getSavedPaymentMethods: async () => {
		return withErrorMessage(() => apiClient.get("/payments/saved-methods"));
	},

	/**
	 * Delete a saved payment method
	 * @param {string} paymentMethodId - Payment method ID to delete
	 * @returns {Promise<{success: boolean}>}
	 */
	deletePaymentMethod: async (paymentMethodId) => {
		return withErrorMessage(() =>
			apiClient.delete(`/payments/${paymentMethodId}`)
		);
	},

	/**
	 * Get payment history for current user
	 * @returns {Promise<{history: Array}>}
	 */
	getPaymentHistory: async () => {
		return withErrorMessage(() => apiClient.get("/payments/history"));
	},

	/**
	 * Validate payment details (optional backend validation)
	 * @param {object} cardDetails - Card details to validate
	 * @returns {Promise<{valid: boolean}>}
	 */
	validatePaymentDetails: async (cardDetails) => {
		return withErrorMessage(() =>
			apiClient.post("/payments/validate", cardDetails)
		);
	},
};

/**
 * Wraps API calls with error handling
 */
const withErrorMessage = async (apiCall) => {
	try {
		const response = await apiCall();
		return response.data;
	} catch (error) {
		const message =
			error.response?.data?.message ||
			error.message ||
			"An error occurred. Please try again.";
		throw new Error(message, { cause: error });
	}
};

export default paymentApi;
