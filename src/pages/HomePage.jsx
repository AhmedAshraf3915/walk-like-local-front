import { useEffect, useState } from "react";
import { ArrowRight, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import useAuth from "@/contexts/useAuth";

import Navbar from "@/components/home/Navbar.jsx";
import HeroSection from "@/components/home/HeroSection.jsx";
import TourCard from "@/components/home/TourCard.jsx";
import DestinationCard from "@/components/home/DestinationCard.jsx";
import FeatureCard from "@/components/home/FeatureCard.jsx";
import GuideCard from "@/components/home/GuideCard.jsx";
import TestimonialCard from "@/components/home/TestimonialCard.jsx";
import Footer from "@/components/home/Footer.jsx";

import { FEATURES, REVIEWS } from "@/data/homeData.js";
import { IMG } from "@/assets/images/landingPage/images.js";
import { toursApi } from "@/features/tours/api/toursApi.js";
import { guidesApi } from "@/features/guide/api/guidesApi.js";
import {
  mapActiveTours,
  mapPublicGuides,
  mapTourDestinations,
} from "@/features/landingPage/utils/landingContentMappers.js";

const DESTINATION_TOURS_PAGE_LIMIT = 100;

const getListFromPayload = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.tours)) return payload.tours;
  if (Array.isArray(payload.results)) return payload.results;
  if (Array.isArray(payload.docs)) return payload.docs;

  return [];
};

const getTotalPagesFromPayload = (payload) => {
  const pages = Number(payload?.pagination?.totalPages);
  return Number.isFinite(pages) && pages > 1 ? pages : 1;
};

const fetchAllActiveTours = async () => {
  const firstPagePayload = await toursApi.browseActiveTours({
    page: 1,
    limit: DESTINATION_TOURS_PAGE_LIMIT,
  });

  const totalPages = getTotalPagesFromPayload(firstPagePayload);
  const tours = [...getListFromPayload(firstPagePayload)];

  if (totalPages > 1) {
    const remainingPayloads = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, index) =>
        toursApi.browseActiveTours({
          page: index + 2,
          limit: DESTINATION_TOURS_PAGE_LIMIT,
        }),
      ),
    );

    for (const payload of remainingPayloads) {
      tours.push(...getListFromPayload(payload));
    }
  }

  return tours;
};

// ─── Shared primitives ────────────────────────────────────────────────────────

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
        {sub && (
          <p className="text-[clamp(12px,1.2vw,14px)] leading-relaxed text-[#353572]">
            {sub}
          </p>
        )}
      </div>
      {actionLabel && (
        <Link
          to={actionHref}
          className="flex flex-shrink-0 items-center gap-1.5 text-[12px] font-medium text-[#353572] transition-opacity hover:opacity-70"
        >
          {actionLabel} <ArrowRight size={16} />
        </Link>
      )}
    </div>
  );
}

function CardSkeletons() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="h-[430px] animate-pulse rounded-2xl bg-[#eeeeF6]"
        />
      ))}
    </div>
  );
}

function ContentMessage({ children, tone = "empty" }) {
  return (
    <div
      className={`rounded-2xl border px-5 py-8 text-center text-sm ${
        tone === "error"
          ? "border-[#efc2c2] bg-[#fff5f5] text-[#8f2929]"
          : "border-[#e4e3f0] bg-[#f8f8fc] text-[#65638a]"
      }`}
    >
      {children}
    </div>
  );
}

// ─── Section: AI Curated Tours ────────────────────────────────────────────────

function ToursSection({ tours, isLoading, errorMessage }) {
  return (
    <section id="tours" className="bg-[#FDFDFF] px-4 py-12 sm:px-6 md:py-16">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="AI curated"
          title="Tailored For Your Travel Style."
          sub="Personalized using your interests and preferences."
          actionLabel="View all tours"
          actionHref="/tours"
        />

        {isLoading ? <CardSkeletons /> : null}
        {!isLoading && errorMessage && tours.length === 0 ? (
          <ContentMessage tone="error">{errorMessage}</ContentMessage>
        ) : null}
        {!isLoading && !errorMessage && tours.length === 0 ? (
          <ContentMessage>No active tours are available yet.</ContentMessage>
        ) : null}
        {!isLoading && tours.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tours.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

// ─── Section: Destinations ────────────────────────────────────────────────────

function DestinationsSection({ destinations, isLoading, errorMessage }) {
  return (
    <section
      id="destinations"
      className="bg-[#FDFDFF] px-4 py-12 sm:px-6 md:py-16"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="Destinations"
          title="Egypt, city by city."
          sub="Pick a place. Meet a local. Wander on purpose."
          actionLabel="View all places"
          actionHref="/places"
        />

        {isLoading ? <CardSkeletons /> : null}
        {!isLoading && errorMessage && destinations.length === 0 ? (
          <ContentMessage tone="error">{errorMessage}</ContentMessage>
        ) : null}
        {!isLoading && !errorMessage && destinations.length === 0 ? (
          <ContentMessage>No destinations are available yet.</ContentMessage>
        ) : null}
        {!isLoading && destinations.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {destinations.map((dest) => (
              <DestinationCard key={dest.id} destination={dest} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

// ─── Section: Why Choose Us ───────────────────────────────────────────────────

function WhyChooseUsSection() {
  return (
    <section className="bg-gradient-to-br from-[#010170] to-[#010138] px-4 py-12 sm:px-6 md:py-16">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mx-auto mb-8 max-w-xl text-center">
          <Eyebrow>Why choose us</Eyebrow>
          <h2 className="mt-3 text-[clamp(22px,2.4vw,30px)] font-bold text-white">
            Trust, the Egyptian way.
          </h2>
          <p className="mt-2 text-[clamp(12px,1.2vw,14px)] leading-relaxed text-[#CCCCE2]">
            Verified, story-rich and ready to walk you through their Egypt.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section: Guides ──────────────────────────────────────────────────────────

function GuidesSection({ guides, isLoading, errorMessage }) {
  return (
    <section id="guides" className="bg-[#FDFDFF] px-4 py-12 sm:px-6 md:py-16">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="Guides"
          title="Meet your locals."
          sub="Verified, story-rich and ready to walk you through their Egypt."
          actionLabel="View all guides"
          actionHref="/guides"
        />

        {isLoading ? <CardSkeletons /> : null}
        {!isLoading && errorMessage && guides.length === 0 ? (
          <ContentMessage tone="error">{errorMessage}</ContentMessage>
        ) : null}
        {!isLoading && !errorMessage && guides.length === 0 ? (
          <ContentMessage>
            No public guide profiles are available yet.
          </ContentMessage>
        ) : null}
        {!isLoading && guides.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((guide) => (
              <GuideCard key={guide.id} guide={guide} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

// ─── Section: Heritage ────────────────────────────────────────────────────────

function HeritageSection() {
  return (
    <section className="bg-[#FDFDFF] py-12 md:py-16">
      {/* Text */}
      <div className="mx-auto mb-8 max-w-2xl px-4 text-center sm:px-6">
        <Eyebrow>The beauty of Egypt</Eyebrow>
        <h2 className="mt-3 text-[clamp(22px,2.4vw,30px)] font-bold text-[#010138]">
          Heritage, lived in.
        </h2>
        <p className="mt-2 text-[clamp(12px,1.2vw,14px)] leading-relaxed text-[#353572]">
          Glimpses of the corners, kitchens and conversations that make Egypt
          unforgettable.
        </p>
      </div>

      {/* Full-width photo */}
      <div className="relative flex h-[280px] items-end justify-end overflow-hidden md:h-[360px]">
        <img
          src={IMG.sinai}
          alt="Sinai Red Sea"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/45" />

        {/* Location tag */}
        <div className="relative z-10 mb-5 mr-5 flex items-center gap-1.5 rounded-full bg-black/35 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-sm">
          <MapPin size={12} />
          Sinai · Red Sea
        </div>
      </div>
    </section>
  );
}

// ─── Section: Travelers Say ───────────────────────────────────────────────────

function ReviewsSection() {
  return (
    <section className="bg-[#FDFDFF] px-4 py-12 sm:px-6 md:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-8 max-w-xl text-center">
          <Eyebrow>Travelers say</Eyebrow>
          <h2 className="mt-3 text-[clamp(22px,2.4vw,30px)] font-bold text-[#010138]">
            Stories from the road.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {REVIEWS.map((review) => (
            <TestimonialCard key={review.id} review={review} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section: Become a Guide CTA ─────────────────────────────────────────────

function BecomeGuideSection() {
  return (
    <section className="bg-[#FDFDFF] px-4 pb-14 sm:px-6">
      <div className="relative mx-auto flex min-h-[240px] max-w-6xl flex-col justify-center overflow-hidden rounded-2xl p-8 md:min-h-[280px] md:p-14">
        {/* Background */}
        <img
          src={IMG.becomeGuide}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/72" />

        {/* Content */}
        <div className="relative z-10 flex max-w-lg flex-col gap-4">
          <Eyebrow>Become a guide</Eyebrow>

          <h2 className="text-[clamp(22px,2.8vw,36px)] font-bold leading-tight text-white">
            Share your city's secrets.
          </h2>

          <p className="text-[clamp(12px,1.2vw,15px)] leading-relaxed text-[#CCCCE2]">
            Turn your neighborhood, your craft and your story into income — on a
            platform built to put locals first.
          </p>

          <Link
            to="/signup"
            className="flex items-center gap-2 self-start rounded-full bg-gradient-to-r from-[#010170] to-[#5656A0] px-6 py-2.5 text-[12px] font-semibold text-white shadow-[0_6px_20px_rgba(1,1,112,0.42)] transition-opacity hover:opacity-90"
          >
            Apply now as a guide
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { isAuthenticated, userRole } = useAuth();
  const isGuide = String(userRole ?? "").toLowerCase() === "guide";
  const [content, setContent] = useState({
    tours: [],
    guides: [],
    destinations: [],
    toursLoading: true,
    guidesLoading: true,
    destinationsLoading: true,
    toursError: "",
    guidesError: "",
    destinationsError: "",
  });

  useEffect(() => {
    let isMounted = true;

    const loadLandingContent = async () => {
      const [toursResult, guidesResult, destinationsResult] =
        await Promise.allSettled([
          toursApi.browseActiveTours({ page: 1, limit: 3 }),
          guidesApi.getPublicGuides({ page: 1, limit: 3 }),
          fetchAllActiveTours(),
        ]);

      if (!isMounted) return;

      const guides =
        guidesResult.status === "fulfilled"
          ? mapPublicGuides(guidesResult.value).slice(0, 3)
          : [];
      const tours =
        toursResult.status === "fulfilled"
          ? mapActiveTours(toursResult.value, guides).slice(0, 3)
          : [];
      const destinations =
        destinationsResult.status === "fulfilled"
          ? mapTourDestinations(
              { items: destinationsResult.value },
              { limit: 3 },
            )
          : [];

      setContent({
        tours,
        guides,
        destinations,
        toursLoading: false,
        guidesLoading: false,
        destinationsLoading: false,
        toursError:
          toursResult.status === "rejected"
            ? (toursResult.reason?.message ?? "Unable to load active tours.")
            : "",
        guidesError:
          guidesResult.status === "rejected"
            ? (guidesResult.reason?.message ?? "Unable to load public guides.")
            : "",
        destinationsError:
          destinationsResult.status === "rejected"
            ? (destinationsResult.reason?.message ??
              "Unable to load destinations.")
            : "",
      });
    };

    void loadLandingContent();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="overflow-x-hidden bg-[#FDFDFF]">
      <Navbar />
      <HeroSection />
      <ToursSection
        tours={content.tours}
        isLoading={content.toursLoading}
        errorMessage={content.toursError}
      />
      <DestinationsSection
        destinations={content.destinations}
        isLoading={content.destinationsLoading}
        errorMessage={content.destinationsError}
      />
      <WhyChooseUsSection />
      <GuidesSection
        guides={content.guides}
        isLoading={content.guidesLoading}
        errorMessage={content.guidesError}
      />
      <HeritageSection />
      {/* <ReviewsSection /> */}
      {!isAuthenticated || !isGuide ? <BecomeGuideSection /> : null}
      <Footer />
    </div>
  );
}
