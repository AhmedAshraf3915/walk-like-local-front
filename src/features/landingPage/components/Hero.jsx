import { Calendar, MapPin, Search } from "lucide-react";
import Navbar from "./Navbar";
import { IMG } from "../../../assets/images/landingPage/images.js";
import { useState } from "react";
import { Link } from "react-router-dom";

const CITIES = [
  "Cairo",
  "Giza",
  "Alexandria",
  "Luxor",
  "Aswan",
  "Khan el Khalili",
];

const TOUR_TYPES = [
  "Cultural Tour",
  "Food Tour",
  "Historical",
  "Adventure",
  "Diving",
  "Desert Safari",
];

export default function Hero() {
  const [city, setCity] = useState("");
  const [tourType, setTourType] = useState("");
  const [date, setDate] = useState("");

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
      <div className="relative z-10 mx-auto -mt-5 flex max-w-5xl flex-col items-stretch gap-2 px-4 pb-6 sm:px-6 md:flex-row md:items-center md:gap-0 md:rounded-2xl md:overflow-hidden md:bg-transparent">
        <SearchField
          icon={<MapPin size={14} color="rgba(255,255,255,0.75)" />}
          label="Where to"
          value={city}
          placeholder="Cities, places or regions"
          options={CITIES}
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
        <Link
          to="/signup"
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full md:ml-3"
          style={{
            background: "linear-gradient(180deg, #010170, #4646A0)",
            boxShadow: "0 4px 14px rgba(1,1,112,0.5)",
          }}
          aria-label="Search"
        >
          <Search size={16} color="white" />
        </Link>
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
  return (
    <FieldShell icon={icon} label={label}>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full bg-transparent font-semibold text-white outline-none"
        style={{ fontSize: "11px" }}
        aria-label={label}
      >
        <option value="" style={{ color: "#010138" }}>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option} value={option} style={{ color: "#010138" }}>
            {option}
          </option>
        ))}
      </select>
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
