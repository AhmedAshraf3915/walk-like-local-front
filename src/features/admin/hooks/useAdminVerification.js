import { useEffect, useMemo, useState } from "react";
import { adminApi } from "@/features/admin/api/adminApi";
import {
	VERIFICATION_TYPES,
} from "@/features/admin/utils/adminConstants";
import {
	mapVerificationDetails,
	mapVerificationList,
} from "@/features/admin/utils/adminMappers";

export const useAdminVerification = () => {
	const [verificationType, setVerificationType] = useState(
		VERIFICATION_TYPES.guide,
	);
	const [queue, setQueue] = useState([]);
	const [queueLoading, setQueueLoading] = useState(true);
	const [queueError, setQueueError] = useState("");
	const [selectedRecordId, setSelectedRecordId] = useState("");
	const [recordDetails, setRecordDetails] = useState(null);
	const [detailsLoading, setDetailsLoading] = useState(false);
	const [detailsError, setDetailsError] = useState("");
	const [actionLoading, setActionLoading] = useState(false);
	const [rejectReason, setRejectReason] = useState("");
	const [rejectedFieldsText, setRejectedFieldsText] = useState("");

	const selectedRecord = useMemo(
		() => queue.find((record) => record.id === selectedRecordId) ?? null,
		[queue, selectedRecordId],
	);

	const loadVerificationQueue = async () => {
		setQueueLoading(true);
		setQueueError("");

		try {
			const payload =
				verificationType === VERIFICATION_TYPES.guide
					? await adminApi.getPendingGuideVerifications({ page: 1, limit: 30 })
					: await adminApi.getPendingTouristVerifications({
						page: 1,
						limit: 30,
					});

			const records = mapVerificationList(payload, verificationType);
			setQueue(records);
			setSelectedRecordId(records[0]?.id ?? "");
		} catch (error) {
			setQueueError(error.message ?? "Unable to load verification queue.");
			setQueue([]);
			setSelectedRecordId("");
		} finally {
			setQueueLoading(false);
		}
	};

	const loadVerificationDetails = async (recordId) => {
		if (!recordId) {
			setRecordDetails(null);
			setDetailsError("");
			return;
		}

		setDetailsLoading(true);
		setDetailsError("");

		try {
			const payload =
				verificationType === VERIFICATION_TYPES.guide
					? await adminApi.getGuideVerificationDetails(recordId)
					: await adminApi.getTouristVerificationDetails(recordId);

			setRecordDetails(mapVerificationDetails(payload, verificationType));
		} catch (error) {
			setDetailsError(error.message ?? "Unable to load details.");
			setRecordDetails(null);
		} finally {
			setDetailsLoading(false);
		}
	};

	useEffect(() => {
		queueMicrotask(() => {
			void loadVerificationQueue();
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [verificationType]);

	useEffect(() => {
		queueMicrotask(() => {
			void loadVerificationDetails(selectedRecordId);
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedRecordId, verificationType]);

	const handleVerifyAction = async (actionType) => {
		if (!recordDetails?.id || actionLoading) return;

		if (actionType === "reject" && !rejectReason.trim()) {
			setDetailsError("Please provide a rejection reason.");
			return;
		}

		setActionLoading(true);
		setDetailsError("");

		try {
			if (verificationType === VERIFICATION_TYPES.guide) {
				if (actionType === "approve") {
					await adminApi.approveGuideVerification(recordDetails.id);
				} else {
					const rejectedFields = rejectedFieldsText
						.split(",")
						.map((item) => item.trim())
						.filter(Boolean);

					await adminApi.rejectGuideVerification(recordDetails.id, {
						reason: rejectReason.trim(),
						...(rejectedFields.length ? { rejectedFields } : {}),
					});
				}
			} else if (actionType === "approve") {
				await adminApi.approveTouristVerification(recordDetails.id);
			} else {
				await adminApi.rejectTouristVerification(recordDetails.id, {
					reason: rejectReason.trim(),
				});
			}

			setRejectReason("");
			setRejectedFieldsText("");
			await loadVerificationQueue();
		} catch (error) {
			setDetailsError(error.message ?? "Action failed.");
		} finally {
			setActionLoading(false);
		}
	};

	return {
		verificationType,
		setVerificationType,
		queue,
		queueLoading,
		queueError,
		selectedRecord,
		setSelectedRecordId,
		recordDetails,
		detailsLoading,
		detailsError,
		actionLoading,
		rejectReason,
		setRejectReason,
		rejectedFieldsText,
		setRejectedFieldsText,
		handleVerifyAction,
	};
};
