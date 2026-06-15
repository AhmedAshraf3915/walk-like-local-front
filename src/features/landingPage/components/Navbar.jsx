import { Menu } from "lucide-react";
import { IMG } from "../../../assets/images/landingPage/images.js";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-16 py-8">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <img src={IMG.WLLLogo} alt="Walk Like A Local" className="w-10 h-10" />
      </div>

      {/* Nav Links */}
      <div className="flex items-center gap-10">
        <button className="flex items-center gap-1 text-white font-semibold text-base hover:text-[#EDC84C] transition-colors">
          Explore
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        <button className="text-white font-semibold text-base hover:text-[#EDC84C] transition-colors">Places</button>
        <button className="text-white font-semibold text-base hover:text-[#EDC84C] transition-colors">Guides</button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
          <Link
          to="/signup"
          className="flex items-center justify-center px-8 py-3 rounded-xl font-semibold text-white text-sm whitespace-nowrap"
          style={{ background: "linear-gradient(90deg, #010170, #5656A0)", boxShadow: "0 4px 4px rgba(1,1,56,0.2)" }}
        >
          Signup / Login
        </Link>

        <button
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ background: "rgba(204,204,226,0.25)", border: "1px solid rgba(170,170,207,0.25)" }}
          aria-label="Menu"
        >
          <Menu size={22} color="white" />
        </button>
      </div>
    </nav>
  );
}
