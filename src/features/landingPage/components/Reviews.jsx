import { Eyebrow } from "../ui/ui.jsx";
import { IMG } from "../../../assets/images/landingPage/images.js";

const REVIEWS = [
  {
    text: "Yara walked us through Cairo like we were her cousins visiting. The food, the stories — nothing rehearsed. Magic.",
    name: "Léa Marchand",
    country: "France",
    stars: 5,
    avatar: IMG.reviewAvatar,
  },
  {
    text: "Booked a last-minute Nile felucca at sunset. Our guide Karim had stories for every bend in the river. Absolutely unforgettable.",
    name: "Marco Bellini",
    country: "Italy",
    stars: 5,
    avatar: IMG.reviewAvatar,
  },
  {
    text: "We avoided every tourist trap and found a spice shop that's been in the same family since 1870. That's Walk Like a Local.",
    name: "Sophie Müller",
    country: "Germany",
    stars: 4,
    avatar: IMG.reviewAvatar,
  },
];

export default function Reviews() {
  return (
    <section
      className="px-4 py-9 sm:px-6 md:py-12"
      style={{ background: "#FDFDFF" }}
    >
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mx-auto mb-7 max-w-2xl text-center">
          <Eyebrow>Travelers say</Eyebrow>
          <h2
            className="mt-2 font-bold"
            style={{ fontSize: "clamp(20px,2.1vw,28px)", color: "#010138" }}
          >
            Stories from the road.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {REVIEWS.map((r) => (
            <ReviewCard key={r.name} {...r} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ReviewCard({ text, name, country, stars, avatar }) {
  return (
    <div
      className="flex flex-col gap-4 p-5"
      style={{
        background: "#F4F4F8",
        border: "1px solid rgba(170,170,207,0.55)",
        borderRadius: "20px 6px 20px 6px",
        boxShadow: "4px 6px 18px rgba(1,1,112,0.12)",
      }}
    >
      <div
        className="self-end text-2xl font-bold leading-none"
        style={{ color: "rgba(1,1,112,0.18)", fontFamily: "Georgia, serif" }}
      >
        &ldquo;
      </div>

      <p
        className="leading-relaxed"
        style={{ fontSize: "11px", color: "#010138", lineHeight: 1.65 }}
      >
        &ldquo;{text}&rdquo;
      </p>

      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-3">
          <div
            className="flex-shrink-0 overflow-hidden rounded-full"
            style={{
              width: "28px",
              height: "28px",
              border: "2px solid #CCCCE2",
            }}
          >
            <img
              src={avatar}
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div
              className="font-semibold"
              style={{ fontSize: "10px", color: "#010170" }}
            >
              {name}
            </div>
            <div
              style={{ fontSize: "9px", color: "#AAAACF", marginTop: "2px" }}
            >
              {country}
            </div>
          </div>
        </div>

        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg
              key={i}
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill={i < stars ? "#EDC84C" : "none"}
              stroke="#EDC84C"
              strokeWidth="1.5"
            >
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
            </svg>
          ))}
        </div>
      </div>
    </div>
  );
}
