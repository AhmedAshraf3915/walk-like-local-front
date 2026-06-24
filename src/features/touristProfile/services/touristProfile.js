import { apiClient } from "@/services/apiClient";
import { uploadProfilePhotoToCloudinary } from "./cloudinaryUpload.js";

// GET /tourists/profile
export async function getTouristProfile() {
  const res = await apiClient.get("/tourists/profile");
  return res.data;
}

// PATCH /tourists/profile
export async function updateTouristProfile(payload) {
  const res = await apiClient.patch("/tourists/profile", payload);
  return res.data;
}

// PATCH /tourists/profile/photo
export async function updateTouristProfilePhoto({ secureUrl, publicId }) {
  const res = await apiClient.patch("/tourists/profile/photo", {
    profilePhoto: { secureUrl, publicId },
  });
  return res.data;
}

export async function uploadAndSaveProfilePhoto(file) {
  const { secureUrl, publicId } = await uploadProfilePhotoToCloudinary(file);
  return updateTouristProfilePhoto({ secureUrl, publicId });
}

/**
 * GET /tourists/verification-status
 *
 * Backend returns:
 *   { success: true, data: { passportVerificationStatus: "PENDING" | "APPROVED" | "REJECTED" } }
 *
 * This function always returns a lowercase string so every caller can simply do:
 *   status === "pending" / "approved" / "rejected"
 */
export async function getVerificationStatus() {
  const res = await apiClient.get("/tourists/verification-status");

  // Try every possible path the backend might use
  const raw =
    res.data?.data?.passportVerificationStatus ??
    res.data?.data?.status ??
    res.data?.passportVerificationStatus ??
    res.data?.status ??
    null;

  return raw ? String(raw).toLowerCase() : null;
}