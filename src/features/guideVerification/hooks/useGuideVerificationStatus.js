import { useEffect, useState } from "react";
import { guideVerificationApi } from "@/features/guideVerification/api/guideVerificationApi";

export const normalizeGuideVerificationStatus = (statusValue) => {
  if (typeof statusValue === "boolean") {
    return statusValue ? "approved" : "none";
  }

  if (typeof statusValue !== "string") {
    return "none";
  }

  const value = statusValue.trim().toLowerCase();

  if (value.includes("unverified") || value.includes("not verified")) {
    return "none";
  }
  if (
    value === "true" ||
    value.includes("approved") ||
    value.includes("verified")
  ) {
    return "approved";
  }
  if (value.includes("pending") || value.includes("submitted")) {
    return "pending";
  }
  if (value.includes("reject")) {
    return "rejected";
  }

  return "none";
};

export const getGuideVerificationPayload = (data) => {
  if (typeof data === "string" || typeof data === "boolean") {
    return { verificationStatus: data };
  }

  if (!data || typeof data !== "object") {
    return {};
  }

  const nestedVerification =
    data.guideVerification ?? data.verification ?? {};

  return nestedVerification && typeof nestedVerification === "object"
    ? { ...data, ...nestedVerification }
    : data;
};

export const readGuideVerificationStatus = (source) => {
  if (typeof source === "string" || typeof source === "boolean") {
    return normalizeGuideVerificationStatus(source);
  }

  const explicitStatus = normalizeGuideVerificationStatus(
    source?.verificationStatus ??
      source?.guideVerificationStatus ??
      source?.approvalStatus ??
      source?.verificationState ??
      source?.guideVerification?.status ??
      source?.verification?.status ??
      (typeof source?.guideVerification === "string"
        ? source.guideVerification
        : undefined) ??
      (typeof source?.verification === "string"
        ? source.verification
        : undefined) ??
      source?.status,
  );

  if (explicitStatus !== "none") return explicitStatus;

  return normalizeGuideVerificationStatus(
    source?.isGuideVerified ??
      source?.isVerifiedGuide ??
      source?.isGuideApproved ??
      source?.isApproved ??
      source?.guideVerification?.isVerified ??
      source?.verification?.isVerified ??
      source?.isVerified ??
      source?.verified,
  );
};

export const useGuideVerificationStatus = ({ user, enabled = true } = {}) => {
  const [status, setStatus] = useState(() =>
    readGuideVerificationStatus(user),
  );
  const [verification, setVerification] = useState(() =>
    getGuideVerificationPayload(
      user?.guideVerification ?? user?.verification ?? {},
    ),
  );
  const [isLoading, setIsLoading] = useState(enabled);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    if (!enabled) {
      return () => {
        isMounted = false;
      };
    }

    const loadStatus = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const responseData = await guideVerificationApi.getVerificationStatus();
        const nextVerification = getGuideVerificationPayload(responseData);

        if (!isMounted) return;

        setVerification(nextVerification);
        setStatus(readGuideVerificationStatus(nextVerification));
      } catch (error) {
        if (!isMounted) return;

        setStatus("none");
        setErrorMessage(
          error?.message ?? "Unable to confirm guide verification status.",
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadStatus();

    return () => {
      isMounted = false;
    };
  }, [enabled]);

  return {
    status,
    verification,
    isLoading: enabled ? isLoading : false,
    errorMessage: enabled ? errorMessage : "",
    isVerified: enabled && status === "approved",
  };
};
