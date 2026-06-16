import { Bell, ChevronDown, Menu, X } from "lucide-react";
import { IMG } from "../../../assets/images/landingPage/images.js";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      className="relative z-50 bg-white"
      style={{
        borderBottom: "1px solid rgba(204,204,226,0.4)",
        boxShadow: "0 1px 10px rgba(1,1,56,0.06)",
      }}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <img
            src={IMG.WLLLogo}
            alt="Walk Like A Local"
            className="h-7 w-7 [filter:brightness(0)_saturate(100%)_invert(9%)_sepia(68%)_saturate(4043%)_hue-rotate(239deg)_brightness(79%)_contrast(111%)]"
          />
        </div>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-7">
          <a
            href="#tours"
            className="flex items-center gap-1 text-[12px] font-semibold text-[#010138] hover:text-[#010170] transition-colors"
          >
            Explore
            <ChevronDown size={13} color="#010138" />
          </a>
          <a
            href="#destinations"
            className="text-[12px] font-semibold text-[#010138] hover:text-[#010170] transition-colors"
          >
            Places
          </a>
          <a
            href="#guides"
            className="text-[12px] font-semibold text-[#010138] hover:text-[#010170] transition-colors"
          >
            Guides
          </a>
        </div>

        {/* Right actions */}
        <div className="relative flex items-center gap-2.5">
          {/* Bell */}
          <button
            type="button"
            aria-label="Notifications"
            className="relative hidden sm:flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[#f0effa]"
            style={{ border: "1px solid rgba(204,204,226,0.55)" }}
          >
            <Bell size={15} color="#010138" />
            <span
              className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold text-white"
              style={{ background: "#010170" }}
            >
              3
            </span>
          </button>

          {/* Profile avatar */}
          <Link
            to="/signup"
            aria-label="Profile"
            className="hidden sm:flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2"
            style={{ borderColor: "#CCCCE2", background: "#F4F4F8" }}
          >
            <img
              src={IMG.avatar}
              alt="Profile"
              className="h-full w-full object-cover"
            />
          </Link>

          {/* Hamburger */}
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[#f0effa]"
            style={{ border: "1px solid rgba(204,204,226,0.55)" }}
            aria-label="Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? (
              <X size={15} color="#010138" />
            ) : (
              <Menu size={15} color="#010138" />
            )}
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-11 flex min-w-44 flex-col gap-1 rounded-xl p-2 shadow-xl"
              style={{
                background: "#fff",
                border: "1px solid rgba(204,204,226,0.75)",
                zIndex: 100,
              }}
            >
              <a
                href="#tours"
                className="rounded-lg px-3 py-2 text-xs font-semibold text-[#010138] hover:bg-[#F4F4F8]"
                onClick={() => setMenuOpen(false)}
              >
                Explore
              </a>
              <a
                href="#destinations"
                className="rounded-lg px-3 py-2 text-xs font-semibold text-[#010138] hover:bg-[#F4F4F8]"
                onClick={() => setMenuOpen(false)}
              >
                Places
              </a>
              <a
                href="#guides"
                className="rounded-lg px-3 py-2 text-xs font-semibold text-[#010138] hover:bg-[#F4F4F8]"
                onClick={() => setMenuOpen(false)}
              >
                Guides
              </a>
              <Link
                to="/signup"
                className="rounded-lg px-3 py-2 text-xs font-semibold text-[#010138] hover:bg-[#F4F4F8]"
                onClick={() => setMenuOpen(false)}
              >
                Sign up / Log in
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
