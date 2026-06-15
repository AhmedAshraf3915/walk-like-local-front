import Hero from "../components/Hero";
import Destinations from "../components/Destinations";
import Tours from "../components/Tours";
import WhyUs from "../components/WhyUs";
import Guides from "../components/Guides";
import Heritage from "../components/Heritage";
import Reviews from "../components/Reviews";
import BecomeGuide from "../components/BecomeGuide";
import Footer from "../components/Footer";

export default function LandingPage() {
  return (
    <div style={{ background: "#FDFDFF", overflowX: "hidden" }}>
      <Hero />
      <Destinations />
      <Tours />
      <WhyUs />
      <Guides />
      <Heritage />
      <Reviews />
      <BecomeGuide />
      <Footer />
    </div>
  );
}
