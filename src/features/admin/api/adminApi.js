import { apiClient } from "@/services/apiClient";

const unwrapResponseData = (response) => response?.data?.data ?? response?.data ?? null;

const getErrorMessage = (error, fallbackMessage) => {
	const responseMessage =
		error?.response?.data?.message ??
		error?.response?.data?.error ??
		error?.message;

	if (typeof responseMessage === "string" && responseMessage.trim()) {
		return responseMessage;
	}

	return fallbackMessage;
};

const withErrorMessage = async (request, fallbackMessage) => {
	try {
		const response = await request();
		return unwrapResponseData(response);
	} catch (error) {
		throw new Error(getErrorMessage(error, fallbackMessage), { cause: error });
	}
};

export const adminApi = {
	getPendingGuideVerifications: ({ page = 1, limit = 10 } = {}) =>
		withErrorMessage(
			() => apiClient.get("/admin/guides/verifications", { params: { page, limit } }),
			"Unable to load pending guide verifications.",
		),

	getGuideVerificationDetails: (guideId) =>
		withErrorMessage(
			() => apiClient.get(`/admin/guides/verifications/${guideId}`),
			"Unable to load guide verification details.",
		),

	approveGuideVerification: (guideId) =>
		withErrorMessage(
			() => apiClient.put(`/admin/guides/verifications/${guideId}/approve`),
			"Unable to approve guide verification.",
		),

	rejectGuideVerification: (guideId, payload) =>
		withErrorMessage(
			() => apiClient.put(`/admin/guides/verifications/${guideId}/reject`, payload),
			"Unable to reject guide verification.",
		),

	getPendingTouristVerifications: ({ page = 1, limit = 10 } = {}) =>
		withErrorMessage(
			() => apiClient.get("/admin/tourists/verifications", { params: { page, limit } }),
			"Unable to load pending tourist verifications.",
		),

	getTouristVerificationDetails: (touristId) =>
		withErrorMessage(
			() => apiClient.get(`/admin/tourists/verifications/${touristId}`),
			"Unable to load tourist verification details.",
		),

	approveTouristVerification: (touristId) =>
		withErrorMessage(
			() => apiClient.put(`/admin/tourists/verifications/${touristId}/approve`),
			"Unable to approve tourist verification.",
		),

	rejectTouristVerification: (touristId, payload) =>
		withErrorMessage(
			() => apiClient.put(`/admin/tourists/verifications/${touristId}/reject`, payload),
			"Unable to reject tourist verification.",
		),

	getUsers: ({ page = 1, limit = 10, status, role, search } = {}) =>
		withErrorMessage(
			() =>
				apiClient.get("/admin/users", {
					params: {
						page,
						limit,
						...(status ? { status } : {}),
						...(role ? { role } : {}),
						...(search ? { search } : {}),
					},
				}),
			"Unable to load users.",
		),

	getUsersStats: () =>
		withErrorMessage(
			() => apiClient.get("/admin/users/stats"),
			"Unable to load user statistics.",
		),

	getUserById: (userId) =>
		withErrorMessage(
			() => apiClient.get(`/admin/users/${userId}`),
			"Unable to load user details.",
		),

	suspendUser: (userId) =>
		withErrorMessage(
			() => apiClient.put(`/admin/users/${userId}/suspend`),
			"Unable to suspend user.",
		),

	activateUser: (userId) =>
		withErrorMessage(
			() => apiClient.put(`/admin/users/${userId}/activate`),
			"Unable to activate user.",
		),

	banUser: (userId) =>
		withErrorMessage(
			() => apiClient.put(`/admin/users/${userId}/ban`),
			"Unable to ban user.",
		),

	unbanUser: (userId) =>
		withErrorMessage(
			() => apiClient.put(`/admin/users/${userId}/unban`),
			"Unable to unban user.",
		),
};
