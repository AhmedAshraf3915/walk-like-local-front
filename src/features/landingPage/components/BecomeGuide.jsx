import { ArrowRight } from "lucide-react";
import { Eyebrow } from "../ui/ui.jsx";
import { IMG } from "../../../assets/images/landingPage/images.js";
import { Link } from "react-router-dom";

export default function BecomeGuide() {
  return (
    <section
      className="px-4 pb-10 sm:px-6 md:pb-14"
      style={{ background: "#FDFDFF" }}
    >
      <div className="relative mx-auto flex min-h-[230px] max-w-6xl flex-col justify-center overflow-hidden rounded-md p-6 md:min-h-[270px] md:p-12">
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
        <div className="relative z-10 flex max-w-xl flex-col gap-3">
          <Eyebrow>Become a guide</Eyebrow>

          <h2
            className="font-bold leading-tight text-white"
            style={{ fontSize: "clamp(22px,2.6vw,34px)" }}
          >
            Share your city's secrets.
          </h2>

          <p
            className="font-medium leading-relaxed"
            style={{ fontSize: "clamp(12px,1.2vw,15px)", color: "#CCCCE2" }}
          >
            Turn your neighborhood, your craft and your story into income — on a
            platform built to put locals first.
          </p>

          <Link
            to="/signup"
            className="flex items-center gap-2 self-start rounded-full font-semibold text-white transition-opacity hover:opacity-90"
            style={{
              background: "linear-gradient(90deg, #010170, #5656A0)",
              boxShadow: "0 6px 20px rgba(1,1,112,0.4)",
              padding: "10px 26px",
              fontSize: "12px",
            }}
          >
            Apply now as a guide
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
