const GUIDE_PROFILE_CACHE_KEY = "guide-profile-draft-v1";

const isObject = (value) => value && typeof value === "object";

const normalizeCacheValue = (value) => {
	if (!isObject(value)) return null;

	const next = { ...value };

	if (Array.isArray(next.languages)) {
		next.languages = next.languages.filter((entry) => String(entry ?? "").trim());
	}

	if (Array.isArray(next.interests)) {
		next.interests = next.interests.filter((entry) => String(entry ?? "").trim());
	}

	if (isObject(next.experience)) {
		next.experience = {
			...next.experience,
			year: String(next.experience.year ?? "").trim(),
		};
	}

	return next;
};

export const readCachedGuideProfile = () => {
	if (typeof window === "undefined") return null;

	try {
		const rawValue = window.sessionStorage.getItem(GUIDE_PROFILE_CACHE_KEY);
		if (!rawValue) return null;

		const parsed = JSON.parse(rawValue);
		return normalizeCacheValue(parsed);
	} catch {
		return null;
	}
};

export const writeCachedGuideProfile = (partialProfile) => {
	if (typeof window === "undefined" || !isObject(partialProfile)) return;

	const current = readCachedGuideProfile() ?? {};
	const next = normalizeCacheValue({
		...current,
		...partialProfile,
		experience: {
			...(current.experience ?? {}),
			...(partialProfile.experience ?? {}),
		},
	});

	try {
		window.sessionStorage.setItem(
			GUIDE_PROFILE_CACHE_KEY,
			JSON.stringify(next ?? {}),
		);
	} catch {
		// Cache failures should never block normal profile flows.
	}
};
