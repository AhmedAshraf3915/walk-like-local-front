import { useEffect, useState } from "react";
import { RotateCcw, Search, SlidersHorizontal } from "lucide-react";

import Navbar from "@/components/home/Navbar.jsx";
import HeroSection from "@/components/home/HeroSection.jsx";
import TourCard from "@/components/home/TourCard.jsx";
import Footer from "@/components/home/Footer.jsx";
import { toursApi } from "@/features/tours/api/toursApi";
import { EGYPT_GOVERNORATES } from "@/features/tours/constants/tourOptions";
import { mapActiveTours } from "@/features/landingPage/utils/landingContentMappers";

const PAGE_SIZE = 9;

const EMPTY_FILTERS = {
  search: "",
  destination: "",
  minPrice: "",
  maxPrice: "",
};

function TourGridSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: PAGE_SIZE }, (_, index) => (
        <div
          key={index}
          className="h-[430px] animate-pulse rounded-2xl bg-[#eeeeF6]"
        />
      ))}
    </div>
  );
}

export default function AllToursPage() {
  const [draftFilters, setDraftFilters] = useState(EMPTY_FILTERS);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [tours, setTours] = useState([]);
  const [pagination, setPagination] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [filterError, setFilterError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadTours = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await toursApi.browseActiveTours({
          ...filters,
          groupType:
            filters.minPrice || filters.maxPrice ? "PRIVATE" : "",
          page,
          limit: PAGE_SIZE,
        });

        if (!isMounted) return;

        setTours(
          mapActiveTours(response, [], { priceGroupType: "PRIVATE" }),
        );
        setPagination(response?.pagination ?? {});
      } catch (error) {
        if (!isMounted) return;

        setTours([]);
        setPagination({});
        setErrorMessage(error?.message ?? "Unable to load active tours.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadTours();

    return () => {
      isMounted = false;
    };
  }, [filters, page, reloadKey]);

  const setFilterField = (field, value) => {
    setDraftFilters((current) => ({ ...current, [field]: value }));
    setFilterError("");
  };

  const applyFilters = (event) => {
    event.preventDefault();

    if (
      draftFilters.minPrice &&
      draftFilters.maxPrice &&
      Number(draftFilters.minPrice) > Number(draftFilters.maxPrice)
    ) {
      setFilterError("Minimum price cannot be greater than maximum price.");
      return;
    }

    setPage(1);
    setFilters({ ...draftFilters });
    setFilterError("");
  };

  const clearFilters = () => {
    setDraftFilters(EMPTY_FILTERS);
    setFilters(EMPTY_FILTERS);
    setPage(1);
    setFilterError("");
  };

  const totalItems = Number(pagination?.totalItems) || tours.length;
  const totalPages = Math.max(Number(pagination?.totalPages) || 1, 1);
  const hasPreviousPage =
    pagination?.hasPreviousPage ?? page > 1;
  const hasNextPage = pagination?.hasNextPage ?? page < totalPages;
  const sectionTitle = filters.destination
    ? `${filters.destination} Journeys`
    : "Explore Egypt's tours";

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#FDFDFF] text-[#010138]">
      <Navbar />
      <HeroSection />

      <main id="tours" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
        <form
          onSubmit={applyFilters}
          className="rounded-2xl border border-[#e4e3f0] bg-white p-4 shadow-[0_6px_24px_rgba(1,1,112,0.08)] sm:p-5"
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#65638a]">
              Search
              <span className="mt-2 flex h-11 items-center gap-2 rounded-xl border border-[#d5d4ea] bg-[#FDFDFF] px-3 focus-within:border-[#010170]">
                <Search className="h-4 w-4" />
                <input
                  value={draftFilters.search}
                  onChange={(event) =>
                    setFilterField("search", event.target.value)
                  }
                  placeholder="Tour or activity"
                  className="min-w-0 flex-1 bg-transparent text-sm font-medium normal-case tracking-normal outline-none"
                />
              </span>
            </label>

            <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#65638a]">
              Destination
              <select
                value={draftFilters.destination}
                onChange={(event) =>
                  setFilterField("destination", event.target.value)
                }
                className="mt-2 h-11 w-full rounded-xl border border-[#d5d4ea] bg-[#FDFDFF] px-3 text-sm font-medium normal-case tracking-normal outline-none focus:border-[#010170]"
              >
                <option value="">All Egypt</option>
                {EGYPT_GOVERNORATES.map((governorate) => (
                  <option key={governorate} value={governorate}>
                    {governorate}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#65638a]">
              Minimum private price
              <input
                type="number"
                min="0"
                step="0.01"
                value={draftFilters.minPrice}
                onChange={(event) =>
                  setFilterField("minPrice", event.target.value)
                }
                placeholder="0"
                className="mt-2 h-11 w-full rounded-xl border border-[#d5d4ea] bg-[#FDFDFF] px-3 text-sm font-medium normal-case tracking-normal outline-none focus:border-[#010170]"
              />
            </label>

            <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#65638a]">
              Maximum private price
              <input
                type="number"
                min="0"
                step="0.01"
                value={draftFilters.maxPrice}
                onChange={(event) =>
                  setFilterField("maxPrice", event.target.value)
                }
                placeholder="Any"
                className="mt-2 h-11 w-full rounded-xl border border-[#d5d4ea] bg-[#FDFDFF] px-3 text-sm font-medium normal-case tracking-normal outline-none focus:border-[#010170]"
              />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[#9a2d2d]">{filterError}</p>
            <div className="ml-auto flex gap-2">
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex h-10 items-center gap-2 rounded-lg px-4 text-xs font-semibold text-[#353572] transition hover:bg-[#f4f4f8]"
              >
                <RotateCcw className="h-4 w-4" />
                Clear
              </button>
              <button
                type="submit"
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-gradient-to-r from-[#010170] to-[#5656A0] px-5 text-xs font-semibold text-white shadow-[0_4px_12px_rgba(1,1,112,0.22)]"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Apply filters
              </button>
            </div>
          </div>
        </form>

        <div className="mb-8 mt-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#EDC84C]">
            Explore Egypt
          </p>
          <h1 className="mt-3 text-[clamp(26px,3vw,36px)] font-bold text-[#010138]">
            {sectionTitle}
          </h1>
          <p className="mt-2 text-sm text-[#353572]">
            {isLoading
              ? "Finding active experiences..."
              : `${totalItems} active experience${totalItems === 1 ? "" : "s"} available.`}
          </p>
        </div>

        {isLoading ? <TourGridSkeleton /> : null}

        {!isLoading && errorMessage ? (
          <div className="rounded-2xl border border-[#efc2c2] bg-[#fff5f5] px-5 py-10 text-center">
            <p className="text-sm text-[#8f2929]">{errorMessage}</p>
            <button
              type="button"
              onClick={() => setReloadKey((current) => current + 1)}
              className="mt-4 rounded-lg bg-[#010138] px-5 py-2.5 text-xs font-semibold text-white"
            >
              Try again
            </button>
          </div>
        ) : null}

        {!isLoading && !errorMessage && tours.length === 0 ? (
          <div className="rounded-2xl border border-[#e4e3f0] bg-[#f8f8fc] px-5 py-12 text-center text-sm text-[#65638a]">
            No active tours match these filters.
          </div>
        ) : null}

        {!isLoading && !errorMessage && tours.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tours.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        ) : null}

        {!isLoading && !errorMessage && totalPages > 1 ? (
          <nav
            aria-label="Tours pagination"
            className="mt-10 flex items-center justify-center gap-4"
          >
            <button
              type="button"
              disabled={!hasPreviousPage}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="rounded-lg border border-[#d5d4ea] bg-white px-5 py-2.5 text-xs font-semibold text-[#010138] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm font-semibold text-[#353572]">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={!hasNextPage}
              onClick={() => setPage((current) => current + 1)}
              className="rounded-lg border border-[#d5d4ea] bg-white px-5 py-2.5 text-xs font-semibold text-[#010138] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </nav>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}
