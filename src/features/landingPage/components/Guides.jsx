import { MapPin, Globe } from "lucide-react";
import { SectionHeader, StarRating, OutlineButton } from "../ui/ui.jsx";
import { IMG } from "../../../assets/images/landingPage/images.js";

const GUIDES = [
  {
    name: "Nour Hassan",
    city: "Cairo",
    languages: "English and German",
    photo: IMG.guideNour,
  },
  {
    name: "Yassin Mohammed",
    city: "Dahab",
    languages: "English, Spanish and German",
    photo: IMG.guideYassin,
  },
  {
    name: "Heba Khaled",
    city: "Cairo",
    languages: "English, Spanish, German and more",
    photo: IMG.guideHeba,
  },
];

export default function Guides() {
  return (
    <section
      id="guides"
      className="px-4 py-10 sm:px-6 md:py-14"
      style={{ background: "#FDFDFF" }}
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="Guides"
          title="Meet your locals."
          sub="Verified, story-rich and ready to walk you through their Egypt."
          action="View all guides"
          actionHref="#guides"
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {GUIDES.map((guide) => (
            <GuideCard key={guide.name} {...guide} />
          ))}
        </div>
      </div>
    </section>
  );
}

function GuideCard({ name, city, languages, photo }) {
  return (
    <div
      className="flex flex-col overflow-hidden rounded-2xl bg-white"
      style={{ boxShadow: "0 6px 24px rgba(1,1,112,0.10)" }}
    >
      {/* Photo */}
      <div className="relative h-[230px] overflow-hidden">
        <img
          src={photo}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
        />
        {/* Verified badge */}
        <div
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full"
          style={{
            background: "rgba(255,255,255,0.88)",
            boxShadow: "0 2px 8px rgba(1,1,56,0.15)",
          }}
          title="Verified guide"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 12l2 2 4-4"
              stroke="#010170"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="12" r="9" stroke="#010170" strokeWidth="2" />
          </svg>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3
            className="font-semibold"
            style={{ fontSize: "15px", color: "#010138" }}
          >
            {name}
          </h3>
        </div>

        <StarRating />

        <div className="flex flex-col gap-1.5">
          <div
            className="flex items-center gap-2"
            style={{ fontSize: "11px", color: "#AAAACF" }}
          >
            <MapPin size={11} color="#AAAACF" />
            {city}
          </div>
          <div
            className="flex items-center gap-2"
            style={{ fontSize: "11px", color: "#AAAACF" }}
          >
            <Globe size={11} color="#AAAACF" />
            {languages}
          </div>
        </div>

        <OutlineButton
          className="mt-auto w-full"
          style={{ borderRadius: "8px", fontSize: "11px", padding: "8px 18px" }}
          to="/signup"
        >
          View profile
        </OutlineButton>
      </div>
    </div>
  );
}
