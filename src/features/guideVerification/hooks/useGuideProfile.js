import { useState } from "react";
import { initialProfileState } from "@/features/guideVerification/constants";
import { guideVerificationApi } from "@/features/guideVerification/api/guideVerificationApi";
import {
	readCachedGuideProfile,
	writeCachedGuideProfile,
} from "@/features/guide/utils/guideProfileCache";

const LANGUAGE_TO_CODE = {
	Arabic: "ar",
	English: "en",
	German: "de",
	Italian: "it",
	Spanish: "es",
	French: "fr",
};

const SUPPORTED_LANGUAGE_CODES = new Set(Object.values(LANGUAGE_TO_CODE));

const toLanguageCode = (language) => {
	if (typeof language !== "string") {
		return "";
	}

	const trimmedLanguage = language.trim();
	const lowerLanguage = trimmedLanguage.toLowerCase();

	if (SUPPORTED_LANGUAGE_CODES.has(lowerLanguage)) {
		return lowerLanguage;
	}

	return LANGUAGE_TO_CODE[trimmedLanguage] ?? "";
};

/**
 * Manages guide profile state: bio, years of experience, interests, and their
 * per-section skip toggles. Computes isProfileReady based on filled or skipped
 * sections.
 */
const toInitialProfile = (source) => {
	const nestedProfile = source?.guideProfile ?? source?.profile ?? {};
	const cachedProfile = readCachedGuideProfile() ?? {};
	const sourceLanguages =
		Array.isArray(source?.languages) && source.languages.length > 0
			? source.languages
			: Array.isArray(nestedProfile?.languages) && nestedProfile.languages.length > 0
				? nestedProfile.languages
				: Array.isArray(cachedProfile?.languages)
					? cachedProfile.languages
					: [];
	const languages = sourceLanguages
		.map((entry) => {
			if (typeof entry === "string") {
				const normalized = entry.trim();
				if (!normalized) return "";

				if (SUPPORTED_LANGUAGE_CODES.has(normalized.toLowerCase())) {
					return (
						Object.keys(LANGUAGE_TO_CODE).find(
							(label) => LANGUAGE_TO_CODE[label] === normalized.toLowerCase(),
						) ?? normalized
					);
				}

				return normalized;
			}

			return String(
				entry?.label ?? entry?.name ?? entry?.code ?? entry?.value ?? "",
			).trim();
		})
		.filter(Boolean);
	const interests = Array.isArray(source?.interests)
		? source.interests
		: Array.isArray(nestedProfile?.interests)
			? nestedProfile.interests
			: Array.isArray(cachedProfile?.interests)
				? cachedProfile.interests
				: [];

	return {
		bio:
			source?.bio ??
			nestedProfile?.bio ??
			cachedProfile?.bio ??
			initialProfileState.bio,
		city:
			source?.city ??
			source?.governorate ??
			nestedProfile?.city ??
			nestedProfile?.governorate ??
			cachedProfile?.city ??
			cachedProfile?.governorate ??
			initialProfileState.city,
		yearsOfExperience:
			source?.experience?.year ??
			nestedProfile?.experience?.year ??
			cachedProfile?.experience?.year ??
			initialProfileState.yearsOfExperience,
		languages,
		interests,
	};
};

export const useGuideProfile = ({ initialProfile } = {}) => {
	const [profile, setProfile] = useState(() => toInitialProfile(initialProfile));
	const [submittingProfile, setSubmittingProfile] = useState(false);
	const [profileSkips, setProfileSkips] = useState({
		bio: false,
		city: false,
		yearsOfExperience: false,
		languages: false,
		interests: false,
	});

	const isProfileReady =
		(Boolean(profile.bio.trim()) || profileSkips.bio) &&
		(Boolean(profile.city) || profileSkips.city) &&
		(Boolean(profile.yearsOfExperience) || profileSkips.yearsOfExperience) &&
		(profile.interests.length > 0 || profileSkips.interests);

	const setBio = (value) => {
		setProfile((current) => {
			const nextProfile = { ...current, bio: value };
			writeCachedGuideProfile({
				bio: nextProfile.bio,
				city: nextProfile.city,
				governorate: nextProfile.city,
				languages: nextProfile.languages.map(toLanguageCode).filter(Boolean),
				experience: { year: nextProfile.yearsOfExperience },
				interests: nextProfile.interests,
			});
			return nextProfile;
		});
	};

	const setExperience = (value) => {
		setProfile((current) => {
			const nextProfile = { ...current, yearsOfExperience: value };
			writeCachedGuideProfile({
				bio: nextProfile.bio,
				city: nextProfile.city,
				governorate: nextProfile.city,
				languages: nextProfile.languages.map(toLanguageCode).filter(Boolean),
				experience: { year: nextProfile.yearsOfExperience },
				interests: nextProfile.interests,
			});
			return nextProfile;
		});
	};

	const setCity = (value) => {
		setProfile((current) => {
			const nextProfile = { ...current, city: value };
			writeCachedGuideProfile({
				bio: nextProfile.bio,
				city: nextProfile.city,
				governorate: nextProfile.city,
				languages: nextProfile.languages.map(toLanguageCode).filter(Boolean),
				experience: { year: nextProfile.yearsOfExperience },
				interests: nextProfile.interests,
			});
			return nextProfile;
		});
	};

	const toggleLanguage = (language) => {
		setProfile((current) => {
			const alreadySelected = current.languages.includes(language);
			const nextProfile = {
				...current,
				languages: alreadySelected
					? current.languages.filter((item) => item !== language)
					: [...current.languages, language],
			};

			writeCachedGuideProfile({
				bio: nextProfile.bio,
				city: nextProfile.city,
				governorate: nextProfile.city,
				languages: nextProfile.languages.map(toLanguageCode).filter(Boolean),
				experience: { year: nextProfile.yearsOfExperience },
				interests: nextProfile.interests,
			});

			return nextProfile;
		});
	};

	const toggleInterest = (interest) => {
		setProfile((current) => {
			const alreadySelected = current.interests.includes(interest);
			const nextProfile = {
				...current,
				interests: alreadySelected
					? current.interests.filter((item) => item !== interest)
					: [...current.interests, interest],
			};

			writeCachedGuideProfile({
				bio: nextProfile.bio,
				city: nextProfile.city,
				governorate: nextProfile.city,
				languages: nextProfile.languages.map(toLanguageCode).filter(Boolean),
				experience: { year: nextProfile.yearsOfExperience },
				interests: nextProfile.interests,
			});

			return nextProfile;
		});
	};

	const toggleProfileSkip = (field) => {
		setProfileSkips((current) => ({
			...current,
			[field]: !current[field],
		}));
	};

	const submitProfile = async ({ selectedLanguages = [] } = {}) => {
		const detailLanguages = profileSkips.languages
			? []
			: profile.languages.map(toLanguageCode).filter(Boolean);
		const aiLanguages = selectedLanguages
			.map(toLanguageCode)
			.filter((value) => Boolean(value));
		const languages = [...new Set([...detailLanguages, ...aiLanguages])];
		const trimmedBio = profile.bio.trim();

		setSubmittingProfile(true);

		try {
			if (languages.length > 0) {
				await guideVerificationApi.updateGuideLanguages({ languages });
			}

			const profilePayload = {};

			if (!profileSkips.bio && trimmedBio) {
				profilePayload.bio = trimmedBio;
			}

			if (!profileSkips.interests && profile.interests.length > 0) {
				profilePayload.interests = profile.interests;
			}

			if (!profileSkips.city && profile.city) {
				profilePayload.city = profile.city;
				profilePayload.governorate = profile.city;
			}

			if (!profileSkips.yearsOfExperience && profile.yearsOfExperience) {
				profilePayload.experience = {
					year: profile.yearsOfExperience,
				};
			}

			const savedProfile =
				Object.keys(profilePayload).length > 0
					? await guideVerificationApi.completeGuideProfile(profilePayload)
					: null;

			writeCachedGuideProfile({
				...(savedProfile && typeof savedProfile === "object" ? savedProfile : {}),
				...profilePayload,
				...(languages.length > 0 ? { languages } : {}),
			});

			return savedProfile ?? {
				...profilePayload,
				...(languages.length > 0 ? { languages } : {}),
			};
		} finally {
			setSubmittingProfile(false);
		}
	};

	return {
		profile,
		profileSkips,
		isProfileReady,
		submittingProfile,
		setBio,
		setCity,
		setExperience,
		toggleLanguage,
		toggleInterest,
		toggleProfileSkip,
		submitProfile,
	};
};
