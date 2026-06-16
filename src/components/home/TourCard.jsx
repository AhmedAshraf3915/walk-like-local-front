import { Clock, Users } from "lucide-react";
import { Link } from "react-router-dom";

function StarIcon({ filled }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill={filled ? "#EDC84C" : "none"}
      stroke="#EDC84C"
      strokeWidth="1.5"
    >
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
    </svg>
  );
}

function StarRating({ value, count }) {
  return (
    <div className="flex items-center gap-1.5">
      <StarIcon filled />
      <span className="text-[11px] font-semibold text-[#010170]">
        {value} ({count})
      </span>
    </div>
  );
}

export default function TourCard({ tour }) {
  const {
    title,
    matchTag,
    tags,
    guide,
    avatar,
    photo,
    rating,
    reviewCount,
    duration,
    groupType,
    price,
  } = tour;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_6px_24px_rgba(1,1,112,0.10)] transition-shadow hover:shadow-[0_12px_32px_rgba(1,1,112,0.16)]">
      {/* Photo */}
      <div className="relative h-[220px] flex-shrink-0 overflow-hidden">
        <img
          src={photo}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {matchTag && (
            <span className="rounded-full bg-white/90 px-2.5 py-1 text-[8px] font-semibold text-[#010170] backdrop-blur-sm">
              {matchTag}
            </span>
          )}
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-[rgba(204,204,226,0.85)] px-2.5 py-1 text-[8px] font-medium text-[#010170] backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Guide strip */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-end bg-[rgba(204,204,226,0.78)] px-4 py-1.5 backdrop-blur-sm">
          <span className="text-[10px] font-medium text-[#010138]">
            Your guide: {guide} ✓
          </span>
        </div>

        {/* Avatar overlap */}
        <div className="absolute -bottom-5 left-4 h-11 w-11 overflow-hidden rounded-full border-2 border-white shadow-md">
          <img
            src={avatar}
            alt={guide}
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-4 pt-8">
        <div className="flex flex-col gap-2">
          <h3 className="text-[15px] font-semibold leading-snug text-[#010138]">
            {title}
          </h3>
          <StarRating value={rating} count={reviewCount} />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-[11px] text-[#AAAACF]">
            <Clock size={12} className="flex-shrink-0 text-[#AAAACF]" />
            {duration}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#AAAACF]">
            <Users size={12} className="flex-shrink-0 text-[#AAAACF]" />
            {groupType}
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-[10px] text-[#AAAACF]">Per person</span>
          <span className="text-[17px] font-bold text-[#010138]">{price}</span>
        </div>

        <Link
          to="/signup"
          className="mt-auto flex items-center justify-center rounded-lg bg-gradient-to-r from-[#010170] to-[#5656A0] px-4 py-2.5 text-[11px] font-semibold text-white shadow-[0_4px_12px_rgba(1,1,112,0.25)] transition-opacity hover:opacity-90"
        >
          View tour
        </Link>
      </div>
    </div>
  );
}
