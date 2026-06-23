import { useEffect, useId, useRef, useState } from "react";
import { Calendar, Check, ChevronDown, MapPin, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { IMG } from "../../../assets/images/landingPage/images.js";
import { TOUR_CITIES, TOUR_TYPES } from "@/data/homeData.js";

export default function Hero() {
  const navigate = useNavigate();
  const [city, setCity] = useState("");
  const [tourType, setTourType] = useState("");
  const [date, setDate] = useState("");

  const searchTours = (event) => {
    event.preventDefault();

    const searchParams = new URLSearchParams();

    if (city) searchParams.set("destination", city);
    if (tourType) searchParams.set("search", tourType);
    if (date) searchParams.set("date", date);

    const query = searchParams.toString();
    navigate(query ? `/tours?${query}` : "/tours");
  };

  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={IMG.heroBG}
          alt=""
          className="w-full h-full object-cover"
          style={{ objectPosition: "center 30%" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(1,1,40,0.52) 0%, rgba(1,1,56,0.26) 100%)",
          }}
        />
      </div>

      <Navbar />

      {/* Hero text */}
      <div className="relative z-10 mx-auto flex min-h-[280px] max-w-6xl flex-col justify-center px-4 pb-14 pt-10 sm:px-6 md:min-h-[320px] md:pb-20">
        <div
          className="font-extrabold leading-[1.04]"
          style={{
            fontFamily: "'Bree Serif', Georgia, serif",
            fontSize: "clamp(40px, 5.2vw, 64px)",
          }}
        >
          <div className="text-white">Walk like a local</div>
          <div style={{ color: "#EDC84C" }}>In Egypt.</div>
        </div>

        <p
          className="mt-4 max-w-lg leading-relaxed"
          style={{
            fontSize: "clamp(12px, 1.25vw, 14px)",
            color: "rgba(244,244,248,0.88)",
            fontWeight: 450,
          }}
        >
          Your profile is fully set up — we've matched new guides and routes
          that fit your travel style perfectly.
        </p>

        {/* Stats row */}
        <div
          className="mt-7 flex flex-wrap items-center gap-px divide-x overflow-hidden rounded-lg"
          style={{
            background: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(6px)",
            border: "1px solid rgba(255,255,255,0.18)",
            alignSelf: "flex-start",
          }}
        >
          <StatPill value="120+" label="Vetted Guides" />
          <StatPill value="35" label="Cities Covered" />
          <StatPill
            value={
              <span className="flex items-center gap-1">
                4.9 <StarIcon />
              </span>
            }
            label="Avg. Rating"
          />
        </div>
      </div>

      {/* Search bar */}
      <div className="relative z-10 mx-auto -mt-5 flex max-w-5xl flex-col items-stretch gap-2 px-4 pb-6 sm:px-6 md:overflow-hidden md:rounded-2xl md:bg-transparent md:flex-row md:items-center md:gap-0">
        <form
          onSubmit={searchTours}
          className="flex w-full flex-col items-stretch gap-2 md:flex-row md:items-center md:gap-0"
        >
          <SearchField
            icon={<MapPin size={14} color="rgba(255,255,255,0.75)" />}
            label="Where to"
            value={city}
            placeholder="Cities, places or regions"
            options={TOUR_CITIES}
            onChange={setCity}
          />
          <Divider />
          <SearchField
            icon={<MapPin size={14} color="rgba(255,255,255,0.75)" />}
            label="Type of Tour"
            value={tourType}
            placeholder="Cultural Tour"
            options={TOUR_TYPES}
            onChange={setTourType}
          />
          <Divider />
          <DateField
            icon={<Calendar size={14} color="rgba(255,255,255,0.75)" />}
            label="Select Date"
            value={date}
            placeholder="Add date"
            onChange={setDate}
          />
          <button
            type="submit"
            aria-label="Search tours"
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full md:ml-3"
            style={{
              background: "linear-gradient(180deg, #010170, #4646A0)",
              boxShadow: "0 4px 14px rgba(1,1,112,0.5)",
            }}
          >
            <Search size={16} color="white" />
          </button>
        </form>
      </div>
    </section>
  );
}

function StatPill({ value, label }) {
  return (
    <div className="flex flex-col items-start px-5 py-3">
      <span className="text-base font-bold text-white leading-none">
        {value}
      </span>
      <span
        className="mt-1 font-medium uppercase tracking-widest"
        style={{ fontSize: "8px", color: "rgba(227,227,235,0.82)" }}
      >
        {label}
      </span>
    </div>
  );
}

function StarIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="#EDC84C">
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
    </svg>
  );
}

function Divider() {
  return (
    <div
      className="hidden md:block w-px self-stretch"
      style={{ background: "rgba(255,255,255,0.22)" }}
    />
  );
}

function FieldShell({ icon, label, children }) {
  return (
    <div
      className="flex flex-1 items-center gap-3 px-5 py-3.5 rounded-xl md:rounded-none"
      style={{
        background: "rgba(255,255,255,0.18)",
        border: "1px solid rgba(255,255,255,0.26)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div className="flex-shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <div
          className="font-semibold uppercase tracking-[2px]"
          style={{ fontSize: "8px", color: "rgba(255,255,255,0.7)" }}
        >
          {label}
        </div>
        {children}
      </div>
    </div>
  );
}

function SearchField({ icon, label, value, placeholder, options, onChange }) {
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

function DateField({ icon, label, value, placeholder, onChange }) {
  return (
    <FieldShell icon={icon} label={label}>
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full bg-transparent font-semibold text-white outline-none placeholder-white/60"
        style={{ fontSize: "11px", colorScheme: "dark" }}
        placeholder={placeholder}
        aria-label={label}
      />
    </FieldShell>
  );
}
