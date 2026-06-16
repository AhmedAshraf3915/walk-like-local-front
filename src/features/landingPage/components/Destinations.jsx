import { MapPin, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { SectionHeader } from "../ui/ui.jsx";
import { IMG } from "../../../assets/images/landingPage/images.js";

const CITIES = [
  { name: "Cairo", tours: 45, img: IMG.cairo },
  { name: "Dahab", tours: 10, img: IMG.dahab },
  { name: "Luxor", tours: 30, img: IMG.luxor },
];

export default function Destinations() {
  return (
    <section
      id="destinations"
      className="px-4 py-10 sm:px-6 md:py-14"
      style={{ background: "#FDFDFF" }}
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="Destinations"
          title="Egypt, city by city."
          sub="Pick a place. Meet a local. Wander on purpose."
          action="View all places"
          actionHref="#destinations"
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CITIES.map((city) => (
            <CityCard key={city.name} {...city} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CityCard({ name, tours, img }) {
  return (
    <div
      className="group relative h-[280px] cursor-pointer overflow-hidden rounded-2xl"
      style={{ boxShadow: "0 6px 24px rgba(1,1,112,0.18)" }}
    >
      <img
        src={img}
        alt={name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.08) 30%, rgba(0,0,0,0.62) 100%)",
        }}
      />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-col gap-2 p-5">
        <span
          className="uppercase tracking-[3px] font-semibold"
          style={{ fontSize: "10px", color: "#EDC84C" }}
        >
          {tours} tours
        </span>

        <div className="flex items-center gap-2">
          <MapPin size={15} color="white" />
          <span
            className="text-xl font-bold text-white"
            style={{ lineHeight: 1 }}
          >
            {name}
          </span>
        </div>

        <Link
          to="/signup"
          className="flex items-center gap-1.5 font-medium text-white transition-all hover:gap-3"
          style={{ fontSize: "11px" }}
        >
          View all tours <ArrowRight size={12} color="white" />
        </Link>
      </div>
    </div>
  );
}
