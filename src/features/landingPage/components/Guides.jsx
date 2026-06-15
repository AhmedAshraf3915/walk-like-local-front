import { MapPin, Globe } from "lucide-react";
import { SectionHeader, StarRating, OutlineButton }from "../ui/ui.jsx";
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
    <section className="px-16 py-24" style={{ background: "#FDFDFF" }}>
      <SectionHeader
        eyebrow="Guides"
        title="Meet your locals."
        sub="Verified, story-rich and ready to walk you through their Egypt."
        action="View all guides"
      />

      <div className="grid grid-cols-3 gap-6">
        {GUIDES.map((g) => (
          <GuideCard key={g.name} {...g} />
        ))}
      </div>
    </section>
  );
}

function GuideCard({ name, city, languages, photo }) {
  return (
    <div
      className="bg-white rounded-2xl overflow-hidden flex flex-col"
      style={{ boxShadow: "0 4px 12px rgba(1,1,112,0.2)" }}
    >
      {/* Photo */}
      <div className="overflow-hidden" style={{ height: "300px" }}>
        <img
          src={photo}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
        />
      </div>

      {/* Body */}
      <div className="flex flex-col gap-6 p-8 flex-1">
        <div className="flex flex-col gap-3">
          <h3 className="font-medium" style={{ fontSize: "22px", color: "#010138" }}>
            {name}
          </h3>
          <StarRating />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2" style={{ fontSize: "15px", color: "#AAAACF" }}>
            <MapPin size={18} color="#AAAACF" />
            {city}
          </div>
          <div className="flex items-center gap-2" style={{ fontSize: "15px", color: "#AAAACF" }}>
            <Globe size={18} color="#AAAACF" />
            {languages}
          </div>
        </div>

        <OutlineButton className="w-full mt-auto" style={{ fontSize: "15px" }}>
          View profile
        </OutlineButton>
      </div>
    </div>
  );
}
