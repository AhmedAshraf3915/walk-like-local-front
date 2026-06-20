import { useEffect, useId, useRef, useState } from "react";
import { Calendar, Check, ChevronDown, MapPin, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { IMG } from "@/assets/images/landingPage/images.js";
import { TOUR_TYPES } from "@/data/homeData.js";
import { EGYPT_GOVERNORATES } from "@/features/tours/constants/tourOptions";
import { toursApi } from "@/features/tours/api/toursApi.js";
import { guidesApi } from "@/features/guide/api/guidesApi.js";
import {
  buildHeroStats,
  DEFAULT_HERO_STATS,
} from "@/features/landingPage/utils/heroStats.js";

const HERO_STATS_PAGE_LIMIT = 12;

const getListFromPayload = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.tours)) return payload.tours;
  if (Array.isArray(payload.guides)) return payload.guides;
  if (Array.isArray(payload.results)) return payload.results;
  if (Array.isArray(payload.docs)) return payload.docs;

  return [];
};

const getTotalPagesFromPayload = (payload) => {
  const pages = Number(payload?.pagination?.totalPages);
  return Number.isFinite(pages) && pages > 1 ? pages : 1;
};

const fetchAllPagedRecords = async (fetchPage) => {
  const firstPagePayload = await fetchPage(1);
  const totalPages = getTotalPagesFromPayload(firstPagePayload);
  const allRecords = [...getListFromPayload(firstPagePayload)];

  if (totalPages > 1) {
    const remainingPayloads = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, index) =>
        fetchPage(index + 2),
      ),
    );

    for (const payload of remainingPayloads) {
      allRecords.push(...getListFromPayload(payload));
    }
  }

  return {
    records: allRecords,
    pagination: firstPagePayload?.pagination ?? {},
  };
};

export default function HeroSection({ stats }) {
  const navigate = useNavigate();
  const [city, setCity] = useState("");
  const [tourType, setTourType] = useState("");
  const [date, setDate] = useState("");
  const [resolvedStats, setResolvedStats] = useState(() =>
    Array.isArray(stats) && stats.length ? stats : DEFAULT_HERO_STATS,
  );

  useEffect(() => {
    if (Array.isArray(stats) && stats.length) {
      setResolvedStats(stats);
      return;
    }

    setResolvedStats(DEFAULT_HERO_STATS);
  }, [stats]);

  useEffect(() => {
    if (Array.isArray(stats) && stats.length) {
      return undefined;
    }

    let cancelled = false;

    const loadHeroStats = async () => {
      try {
        const [allTours, allGuides] = await Promise.all([
          fetchAllPagedRecords((page) =>
            toursApi.browseActiveTours({
              page,
              limit: HERO_STATS_PAGE_LIMIT,
            }),
          ),
          fetchAllPagedRecords((page) =>
            guidesApi.getPublicGuides({
              page,
              limit: HERO_STATS_PAGE_LIMIT,
            }),
          ),
        ]);

        if (cancelled) {
          return;
        }

        setResolvedStats(
          buildHeroStats(
            {
              items: allTours.records,
              pagination: allTours.pagination,
            },
            {
              items: allGuides.records,
              pagination: allGuides.pagination,
            },
          ),
        );
      } catch {
        if (!cancelled) {
          setResolvedStats(DEFAULT_HERO_STATS);
        }
      }
    };

    void loadHeroStats();

    return () => {
      cancelled = true;
    };
  }, [stats]);

  const searchTours = (event) => {
    event.preventDefault();

    const searchParams = new URLSearchParams();

    if (city) searchParams.set("destination", city);
    if (tourType) searchParams.set("search", tourType);

    const query = searchParams.toString();
    navigate(query ? `/tours?${query}` : "/tours");
  };

  return (
    <section className="relative overflow-visible">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={IMG.heroBG}
          alt=""
          className="h-full w-full object-cover"
          style={{ objectPosition: "center 30%" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(1,1,40,0.25)] to-[rgba(1,1,56,0.20)]" />
      </div>

      {/* Hero content */}
      <div className="relative z-10 mx-auto flex min-h-[300px] max-w-6xl flex-col justify-center px-4 pb-16 pt-10 sm:px-6 md:min-h-[340px] md:pb-22">
        {/* Headline */}
        <h1
          className="font-extrabold leading-[1.04]"
          style={{
            fontSize: "clamp(38px,5.5vw,66px)",
            fontFamily: "'Bree Serif', Georgia, serif",
          }}
        >
          <span className="block text-white">Walk like a local</span>
          <span className="block text-[#EDC84C]">In Egypt.</span>
        </h1>

        {/* Subtitle */}
        <p
          className="mt-4 max-w-md font-normal leading-relaxed text-white/85"
          style={{ fontSize: "clamp(12px,1.3vw,14px)" }}
        >
          Your profile is fully set up — we've matched new guides and routes
          that fit your travel style perfectly.
        </p>

        {/* Stats pill */}
        <div className="mt-8 inline-flex divide-x divide-white/20 overflow-hidden rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm self-start">
          {resolvedStats.map((stat) => (
            <div key={stat.label} className="flex flex-col px-5 py-3">
              <span className="text-base font-bold leading-none text-white">
                {stat.value}
              </span>
              <span className="mt-1 text-[8px] font-semibold uppercase tracking-[0.18em] text-white/75">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Search bar */}
      <div className="relative z-10 mx-auto max-w-5xl px-4 pb-6 sm:px-6">
        <form
          onSubmit={searchTours}
          className="flex flex-col gap-2 md:flex-row md:items-stretch md:gap-0 md:rounded-2xl"
        >
          <SearchField
            icon={<MapPin size={14} className="text-white/75" />}
            label="Where to"
            value={city}
            onChange={setCity}
            options={EGYPT_GOVERNORATES}
            placeholder="Choose a city or governorate"
          />

          <div className="hidden md:block w-px bg-white/20 flex-shrink-0" />

          <SearchField
            icon={<MapPin size={14} className="text-white/75" />}
            label="Type of Tour"
            value={tourType}
            onChange={setTourType}
            options={TOUR_TYPES}
            placeholder="Cultural Tour"
          />

          <div className="hidden md:block w-px bg-white/20 flex-shrink-0" />

          <DateField
            icon={<Calendar size={14} className="text-white/75" />}
            label="Select Date"
            value={date}
            onChange={setDate}
            placeholder="Add date"
          />

          {/* Search button */}
          <div className="flex items-center justify-end md:pl-3 md:pr-1 md:bg-white/18 md:border md:border-white/26 md:backdrop-blur-md">
            <button
              type="submit"
              aria-label="Search tours"
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#010170] shadow-[0_4px_16px_rgba(1,1,112,0.5)] transition-opacity hover:opacity-90 md:h-10 md:w-10"
            >
              <Search size={15} className="text-white" />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

function FieldShell({ icon, label, children }) {
  return (
    <div className="flex flex-1 items-center gap-3 rounded-xl border border-white/25 bg-white/18 px-5 py-3.5 backdrop-blur-md md:rounded-none md:border-0 md:border-y md:border-white/25">
      <div className="flex-shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <span className="block text-[8px] font-semibold uppercase tracking-[0.22em] text-white/70">
          {label}
        </span>
        {children}
      </div>
    </div>
  );
}

function SearchField({ icon, label, value, onChange, options, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const fieldRef = useRef(null);
  const listboxId = useId();

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!fieldRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const selectOption = (option) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <FieldShell icon={icon} label={label}>
      <div ref={fieldRef} className="relative mt-1">
        <button
          type="button"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-label={label}
          onClick={() => setIsOpen((open) => !open)}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setIsOpen(true);
            }
          }}
          className={`flex h-9 w-full cursor-pointer items-center rounded-lg border px-3 pr-9 text-left text-[11px] font-semibold outline-none transition duration-200 focus:ring-2 focus:ring-[#EDC84C]/30 ${
            isOpen
              ? "border-[#EDC84C]/70 bg-white/20 shadow-[0_4px_18px_rgba(1,1,56,0.16)]"
              : "border-white/20 bg-white/10 hover:border-white/40 hover:bg-white/15"
          } ${value ? "text-white" : "text-white/70"}`}
        >
          <span className="truncate">{value || placeholder}</span>
        </button>
        <ChevronDown
          aria-hidden="true"
          className={`pointer-events-none absolute right-3 top-[18px] h-3.5 w-3.5 -translate-y-1/2 text-white/80 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />

        {isOpen ? (
          <div
            id={listboxId}
            role="listbox"
            aria-label={`${label} options`}
            className="absolute left-0 top-[calc(100%+0.55rem)] z-[80] max-h-64 min-w-full overflow-y-auto rounded-2xl border border-white/70 bg-white/95 p-2 shadow-[0_18px_55px_rgba(1,1,56,0.28)] ring-1 ring-[#010170]/10 backdrop-blur-xl [scrollbar-color:#aaaacf_transparent] [scrollbar-width:thin]"
          >
            {["", ...options].map((option) => {
              const isSelected = value === option;

              return (
                <button
                  key={option || "all-options"}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => selectOption(option)}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition ${
                    isSelected
                      ? "bg-gradient-to-r from-[#ececfa] to-[#f6f5fc] text-[#010170]"
                      : "text-[#353572] hover:bg-[#f1f0f8] hover:text-[#010138]"
                  }`}
                >
                  <span className="whitespace-nowrap">
                    {option || placeholder}
                  </span>
                  {isSelected ? (
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#010170] text-white shadow-sm">
                      <Check aria-hidden="true" className="h-3 w-3" />
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </FieldShell>
  );
}

function DateField({ icon, label, value, onChange, placeholder }) {
  return (
    <FieldShell icon={icon} label={label}>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        placeholder={placeholder}
        className="mt-1 w-full bg-transparent text-[11px] font-semibold text-white outline-none placeholder:text-white/60"
        style={{ colorScheme: "dark" }}
      />
    </FieldShell>
  );
}
