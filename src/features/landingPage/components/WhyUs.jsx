import { ShieldCheck, Star, Fingerprint, Globe } from "lucide-react";
import { Eyebrow } from "../ui/ui.jsx";

const FEATURES = [
  {
    icon: <ShieldCheck size={15} color="#EDC84C" />,
    title: "Fully verified safety",
    body: "ID-verified guides, secure payments, and 24/7 trip support across every itinerary.",
  },
  {
    icon: <Star size={15} color="#EDC84C" />,
    title: "Transparent reviews",
    body: "Real ratings from real travelers. No hidden boosts, no paid placements — ever.",
  },
  {
    icon: <Fingerprint size={15} color="#EDC84C" />,
    title: "Authentic experiences",
    body: "Designed by locals, for travelers who'd rather miss a monument than miss the city.",
  },
  {
    icon: <Globe size={15} color="#EDC84C" />,
    title: "Secure bookings",
    body: "End-to-end encrypted payments, instant confirmation, and flexible cancellation.",
  },
];

export default function WhyUs() {
  return (
    <section
      className="px-4 py-10 sm:px-6 md:py-12"
      style={{
        background: "linear-gradient(113deg, #010170 0%, #010138 100%)",
      }}
    >
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mx-auto mb-7 max-w-2xl text-center">
          <Eyebrow>Why choose us</Eyebrow>
          <h2
            className="mt-2 font-bold"
            style={{ fontSize: "clamp(20px,2.1vw,28px)", color: "#fff" }}
          >
            Trust, the Egyptian way.
          </h2>
          <p
            className="mt-2 font-medium"
            style={{ fontSize: "clamp(12px,1.2vw,15px)", color: "#CCCCE2" }}
          >
            Verified, story-rich and ready to walk you through their Egypt.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="flex min-h-[165px] flex-col gap-4 rounded-2xl p-5"
              style={{
                background: "linear-gradient(160deg, #151571 0%, #2e2e7e 100%)",
                boxShadow: "0 8px 24px rgba(10,10,80,0.3)",
              }}
            >
              <div
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
                style={{ background: "rgba(170,170,207,0.3)" }}
              >
                {f.icon}
              </div>
              <div className="flex flex-col gap-2">
                <h3
                  className="font-semibold text-white"
                  style={{ fontSize: "13px" }}
                >
                  {f.title}
                </h3>
                <p
                  style={{
                    fontSize: "11px",
                    color: "#AAAACF",
                    lineHeight: 1.6,
                  }}
                >
                  {f.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
