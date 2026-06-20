import { describe, expect, it } from "vitest";

import {
  mapActiveTours,
  mapPublicGuides,
} from "@/features/landingPage/utils/landingContentMappers";

describe("landing content mappers", () => {
  it("maps completed public guide profiles to guide cards", () => {
    const guides = mapPublicGuides({
      guides: [
        {
          _id: "guide-1",
          fullName: "Ahmed Mohamed",
          nationality: "Egypt",
          languages: ["ar", "en"],
          profilePhoto: {
            secureUrl: "https://images.example/ahmed.jpg",
          },
          averageRating: 4.8,
          reviewCount: 12,
        },
      ],
    });

    expect(guides).toHaveLength(1);
    expect(guides[0]).toMatchObject({
      sourceId: "guide-1",
      name: "Ahmed Mohamed",
      city: "Egypt",
      languages: "Arabic, English",
      rating: 4.8,
      reviewCount: 12,
      photo: "https://images.example/ahmed.jpg",
    });
  });

  it("maps active tours and joins their guide profile photo", () => {
    const guides = mapPublicGuides([
      {
        _id: "guide-1",
        fullName: "Ahmed Mohamed",
        profilePhoto: { secureUrl: "https://images.example/ahmed.jpg" },
      },
    ]);
    const tours = mapActiveTours(
      [
        {
          _id: "tour-1",
          title: "Pyramids Night Walk",
          destination: "Giza, Egypt",
          duration: "3 hours",
          guideId: { _id: "guide-1", fullName: "Ahmed Mohamed" },
          guide: { _id: "guide-1", fullName: "Ahmed Mohamed" },
          pricing: { PRIVATE: 150, SMALL_GROUP: 80, LARGE_GROUP: 50 },
          coverImage: { secureUrl: "https://images.example/pyramids.jpg" },
          activities: [{ name: "Camel Ride" }],
        },
      ],
      guides,
    );

    expect(tours).toHaveLength(1);
    expect(tours[0]).toMatchObject({
      id: "tour-1",
      title: "Pyramids Night Walk",
      guide: "Ahmed Mohamed",
      avatar: "https://images.example/ahmed.jpg",
      photo: "https://images.example/pyramids.jpg",
      duration: "3 hours",
      price: "$50 USD",
      tags: ["Camel Ride"],
    });
  });

  it("keeps a missing tour image empty so the card can show a placeholder", () => {
    const [tour] = mapActiveTours([
      {
        _id: "tour-without-image",
        title: "Old Cairo Walk",
        pricing: { PRIVATE: 40 },
      },
    ]);

    expect(tour.photo).toBe("");
  });

  it("does not request seeded Cloudinary demo images", () => {
    const [tour] = mapActiveTours([
      {
        _id: "tour-with-demo-image",
        title: "Pyramids Walk",
        coverImage: {
          secureUrl:
            "https://res.cloudinary.com/demo/image/upload/v123/tours/pyramids_cover.jpg",
        },
      },
    ]);

    expect(tour.photo).toBe("");
  });

  it("uses the private price when the catalog filters private pricing", () => {
    const [tour] = mapActiveTours(
      [
        {
          _id: "tour-price",
          pricing: { PRIVATE: 150, SMALL_GROUP: 80, LARGE_GROUP: 50 },
        },
      ],
      [],
      { priceGroupType: "PRIVATE" },
    );

    expect(tour.price).toBe("$150 USD");
    expect(tour.groupType).toBe("Private tour");
  });
});
