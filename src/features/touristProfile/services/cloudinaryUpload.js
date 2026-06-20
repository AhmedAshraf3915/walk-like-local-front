// Uploads an image file directly to Cloudinary (unsigned upload preset),
// matching the "Upload profile photo directly to cloudinary" request in the API docs.
// Note: this call goes straight to Cloudinary, not through apiClient (different baseURL/host).

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_FOLDER = "walk-like-local/tourists/profile-photos";

export async function uploadProfilePhotoToCloudinary(file) {
	if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
		throw new Error("Cloudinary env vars are missing (VITE_CLOUDINARY_CLOUD_NAME / VITE_CLOUDINARY_UPLOAD_PRESET).");
	}

	const formData = new FormData();
	formData.append("file", file);
	formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
	formData.append("folder", CLOUDINARY_FOLDER);

	const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`, {
		method: "POST",
		body: formData,
	});

	if (!res.ok) {
		const errBody = await res.json().catch(() => null);
		throw new Error(errBody?.error?.message || "Failed to upload image to Cloudinary");
	}

	const data = await res.json();
	// These are the two fields the backend expects: secureUrl + publicId
	return { secureUrl: data.secure_url, publicId: data.public_id };
}