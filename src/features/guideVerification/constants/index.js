export const STEPS = [
	{ id: 1, label: "Verification" },
	{ id: 2, label: "AI Language test" },
	{ id: 3, label: "Profile details" },
	{ id: 4, label: "Payment method" },
];

export const EXPERIENCE_OPTIONS = [
	"0 - 1 year",
	"1 - 3 years",
	"3 - 5 years",
	"5+ years",
];

export const INTEREST_OPTIONS = [
	"Swimming",
	"Safari",
	"Adventure",
	"Riding",
	"Climbing",
	"Summer",
	"Sun rise",
];

export const LANGUAGE_OPTIONS = ["Arabic", "English", "German", "Italian", "Spanish", "French"];

export const AI_TEST_QUESTIONS = [
	{
		type: "text",
		prompt: "Translate the following sentence into Spanish :",
		quote: "The tourists was excited to see the beautiful sights.",
	},
	{
		type: "text",
		prompt: "Correct the grammatical errors in the following sentence :",
		quote: "Welcome to our guided tour of the city.",
	},
	{
		type: "text",
		prompt:
			"Provide a synonym for the word 'historic' and use it in a sentence related to tourism :",
	},
	{
		type: "voice",
		prompt:
			"A tourist ask you for recommendation on local cuisine . How would you respond?",
	},
	{
		type: "voice",
		prompt:
			"Imagine you are at a famous landmark. Describe it to a group of tourists.",
	},
];

export const initialProfileState = {
	bio: "",
	yearsOfExperience: "",
	interests: [],
};

export const initialPaymentState = {
	nameOnCard: "",
	cardNumber: "",
	expiryDate: "",
	cvv: "",
};

export const initialAssetsState = {
	nationality: "Egypt",
	nationalId: null,
	tourismLicense: null,
	profilePhoto: null,
	introductionVideo: null,
};
