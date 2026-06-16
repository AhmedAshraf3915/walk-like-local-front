import { ShieldCheck, Star, Fingerprint, Globe } from "lucide-react";
import { IMG } from "@/assets/images/landingPage/images.js";

export const TOUR_CITIES = [
	"Cairo",
	"Giza",
	"Alexandria",
	"Luxor",
	"Aswan",
	"Khan el-Khalili",
	"Dahab",
];

export const TOUR_TYPES = [
	"Cultural Tour",
	"Food Tour",
	"Historical Walk",
	"Adventure",
	"Diving",
	"Desert Safari",
	"Nile Cruise",
];

export const TOURS = [
	{
		id: 1,
		title: "Khan el-Khalili at Dusk",
		matchTag: "Matches History & Architecture",
		tags: ["Food", "Bazaar"],
		guide: "Karim Mohamed",
		avatar: IMG.g1,
		photo: IMG.tourKhan,
		rating: 4.2,
		reviewCount: 8,
		duration: "2 hours",
		groupType: "Private tour",
		price: "$30 USD",
	},
	{
		id: 2,
		title: "Dahab Diving",
		matchTag: "Matches Desert Adventure",
		tags: ["Diving", "Red Sea"],
		guide: "Yassin Mohamed",
		avatar: IMG.g2,
		photo: IMG.tourDahab,
		rating: 4.2,
		reviewCount: 8,
		duration: "2 hours",
		groupType: "Private tour",
		price: "$60 USD",
	},
	{
		id: 3,
		title: "Felucca Sunset on the Nile",
		matchTag: "Matches Sun set",
		tags: ["Nile", "Sunset"],
		guide: "Nour Hassan",
		avatar: IMG.g3,
		photo: IMG.tourNile,
		rating: 4.2,
		reviewCount: 8,
		duration: "1.5 hours",
		groupType: "Private tour",
		price: "$25 USD",
	},
];

export const DESTINATIONS = [
	{ id: 1, name: "Cairo", tourCount: 45, img: IMG.cairo },
	{ id: 2, name: "Dahab", tourCount: 10, img: IMG.dahab },
	{ id: 3, name: "Luxor", tourCount: 30, img: IMG.luxor },
];

export const FEATURES = [
	{
		id: 1,
		icon: ShieldCheck,
		title: "Fully verified safety",
		body: "ID-verified guides, secure payments, and 24/7 trip support across every itinerary.",
	},
	{
		id: 2,
		icon: Star,
		title: "Transparent reviews",
		body: "Real ratings from real travelers. No hidden boosts, no paid placements — ever.",
	},
	{
		id: 3,
		icon: Fingerprint,
		title: "Authentic experiences",
		body: "Designed by locals, for travelers who'd rather miss a monument than miss the city.",
	},
	{
		id: 4,
		icon: Globe,
		title: "Fully verified safety",
		body: "End-to-end encrypted payments, instant confirmation, and flexible cancellation.",
	},
];

export const GUIDES = [
	{
		id: 1,
		name: "Nour Hassan",
		city: "Cairo",
		languages: "English and German",
		rating: 4.2,
		reviewCount: 8,
		photo: IMG.guideNour,
	},
	{
		id: 2,
		name: "Yassin Mohammed",
		city: "Dahab",
		languages: "English, Spanish and German",
		rating: 4.2,
		reviewCount: 8,
		photo: IMG.guideYassin,
	},
	{
		id: 3,
		name: "Heba Khaled",
		city: "Cairo",
		languages: "English, Spanish, German and more",
		rating: 4.2,
		reviewCount: 8,
		photo: IMG.guideHeba,
	},
];

export const REVIEWS = [
	{
		id: 1,
		text: "Yara walked us through Cairo like we were her cousins visiting. The food, the stories — nothing rehearsed. Magic.",
		name: "Léa Marchand",
		country: "France",
		stars: 5,
		avatar: IMG.reviewAvatar,
	},
	{
		id: 2,
		text: "Booked a last-minute Nile felucca at sunset. Our guide Karim had stories for every bend in the river. Absolutely unforgettable.",
		name: "Marco Bellini",
		country: "Italy",
		stars: 5,
		avatar: IMG.reviewAvatar,
	},
	{
		id: 3,
		text: "We avoided every tourist trap and found a spice shop that's been in the same family since 1870. That's Walk Like a Local.",
		name: "Sophie Müller",
		country: "Germany",
		stars: 4,
		avatar: IMG.reviewAvatar,
	},
];
