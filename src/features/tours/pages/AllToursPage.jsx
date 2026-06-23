import { useEffect, useRef, useState } from "react";
import { RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { useLocation, useSearchParams } from "react-router-dom";

import GuideNavbar from "@/components/home/GuideNavbar.jsx";
import HeroSection from "@/components/home/HeroSection.jsx";
import TourCard from "@/components/home/TourCard.jsx";
import Footer from "@/components/home/Footer.jsx";
import { toursApi } from "@/features/tours/api/toursApi";
import { mapActiveTours } from "@/features/landingPage/utils/landingContentMappers";

const PAGE_SIZE = 9;

const EMPTY_FILTERS = {
  search: "",
  minPrice: "",
  maxPrice: "",
};

const getRefineFiltersFromSearchParams = (searchParams) => ({
  ...EMPTY_FILTERS,
  search: searchParams.get("search") ?? "",
  minPrice: searchParams.get("minPrice") ?? "",
  maxPrice: searchParams.get("maxPrice") ?? "",
});

const getHeroSearchFromSearchParams = (searchParams) => ({
  destination: searchParams.get("destination") ?? "",
  date: searchParams.get("date") ?? "",
  tourType:
    searchParams.get("tourType") ??
    (searchParams.has("destination") || searchParams.has("date")
      ? (searchParams.get("search") ?? "")
      : ""),
});

const normalizeWholeNumberInput = (value) => {
  const integerPart = String(value ?? "").split(".")[0];
  const digitsOnly = integerPart.replace(/\D/g, "");

  return digitsOnly.replace(/^0+(?=\d)/, "");
};

const filterToursByDate = (items, selectedDate) => {
  if (!selectedDate) return items;

  return items.filter((tour) =>
    (Array.isArray(tour?.slots) ? tour.slots : []).some((slot) => {
      const rawDate = String(slot?.date ?? "");
      if (!rawDate) return false;

      const normalizedDate = Number.isNaN(new Date(rawDate).getTime())
        ? rawDate.slice(0, 10)
        : new Date(rawDate).toISOString().slice(0, 10);

      return normalizedDate === selectedDate;
    }),
  );
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
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const initialFilters = getRefineFiltersFromSearchParams(searchParams);
  const initialHeroSearch = getHeroSearchFromSearchParams(searchParams);
  const [draftFilters, setDraftFilters] = useState(initialFilters);
  const [filters, setFilters] = useState(initialFilters);
  const [heroSearch, setHeroSearch] = useState(initialHeroSearch);
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [tours, setTours] = useState([]);
  const [pagination, setPagination] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [filterError, setFilterError] = useState("");
  const hasMountedRef = useRef(false);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    const nextFilters = getRefineFiltersFromSearchParams(
      new URLSearchParams(location.search),
    );
    const nextHeroSearch = getHeroSearchFromSearchParams(
      new URLSearchParams(location.search),
    );
    setDraftFilters(nextFilters);
    setFilters(nextFilters);
    setHeroSearch(nextHeroSearch);
    setPage(1);
    setFilterError("");
  }, [location.key, location.search]);

  useEffect(() => {
    let isMounted = true;

    const loadTours = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const combinedSearch = [heroSearch.tourType, filters.search]
          .filter(Boolean)
          .join(" ");
        const response = await toursApi.browseActiveTours({
          search: combinedSearch,
          destination: heroSearch.destination,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          groupType: filters.minPrice || filters.maxPrice ? "PRIVATE" : "",
          page: heroSearch.date ? 1 : page,
          limit: heroSearch.date ? 100 : PAGE_SIZE,
        });

        if (!isMounted) return;

        const dateFilteredItems = filterToursByDate(
          Array.isArray(response?.items) ? response.items : [],
          heroSearch.date,
        );
        const pageItems = heroSearch.date
          ? dateFilteredItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
          : dateFilteredItems;
        const dateTotalPages = Math.max(
          Math.ceil(dateFilteredItems.length / PAGE_SIZE),
          1,
        );

        setTours(
          mapActiveTours({ items: pageItems }, [], {
            priceGroupType: "PRIVATE",
          }),
        );
        setPagination(
          heroSearch.date
            ? {
                page,
                totalItems: dateFilteredItems.length,
                totalPages: dateTotalPages,
                hasPreviousPage: page > 1,
                hasNextPage: page < dateTotalPages,
              }
            : (response?.pagination ?? {}),
        );
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
  }, [filters, heroSearch, page, reloadKey]);

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
  const hasPreviousPage = pagination?.hasPreviousPage ?? page > 1;
  const hasNextPage = pagination?.hasNextPage ?? page < totalPages;
  const sectionTitle = heroSearch.destination
    ? `${heroSearch.destination} Journeys`
    : "Explore Egypt's tours";

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#FDFDFF] text-[#010138]">
      <GuideNavbar />
      <HeroSection />

      <main
        id="tours"
        className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16"
      >
        <form
          onSubmit={applyFilters}
          className="rounded-2xl border border-[#ebeaf4] bg-[#fbfbfe] p-4 shadow-[0_4px_18px_rgba(1,1,112,0.06)] sm:p-5"
        >
          <div className="mb-4 flex flex-col gap-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8b89a8]">
              Refine Results
            </p>
            <p className="text-sm text-[#55537a]">
              Narrow the searched tours by activity name and private price
              range.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-[1.35fr_0.9fr_0.9fr]">
            <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#65638a]">
              Tour / Activity Name
              <span className="mt-2 flex h-11 items-center gap-2 rounded-xl border border-[#d5d4ea] bg-[#FDFDFF] px-3 focus-within:border-[#010170]">
                <Search className="h-4 w-4" />
                <input
                  value={draftFilters.search}
                  onChange={(event) =>
                    setFilterField("search", event.target.value)
                  }
                  placeholder="Search by tour or activity"
                  className="min-w-0 flex-1 bg-transparent text-sm font-medium normal-case tracking-normal outline-none"
                />
              </span>
            </label>

            <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#65638a]">
              Minimum private price
              <input
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                value={draftFilters.minPrice}
                onChange={(event) =>
                  setFilterField(
                    "minPrice",
                    normalizeWholeNumberInput(event.target.value),
                  )
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
                step="1"
                inputMode="numeric"
                value={draftFilters.maxPrice}
                onChange={(event) =>
                  setFilterField(
                    "maxPrice",
                    normalizeWholeNumberInput(event.target.value),
                  )
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
