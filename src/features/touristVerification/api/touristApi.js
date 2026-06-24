import { apiClient } from "@/services/apiClient";

// ── Cloudinary upload ─────────────────────────────────────────────────────────
export const uploadToCloudinary = async (file, folder) => {
  const cloudName    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
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

// ── Tourist API ───────────────────────────────────────────────────────────────
export const touristApi = {
  getProfile: () =>
    apiClient.get("/tourists/profile").then((r) => r.data?.data ?? r.data),

  updateProfile: (data) =>
    apiClient.patch("/tourists/profile", data).then((r) => r.data?.data ?? r.data),

  updateProfilePhoto: async (file) => {
    const { secureUrl, publicId } = await uploadToCloudinary(
      file,
      "walk-like-local/tourists/profile-photos"
    );
    return apiClient
      .patch("/tourists/profile/photo", { profilePhoto: { secureUrl, publicId } })
      .then((r) => r.data?.data ?? r.data);
  },

  // ── Verification ─────────────────────────────────────────────────────────
  // Backend returns: { success: true, data: { passportVerificationStatus: "PENDING" } }
  // We always return lowercase: "pending" | "approved" | "rejected" | null
  getVerificationStatus: () =>
    apiClient.get("/tourists/verification-status").then((r) => {
      const raw =
        r.data?.data?.passportVerificationStatus ??
        r.data?.data?.status ??
        r.data?.passportVerificationStatus ??
        r.data?.status ??
        null;
      return raw ? String(raw).toLowerCase() : null;
    }),

  submitPassport: async (file) => {
    const { secureUrl, publicId } = await uploadToCloudinary(
      file,
      "walk-like-local/tourists/passports"
    );
    return apiClient
      .post("/tourists/verification", { passport: { secureUrl, publicId } })
      .then((r) => r.data?.data ?? r.data);
  },

  resubmitPassport: async (file) => {
    const { secureUrl, publicId } = await uploadToCloudinary(
      file,
      "walk-like-local/tourists/passports"
    );
    return apiClient
      .patch("/tourists/verification/resubmit", { passport: { secureUrl, publicId } })
      .then((r) => r.data?.data ?? r.data);
  },

  // ── Bookings ──────────────────────────────────────────────────────────────
  getMyBookings: (params = {}) =>
    apiClient.get("/tourists/bookings", { params }).then((r) => r.data?.data ?? r.data),

  createBooking: (data) =>
    apiClient.post("/tourists/bookings", data).then((r) => r.data?.data ?? r.data),

  cancelBooking: (bookingId, reason) =>
    apiClient
      .patch(`/tourists/bookings/${encodeURIComponent(bookingId)}/cancel`, { reason })
      .then((r) => r.data?.data ?? r.data),

  getPaymentStatus: (bookingId) =>
    apiClient
      .get(`/payments/status/${encodeURIComponent(bookingId)}`)
      .then((r) => r.data?.data ?? r.data),
};