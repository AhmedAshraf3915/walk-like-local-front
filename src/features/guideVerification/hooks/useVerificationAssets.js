import { useEffect, useRef, useState } from "react";
import { guideVerificationApi } from "@/features/guideVerification/api/guideVerificationApi";
import { initialAssetsState } from "@/features/guideVerification/constants";
import {
	getGuideVerificationPayload,
	readGuideVerificationStatus,
} from "@/features/guideVerification/hooks/useGuideVerificationStatus";

const REQUIRED_ASSET_KEYS = [
	"nationalId",
	"tourismLicense",
	"profilePhoto",
	"introductionVideo",
];

const VERIFICATION_ASSET_CACHE_KEY = "guide-verification-assets-draft";

const getAssetFromStatus = (statusPayload, key) => {
	const source =
		statusPayload?.verificationDocuments?.[key] ??
		statusPayload?.documents?.[key] ??
		statusPayload?.verification?.[key] ??
		statusPayload?.[key];
	const secureUrl =
		typeof source === "string"
			? source
			: source?.secureUrl ?? source?.secure_url ?? source?.url ?? "";
	const publicId =
		typeof source === "object"
			? source?.publicId ?? source?.public_id ?? ""
			: "";

	if (!secureUrl) {
		return null;
	}

	return {
		secureUrl,
		publicId,
		name:
			source?.name ||
			publicId.split("/").pop() ||
			secureUrl.split("/").pop()?.split("?")[0] ||
			"Uploaded",
	};
};

const toVerificationAssetPayload = (asset) => {
	if (!asset?.secureUrl || !asset?.publicId) {
		return null;
	}

	return {
		secureUrl: asset.secureUrl,
		publicId: asset.publicId,
	};
};

const readCachedAssets = () => {
	if (typeof window === "undefined") return null;

	try {
		const rawValue = window.sessionStorage.getItem(
			VERIFICATION_ASSET_CACHE_KEY,
		);
		if (!rawValue) return null;

		const parsed = JSON.parse(rawValue);
		return parsed && typeof parsed === "object" ? parsed : null;
	} catch {
		return null;
	}
};

const writeCachedAssets = (assets) => {
	if (typeof window === "undefined") return;

	try {
		window.sessionStorage.setItem(
			VERIFICATION_ASSET_CACHE_KEY,
			JSON.stringify(assets),
		);
	} catch {
		// Ignore storage errors. The verification flow can continue in memory.
	}
};

const mergeAssetsWithCache = (nextAssets, cachedAssets) => {
	if (!cachedAssets || typeof cachedAssets !== "object") {
		return nextAssets;
	}

	const merged = { ...nextAssets };

	for (const key of REQUIRED_ASSET_KEYS) {
		if (!merged[key]?.secureUrl && cachedAssets[key]?.secureUrl) {
			merged[key] = cachedAssets[key];
		}
	}

	return merged;
};

/**
 * Manages all verification-related state: assets, verification status, file
 * input refs, upload handling, skip toggles, and verification submission.
 */
export const useVerificationAssets = ({ setErrorMessage }) => {
	const [verificationStatus, setVerificationStatus] = useState("none");
	const [assets, setAssets] = useState(initialAssetsState);
	const [uploadingField, setUploadingField] = useState("");
	const [submittingVerification, setSubmittingVerification] = useState(false);
	const [loadingStatus, setLoadingStatus] = useState(true);

	const nationalIdInputRef = useRef(null);
	const licenseInputRef = useRef(null);
	const profilePhotoInputRef = useRef(null);
	const introVideoInputRef = useRef(null);

	const hasAllUploadedAssets = REQUIRED_ASSET_KEYS.every((key) =>
		Boolean(assets[key]),
	);

	useEffect(() => {
		const fetchStatus = async () => {
			setLoadingStatus(true);
			setErrorMessage("");

			try {
				const responseData = await guideVerificationApi.getVerificationStatus();
				const statusPayload = getGuideVerificationPayload(responseData);
				const normalizedStatus = readGuideVerificationStatus(statusPayload);

				setVerificationStatus(normalizedStatus);
				setAssets((currentAssets) => {
					const nextAssets = {
						...currentAssets,
						nationality:
							statusPayload?.nationality ?? currentAssets.nationality,
						nationalId: getAssetFromStatus(statusPayload, "nationalId"),
						tourismLicense: getAssetFromStatus(statusPayload, "tourismLicense"),
						profilePhoto: getAssetFromStatus(statusPayload, "profilePhoto"),
						introductionVideo: getAssetFromStatus(
							statusPayload,
							"introductionVideo",
						),
					};
					const mergedAssets = mergeAssetsWithCache(
						nextAssets,
						readCachedAssets(),
					);

					writeCachedAssets(mergedAssets);
					return mergedAssets;
				});
			} catch (error) {
				setVerificationStatus("none");
				setErrorMessage(error.message ?? "Unable to load verification status.");
			} finally {
				setLoadingStatus(false);
			}
		};

		void fetchStatus();
		// setErrorMessage is a stable React setState setter — safe to omit from deps.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleUpload = async (field, file, type) => {
		if (!file) return;

		setErrorMessage("");
		setUploadingField(field);

		try {
			const uploadedAsset =
				type === "video"
					? await guideVerificationApi.uploadVideo(file)
					: await guideVerificationApi.uploadImage(file);

			setAssets((currentAssets) => {
				const nextAssets = {
					...currentAssets,
					[field]: { ...uploadedAsset, name: file.name },
				};

				writeCachedAssets(nextAssets);
				return nextAssets;
			});
		} catch (error) {
			setErrorMessage(error.message ?? "Upload failed.");
		} finally {
			setUploadingField("");
		}
	};

	const openFilePicker = (field) => {
		const refsByField = {
			nationalId: nationalIdInputRef,
			tourismLicense: licenseInputRef,
			profilePhoto: profilePhotoInputRef,
			introductionVideo: introVideoInputRef,
		};

		refsByField[field]?.current?.click();
	};

	const submitVerification = async () => {
		if (!hasAllUploadedAssets) {
			setErrorMessage("Please upload all required files before continuing.");
			return false;
		}

		setErrorMessage("");
		setSubmittingVerification(true);

		const payload = {
			nationality: assets.nationality || "Egypt",
			nationalId: toVerificationAssetPayload(assets.nationalId),
			tourismLicense: toVerificationAssetPayload(assets.tourismLicense),
			profilePhoto: toVerificationAssetPayload(assets.profilePhoto),
			introductionVideo: toVerificationAssetPayload(assets.introductionVideo),
		};

		try {
			if (verificationStatus === "rejected") {
				await guideVerificationApi.resubmitVerification(payload);
			} else {
				await guideVerificationApi.submitVerification(payload);
			}

			setVerificationStatus("pending");
			return true;
		} catch (error) {
			setErrorMessage(error.message ?? "Unable to submit verification.");
			return false;
		} finally {
			setSubmittingVerification(false);
		}
	};

	return {
		verificationStatus,
		assets,
		uploadingField,
		submittingVerification,
		loadingStatus,
		hasAllUploadedAssets,
		nationalIdInputRef,
		licenseInputRef,
		profilePhotoInputRef,
		introVideoInputRef,
		handleUpload,
		openFilePicker,
		submitVerification,
	};
};
