import { useState } from "react";
import { initialProfileState } from "@/features/guideVerification/constants";

/**
 * Manages guide profile state: bio, years of experience, interests, and their
 * per-section skip toggles. Computes isProfileReady based on filled or skipped
 * sections.
 */
export const useGuideProfile = () => {
	const [profile, setProfile] = useState(initialProfileState);
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

	return {
		profile,
		profileSkips,
		isProfileReady,
		setBio,
		setExperience,
		toggleInterest,
		toggleProfileSkip,
	};
};
