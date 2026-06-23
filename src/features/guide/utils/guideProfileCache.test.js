/* @vitest-environment jsdom */
import { beforeEach, describe, expect, it } from "vitest";

import {
	readCachedGuideProfile,
	writeCachedGuideProfile,
} from "@/features/guide/utils/guideProfileCache";

describe("guideProfileCache", () => {
	beforeEach(() => {
		window.sessionStorage.clear();
	});

	it("writes and reads cached guide profile data", () => {
		writeCachedGuideProfile({
			bio: "Cached bio",
			city: "Cairo",
			interests: ["History"],
			languages: ["en"],
			experience: { year: "3 - 5 years" },
		});

		expect(readCachedGuideProfile()).toMatchObject({
			bio: "Cached bio",
			city: "Cairo",
			interests: ["History"],
			languages: ["en"],
			experience: { year: "3 - 5 years" },
		});
	});

	it("merges partial writes with existing cache", () => {
		writeCachedGuideProfile({ bio: "Old bio", city: "Luxor" });
		writeCachedGuideProfile({ city: "Aswan" });

		expect(readCachedGuideProfile()).toMatchObject({
			bio: "Old bio",
			city: "Aswan",
		});
	});
});
