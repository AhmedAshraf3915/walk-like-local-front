import { useState, useEffect } from "react";
import { ArrowRight, MapPin, Loader } from "lucide-react";
import { Link } from "react-router-dom";

import Navbar from "@/components/home/Navbar.jsx";
import HeroSection from "@/components/home/HeroSection.jsx";
import TourCard from "@/components/home/TourCard.jsx";
import DestinationCard from "@/components/home/DestinationCard.jsx";
import FeatureCard from "@/components/home/FeatureCard.jsx";
import GuideCard from "@/components/home/GuideCard.jsx";
import TestimonialCard from "@/components/home/TestimonialCard.jsx";
import Footer from "@/components/home/Footer.jsx";

import { toursApi } from "@/features/tours/api/toursApi";
import {
  DESTINATIONS,
  FEATURES,
  GUIDES,
  REVIEWS,
} from "@/data/homeData.js";
import { IMG } from "@/assets/images/landingPage/images.js";

// ─── Shared primitives ────────────────────────────────────────────────────────

function Eyebrow({ children }) {
  return (
    <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#EDC84C]">
      {children}
    </span>
  );
}

function SectionHeader({ eyebrow, title, sub, actionLabel, redirect }) {
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
          to={redirect}
          className="flex flex-shrink-0 items-center gap-1.5 text-[12px] font-medium text-[#353572] transition-opacity hover:opacity-70"
        >
          {actionLabel} <ArrowRight size={16} />
        </Link>
      )}
    </div>
  );
}

// ─── Map API tour → TourCard props ───────────────────────────

function mapApiTourToCard(apiTour) {
  const groupLabels = {
    PRIVATE: "Private tour",
    SMALL_GROUP: "Small group",
    LARGE_GROUP: "Large group",
  };

  const gType = apiTour.groupType ?? "PRIVATE";
  const pricing = apiTour.pricing ?? {};
  const priceVal = pricing[gType] ?? pricing.PRIVATE ?? 0;

  return {
    id: apiTour._id ?? apiTour.id,
    title: apiTour.title ?? "Untitled tour",
    matchTag: apiTour.destination
      ? `Explore ${apiTour.destination}`
      : null,
    tags: apiTour.activities
      ? apiTour.activities.map((a) =>
          typeof a === "string" ? a : a.name,
        ).slice(0, 3)
      : apiTour.destination
        ? [apiTour.destination]
        : [],
    guide:
      apiTour.guide?.fullName ??
      apiTour.guide?.name ??
      "Local guide",
    avatar:
      apiTour.guide?.profilePhoto?.secureUrl ??
      apiTour.guide?.avatar ??
      IMG.avatar,
    photo: apiTour.coverImage?.secureUrl ?? IMG.tourKhan,
    rating: apiTour.rating ?? 0,
    reviewCount: apiTour.reviewCount ?? 0,
    duration: apiTour.duration ?? "",
    groupType: groupLabels[gType] ?? gType,
    price: `$${priceVal} USD`,
  };
}

// ─── Section: AI Curated Tours ────────────────────────────────────────────────

function ToursSection() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    toursApi
      .getActiveTours({ limit: 6 })
      .then((res) => {
        if (cancelled) return;
        const raw = Array.isArray(res)
          ? res
          : res?.tours ?? res?.data ?? [];
        setTours(raw.map(mapApiTourToCard));
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message ?? "Failed to load tours");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="tours" className="bg-[#FDFDFF] px-4 py-12 sm:px-6 md:py-16">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="AI curated"
          title="Tailored For Your Travel Style."
          sub="Personalized using your interests and preferences."
          actionLabel="Browse all tours"
          actionHref="#tours"
          redirect="/tours"
        />

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="animate-spin text-[#010170]" size={32} />
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-red-50 px-6 py-10 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-full bg-[#010170] px-6 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Retry
            </button>
          </div>
        ) : tours.length === 0 ? (
          <div className="py-20 text-center text-[#353572]">
            No tours available yet. Check back soon.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tours.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Section: Destinations ────────────────────────────────────────────────────

function DestinationsSection() {
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
          actionHref="#destinations"
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {DESTINATIONS.map((dest) => (
            <DestinationCard key={dest.id} destination={dest} />
          ))}
        </div>
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

function GuidesSection() {
  return (
    <section id="guides" className="bg-[#FDFDFF] px-4 py-12 sm:px-6 md:py-16">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="Guides"
          title="Meet your locals."
          sub="Verified, story-rich and ready to walk you through their Egypt."
          actionLabel="View all guides"
          redirect="/guides"
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {GUIDES.map((guide) => (
            <GuideCard key={guide.id} guide={guide} />
          ))}
        </div>
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
  return (
    <div className="overflow-x-hidden bg-[#FDFDFF]">
      <Navbar />
      <HeroSection />
      <ToursSection />
      <DestinationsSection />
      <WhyChooseUsSection />
      <GuidesSection />
      <HeritageSection />
      <ReviewsSection />
      <BecomeGuideSection />
      <Footer />
    </div>
  );
}
