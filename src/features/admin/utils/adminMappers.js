import {
	formatDate,
	readPossible,
	toArray,
} from "@/features/admin/utils/adminFormatters";
import { VERIFICATION_TYPES } from "@/features/admin/utils/adminConstants";

export const mapVerificationList = (payload, type) => {
	const records = toArray(payload);

	return records.map((item, index) => {
		const entity = item?.guide ?? item?.tourist ?? item?.user ?? item ?? {};
		const id =
			item?._id ?? item?.id ?? entity?._id ?? entity?.id ?? `${type}-${index}`;

		const fullName = readPossible(entity, ["fullName", "name"], "Unknown user");
		const email = readPossible(entity, ["email"], "No email");
		const createdAt =
			item?.createdAt ??
			item?.updatedAt ??
			entity?.createdAt ??
			entity?.updatedAt ??
			null;

		return {
			id,
			fullName,
			email,
			createdAt,
			status: String(item?.status ?? "PENDING").toUpperCase(),
		};
	});
};

export const mapVerificationDetails = (payload, type) => {
	const record = payload && typeof payload === "object" ? payload : {};
	const entity = record?.guide ?? record?.tourist ?? record?.user ?? {};

	const documents = [];
	const pushDocument = (label, value, sizeLabel = "") => {
		if (!value || typeof value !== "object") return;

		const secureUrl = readPossible(value, ["secureUrl", "url"], "");
		if (!secureUrl) return;

		documents.push({
			key: label,
			label,
			secureUrl,
			publicId: readPossible(value, ["publicId"], ""),
			sizeLabel,
		});
	};

	if (type === VERIFICATION_TYPES.guide) {
		pushDocument("National ID", record?.nationalId);
		pushDocument("Tourism / Guide License", record?.tourismLicense);
		pushDocument("Profile Photo", record?.profilePhoto);
		pushDocument("Intro Video", record?.introductionVideo);
	} else {
		pushDocument("International Passport", record?.passport);
	}

	return {
		id: record?._id ?? record?.id ?? "",
		type,
		fullName: readPossible(entity, ["fullName", "name"], "Unknown user"),
		email: readPossible(entity, ["email"], "No email"),
		city: readPossible(entity, ["city", "nationality", "country"], "-"),
		phone: readPossible(entity, ["phone", "phoneNumber"], "-"),
		submittedAt: formatDate(record?.createdAt ?? record?.updatedAt),
		status: String(record?.status ?? "PENDING").toUpperCase(),
		bio: readPossible(entity, ["bio"], ""),
		documents,
	};
};

export const mapUsers = (payload) => {
	const records = toArray(payload);

	return records.map((item, index) => {
		const id = item?._id ?? item?.id ?? `user-${index}`;
		const fullName = readPossible(item, ["fullName", "name"], "Unknown user");
		const email = readPossible(item, ["email"], "No email");
		const role = String(item?.role ?? "-").toUpperCase();
		const status = String(item?.status ?? "ACTIVE").toUpperCase();
		const joinedAt = formatDate(
			item?.createdAt ?? item?.joinedAt ?? item?.created_at,
		);

		return {
			id,
			fullName,
			email,
			role,
			status,
			joinedAt,
		};
	});
};

export const mapStats = (payload) => {
	const source = payload && typeof payload === "object" ? payload : {};

	return {
		total: Number(source.total ?? source.totalUsers ?? source.users ?? 0) || 0,
		active: Number(source.active ?? source.activeUsers ?? 0) || 0,
		banned: Number(source.banned ?? source.bannedUsers ?? 0) || 0,
		suspended: Number(source.suspended ?? source.suspendedUsers ?? 0) || 0,
	};
};
