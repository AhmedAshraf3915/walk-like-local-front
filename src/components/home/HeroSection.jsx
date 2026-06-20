import { useState } from "react";
import { Calendar, MapPin, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { IMG } from "@/assets/images/landingPage/images.js";
import { TOUR_CITIES, TOUR_TYPES } from "@/data/homeData.js";

const STATS = [
  { value: "120+", label: "Vetted Guides" },
  { value: "35", label: "Cities Covered" },
  { value: "4.9 ★", label: "Avg. Rating" },
];

export default function HeroSection() {
  const [city, setCity] = useState("");
  const [tourType, setTourType] = useState("");
  const [date, setDate] = useState("");

  return (
    <section className="relative overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={IMG.heroBG}
          alt=""
          className="h-full w-full object-cover"
          style={{ objectPosition: "center 30%" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(1,1,40,0.23)] to-[rgba(1,1,56,0.11)]" />
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
          {STATS.map((stat) => (
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
        <div className="flex flex-col gap-2 md:flex-row md:items-stretch md:gap-0 md:overflow-hidden md:rounded-2xl">
          <SearchField
            icon={<MapPin size={14} className="text-white/75" />}
            label="Where to"
            value={city}
            onChange={setCity}
            options={TOUR_CITIES}
            placeholder="Cities, places or regions"
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
            <Link
              to="/signup"
              aria-label="Search tours"
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#010170] shadow-[0_4px_16px_rgba(1,1,112,0.5)] transition-opacity hover:opacity-90 md:h-10 md:w-10"
            >
              <Search size={15} className="text-white" />
            </Link>
          </div>
        </div>
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
  return (
    <FieldShell icon={icon} label={label}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="mt-1 w-full bg-transparent text-[11px] font-semibold text-white outline-none"
        style={{ colorScheme: "dark" }}
      >
        <option value="" className="text-[#010138] bg-white">
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt} className="text-[#010138] bg-white">
            {opt}
          </option>
        ))}
      </select>
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
