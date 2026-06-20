import { Globe, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

function StarRating({ value, count }) {
  return (
    <div className="flex items-center gap-1.5">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="#EDC84C">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
      </svg>
      <span className="text-[11px] font-semibold text-[#010170]">
        {value} ({count})
      </span>
    </div>
  );
}

function VerifiedBadge() {
  return (
    <div
      className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-[0_2px_8px_rgba(1,1,56,0.15)]"
      title="Verified guide"
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="#010170" strokeWidth="2" />
        <path
          d="M9 12l2 2 4-4"
          stroke="#010170"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export default function GuideCard({ guide }) {
  const {
    name,
    city,
    languages,
    rating,
    reviewCount,
    photo,
    fallbackPhoto,
    href = "/signup",
  } = guide;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_6px_24px_rgba(1,1,112,0.10)] transition-shadow hover:shadow-[0_12px_32px_rgba(1,1,112,0.15)]">
      {/* Photo */}
      <div className="relative h-[230px] overflow-hidden">
        <img
          src={photo}
          alt={name}
          onError={(event) => {
            if (fallbackPhoto && !event.currentTarget.dataset.fallbackApplied) {
              event.currentTarget.dataset.fallbackApplied = "true";
              event.currentTarget.src = fallbackPhoto;
            }
          }}
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <VerifiedBadge />
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-col gap-2">
          <h3 className="text-[15px] font-semibold text-[#010138]">{name}</h3>
          <StarRating value={rating} count={reviewCount} />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-[11px] text-[#AAAACF]">
            <MapPin size={11} className="flex-shrink-0 text-[#AAAACF]" />
            {city}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#AAAACF]">
            <Globe size={11} className="flex-shrink-0 text-[#AAAACF]" />
            {languages}
          </div>
        </div>

        <Link
          to={href}
          className="mt-auto flex items-center justify-center rounded-lg border border-[#010170] px-4 py-2 text-[11px] font-semibold text-[#010138] shadow-[0_3px_8px_rgba(1,1,112,0.12)] transition-opacity hover:opacity-75"
        >
          View profile
        </Link>
      </div>
    </div>
  );
}
