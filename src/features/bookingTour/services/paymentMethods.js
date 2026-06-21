import { apiClient } from "@/services/apiClient";

// ⚠️ ASSUMED endpoints — confirm exact paths with backend
export async function getPaymentMethods() {
  const res = await apiClient.get("/tourists/payment-methods");
  return res.data;
}

export async function addPaymentMethod(payload) {
  const res = await apiClient.post("/tourists/payment-methods", payload);
  return res.data;
}

export async function updatePaymentMethod(id, payload) {
  const res = await apiClient.patch(`/tourists/payment-methods/${id}`, payload);
  return res.data;
}

export async function deletePaymentMethod(id) {
  const res = await apiClient.delete(`/tourists/payment-methods/${id}`);
  return res.data;
}