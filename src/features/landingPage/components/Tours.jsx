import { Clock, Users } from "lucide-react";
import { SectionHeader, StarRating, PrimaryButton }from "../ui/ui.jsx";

import { IMG } from "../../../assets/images/landingPage/images.js";

const TOURS = [
  {
    title: "Khan el-Khalili at Dusk",
    tags: ["Food", "Bazaar"],
    guide: "Karim Mohamed",
    avatar: IMG.g1,
    photo: IMG.tourKhan,
    duration: "2 hours",
    type: "Private tour",
    price: "$30 USD",
  },
  {
    title: "Dahab Diving",
    tags: ["Diving", "Red Sea"],
    guide: "Yassin Mohamed",
    avatar: IMG.g2,
    photo: IMG.tourDahab,
    duration: "2 hours",
    type: "Private tour",
    price: "$60 USD",
  },
  {
    title: "Felucca Sunset on the Nile",
    tags: ["Nile", "Sunset"],
    guide: "Nour Hassan",
    avatar: IMG.g3,
    photo: IMG.tourNile,
    duration: "1.5 hours",
    type: "Private tour",
    price: "$25 USD",
  },
];

export default function Tours() {
  return (
    <section className="px-4 sm:px-6 md:px-16 pb-12 md:pb-24" style={{ background: "#FDFDFF" }}>
      <SectionHeader
        eyebrow="Tours"
        title="Hand-curated experiences."
        sub="Small groups, slow streets, real conversations."
        action="Browse all tours"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {TOURS.map((tour) => (
          <TourCard key={tour.title} {...tour} />
        ))}
      </div>
    </section>
  );
}

function TourCard({ title, tags, guide, avatar, photo, duration, type, price }) {
  return (
    <div
      className="bg-white rounded-2xl overflow-hidden flex flex-col"
      style={{ boxShadow: "0 4px 6px rgba(1,1,112,0.2)" }}
    >
      {/* Photo area */}
      <div className="relative h-[240px] md:h-[340px]">
        <img src={photo} alt={title} className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.25)" }} />

        {/* Tags */}
        <div className="absolute top-3 md:top-6 left-3 md:left-6 flex gap-2 md:gap-3 flex-wrap">
          {tags.map((t) => (
            <span
              key={t}
              className="font-medium rounded-full px-3 md:px-5 py-1 md:py-2"
              style={{ background: "rgba(204,204,226,0.75)", fontSize: "14px", color: "#010170" }}
            >
              {t}
            </span>
          ))}
        </div>

        {/* Guide avatar + strip */}
        <div
          className="absolute bottom-0 left-0 right-0 flex items-center justify-end px-4 md:px-8 py-2 md:py-3"
          style={{ background: "rgba(204,204,226,0.82)" }}
        >
          <span className="text-xs md:text-[15px]" style={{ color: "#010138" }}>Your guide: {guide}</span>
        </div>
        <div
          className="absolute rounded-full overflow-hidden border-3 border-[#cccce2d6] w-16 h-16 md:w-[130px] md:h-[128px]"
          style={{ bottom: "-22px", left: "12px" }}
        >
          <img src={avatar} alt={guide} className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-4 md:gap-5 p-4 md:p-8 flex-1">
        {/* Title + rating */}
        <div className="flex flex-col gap-3">
          <h3 className="font-medium" style={{ fontSize: "22px", color: "#010138", lineHeight: 1.3 }}>
            {title}
          </h3>
          <StarRating />
        </div>

        {/* Meta */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2" style={{ fontSize: "15px", color: "#AAAACF" }}>
            <Clock size={18} color="#AAAACF" /> {duration}
          </div>
          <div className="flex items-center gap-2" style={{ fontSize: "15px", color: "#AAAACF" }}>
            <Users size={18} color="#AAAACF" /> {type}
          </div>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span style={{ fontSize: "14px", color: "#AAAACF" }}>Per person</span>
          <span className="font-medium" style={{ fontSize: "28px", color: "#010138" }}>{price}</span>
        </div>

        <PrimaryButton className="w-full mt-auto" style={{ fontSize: "15px", padding: "12px 24px" }} to="/signup">
          Signup to book
        </PrimaryButton>
        
      </div>
    </div>
  );
}
