import { apiClient } from "@/services/apiClient";

// ── Cloudinary upload 
/**
 * Uploads a file directly to Cloudinary.
 * Returns { secureUrl, publicId }
 */
export const uploadToCloudinary = async (file, folder) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? "Cloudinary upload failed");
  }

  const data = await res.json();
  return { secureUrl: data.secure_url, publicId: data.public_id };
};

// ── Tourist profile API 
export const touristApi = {
  /** GET /tourists/profile */
  getProfile: () => apiClient.get("/tourists/profile").then((r) => r.data?.data ?? r.data),

  /**
   * PATCH /tourists/profile
   * body: { nationality, preferredLanguages, interests, travelPreferences }
   */
  updateProfile: (data) =>
    apiClient.patch("/tourists/profile", data).then((r) => r.data?.data ?? r.data),

  /**
   * PATCH /tourists/profile/photo
   * Uploads file to Cloudinary first, then sends { profilePhoto: { secureUrl, publicId } }
   */
  updateProfilePhoto: async (file) => {
    const { secureUrl, publicId } = await uploadToCloudinary(
      file,
      "walk-like-local/tourists/profile-photos"
    );
    return apiClient
      .patch("/tourists/profile/photo", { profilePhoto: { secureUrl, publicId } })
      .then((r) => r.data?.data ?? r.data);
  },

  // ── Verification 

  /** GET /tourists/verification-status */
  getVerificationStatus: () =>
    apiClient.get("/tourists/verification-status").then((r) => r.data?.data ?? r.data),

  /**
   * POST /tourists/verification
   * Uploads passport to Cloudinary first, then submits { passport: { secureUrl, publicId } }
   */
  submitPassport: async (file) => {
    const { secureUrl, publicId } = await uploadToCloudinary(
      file,
      "walk-like-local/tourists/passports"
    );
    return apiClient
      .post("/tourists/verification", { passport: { secureUrl, publicId } })
      .then((r) => r.data?.data ?? r.data);
  },

  /**
   * PATCH /tourists/verification/resubmit
   * Only allowed when status === "rejected"
   */
  resubmitPassport: async (file) => {
    const { secureUrl, publicId } = await uploadToCloudinary(
      file,
      "walk-like-local/tourists/passports"
    );
    return apiClient
      .patch("/tourists/verification/resubmit", { passport: { secureUrl, publicId } })
      .then((r) => r.data?.data ?? r.data);
  },

  // ── Bookings ──

  /** GET /tourists/bookings */
  getMyBookings: (params = {}) =>
    apiClient.get("/tourists/bookings", { params }).then((r) => r.data?.data ?? r.data),

  /** POST /tourists/bookings — create booking for a tour slot */
  createBooking: (data) =>
    apiClient.post("/tourists/bookings", data).then((r) => r.data?.data ?? r.data),

  /** PATCH /tourists/bookings/:id/cancel */
  cancelBooking: (bookingId, reason) =>
    apiClient.patch(`/tourists/bookings/${bookingId}/cancel`, { reason }).then((r) => r.data?.data ?? r.data),

  /** GET /payments/status/:bookingId */
  getPaymentStatus: (bookingId) =>
    apiClient.get(`/payments/status/${bookingId}`).then((r) => r.data?.data ?? r.data),
};
