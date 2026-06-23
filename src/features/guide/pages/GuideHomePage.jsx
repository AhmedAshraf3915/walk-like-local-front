import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BadgeCheck, Star, UserRound } from "lucide-react";

import useAuth from "@/contexts/useAuth";
import { useGuideVerificationStatus } from "@/features/guideVerification/hooks/useGuideVerificationStatus";
import TourCard from "@/components/home/TourCard.jsx";
import GuideCard from "@/components/home/GuideCard.jsx";
import GuideNavbar from "@/components/home/GuideNavbar.jsx";
import Footer from "@/components/home/Footer.jsx";
import { GUIDES } from "@/data/homeData.js";
import { toursApi } from "@/features/tours/api/toursApi";
import { mapActiveTours } from "@/features/landingPage/utils/landingContentMappers";

const LANGUAGE_LABELS = {
  ar: "Arabic",
  arabic: "Arabic",
  en: "English",
  english: "English",
  de: "German",
  german: "German",
  it: "Italian",
  italian: "Italian",
  es: "Spanish",
  spanish: "Spanish",
  fr: "French",
  french: "French",
  france: "French",
};

const DEFAULT_PROFILE = {
  name: "",
  languages: [],
  location: "Not added yet",
  expertise: [],
  rating: 0,
  activeTours: 0,
  lifetimeBookings: 0,
  photo: "",
};

const getAssetUrl = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;

  if (typeof value === "object") {
    return (
      value.secureUrl ??
      value.secure_url ??
      value.url ??
      value.src ??
      value.path ??
      ""
    );
  }

  return "";
};

const readFirst = (...values) =>
  values.find((value) => typeof value === "string" && value.trim())?.trim() ??
  "";

const toTitleLabel = (value) => {
  const normalized = String(value ?? "").trim();
  if (!normalized) return "";

  const mapped = LANGUAGE_LABELS[normalized.toLowerCase()];
  if (mapped) return mapped;

  return normalized
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const normalizeDisplayList = (value, fallback) => {
  const source = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(/[,|]/)
      : [];

  const labels = source
    .map((entry) => {
      if (typeof entry === "string") {
        return toTitleLabel(entry);
      }

      if (entry && typeof entry === "object") {
        return toTitleLabel(
          entry.label ?? entry.name ?? entry.code ?? entry.value,
        );
      }

      return "";
    })
    .filter(Boolean);

  return labels.length ? labels : fallback;
};

const joinWithDots = (items) => items.filter(Boolean).join(" . ");

function Eyebrow({ children }) {
  return (
    <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#EDC84C]">
      {children}
    </span>
  );
}

function SectionHeader({ eyebrow, title, sub, actionLabel, actionHref = "#" }) {
  return (
    <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex max-w-2xl flex-col gap-2">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="text-[clamp(22px,2.4vw,30px)] font-bold leading-tight text-[#010138]">
          {title}
        </h2>
        {sub ? (
          <p className="text-[clamp(12px,1.2vw,15px)] leading-relaxed text-[#353572]">
            {sub}
          </p>
        ) : null}
      </div>
      {actionLabel ? (
        <Link
          to={actionHref}
          className="flex shrink-0 items-center gap-1.5 text-[12px] font-medium text-[#353572] transition-opacity hover:opacity-70"
        >
          {actionLabel}
          <ArrowRight size={16} />
        </Link>
      ) : null}
    </div>
  );
}

function GuideBadge() {
  return (
    <span className="absolute bottom-2 right-2 grid h-10 w-10 place-items-center rounded-full border-2 border-white bg-[#010138] text-[#EDC84C] shadow-[0_6px_16px_rgba(1,1,56,0.25)]">
      <BadgeCheck size={21} />
    </span>
  );
}

function GuideHero({ profile, verified }) {
  const createTourAction = {
    label: "Create new tour",
    to: verified ? "/guide/tours/new" : "/guide/complete-profile",
  };

  return (
    <header className="bg-[#FDFDFF] px-4 pt-10 sm:px-6 md:pt-14">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-6 md:grid-cols-[190px_1fr] md:items-center">
          <div className="relative mx-auto h-40 w-40 shrink-0 overflow-visible rounded-full md:mx-0 md:h-[170px] md:w-[170px]">
            {profile.photo ? (
              <img
                src={profile.photo}
                alt={profile.name || "Guide profile"}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <div
                aria-label="Guide profile placeholder"
                className="grid h-full w-full place-items-center rounded-full border border-[#deddec] bg-[#f0eff8] text-[#8d8baa]"
              >
                <UserRound className="h-16 w-16" />
              </div>
            )}
            {verified ? <GuideBadge /> : null}
          </div>

          <div>
            <div className="flex flex-col gap-1">
              {profile.name ? (
                <h1 className="text-[clamp(24px,3vw,32px)] font-bold leading-tight text-[#010138]">
                  {profile.name}
                </h1>
              ) : null}
              {verified ? (
                <div className="flex items-center gap-1.5 text-[13px] font-semibold text-[#010138]">
                  {profile.rating > 0 ? (
                    <>
                      Rating . {profile.rating} / 5
                      <Star
                        size={13}
                        className="fill-[#EDC84C] text-[#EDC84C]"
                      />
                    </>
                  ) : (
                    "New guide"
                  )}
                </div>
              ) : null}
            </div>

            <div className="mt-5 grid gap-5 text-[#010138] sm:grid-cols-3">
              <div>
                <p className="text-[13px] font-bold">Languages :</p>
                <p className="mt-2 text-[16px] font-bold leading-snug">
                  {joinWithDots(profile.languages) || "Not added yet"}
                </p>
              </div>
              <div>
                <p className="text-[13px] font-bold">Location :</p>
                <p className="mt-2 text-[16px] font-bold leading-snug">
                  {profile.location}
                </p>
              </div>
              <div>
                <p className="text-[13px] font-bold">Expertise :</p>
                <p className="mt-2 text-[16px] font-bold leading-snug">
                  {joinWithDots(profile.expertise) || "Not added yet"}
                </p>
              </div>
            </div>

            <div className="mx-auto mt-8 flex max-w-sm flex-col items-center gap-3 md:mx-0 md:ml-[110px]">
              <Link
                to={createTourAction.to}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#010170] to-[#5656A0] px-5 text-[12px] font-semibold text-white shadow-[0_6px_16px_rgba(1,1,112,0.22)] transition-opacity hover:opacity-90"
              >
                {createTourAction.label}
                <ArrowRight size={15} />
              </Link>
              {verified ? (
                <p className="text-center text-[13px] font-medium text-[#353572]">
                  {profile.activeTours} active tours .{" "}
                  {profile.lifetimeBookings} lifetime bookings
                </p>
              ) : (
                <p className="text-center text-[13px] font-medium text-[#353572]">
                  Complete your profile to unlock tour publishing.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function MarketplaceSection({ tours, isLoading, errorMessage, onRetry }) {
  return (
    <section id="tours" className="bg-[#FDFDFF] px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="Discover"
          title="Marketplace"
          sub="Small groups, slow streets, real conversations."
          actionLabel="Browse all tours"
          actionHref="/tours"
        />

        {isLoading ? (
          <div className="-mx-4 overflow-hidden px-4 pb-2">
            <div className="flex min-w-max gap-4" aria-label="Loading tours">
              {Array.from({ length: 3 }, (_, index) => (
                <div
                  key={index}
                  className="h-[470px] w-[300px] shrink-0 animate-pulse rounded-2xl bg-[#eeeeF6] lg:w-[420px]"
                />
              ))}
            </div>
          </div>
        ) : null}

        {!isLoading && errorMessage ? (
          <div className="rounded-2xl border border-[#efc2c2] bg-[#fff5f5] px-5 py-8 text-center">
            <p className="text-sm text-[#8f2929]">{errorMessage}</p>
            <button
              type="button"
              onClick={onRetry}
              className="mt-4 rounded-lg bg-[#010138] px-5 py-2.5 text-xs font-semibold text-white"
            >
              Try again
            </button>
          </div>
        ) : null}

        {!isLoading && !errorMessage && tours.length === 0 ? (
          <div className="rounded-2xl border border-[#e4e3f0] bg-[#f8f8fc] px-5 py-10 text-center text-sm text-[#65638a]">
            No active tours are available yet.
          </div>
        ) : null}

        {!isLoading && !errorMessage && tours.length > 0 ? (
          <div className="-mx-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex min-w-max gap-4">
              {tours.map((tour) => (
                <div key={tour.id} className="w-[300px] shrink-0 lg:w-[420px]">
                  <TourCard tour={tour} />
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function GuidesSection() {
  return (
    <section id="guides" className="bg-[#FDFDFF] px-4 py-8 sm:px-6 md:py-10">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="Guides"
          title="Meet your locals."
          sub="Verified, story-rich and ready to walk you through their Egypt."
          actionLabel="View all guides"
          actionHref="/guides"
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
          {GUIDES.map((guide) => (
            <GuideCard key={guide.id} guide={{ ...guide, href: "#" }} />
          ))}
        </div>
      </div>
    </section>
  );
}

const buildGuideProfile = (user, remoteVerification = {}) => {
  const remoteGuide =
    remoteVerification?.guide ?? remoteVerification?.user ?? {};
  const nestedProfile = user?.guideProfile ?? user?.profile ?? {};
  const guideVerification = {
    ...(user?.guideVerification ?? user?.verification ?? {}),
    ...remoteVerification,
  };
  const photo =
    getAssetUrl(guideVerification?.verificationDocuments?.profilePhoto) ||
    getAssetUrl(guideVerification?.profilePhoto) ||
    getAssetUrl(user?.profilePhoto) ||
    getAssetUrl(user?.profilePicture) ||
    getAssetUrl(user?.avatar) ||
    getAssetUrl(user?.photo) ||
    getAssetUrl(nestedProfile?.profilePhoto) ||
    DEFAULT_PROFILE.photo;

  const stats = user?.stats ?? user?.guideStats ?? remoteGuide?.stats ?? {};
  const languages =
    user?.languages ?? nestedProfile?.languages ?? remoteGuide?.languages;
  const expertise =
    user?.expertise ??
    user?.specialties ??
    user?.interests ??
    nestedProfile?.interests ??
    remoteGuide?.interests;

  return {
    name:
      readFirst(
        user?.fullName,
        user?.name,
        nestedProfile?.fullName,
        remoteGuide?.fullName,
        remoteGuide?.name,
      ) || DEFAULT_PROFILE.name,
    languages: normalizeDisplayList(languages, DEFAULT_PROFILE.languages),
    location:
      readFirst(
        user?.city,
        user?.location,
        user?.address?.city,
        user?.nationality,
        nestedProfile?.location,
        nestedProfile?.nationality,
        remoteGuide?.city,
        remoteGuide?.location,
        guideVerification?.nationality,
      ) || DEFAULT_PROFILE.location,
    expertise: normalizeDisplayList(expertise, DEFAULT_PROFILE.expertise),
    rating:
      Number(
        user?.rating ??
          user?.averageRating ??
          remoteGuide?.rating ??
          stats.rating,
      ) || DEFAULT_PROFILE.rating,
    activeTours:
      Number(
        user?.activeToursCount ??
          user?.activeTours ??
          stats.activeTours ??
          stats.activeToursCount,
      ) || DEFAULT_PROFILE.activeTours,
    lifetimeBookings:
      Number(
        user?.lifetimeBookings ??
          user?.bookingCount ??
          stats.lifetimeBookings ??
          stats.bookingCount,
      ) || DEFAULT_PROFILE.lifetimeBookings,
    photo,
  };
};

export default function GuideHomePage() {
  const { user } = useAuth();
  const [marketplace, setMarketplace] = useState({
    tours: [],
    isLoading: true,
    errorMessage: "",
  });
  const [marketplaceReloadKey, setMarketplaceReloadKey] = useState(0);
  const {
    isVerified,
    isLoading: loadingVerification,
    verification,
  } = useGuideVerificationStatus({ user });
  const verified = isVerified && !loadingVerification;
  const profile = useMemo(
    () => buildGuideProfile(user, verification),
    [user, verification],
  );

  useEffect(() => {
    let isMounted = true;

    const loadMarketplaceTours = async () => {
      setMarketplace((current) => ({
        ...current,
        isLoading: true,
        errorMessage: "",
      }));

      try {
        const response = await toursApi.browseActiveTours({
          page: 1,
          limit: 6,
        });

        if (!isMounted) return;

        setMarketplace({
          tours: mapActiveTours(response, [], { href: "/tours" }),
          isLoading: false,
          errorMessage: "",
        });
      } catch (error) {
        if (!isMounted) return;

        setMarketplace({
          tours: [],
          isLoading: false,
          errorMessage: error?.message ?? "Unable to load active tours.",
        });
      }
    };

    void loadMarketplaceTours();

    return () => {
      isMounted = false;
    };
  }, [marketplaceReloadKey]);

  return (
    <div className="overflow-x-hidden bg-[#FDFDFF] text-[#010138]">
      <GuideNavbar verified={verified} profilePhoto={profile.photo} />
      <GuideHero profile={profile} verified={verified} />
      <MarketplaceSection
        tours={marketplace.tours}
        isLoading={marketplace.isLoading}
        errorMessage={marketplace.errorMessage}
        onRetry={() => setMarketplaceReloadKey((current) => current + 1)}
      />
      <GuidesSection />
      <Footer />
    </div>
  );
}
