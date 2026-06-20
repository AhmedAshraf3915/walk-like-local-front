const AUTH_PAGES = new Set([
	"/",
	"/signup",
	"/register",
	"/login",
	"/auth/google/callback",
]);

export const normalizeRole = (role) => {
	if (typeof role !== "string") {
		return "";
	}

	return role.trim().toLowerCase();
};

export const getRoleBasedVerificationPath = (role) => {
	const normalizedRole = normalizeRole(role);

	if (normalizedRole === "admin") {
		return "/admin";
	}

	if (normalizedRole === "guide") {
		return "/guide-verification";
	}

	return "/onboarding/profile";
};

export const resolvePostAuthPath = ({ role, nextPath }) => {
	if (typeof nextPath === "string") {
		const trimmedPath = nextPath.trim();

		if (trimmedPath.startsWith("/") && !AUTH_PAGES.has(trimmedPath)) {
			return trimmedPath;
		}
	}

	return getRoleBasedVerificationPath(role);
};
