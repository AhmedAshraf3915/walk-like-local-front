import { useEffect, useState } from "react";

import Navbar from "@/components/home/Navbar.jsx";
import HeroSection from "@/components/home/HeroSection.jsx";
import DestinationCard from "@/components/home/DestinationCard.jsx";
import Footer from "@/components/home/Footer.jsx";

import { toursApi } from "@/features/tours/api/toursApi.js";
import { mapTourDestinations } from "@/features/landingPage/utils/landingContentMappers.js";

const DESTINATIONS_TOURS_PAGE_LIMIT = 100;

const getTotalPagesFromPayload = (payload) => {
  const pages = Number(payload?.pagination?.totalPages);
  return Number.isFinite(pages) && pages > 1 ? pages : 1;
};

async function fetchAllActiveTours() {
  const firstPage = await toursApi.browseActiveTours({
    page: 1,
    limit: DESTINATIONS_TOURS_PAGE_LIMIT,
  });

  const tours = Array.isArray(firstPage?.items) ? [...firstPage.items] : [];
  const totalPages = getTotalPagesFromPayload(firstPage);

  if (totalPages > 1) {
    const remainingPages = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, index) =>
        toursApi.browseActiveTours({
          page: index + 2,
          limit: DESTINATIONS_TOURS_PAGE_LIMIT,
        }),
      ),
    );

    for (const pagePayload of remainingPages) {
      if (Array.isArray(pagePayload?.items)) {
        tours.push(...pagePayload.items);
      }
    }
  }

  return tours;
}

function Eyebrow({ children }) {
  return (
    <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#EDC84C]">
      {children}
    </span>
  );
}

function CardSkeletons() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2, 3, 4, 5].map((item) => (
        <div
          key={item}
          className="h-[280px] animate-pulse rounded-2xl bg-[#eeeeF6]"
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

function PlacesSection({ destinations, isLoading, errorMessage }) {
  return (
    <section id="places" className="bg-[#FDFDFF] px-4 py-12 sm:px-6 md:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-7 flex max-w-2xl flex-col gap-2">
          <Eyebrow>Destinations</Eyebrow>
          <h2 className="text-[clamp(22px,2.4vw,30px)] font-bold leading-tight text-[#010138]">
            Explore all places.
          </h2>
          <p className="text-[clamp(12px,1.2vw,14px)] leading-relaxed text-[#353572]">
            Browse every destination currently available in active tours.
          </p>
        </div>

        {isLoading ? <CardSkeletons /> : null}
        {!isLoading && errorMessage && destinations.length === 0 ? (
          <ContentMessage tone="error">{errorMessage}</ContentMessage>
        ) : null}
        {!isLoading && !errorMessage && destinations.length === 0 ? (
          <ContentMessage>No destinations are available yet.</ContentMessage>
        ) : null}
        {!isLoading && destinations.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {destinations.map((destination) => (
              <DestinationCard key={destination.id} destination={destination} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default function ViewAllPlacesPage() {
  const [content, setContent] = useState({
    destinations: [],
    destinationsLoading: true,
    destinationsError: "",
  });

  useEffect(() => {
    let isMounted = true;

    const loadDestinations = async () => {
      const tours = await fetchAllActiveTours();

      if (!isMounted) return;

      try {
        const destinations = mapTourDestinations(
          { items: tours },
          { limit: Number.POSITIVE_INFINITY },
        );

        setContent({
          destinations,
          destinationsLoading: false,
          destinationsError: "",
        });
      } catch (error) {
        setContent({
          destinations: [],
          destinationsLoading: false,
          destinationsError: error?.message ?? "Unable to load destinations.",
        });
      }
    };

    loadDestinations().catch((error) => {
      if (!isMounted) return;

      setContent({
        destinations: [],
        destinationsLoading: false,
        destinationsError: error?.message ?? "Unable to load destinations.",
      });
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <PlacesSection
        destinations={content.destinations}
        isLoading={content.destinationsLoading}
        errorMessage={content.destinationsError}
      />
      <Footer />
    </div>
  );
}
