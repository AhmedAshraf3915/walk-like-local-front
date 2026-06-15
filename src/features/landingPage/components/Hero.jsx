import { MapPin, Calendar, Compass, Search } from "lucide-react";
import Navbar from "./Navbar";
import { IMG } from "../../../assets/images/landingPage/images.js";
import { useState } from "react";
import { Link } from "react-router-dom";

const CITIES = [
  "Cairo", "Giza", "Alexandria", "Luxor", "Aswan", "Khan el Khalili",
];

const FOOD_TYPES = [
  "Street Food", "Traditional Egyptian", "Seafood", "Vegetarian", "Fine Dining",
];

export default function Hero() {

  const [city, setCity] = useState("");
  const [foodType, setFoodType] = useState("");
  const [date, setDate] = useState("")

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0">
        <img
          src={IMG.heroBG}
          alt=""
          className="w-full h-full object-cover"
          style={{ objectPosition: "center 30%" }}
        />
        <div className="absolute inset-0" style={{ background: "rgba(1,1,56,0.1)" }} />
      </div>

      <Navbar />

      {/* Hero content */}
      <div className="relative z-10 flex flex-col flex-1 px-4 sm:px-6 md:px-16 pt-28 sm:pt-32 md:pt-48 pb-0">
        {/* Headline */}
        <div
          className="font-bold leading-tight tracking-wide"
          style={{ fontFamily: "'Bree Serif', serif", fontSize: "clamp(52px, 6vw, 92px)", letterSpacing: "4px" }}
        >
          <div className="text-white">Walk like a local</div>
          <div style={{ color: "#EDC84C" }}>In Egypt.</div>
        </div>

        {/* Description */}
        <p
          className="mt-6 font-medium leading-relaxed max-w-3xl"
          style={{ fontSize: "clamp(16px,1.5vw,22px)", color: "#E3E3EB", fontFamily: "'Cairo', 'Inter', sans-serif" }}
        >
          Discover Egypt's living streets, hidden cafés and storied alleys through the eyes of vetted local guides —
          curated for travelers who want more than a postcard.
        </p>

        {/* Stats */}
        <div className="flex flex-wrap items-end gap-6 sm:gap-10 md:gap-16 mt-10 md:mt-14">
          <div>
            <div className="text-white font-bold text-3xl tracking-wide">120+</div>
            <div
              className="mt-2 uppercase tracking-widest font-medium"
              style={{ fontSize: "13px", color: "#AAAACF", fontFamily: "'Instrument Sans', sans-serif" }}
            >
              Vetted Guides
            </div>
          </div>
          <div>
            <div className="text-white font-bold text-3xl tracking-wide">35</div>
            <div
              className="mt-2 uppercase tracking-widest font-medium"
              style={{ fontSize: "13px", color: "#AAAACF", fontFamily: "'Instrument Sans', sans-serif" }}
            >
              Cities Covered
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-3xl tracking-wide">
              4.9
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#EDC84C">
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
              </svg>
            </div>
            <div
              className="mt-2 uppercase tracking-widest font-medium"
              style={{ fontSize: "13px", color: "#AAAACF", fontFamily: "'Instrument Sans', sans-serif" }}
            >
              Avg. Rating
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div
        className="relative z-10 mt-10 md:mt-16 flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-6 px-4 sm:px-6 md:px-16 py-4 md:py-5"
        style={{ background: "rgba(255,255,255,0.22)", backdropFilter: "blur(6px)" }}
      >
        {/* Field: Where to */}
     <SearchField
        icon={<Compass size={22} color="white" />}
        label="City"
        value={city || "Choose city"}
        onClick={() => setCity("Cairo")}
      />
        {/* Field: Type */}
        <SearchField
          icon={<Compass size={22} color="white" />}
          label="Type of Tour"
          value={foodType || "Cultural, food"}
          onClick={() => setFoodType("Cultural, food")}
        />
        {/* Field: Date */}
        <SearchField
          icon={<Calendar size={22} color="white" />}
          label="Select Date"
          value={date || "Add date"}
          onClick={() => setDate("2023-10-10")}
        />
        {/* Search Button */}
        <Link 
        to="/signup"
          className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(180deg, #010170, #5656A0)" }}
          aria-label="Search"
        >
          <Search size={22} color="white" />
        </Link>
      </div>
    </section>
  );
}

function SearchField({ icon, label, value, active, onClick }) {
  return (
    <div
      onClick={onClick}
      className="flex-1 flex items-center gap-4 rounded-xl px-6 py-4 cursor-pointer"
      style={{
        background: active ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.18)",
        border: active ? "1px solid rgba(255,255,255,0.3)" : "none",
      }}
    >
      <div className="flex-shrink-0">{icon}</div>
      <div>
        <div className="uppercase tracking-[2.5px] font-normal" style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)" }}>
          {label}
        </div>
        <div className="font-medium text-white mt-1" style={{ fontSize: "16px" }}>
          {value}
        </div>
      </div>
    </div>
  );
}