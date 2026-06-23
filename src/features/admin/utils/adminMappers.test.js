import { describe, expect, it } from "vitest";

import {
	mapVerificationDetails,
	mapVerificationList,
	mapUsers,
} from "@/features/admin/utils/adminMappers";
import { VERIFICATION_TYPES } from "@/features/admin/utils/adminConstants";

describe("admin verification mappers", () => {
	it("uses the guide id for verification queue records and details", () => {
		const queue = mapVerificationList(
			{
				docs: [
					{
						_id: "verification-record-1",
						status: "pending",
						createdAt: "2026-06-20T10:00:00.000Z",
						guide: {
							_id: "guide-123",
							fullName: "Guide Example",
							email: "guide@example.com",
						},
					},
				],
			},
			VERIFICATION_TYPES.guide,
		);

		expect(queue[0]).toMatchObject({
			id: "guide-123",
			fullName: "Guide Example",
			email: "guide@example.com",
			status: "PENDING",
		});

		const details = mapVerificationDetails(
			{
				_id: "verification-record-1",
				guide: {
					_id: "guide-123",
					fullName: "Guide Example",
					email: "guide@example.com",
				},
				nationalId: {
					secureUrl: "https://files.example/national-id.jpg",
					publicId: "docs/national-id",
				},
			},
			VERIFICATION_TYPES.guide,
		);

		expect(details.id).toBe("guide-123");
		expect(details.documents).toHaveLength(1);
	});

	it("uses the tourist id for tourist verification records", () => {
		const queue = mapVerificationList(
			[
				{
					_id: "verification-record-2",
					status: "pending",
					tourist: {
						_id: "tourist-456",
						fullName: "Tourist Example",
						email: "tourist@example.com",
					},
				},
			],
			VERIFICATION_TYPES.tourist,
		);

		expect(queue[0].id).toBe("tourist-456");
	});

	it("supports wrapped users and verification payloads", () => {
		expect(
			mapVerificationList(
				{
					verifications: [
						{
							_id: "verification-record-3",
							guide: {
								_id: "guide-789",
								fullName: "Wrapped Guide",
								email: "wrapped@example.com",
							},
						},
					],
				},
				VERIFICATION_TYPES.guide,
			),
		).toHaveLength(1);

		expect(
			mapUsers({
				users: [
					{
						_id: "user-1",
						fullName: "Wrapped User",
						email: "user@example.com",
						role: "admin",
						status: "active",
					},
				],
			}),
		).toMatchObject([
			{
				id: "user-1",
				fullName: "Wrapped User",
				email: "user@example.com",
				role: "ADMIN",
				status: "ACTIVE",
			},
		]);
	});
});