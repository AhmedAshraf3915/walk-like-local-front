import { MapPin } from "lucide-react";
import { Eyebrow } from "../ui/ui.jsx";
import { IMG } from "../../../assets/images/landingPage/images.js";

export default function Heritage() {
  return (
    <section className="py-10 md:py-14" style={{ background: "#FDFDFF" }}>
      <div className="mx-auto mb-7 max-w-2xl px-4 text-center sm:px-6">
        <Eyebrow>The beauty of Egypt</Eyebrow>
        <h2
          className="mt-3 font-bold"
          style={{ fontSize: "clamp(22px, 2.4vw, 32px)", color: "#010138" }}
        >
          Heritage, lived in.
        </h2>
        <p
          className="mt-2 leading-relaxed"
          style={{ fontSize: "clamp(13px, 1.2vw, 15px)", color: "#353572" }}
        >
          Glimpses of the corners, kitchens and conversations that make Egypt
          unforgettable.
        </p>
      </div>

      <div className="relative flex h-[280px] items-end justify-end overflow-hidden md:h-[360px]">
        <img
          src={IMG.sinai}
          alt="Sinai Red Sea"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.45) 100%)",
          }}
        />
        <div
          className="relative z-10 mb-6 mr-6 flex items-center gap-2 rounded-full px-3 py-1.5 font-medium text-white"
          style={{
            background: "rgba(0,0,0,0.38)",
            backdropFilter: "blur(6px)",
            fontSize: "11px",
          }}
        >
          <MapPin size={12} color="white" />
          Sinai · Red Sea
        </div>
      </div>
    </section>
  );
}
