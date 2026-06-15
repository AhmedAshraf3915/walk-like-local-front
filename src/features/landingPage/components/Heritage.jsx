import { MapPin } from "lucide-react";
import { Eyebrow } from "../ui/ui.jsx";
import { IMG } from "../../../assets/images/landingPage/images.js";

export default function Heritage() {
  return (
    <section className="px-16 pb-24" style={{ background: "#FDFDFF" }}>
      {/* Text header */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <Eyebrow>The beauty of Egypt</Eyebrow>
        <h2
          className="font-bold mt-4"
          style={{ fontSize: "clamp(28px,3vw,46px)", color: "#010138" }}
        >
          Heritage, lived in.
        </h2>
        <p
          className="font-medium mt-4"
          style={{ fontSize: "clamp(16px,1.6vw,26px)", color: "#353572" }}
        >
          Glimpses of the corners, kitchens and conversations that make Egypt unforgettable.
        </p>
      </div>

      {/* Full-width photo with label */}
      <div
        className="relative rounded-2xl overflow-hidden flex items-end justify-end"
        style={{ height: "440px" }}
      >
        <img
          src={IMG.sinai}
          alt="Sinai Red Sea"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.22)" }} />

        {/* Location tag */}
        <div
          className="relative z-10 flex items-center gap-2 mb-8 mr-8 font-medium text-white"
          style={{ fontSize: "20px" }}
        >
          <MapPin size={22} color="white" />
          Sinai · Red Sea
        </div>
      </div>
    </section>
  );
}
