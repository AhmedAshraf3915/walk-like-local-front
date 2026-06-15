import { ArrowRight } from "lucide-react";
import { Eyebrow }from "../ui/ui.jsx";
import { IMG } from "../../../assets/images/landingPage/images.js";
import { Link } from "react-router-dom";


export default function BecomeGuide() {
  return (
    <section className="px-16 pb-24" style={{ background: "#FDFDFF" }}>
      <div
        className="relative rounded-2xl overflow-hidden flex flex-col justify-center"
        style={{ minHeight: "420px", padding: "80px" }}
      >
        {/* Background */}
        <img
          src={IMG.becomeGuide}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: "rgba(0,0,0,0.72)" }}
        />

        {/* Content */}
        <div
          className="relative z-10 flex flex-col gap-7 max-w-3xl"
        >
          <Eyebrow>Become a guide</Eyebrow>

          <h2
            className="font-bold text-white leading-tight"
            style={{ fontSize: "clamp(28px,3.5vw,50px)" }}
          >
            Share your city's secrets.
          </h2>

          <p
            className="font-medium leading-relaxed"
            style={{ fontSize: "clamp(16px,1.6vw,26px)", color: "#CCCCE2" }}
          >
            Turn your neighborhood, your craft and your story into income — on a platform built to put locals first.
          </p>

          <Link
            to="/signup"
            className="self-start flex items-center gap-2 rounded-xl font-semibold text-white transition-opacity hover:opacity-90"
            style={{
              background: "linear-gradient(90deg, #010170, #5656A0)",
              boxShadow: "0 4px 4px rgba(1,1,56,0.2)",
              padding: "16px 44px",
              fontSize: "17px",
            }}
          >
            Apply now as a guide
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </section>
  );
}
