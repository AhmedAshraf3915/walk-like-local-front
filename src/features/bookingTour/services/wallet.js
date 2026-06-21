import { apiClient } from "@/services/apiClient";

// ⚠️ ASSUMED endpoints — confirm exact paths with backend
export async function getWallet() {
  const res = await apiClient.get("/tourists/wallet");
  return res.data;
}

export async function getRefundHistory() {
  const res = await apiClient.get("/tourists/refunds");
  return res.data;
}