import { useState } from "react";
import { initialProfileState } from "@/features/guideVerification/constants";
import { guideVerificationApi } from "@/features/guideVerification/api/guideVerificationApi";

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
export const useGuideProfile = () => {
	const [profile, setProfile] = useState(initialProfileState);
	const [submittingProfile, setSubmittingProfile] = useState(false);
	const [profileSkips, setProfileSkips] = useState({
		bio: false,
		yearsOfExperience: false,
		interests: false,
	});

	const isProfileReady =
		(Boolean(profile.bio.trim()) || profileSkips.bio) &&
		(Boolean(profile.yearsOfExperience) || profileSkips.yearsOfExperience) &&
		(profile.interests.length > 0 || profileSkips.interests);

	const setBio = (value) => {
		setProfile((current) => ({ ...current, bio: value }));
	};

	const setExperience = (value) => {
		setProfile((current) => ({ ...current, yearsOfExperience: value }));
	};

	const toggleInterest = (interest) => {
		setProfile((current) => {
			const alreadySelected = current.interests.includes(interest);
			return {
				...current,
				interests: alreadySelected
					? current.interests.filter((item) => item !== interest)
					: [...current.interests, interest],
			};
		});
	};

	const toggleProfileSkip = (field) => {
		setProfileSkips((current) => ({
			...current,
			[field]: !current[field],
		}));
	};

	const submitProfile = async ({ selectedLanguages = [] } = {}) => {
		const languages = selectedLanguages
			.map(toLanguageCode)
			.filter((value) => Boolean(value));
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

			if (!profileSkips.yearsOfExperience && profile.yearsOfExperience) {
				profilePayload.experience = {
					year: profile.yearsOfExperience,
				};
			}

			if (Object.keys(profilePayload).length > 0) {
				await guideVerificationApi.completeGuideProfile(profilePayload);
			}

			return {
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
		setExperience,
		toggleInterest,
		toggleProfileSkip,
		submitProfile,
	};
};
