import { ArrowRight, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export default function DestinationCard({ destination }) {
  const { name, tourCount, img } = destination;

  return (
    <div className="group relative h-[280px] cursor-pointer overflow-hidden rounded-2xl shadow-[0_6px_24px_rgba(1,1,112,0.18)]">
      {/* Background image */}
      <img
        src={img}
        alt={name}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/10 to-black/65" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-col gap-2 p-5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#EDC84C]">
          {tourCount} tours
        </span>

        <div className="flex items-center gap-2">
          <MapPin size={15} className="flex-shrink-0 text-white" />
          <span className="text-xl font-bold leading-none text-white">
            {name}
          </span>
        </div>

        <Link
          to="/signup"
          className="flex items-center gap-1.5 text-[11px] font-medium text-white transition-all duration-200 hover:gap-3"
        >
          View all tours <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}
