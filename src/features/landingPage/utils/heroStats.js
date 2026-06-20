const toList = (payload, keys) => {
	if (Array.isArray(payload)) return payload;
	if (!payload || typeof payload !== "object") return [];

	for (const key of keys) {
		if (Array.isArray(payload[key])) return payload[key];
	}

	return [];
};

const getNumberCandidate = (...values) => {
	for (const value of values) {
		const parsed = Number(value);
		if (Number.isFinite(parsed) && parsed >= 0) {
			return parsed;
		}
	}

	return null;
};

export const DEFAULT_HERO_STATS = [
	{ value: "0+", label: "Vetted Guides" },
	{ value: "0", label: "Cities Covered" },
	{ value: "0.0 ★", label: "Avg. Rating" },
];

export const buildHeroStats = (toursPayload, guidesPayload) => {
	const guideRecords = toList(guidesPayload, [
		"guides",
		"items",
		"results",
		"docs",
	]);
	const tourRecords = toList(toursPayload, ["tours", "items", "results", "docs"]);

	const guideCount =
		getNumberCandidate(
			guidesPayload?.pagination?.total,
			guidesPayload?.pagination?.totalItems,
			guidesPayload?.pagination?.totalDocs,
			guidesPayload?.total,
			guidesPayload?.count,
			guideRecords.length,
		) ?? 0;

	const uniqueDestinations = new Set(
		tourRecords
			.map((tour) => String(tour?.destination ?? "").trim().toLowerCase())
			.filter(Boolean),
	);

	const ratings = guideRecords
		.map((guide) =>
			Number(
				guide?.averageRating ??
				guide?.rating ??
				guide?.reviewsSummary?.averageRating ??
				guide?.reviewStats?.averageRating,
			),
		)
		.filter((rating) => Number.isFinite(rating) && rating > 0);

	const averageRating = ratings.length
		? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
		: 0;

	return [
		{
			value: `${guideCount}+`,
			label: "Vetted Guides",
		},
		{
			value: String(uniqueDestinations.size),
			label: "Cities Covered",
		},
		{
			value: `${averageRating.toFixed(1)} ★`,
			label: "Avg. Rating",
		},
	];
};
