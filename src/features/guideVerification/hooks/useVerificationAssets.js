import { useEffect, useRef, useState } from "react";
import { guideVerificationApi } from "@/features/guideVerification/api/guideVerificationApi";
import { initialAssetsState } from "@/features/guideVerification/constants";

const REQUIRED_ASSET_KEYS = [
	"nationalId",
	"tourismLicense",
	"profilePhoto",
	"introductionVideo",
];

const normalizeVerificationStatus = (statusValue) => {
	if (typeof statusValue !== "string") return "none";

	const value = statusValue.trim().toLowerCase();
	if (value.includes("pending")) return "pending";
	if (value.includes("approved")) return "approved";
	if (value.includes("rejected")) return "rejected";
	if (value.includes("submitted")) return "pending";

	return "none";
};

const getAssetFromStatus = (statusPayload, key) => {
	const source =
		statusPayload?.verificationDocuments?.[key] ??
		statusPayload?.verification?.[key] ??
		statusPayload?.[key];

	if (!source || !source.secureUrl || !source.publicId) {
		return null;
	}

	return {
		secureUrl: source.secureUrl,
		publicId: source.publicId,
		name: source.publicId.split("/").pop(),
	};
};

const getStatusPayload = (data) =>
	data?.verification ?? data?.guideVerification ?? data ?? {};

/**
 * Manages all verification-related state: assets, verification status, file
 * input refs, upload handling, skip toggles, and verification submission.
 */
export const useVerificationAssets = ({ setErrorMessage }) => {
	const [verificationStatus, setVerificationStatus] = useState("none");
	const [assets, setAssets] = useState(initialAssetsState);
	const [verificationSkips, setVerificationSkips] = useState({
		nationalId: false,
		tourismLicense: false,
		profilePhoto: false,
		introductionVideo: false,
	});
	const [uploadingField, setUploadingField] = useState("");
	const [submittingVerification, setSubmittingVerification] = useState(false);
	const [loadingStatus, setLoadingStatus] = useState(true);

	const nationalIdInputRef = useRef(null);
	const licenseInputRef = useRef(null);
	const profilePhotoInputRef = useRef(null);
	const introVideoInputRef = useRef(null);

	const hasAllRequiredAssets = REQUIRED_ASSET_KEYS.every(
		(key) => Boolean(assets[key]) || verificationSkips[key],
	);

	const hasAllUploadedAssets = REQUIRED_ASSET_KEYS.every((key) =>
		Boolean(assets[key]),
	);

	useEffect(() => {
		const fetchStatus = async () => {
			setLoadingStatus(true);
			setErrorMessage("");

			try {
				const responseData = await guideVerificationApi.getVerificationStatus();
				const statusPayload = getStatusPayload(responseData);
				const normalizedStatus = normalizeVerificationStatus(
					statusPayload?.status ?? statusPayload?.verificationStatus,
				);

				setVerificationStatus(normalizedStatus);
				setAssets((currentAssets) => ({
					...currentAssets,
					nationality: statusPayload?.nationality ?? currentAssets.nationality,
					nationalId: getAssetFromStatus(statusPayload, "nationalId"),
					tourismLicense: getAssetFromStatus(statusPayload, "tourismLicense"),
					profilePhoto: getAssetFromStatus(statusPayload, "profilePhoto"),
					introductionVideo: getAssetFromStatus(statusPayload, "introductionVideo"),
				}));
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

			setAssets((currentAssets) => ({
				...currentAssets,
				[field]: { ...uploadedAsset, name: file.name },
			}));
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

	const toggleVerificationSkip = (field) => {
		setVerificationSkips((currentSkips) => ({
			...currentSkips,
			[field]: !currentSkips[field],
		}));
	};

	const submitVerification = async () => {
		if (!hasAllRequiredAssets) {
			setErrorMessage("Please upload all required files before continuing.");
			return;
		}

		setErrorMessage("");
		setSubmittingVerification(true);

		const payload = {
			nationality: assets.nationality || "Egypt",
			nationalId: assets.nationalId,
			tourismLicense: assets.tourismLicense,
			profilePhoto: assets.profilePhoto,
			introductionVideo: assets.introductionVideo,
		};

		try {
			if (verificationStatus === "rejected") {
				await guideVerificationApi.resubmitVerification(payload);
			} else {
				await guideVerificationApi.submitVerification(payload);
			}

			setVerificationStatus("pending");
		} catch (error) {
			setErrorMessage(error.message ?? "Unable to submit verification.");
		} finally {
			setSubmittingVerification(false);
		}
	};

	return {
		verificationStatus,
		assets,
		verificationSkips,
		uploadingField,
		submittingVerification,
		loadingStatus,
		hasAllRequiredAssets,
		hasAllUploadedAssets,
		nationalIdInputRef,
		licenseInputRef,
		profilePhotoInputRef,
		introVideoInputRef,
		handleUpload,
		openFilePicker,
		toggleVerificationSkip,
		submitVerification,
	};
};
