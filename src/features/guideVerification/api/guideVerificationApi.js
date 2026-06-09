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

const uploadToCloudinary = async ({ file, resourceType, folder }) => {
	if (!file) {
		throw new Error("Please choose a file before uploading.");
	}

	const formData = new FormData();
	formData.append("file", file);
	formData.append("upload_preset", "walk_like_local");
	formData.append("folder", folder);

	const endpoint =
		resourceType === "image"
			? "https://api.cloudinary.com/v1_1/dau2lq7gn/image/upload"
			: "https://api.cloudinary.com/v1_1/dau2lq7gn/auto/upload";

	return withErrorMessage(
		async () => {
			const response = await cloudinaryClient.post(endpoint, formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});

			return toCloudinaryAsset(response?.data ?? {});
		},
		"Upload failed. Please try again.",
	);
};

export const guideVerificationApi = {
	getVerificationStatus: () =>
		withErrorMessage(
			() => apiClient.get("/guides/verification-status"),
			"Unable to get verification status.",
		),

	submitVerification: (payload) =>
		withErrorMessage(
			() => apiClient.post("/guides/verification", payload),
			"Unable to submit verification documents.",
		),

	resubmitVerification: (payload) =>
		withErrorMessage(
			() => apiClient.patch("/guides/verification/resubmit", payload),
			"Unable to resubmit verification documents.",
		),

	submitAiLanguageTest: (payload) =>
		withErrorMessage(
			() => apiClient.post("/guides/ai-language-test", payload),
			"Unable to submit AI language test.",
		),

	uploadImage: (file) =>
		uploadToCloudinary({
			file,
			resourceType: "image",
			folder: "walk-like-local/guides/images",
		}),

	uploadVideo: (file) =>
		uploadToCloudinary({
			file,
			resourceType: "video",
			folder: "walk-like-local/guides/videos",
		}),

	uploadAudio: (file) =>
		uploadToCloudinary({
			file,
			resourceType: "video",
			folder: "walk-like-local/guides/audio",
		}),
};
