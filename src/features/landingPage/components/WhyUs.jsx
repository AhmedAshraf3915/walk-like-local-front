import { ShieldCheck, Star, Fingerprint, Globe } from "lucide-react";
import { Eyebrow } from "../ui/ui.jsx";

const FEATURES = [
  {
    icon: <ShieldCheck size={28} color="#EDC84C" />,
    title: "Fully verified safety",
    body: "ID-verified guides, secure payments, and 24/7 trip support across every itinerary.",
  },
  {
    icon: <Star size={28} color="#EDC84C" />,
    title: "Transparent reviews",
    body: "Real ratings from real travelers. No hidden boosts, no paid placements — ever.",
  },
  {
    icon: <Fingerprint size={28} color="#EDC84C" />,
    title: "Authentic experiences",
    body: "Designed by locals, for travelers who'd rather miss a monument than miss the city.",
  },
  {
    icon: <Globe size={28} color="#EDC84C" />,
    title: "Secure bookings",
    body: "End-to-end encrypted payments, instant confirmation, and flexible cancellation.",
  },
];

export default function WhyUs() {
  return (
    <section
      className="px-4 sm:px-6 md:px-16 py-12 md:py-24"
      style={{ background: "linear-gradient(113deg, #010170 0%, #010138 100%)" }}
    >
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <Eyebrow>Why choose us</Eyebrow>
        <h2
          className="font-bold mt-4"
          style={{ fontSize: "clamp(28px,3vw,46px)", color: "#fff" }}
        >
          Trust, the Egyptian way.
        </h2>
        <p
          className="font-medium mt-4"
          style={{ fontSize: "clamp(16px,1.6vw,26px)", color: "#CCCCE2" }}
        >
          Verified, story-rich and ready to walk you through their Egypt.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="flex flex-col gap-5 md:gap-7 rounded-2xl p-6 md:p-10"
            style={{
              background: "linear-gradient(180deg, #151571, #333381)",
              boxShadow: "0 4px 4px rgba(53,53,114,0.25)",
            }}
          >
            {/* Icon badge */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(170,170,207,0.45)" }}
            >
              {f.icon}
            </div>
            <div className="flex flex-col gap-3">
              <h3 className="font-medium text-white" style={{ fontSize: "20px" }}>
                {f.title}
              </h3>
              <p style={{ fontSize: "15px", color: "#AAAACF", lineHeight: 1.65 }}>
                {f.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
