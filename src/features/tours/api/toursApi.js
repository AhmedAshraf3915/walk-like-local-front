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

const withErrorMessage = async (
	request,
	fallbackMessage,
	transform = unwrapResponseData,
) => {
	try {
		const response = await request();
		return transform(response);
	} catch (error) {
		throw new Error(getErrorMessage(error, fallbackMessage), { cause: error });
	}
};

const unwrapToursPage = (response) => {
	const responseBody = response?.data ?? {};
	const data = responseBody?.data ?? responseBody;
	const items = Array.isArray(data)
		? data
		: data?.tours ?? data?.items ?? data?.results ?? data?.docs ?? [];

	return {
		items,
		pagination: data?.pagination ?? responseBody?.pagination ?? {},
	};
};

const compactParams = (params) =>
	Object.fromEntries(
		Object.entries(params).filter(
			([, value]) => value !== "" && value !== null && value !== undefined,
		),
	);

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
	browseActiveTours: ({
		page = 1,
		limit = 12,
		search = "",
		destination = "",
		groupType = "",
		minPrice = "",
		maxPrice = "",
		sortBy = "createdAt",
		sortOrder = "desc",
	} = {}) =>
		withErrorMessage(
			() =>
				apiClient.get("/tours", {
					params: compactParams({
						page,
						limit,
						search,
						destination,
						groupType,
						minPrice,
						maxPrice,
						sortBy,
						sortOrder,
					}),
					timeout: 60000,
				}),
			"Unable to load active tours.",
			unwrapToursPage,
		),

	getMyTours: ({ page = 1, limit = 12 } = {}) =>
		withErrorMessage(
			() =>
				apiClient.get("/tours/my-tours", {
					params: { page, limit },
					timeout: 60000,
				}),
			"Unable to load your tours.",
			unwrapToursPage,
		),

	createTour: (payload) =>
		withErrorMessage(() => apiClient.post("/tours", payload), "Unable to create tour."),

	uploadImage,
};
