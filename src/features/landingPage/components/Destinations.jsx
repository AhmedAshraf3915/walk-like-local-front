import { MapPin, ArrowRight } from "lucide-react";
import { SectionHeader }from "../ui/ui.jsx";
import { IMG } from "../../../assets/images/landingPage/images.js";

const CITIES = [
  { name: "Cairo",  tours: 45, img: IMG.cairo },
  { name: "Dahab",  tours: 10, img: IMG.dahab },
  { name: "Luxor",  tours: 30, img: IMG.luxor },
];

export default function Destinations() {
  return (
    <section className="px-16 py-24" style={{ background: "#FDFDFF" }}>
      <SectionHeader
        eyebrow="Destinations"
        title="Egypt, city by city."
        sub="Pick a place. Meet a local. Wander on purpose."
        action="View all places"
      />

      <div className="grid grid-cols-3 gap-6">
        {CITIES.map((city) => (
          <CityCard key={city.name} {...city} />
        ))}
      </div>
    </section>
  );
}

function CityCard({ name, tours, img }) {
  return (
    <div
      className="relative rounded-2xl overflow-hidden cursor-pointer group"
      style={{ height: "520px", boxShadow: "0 4px 12px rgba(1,1,112,0.2)" }}
    >
      {/* Background image */}
      <img
        src={img}
        alt={name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      {/* Overlay */}
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.38)" }} />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-10 flex flex-col gap-5">
        {/* Tours label */}
        <span
          className="uppercase tracking-[4px] font-medium"
          style={{ fontSize: "14px", color: "#EDC84C", fontFamily: "'Instrument Sans', sans-serif" }}
        >
          {tours} tours
        </span>

        {/* City name */}
        <div className="flex items-center gap-2">
          <MapPin size={30} color="white" />
          <span className="font-bold text-white" style={{ fontSize: "42px", lineHeight: 1 }}>
            {name}
          </span>
        </div>

        {/* Link */}
        <button className="flex items-center gap-2 text-white font-normal hover:gap-4 transition-all"
          style={{ fontSize: "22px", letterSpacing: "0.02em" }}>
          View all tours
          <ArrowRight size={22} color="white" />
        </button>
      </div>
    </div>
  );
}
