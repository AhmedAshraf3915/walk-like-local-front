import axios from "axios";
import { apiClient } from "@/services/apiClient";

const unwrapResponseData = (response) => response?.data?.data ?? response?.data ?? null;

const GUIDE_REQUEST_TIMEOUT_MS = 60000;
const AI_REQUEST_TIMEOUT_MS = 120000;
const IMAGE_UPLOAD_TIMEOUT_MS = 90000;
const MEDIA_UPLOAD_TIMEOUT_MS = 180000;

const isTimeoutError = (error) =>
	error?.code === "ECONNABORTED" ||
	error?.code === "ETIMEDOUT" ||
	/timeout.*exceeded|timed out/i.test(String(error?.message ?? ""));

const getErrorMessage = (error, fallbackMessage) => {
	if (isTimeoutError(error)) {
		return `${fallbackMessage} The request took too long. Please check your connection and try again.`;
	}

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

const cloudinaryClient = axios.create();

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
      : resourceType === "audio"
        ? "https://api.cloudinary.com/v1_1/dau2lq7gn/video/upload"
        : "https://api.cloudinary.com/v1_1/dau2lq7gn/auto/upload";

	return withErrorMessage(
		async () => {
			return cloudinaryClient.post(endpoint, formData, {
				timeout:
					resourceType === "image"
						? IMAGE_UPLOAD_TIMEOUT_MS
						: MEDIA_UPLOAD_TIMEOUT_MS,
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});
		},
		"Upload failed. Please try again.",
		(response) => toCloudinaryAsset(response?.data ?? {}),
	);
};

export const guideVerificationApi = {
	getVerificationStatus: () =>
		withErrorMessage(
			() =>
				apiClient.get("/guides/verification-status", {
					timeout: GUIDE_REQUEST_TIMEOUT_MS,
				}),
			"Unable to get verification status.",
		),

	getLanguageTestStatus: (languages = []) =>
		withErrorMessage(
			() =>
				apiClient.get("/guides/language-test/status", {
					...(languages.length > 0 ? { data: { languages } } : {}),
					timeout: GUIDE_REQUEST_TIMEOUT_MS,
				}),
			"Unable to get language test status.",
		),

	startLanguageTest: (payload) =>
		withErrorMessage(
			() =>
				apiClient.post("/guides/language-test/start", payload, {
					timeout: AI_REQUEST_TIMEOUT_MS,
				}),
			"Unable to start language test.",
		),

	getLanguageTestSession: (sessionId) =>
		withErrorMessage(
			() =>
				apiClient.get(`/guides/language-test/${encodeURIComponent(sessionId)}`, {
					timeout: GUIDE_REQUEST_TIMEOUT_MS,
				}),
			"Unable to get language test session.",
		),

	getLanguageTestQuestionAudio: (sessionId, questionId, language = "") =>
		withErrorMessage(
			() =>
				apiClient.get(
					`/guides/language-test/${encodeURIComponent(sessionId)}/questions/${encodeURIComponent(questionId)}/audio`,
					{
						...(language ? { data: { language } } : {}),
						responseType: "blob",
						timeout: GUIDE_REQUEST_TIMEOUT_MS,
					},
				),
			"Unable to get language test question audio.",
		),

	submitLanguageTest: (sessionId, payload) =>
		withErrorMessage(
			() =>
				apiClient.post(`/guides/language-test/${encodeURIComponent(sessionId)}/submit`, payload, {
					timeout: AI_REQUEST_TIMEOUT_MS,
				}),
			"Unable to submit language test.",
		),

	reportLanguageTestIntegrityEvents: (sessionId, payload) =>
		withErrorMessage(
			() =>
				apiClient.post(
					`/guides/language-test/${encodeURIComponent(sessionId)}/integrity-events`,
					payload,
					{ timeout: GUIDE_REQUEST_TIMEOUT_MS },
				),
			"Unable to report language test integrity events.",
		),

	getLanguageTestHistory: () =>
		withErrorMessage(
			() =>
				apiClient.get("/guides/language-test/history", {
					timeout: GUIDE_REQUEST_TIMEOUT_MS,
				}),
			"Unable to get language test history.",
		),

	submitVerification: (payload) =>
		withErrorMessage(
			() =>
				apiClient.post("/guides/verification", payload, {
					timeout: GUIDE_REQUEST_TIMEOUT_MS,
				}),
			"Unable to submit verification documents.",
		),

	resubmitVerification: (payload) =>
		withErrorMessage(
			() =>
				apiClient.patch("/guides/verification/resubmit", payload, {
					timeout: GUIDE_REQUEST_TIMEOUT_MS,
				}),
			"Unable to resubmit verification documents.",
		),

	updateGuideLanguages: (payload) =>
		withErrorMessage(
			() =>
				apiClient.put("/guides/profile/languages", payload, {
					timeout: GUIDE_REQUEST_TIMEOUT_MS,
				}),
			"Unable to save guide languages.",
		),

	completeGuideProfile: (payload) =>
		withErrorMessage(
			() =>
				apiClient.patch("/guides/profile", payload, {
					timeout: GUIDE_REQUEST_TIMEOUT_MS,
				}),
			"Unable to complete guide profile.",
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
      resourceType: "audio",
      folder: "walk-like-local/guides/audio",
    }),
};
