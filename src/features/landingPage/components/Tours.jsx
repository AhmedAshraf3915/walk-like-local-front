import { Clock, Users } from "lucide-react";
import { SectionHeader, StarRating, PrimaryButton } from "../ui/ui.jsx";
import { IMG } from "../../../assets/images/landingPage/images.js";

const TOURS = [
  {
    title: "Khan el-Khalili at Dusk",
    tags: ["Food", "Bazaar"],
    matchTag: "Matches History & Architecture",
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
    matchTag: "Matches Desert Adventure",
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
    matchTag: "Matches Sun set",
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
    <section
      id="tours"
      className="px-4 py-10 sm:px-6 md:py-14"
      style={{ background: "#FDFDFF" }}
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="AI curated"
          title="Tailored For Your Travel Style."
          sub="Personalized using your interests and preferences."
          action="Browse all tours"
          actionHref="#tours"
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TOURS.map((tour) => (
            <TourCard key={tour.title} {...tour} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TourCard({
  title,
  tags,
  matchTag,
  guide,
  avatar,
  photo,
  duration,
  type,
  price,
}) {
  return (
    <div
      className="flex flex-col overflow-hidden rounded-2xl bg-white"
      style={{ boxShadow: "0 6px 24px rgba(1,1,112,0.10)" }}
    >
      {/* Photo area */}
      <div className="relative h-[220px] flex-shrink-0">
        <img src={photo} alt={title} className="w-full h-full object-cover" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg,rgba(0,0,0,0.08) 0%,rgba(0,0,0,0.35) 100%)",
          }}
        />

        {/* Match + topic tags */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {matchTag && (
            <span
              className="self-start rounded-full px-2.5 py-1 font-semibold"
              style={{
                background: "rgba(255,255,255,0.88)",
                fontSize: "8px",
                color: "#010170",
              }}
            >
              {matchTag}
            </span>
          )}
          <div className="flex gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full px-2.5 py-1 font-medium"
                style={{
                  background: "rgba(204,204,226,0.82)",
                  fontSize: "8px",
                  color: "#010170",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Guide strip */}
        <div
          className="absolute bottom-0 left-0 right-0 flex items-center justify-end px-4 py-2"
          style={{
            background: "rgba(204,204,226,0.75)",
            backdropFilter: "blur(4px)",
          }}
        >
          <span
            className="text-[10px] font-medium"
            style={{ color: "#010138" }}
          >
            Your guide: {guide} ✓
          </span>
        </div>

        {/* Avatar overlap */}
        <div
          className="absolute h-12 w-12 overflow-hidden rounded-full border-2 border-white shadow-md"
          style={{ bottom: "-18px", left: "16px" }}
        >
          <img
            src={avatar}
            alt={guide}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-4 pt-8">
        <div className="flex flex-col gap-2">
          <h3
            className="font-semibold"
            style={{ fontSize: "15px", color: "#010138", lineHeight: 1.3 }}
          >
            {title}
          </h3>
          <StarRating />
        </div>

        <div className="flex flex-col gap-1.5">
          <div
            className="flex items-center gap-2"
            style={{ fontSize: "11px", color: "#AAAACF" }}
          >
            <Clock size={12} color="#AAAACF" /> {duration}
          </div>
          <div
            className="flex items-center gap-2"
            style={{ fontSize: "11px", color: "#AAAACF" }}
          >
            <Users size={12} color="#AAAACF" /> {type}
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span style={{ fontSize: "10px", color: "#AAAACF" }}>Per person</span>
          <span
            className="font-bold"
            style={{ fontSize: "17px", color: "#010138" }}
          >
            {price}
          </span>
        </div>

        <PrimaryButton
          className="mt-auto w-full"
          style={{ borderRadius: "8px", fontSize: "11px", padding: "9px 20px" }}
          to="/signup"
        >
          View tour
        </PrimaryButton>
      </div>
    </div>
  );
}
