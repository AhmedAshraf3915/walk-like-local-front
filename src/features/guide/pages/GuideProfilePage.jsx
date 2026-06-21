import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BadgeCheck,
  Languages,
  MapPin,
  Sparkles,
  Star,
  UserRound,
} from "lucide-react";

import GuideNavbar from "@/components/home/GuideNavbar.jsx";
import Footer from "@/components/home/Footer.jsx";
import TourCard from "@/components/home/TourCard.jsx";
import useAuth from "@/contexts/useAuth";
import { guidesApi } from "@/features/guide/api/guidesApi";
import { toursApi } from "@/features/tours/api/toursApi";
import { useGuideVerificationStatus } from "@/features/guideVerification/hooks/useGuideVerificationStatus";
import { mapActiveTours } from "@/features/landingPage/utils/landingContentMappers";

const LANGUAGE_LABELS = {
  ar: "Arabic",
  en: "English",
  de: "German",
  it: "Italian",
  es: "Spanish",
  fr: "French",
};

const getAssetUrl = (value) => {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "";

  return (
    value.secureUrl ??
    value.secure_url ??
    value.url ??
    value.src ??
    value.path ??
    ""
  );
};

const toList = (payload, keys) => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  for (const key of keys) {
    if (Array.isArray(payload[key])) return payload[key];
  }

  return [];
};

const getGuideRecordId = (record) => {
  const source = record?.guide ?? record?.user ?? record?.profile ?? record ?? {};

  return String(
    source?._id ??
      source?.id ??
      record?.guideId?._id ??
      record?.guideId?.id ??
      record?.guideId ??
      "",
  );
};

const getTourGuideId = (tour) =>
  String(
    tour?.guide?._id ??
      tour?.guide?.id ??
      tour?.guideId?._id ??
      tour?.guideId?.id ??
      tour?.guideId ??
      "",
  );

const toDisplayLanguages = (value) => {
  const source = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(/[,|]/)
      : [];

  return source
    .map((entry) => {
      const raw =
        typeof entry === "string"
          ? entry
          : entry?.label ?? entry?.name ?? entry?.code ?? entry?.value ?? "";
      const normalized = String(raw).trim();

      if (!normalized) return "";

      return (
        LANGUAGE_LABELS[normalized.toLowerCase()] ??
        normalized
          .replace(/[_-]+/g, " ")
          .replace(/\b\w/g, (character) => character.toUpperCase())
      );
    })
    .filter(Boolean);
};

const buildProfile = ({ databaseProfile, user, verification }) => {
  const source =
    databaseProfile?.guide ??
    databaseProfile?.profile ??
    databaseProfile ??
    {};
  const nestedProfile = user?.guideProfile ?? user?.profile ?? {};
  const verifiedLanguages = toDisplayLanguages(
    source?.verifiedLanguages ?? user?.verifiedLanguages,
  );
  const languages = toDisplayLanguages(
    source?.languages ?? user?.languages ?? nestedProfile?.languages,
  );

  return {
    id: String(source?._id ?? source?.id ?? user?._id ?? user?.id ?? ""),
    fullName:
      source?.fullName ?? source?.name ?? user?.fullName ?? user?.name ?? "",
    photo:
      getAssetUrl(source?.profilePicture) ||
      getAssetUrl(source?.profilePhoto) ||
      getAssetUrl(verification?.profilePhoto) ||
      getAssetUrl(verification?.verificationDocuments?.profilePhoto) ||
      getAssetUrl(user?.profilePhoto) ||
      getAssetUrl(user?.avatar),
    bio: source?.bio ?? user?.bio ?? nestedProfile?.bio ?? "",
    interests: Array.isArray(source?.interests)
      ? source.interests
      : Array.isArray(user?.interests)
        ? user.interests
        : [],
    experience:
      source?.experience?.year ??
      user?.experience?.year ??
      nestedProfile?.experience?.year ??
      "",
    experiencePhoto:
      getAssetUrl(source?.experience?.photo) ||
      getAssetUrl(user?.experience?.photo),
    location:
      source?.city ??
      source?.location ??
      source?.nationality ??
      verification?.nationality ??
      user?.city ??
      user?.nationality ??
      "",
    languages,
    verifiedLanguages,
    introductionVideo:
      getAssetUrl(source?.introductionVideo) ||
      getAssetUrl(verification?.introductionVideo) ||
      getAssetUrl(verification?.verificationDocuments?.introductionVideo),
    rating: Number(source?.rating ?? source?.averageRating ?? user?.rating) || 0,
    reviewCount:
      Number(
        source?.reviewCount ?? source?.reviewsCount ?? user?.reviewCount,
      ) || 0,
    lifetimeBookings:
      Number(
        source?.lifetimeBookings ??
          source?.bookingCount ??
          user?.lifetimeBookings,
      ) || 0,
  };
};

const mapReview = (review, index) => {
  const reviewer =
    review?.tourist ?? review?.reviewer ?? review?.user ?? review?.author ?? {};

  return {
    id: String(review?._id ?? review?.id ?? `review-${index}`),
    name: reviewer?.fullName ?? reviewer?.name ?? "",
    location:
      reviewer?.country ?? reviewer?.nationality ?? reviewer?.location ?? "",
    photo:
      getAssetUrl(reviewer?.profilePhoto) ||
      getAssetUrl(reviewer?.profilePicture) ||
      getAssetUrl(reviewer?.avatar),
    rating: Math.min(Math.max(Number(review?.rating) || 0, 0), 5),
    comment:
      review?.comment ?? review?.text ?? review?.review ?? review?.content ?? "",
  };
};

function EmptySection({ children }) {
  return (
    <div className="rounded-2xl border border-[#e4e3f0] bg-[#f8f8fc] px-5 py-8 text-center text-sm text-[#65638a]">
      {children}
    </div>
  );
}

function RatingStars({ value }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={`h-4 w-4 ${
            index < Math.round(value)
              ? "fill-[#EDC84C] text-[#EDC84C]"
              : "text-[#d7d6e8]"
          }`}
        />
      ))}
    </div>
  );
}

export default function GuideProfilePage() {
  const { user } = useAuth();
  const guideId = String(user?._id ?? user?.id ?? user?.userId ?? "");
  const {
    isVerified,
    verification,
    isLoading: loadingVerification,
    errorMessage: verificationError,
  } = useGuideVerificationStatus({ user, enabled: Boolean(user) });
  const [databaseProfile, setDatabaseProfile] = useState(null);
  const [activeTourRecords, setActiveTourRecords] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadProfilePage = async () => {
      setIsLoading(true);
      setErrorMessage("");

      const requests = [
        guidesApi.getPublicGuides({ page: 1, limit: 100 }),
        toursApi.browseActiveTours({ page: 1, limit: 100 }),
        guidesApi.getReceivedReviews({ page: 1, limit: 10 }),
      ];
      const [profileResult, toursResult, reviewsResult] =
        await Promise.allSettled(requests);

      if (!isMounted) return;

      if (profileResult.status === "fulfilled") {
        const publicGuides = toList(profileResult.value, [
          "guides",
          "items",
          "results",
          "docs",
        ]);
        setDatabaseProfile(
          publicGuides.find(
            (guide) => getGuideRecordId(guide) === guideId,
          ) ?? null,
        );
      }

      if (toursResult.status === "fulfilled") {
        const records = Array.isArray(toursResult.value?.items)
          ? toursResult.value.items
          : [];
        setActiveTourRecords(
          records.filter(
            (tour) =>
              getTourGuideId(tour) === guideId &&
              (!tour?.status || String(tour.status).toUpperCase() === "ACTIVE"),
          ),
        );
      } else {
        setActiveTourRecords([]);
      }

      if (reviewsResult.status === "fulfilled") {
        setReviews(
          toList(reviewsResult.value, ["reviews", "items", "results", "docs"])
            .map(mapReview)
            .filter((review) => review.comment || review.rating || review.name),
        );
      } else {
        setReviews([]);
      }

      const failedMessage = [profileResult, toursResult, reviewsResult]
        .filter((result) => result.status === "rejected")
        .map((result) => result.reason?.message)
        .filter(Boolean)[0];

      setErrorMessage(failedMessage ?? "");
      setIsLoading(false);
    };

    void loadProfilePage();

    return () => {
      isMounted = false;
    };
  }, [guideId]);

  const profile = useMemo(
    () => buildProfile({ databaseProfile, user, verification }),
    [databaseProfile, user, verification],
  );
  const guideCards = profile.id
    ? [
        {
          sourceId: profile.id,
          name: profile.fullName,
          photo: profile.photo,
        },
      ]
    : [];
  const activeTours = mapActiveTours(
    { items: activeTourRecords },
    guideCards,
    { priceGroupType: "PRIVATE", href: "/tours" },
  );
  const reviewCount = profile.reviewCount || reviews.length;

  return (
    <div className="min-h-screen bg-[#FDFDFF] text-[#010138]">
      <GuideNavbar verified={isVerified} profilePhoto={profile.photo} />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
        {isLoading ? (
          <div className="space-y-8">
            <div className="h-52 animate-pulse rounded-3xl bg-[#eeeeF6]" />
            <div className="h-40 animate-pulse rounded-2xl bg-[#eeeeF6]" />
            <div className="h-80 animate-pulse rounded-2xl bg-[#eeeeF6]" />
          </div>
        ) : (
          <>
            <section className="grid gap-8 md:grid-cols-[190px_1fr] md:items-center">
              <div className="relative mx-auto h-44 w-44 md:mx-0">
                {profile.photo ? (
                  <img
                    src={profile.photo}
                    alt={profile.fullName ? `${profile.fullName} profile` : ""}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center rounded-full bg-[#eeeeF6] text-[#8b89a8]">
                    <UserRound className="h-16 w-16" strokeWidth={1.25} />
                  </div>
                )}
                {isVerified ? (
                  <span className="absolute bottom-1 right-1 grid h-11 w-11 place-items-center rounded-full border-2 border-white bg-[#010138] text-[#EDC84C] shadow-lg">
                    <BadgeCheck className="h-6 w-6" />
                  </span>
                ) : null}
              </div>

              <div>
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    {profile.fullName ? (
                      <h1 className="text-3xl font-bold sm:text-4xl">
                        {profile.fullName}
                      </h1>
                    ) : null}
                    {profile.rating > 0 ? (
                      <div className="mt-2 flex items-center gap-2 text-sm font-semibold">
                        <span>Rating · {profile.rating} / 5</span>
                        <Star className="h-4 w-4 fill-[#EDC84C] text-[#EDC84C]" />
                      </div>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {isVerified ? (
                      <span className="inline-flex items-center gap-2 rounded-full bg-[#eefbdc] px-4 py-2 text-xs font-semibold text-[#41651f]">
                        <BadgeCheck className="h-4 w-4" />
                        Verified guide
                      </span>
                    ) : null}
                    {profile.verifiedLanguages.length > 0 ? (
                      <span className="inline-flex items-center gap-2 rounded-full bg-[#eefbdc] px-4 py-2 text-xs font-semibold text-[#41651f]">
                        <BadgeCheck className="h-4 w-4" />
                        Language test passed
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-x-7 gap-y-3 text-base font-semibold text-[#24235f]">
                  {profile.experience ? (
                    <span className="inline-flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      {profile.experience}
                    </span>
                  ) : null}
                  {profile.location ? (
                    <span className="inline-flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      {profile.location}
                    </span>
                  ) : null}
                  {profile.languages.length > 0 ? (
                    <span className="inline-flex items-center gap-2">
                      <Languages className="h-5 w-5" />
                      {profile.languages.join(" · ")}
                    </span>
                  ) : null}
                </div>
              </div>
            </section>

            {!loadingVerification && !isVerified ? (
              <section className="mt-8 flex flex-col gap-4 rounded-2xl border border-[#EDC84C]/70 bg-[#fff9df] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-bold">
                    Complete your guide profile to create tours
                  </h2>
                  <p className="mt-1 text-sm text-[#5d5b84]">
                    Tour creation unlocks after verification and profile approval.
                  </p>
                </div>
                <Link
                  to="/guide/complete-profile"
                  className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#010138] px-5 py-2.5 text-sm font-semibold text-white"
                >
                  Complete profile
                </Link>
              </section>
            ) : null}

            {errorMessage || verificationError ? (
              <p className="mt-8 rounded-xl border border-[#efc2c2] bg-[#fff2f2] px-4 py-3 text-sm text-[#a12121]">
                {errorMessage || verificationError}
              </p>
            ) : null}

            {profile.bio ? (
              <section className="mt-10">
                <h2 className="text-sm font-bold uppercase tracking-[0.2em]">
                  About
                </h2>
                <p className="mt-3 max-w-5xl whitespace-pre-line text-base leading-7 text-[#353572]">
                  {profile.bio}
                </p>
              </section>
            ) : null}

            {profile.interests.length > 0 ? (
              <section className="mt-10">
                <h2 className="text-sm font-bold uppercase tracking-[0.2em]">
                  Specialties
                </h2>
                <div className="mt-4 flex flex-wrap gap-3">
                  {profile.interests.map((interest) => (
                    <span
                      key={interest}
                      className="rounded-full bg-[#010170] px-6 py-2 text-sm font-medium text-white"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </section>
            ) : null}

            {profile.introductionVideo ? (
              <section className="mt-10">
                <h2 className="text-sm font-bold uppercase tracking-[0.2em]">
                  Video introduction
                </h2>
                <video
                  controls
                  preload="metadata"
                  poster={profile.experiencePhoto || undefined}
                  className="mt-5 aspect-video w-full rounded-2xl border border-[#EDC84C] bg-[#010138] object-cover"
                >
                  <source src={profile.introductionVideo} />
                </video>
              </section>
            ) : null}

            <section className="mt-12">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-[0.2em]">
                    Active offerings
                  </h2>
                  <p className="mt-2 text-sm text-[#353572]">
                    {activeTours.length} active tour
                    {activeTours.length === 1 ? "" : "s"}
                    {profile.lifetimeBookings > 0
                      ? ` · ${profile.lifetimeBookings} lifetime bookings`
                      : ""}
                  </p>
                </div>
                {isVerified ? (
                  <Link
                    to="/guide/tours/new"
                    className="rounded-lg bg-gradient-to-r from-[#010170] to-[#5656A0] px-5 py-2.5 text-xs font-semibold text-white"
                  >
                    Create new tour
                  </Link>
                ) : null}
              </div>

              {activeTours.length > 0 ? (
                <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {activeTours.map((tour) => (
                    <TourCard key={tour.id} tour={tour} />
                  ))}
                </div>
              ) : (
                <div className="mt-6">
                  <EmptySection>No active tours yet.</EmptySection>
                </div>
              )}
            </section>

            <section className="mt-12">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em]">
                Ratings &amp; reviews
              </h2>
              {profile.rating > 0 || reviewCount > 0 ? (
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Star className="h-7 w-7 fill-[#EDC84C] text-[#EDC84C]" />
                    <span className="text-3xl font-bold">{profile.rating}</span>
                  </div>
                  <span className="text-sm text-[#353572]">
                    Based on {reviewCount} review{reviewCount === 1 ? "" : "s"}
                  </span>
                </div>
              ) : null}

              {reviews.length > 0 ? (
                <div className="mt-6 space-y-4">
                  {reviews.map((review) => (
                    <article
                      key={review.id}
                      className="rounded-2xl border border-[#e4e3f0] bg-white p-5 shadow-[0_5px_18px_rgba(1,1,112,0.06)]"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          {review.photo ? (
                            <img
                              src={review.photo}
                              alt={review.name ? `${review.name} profile` : ""}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <span className="grid h-10 w-10 place-items-center rounded-full bg-[#eeeeF6] text-[#8b89a8]">
                              <UserRound className="h-5 w-5" />
                            </span>
                          )}
                          <div>
                            {review.name ? (
                              <h3 className="text-sm font-bold">{review.name}</h3>
                            ) : null}
                            {review.location ? (
                              <p className="text-xs text-[#8b89a8]">
                                {review.location}
                              </p>
                            ) : null}
                          </div>
                        </div>
                        {review.rating > 0 ? (
                          <RatingStars value={review.rating} />
                        ) : null}
                      </div>
                      {review.comment ? (
                        <p className="mt-4 text-sm leading-6 text-[#353572]">
                          {review.comment}
                        </p>
                      ) : null}
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-6">
                  <EmptySection>No reviews yet.</EmptySection>
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
