import { Eyebrow }from "../ui/ui.jsx";
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
    <section className="px-16 py-24" style={{ background: "#FDFDFF" }}>
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <Eyebrow>Travelers say</Eyebrow>
        <h2
          className="font-bold mt-4"
          style={{ fontSize: "clamp(28px,3vw,46px)", color: "#010138" }}
        >
          Stories from the road.
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {REVIEWS.map((r) => (
          <ReviewCard key={r.name} {...r} />
        ))}
      </div>
    </section>
  );
}

function ReviewCard({ text, name, country, stars, avatar }) {
  return (
    <div
      className="flex flex-col gap-6 p-6"
      style={{
        background: "#F4F4F8",
        border: "1px solid #AAAACF",
        borderRadius: "40px 12px 40px 12px",
        boxShadow: "4px 4px 12px rgba(1,1,112,0.2)",
      }}
    >
      {/* Quote icon */}
      <div className="self-end text-4xl font-bold leading-none" style={{ color: "#010170" }}>
        "
      </div>

      {/* Review text */}
      <p
        className="font-medium leading-relaxed"
        style={{ fontSize: "15px", color: "#010138", lineHeight: 1.75 }}
      >
        "{text}"
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto">
        {/* Author */}
        <div className="flex items-center gap-3">
          <div className="rounded-full overflow-hidden flex-shrink-0" style={{ width: "46px", height: "46px" }}>
            <img src={avatar} alt={name} className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="font-semibold" style={{ fontSize: "16px", color: "#010170" }}>
              {name}
            </div>
            <div style={{ fontSize: "13px", color: "#AAAACF", marginTop: "3px" }}>
              {country}
            </div>
          </div>
        </div>

        {/* Stars */}
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg key={i} width="20" height="20" viewBox="0 0 24 24"
              fill={i < stars ? "#EDC84C" : "none"}
              stroke="#EDC84C" strokeWidth="1.5"
            >
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
            </svg>
          ))}
        </div>
      </div>
    </div>
  );
}
