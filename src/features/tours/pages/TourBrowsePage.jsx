import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toursApi } from "@/features/tours/api/toursApi";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { ArrowRight, Loader } from "lucide-react";
import Navbar from "@/components/home/Navbar.jsx";
import HeroSection from "@/components/home/HeroSection.jsx";
import TourCard from "@/components/home/TourCard.jsx";
import Footer from "@/components/home/Footer.jsx";

import { IMG } from "@/assets/images/landingPage/images.js";

const GROUP_TYPES = [
  { value: "", label: "All" },
  { value: "PRIVATE", label: "Private" },
  { value: "SMALL_GROUP", label: "Small Group" },
  { value: "LARGE_GROUP", label: "Large Group" },
];

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
        <a
          href={actionHref}
          className="flex flex-shrink-0 items-center gap-1.5 text-[12px] font-medium text-[#353572] transition-opacity hover:opacity-70"
        >
          {actionLabel} <ArrowRight size={16} />
        </a>
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

function ToursSection() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    toursApi
      .getActiveTours({ })
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
    <section id="all-tours" className="bg-[#FDFDFF] px-4 py-12 sm:px-6 md:py-16">
      <div className="mx-auto max-w-6xl">

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

export default function TourBrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const search = searchParams.get("search") || "";
  const destination = searchParams.get("destination") || "";
  const groupType = searchParams.get("groupType") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const sortBy = searchParams.get("sortBy") || "";
  const sortOrder = searchParams.get("sortOrder") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const updateParams = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      if (v) next.set(k, v);
      else next.delete(k);
    });
    if (updates.page === undefined) next.delete("page");
    setSearchParams(next);
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = {};
    if (search) params.search = search;
    if (destination) params.destination = destination;
    if (groupType) params.groupType = groupType;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (sortBy) params.sortBy = sortBy;
    if (sortOrder) params.sortOrder = sortOrder;
    params.page = page;
    params.limit = 12;

    toursApi.getActiveTours(params)
      .then((res) => {
        const raw = Array.isArray(res) ? res : res?.tours ?? res?.data ?? [];
        setTours(raw);
      })
      .catch((err) => setError(err.message || "Failed to load tours"))
      .finally(() => setLoading(false));
  }, [search, destination, groupType, minPrice, maxPrice, sortBy, sortOrder, page]);

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasFilters = search || destination || groupType || minPrice || maxPrice || sortBy;

  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <SectionHeader
          eyebrow="Explore Egypt"
          title="All The Available Tours"
          sub="Personalized using your interests and preferences."
        />
          <div className="flex gap-2">
            <button onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 rounded-full border border-[#cfcee6] bg-white px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold text-[#323166]">
              <SlidersHorizontal size={14} /> Filters
            </button>
            {hasFilters && (
              <button onClick={clearFilters}
                className="flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-[11px] font-semibold text-red-600">
                <X size={12} /> Clear
              </button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="rounded-xl sm:rounded-2xl border border-[#dddced] bg-white p-4 sm:p-5 mb-5 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-[#5d5b84] mb-1">Search</label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaaacf]" />
                  <input value={search} onChange={(e) => updateParams({ search: e.target.value })}
                    placeholder="Keyword..." maxLength={200}
                    className="w-full rounded-lg border border-[#d5d4ea] bg-white pl-8 pr-3 py-2 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-[#302d96]" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-[#5d5b84] mb-1">Destination</label>
                <input value={destination} onChange={(e) => updateParams({ destination: e.target.value })}
                  placeholder="e.g. Giza" maxLength={100}
                  className="w-full rounded-lg border border-[#d5d4ea] bg-white px-3 py-2 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-[#302d96]" />
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-[#5d5b84] mb-1">Group Type</label>
                <select value={groupType} onChange={(e) => updateParams({ groupType: e.target.value })}
                  className="w-full rounded-lg border border-[#d5d4ea] bg-white px-3 py-2 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-[#302d96]">
                  {GROUP_TYPES.map((gt) => <option key={gt.value} value={gt.value}>{gt.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-[#5d5b84] mb-1">Sort By</label>
                <select value={sortBy} onChange={(e) => updateParams({ sortBy: e.target.value, sortOrder: sortOrder || "asc" })}
                  className="w-full rounded-lg border border-[#d5d4ea] bg-white px-3 py-2 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-[#302d96]">
                  <option value="">Default</option>
                  <option value="price">Price</option>
                  <option value="duration">Duration</option>
                  <option value="createdAt">Newest</option>
                  <option value="title">Title</option>
                </select>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-[#5d5b84] mb-1">Min Price ($)</label>
                <input type="number" min="0" value={minPrice} onChange={(e) => updateParams({ minPrice: e.target.value, page: 1 })}
                  className="w-full rounded-lg border border-[#d5d4ea] bg-white px-3 py-2 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-[#302d96]" />
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-[#5d5b84] mb-1">Max Price ($)</label>
                <input type="number" min="0" value={maxPrice} onChange={(e) => updateParams({ maxPrice: e.target.value, page: 1 })}
                  className="w-full rounded-lg border border-[#d5d4ea] bg-white px-3 py-2 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-[#302d96]" />
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-[#5d5b84] mb-1">Order</label>
                <select value={sortOrder} onChange={(e) => updateParams({ sortOrder: e.target.value })}
                  className="w-full rounded-lg border border-[#d5d4ea] bg-white px-3 py-2 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-[#302d96]">
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#010170] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-red-50 px-6 py-10 text-center">
            <p className="text-red-600 text-sm">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-4 rounded-full bg-[#010170] px-5 py-2 text-xs font-semibold text-white">
              Retry
            </button>
          </div>
        ) : tours.length === 0 ? (
          <div className="py-20 text-center text-[#353572] text-sm">No tours found.</div>
        ) : (
          <ToursSection />
        )}

        {tours.length > 0 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button disabled={page <= 1} onClick={() => updateParams({ page: String(page - 1) })}
              className="rounded-full border border-[#cfcee6] bg-white px-4 py-1.5 text-xs font-semibold text-[#323166] disabled:opacity-40">
              Prev
            </button>
            <span className="text-xs text-[#5d5b84]">Page {page}</span>
            <button disabled={tours.length < 12} onClick={() => updateParams({ page: String(page + 1) })}
              className="rounded-full border border-[#cfcee6] bg-white px-4 py-1.5 text-xs font-semibold text-[#323166] disabled:opacity-40">
              Next
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
