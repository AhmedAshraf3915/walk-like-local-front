import { apiClient } from "@/services/apiClient";
import { uploadProfilePhotoToCloudinary } from "./cloudinaryUpload.js";

// GET {{baseUrl}}/tourists/profile
export async function getTouristProfile() {
	const res = await apiClient.get("/tourists/profile");
	return res.data;
}

// PATCH {{baseUrl}}/tourists/profile
// payload can include: nationality, languages, interests, preferences, fullName, etc.
export async function updateTouristProfile(payload) {
	const res = await apiClient.patch("/tourists/profile", payload);
	return res.data;
}

// PATCH {{baseUrl}}/tourists/profile/photo
// Requires both secureUrl and publicId (both required by backend validation).
export async function updateTouristProfilePhoto({ secureUrl, publicId }) {
	const res = await apiClient.patch("/tourists/profile/photo", {
		profilePhoto: { secureUrl, publicId },
	});
	return res.data;
}

// Convenience helper: upload the raw file to Cloudinary, then save the
// returned secureUrl/publicId on the tourist's profile in one call.
export async function uploadAndSaveProfilePhoto(file) {
	const { secureUrl, publicId } = await uploadProfilePhotoToCloudinary(file);
	return updateTouristProfilePhoto({ secureUrl, publicId });
}