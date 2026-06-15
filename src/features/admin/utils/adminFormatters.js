import { STATUS_CLASS_MAP } from "./adminConstants";

export const getInitials = (fullName = "") => {
	const normalized = String(fullName).trim();
	if (!normalized) return "U";

	const parts = normalized.split(/\s+/).filter(Boolean);
	if (parts.length === 1) {
		return parts[0].slice(0, 2).toUpperCase();
	}

	return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
};

export const toArray = (value) => {
	if (Array.isArray(value)) return value;
	if (Array.isArray(value?.items)) return value.items;
	if (Array.isArray(value?.docs)) return value.docs;
	if (Array.isArray(value?.results)) return value.results;
	if (Array.isArray(value?.data)) return value.data;
	return [];
};

export const getPaginationMeta = (value, fallbackLength = 0) => {
	const root = value && typeof value === "object" ? value : {};
	const page = Number(root.page ?? root.currentPage ?? 1) || 1;
	const totalPages = Number(root.totalPages ?? root.pages ?? 1) || 1;
	const totalItems =
		Number(root.totalItems ?? root.total ?? root.count ?? fallbackLength) ||
		fallbackLength;

	return { page, totalPages, totalItems };
};

export const readPossible = (obj, candidates, fallback = "") => {
	for (const key of candidates) {
		const value = obj?.[key];
		if (typeof value === "string" && value.trim()) return value;
	}

	return fallback;
};

export const formatDate = (value) => {
	if (!value) return "-";

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "-";

	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	}).format(date);
};

export const pillClass = (status) => {
	const normalized = String(status || "").toUpperCase();
	return STATUS_CLASS_MAP[normalized] ?? "bg-[#ececf5] text-[#5a5f74]";
};

export const getUserActions = (status) => {
	const normalized = String(status || "").toUpperCase();

	if (normalized === "ACTIVE") {
		return ["suspend", "ban"];
	}

	if (normalized === "SUSPENDED") {
		return ["activate", "ban"];
	}

	if (normalized === "BANNED") {
		return ["unban"];
	}

	return ["activate", "suspend", "ban"];
};
