import axios from "axios";
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

const cloudinaryClient = axios.create({ timeout: 30000 });

const toCloudinaryAsset = (responseData) => ({
	secureUrl: responseData?.secure_url ?? "",
	publicId: responseData?.public_id ?? "",
});

const uploadImage = async (file) => {
	if (!file) {
		throw new Error("Please choose an image before uploading.");
	}

	const formData = new FormData();
	formData.append("file", file);
	formData.append("upload_preset", "walk_like_local");
	formData.append("folder", "walk-like-local/tours/images");

	return withErrorMessage(
		async () => {
			const response = await cloudinaryClient.post(
				"https://api.cloudinary.com/v1_1/dau2lq7gn/image/upload",
				formData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
					},
				},
			);

			return toCloudinaryAsset(response?.data ?? {});
		},
		"Image upload failed. Please try again.",
	);
};

export const toursApi = {

	getActiveTours: (params = {}) =>
		withErrorMessage(
			() => apiClient.get("/tours", { params }),
			"Unable to fetch tours.",
		),

	getMyTours: (params = {}) =>
		withErrorMessage(
			() => apiClient.get("/tours/my-tours", { params }),
			"Unable to fetch your tours.",
		),

	createTour: (payload) =>
		withErrorMessage(() => apiClient.post("/tours", payload), "Unable to create tour."),

	updateTour: (id, payload) =>
		withErrorMessage(() => apiClient.patch(`/tours/${id}`, payload), "Unable to update tour."),

	activateTour: (id) =>
		withErrorMessage(() => apiClient.patch(`/tours/${id}/activate`), "Unable to activate tour."),

	deactivateTour: (id) =>
		withErrorMessage(() => apiClient.patch(`/tours/${id}/deactivate`), "Unable to deactivate tour."),

	addSlot: (tourId, slotData) =>
		withErrorMessage(() => apiClient.post(`/tours/${tourId}/slots`, slotData), "Unable to add slot."),

	deleteSlot: (tourId, slotId) =>
		withErrorMessage(() => apiClient.delete(`/tours/${tourId}/slots/${slotId}`), "Unable to delete slot."),

	uploadImage,
};
