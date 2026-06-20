import { useState } from "react";
import { Bell, ChevronDown, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { IMG } from "@/assets/images/landingPage/images.js";
import useAuth from "@/contexts/useAuth";

const NAV_LINKS = [
  { label: "Explore", href: "#tours", hasDropdown: true },
  { label: "Places", href: "#destinations", hasDropdown: false },
  { label: "Guides", href: "#guides", hasDropdown: false },
];

const PROFILE_PATHS = {
  admin: "/admin/profile",
  guide: "/guide/profile",
  tourist: "/tourist/profile",
};

const getProfilePath = (role) => {
  return PROFILE_PATHS[String(role).toLowerCase()] || "/profile";
};

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, userRole } = useAuth();
  const profilePath = getProfilePath(userRole);

  return (
    <nav className="relative z-50 bg-white shadow-[0_1px_12px_rgba(1,1,56,0.07)] border-b border-[#e8e7f2]">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
          <img
            src={IMG.WLLLogo}
            alt="Walk Like A Local"
            className="h-7 w-7 [filter:brightness(0)_saturate(100%)_invert(9%)_sepia(68%)_saturate(4043%)_hue-rotate(239deg)_brightness(79%)_contrast(111%)]"
          />
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="flex items-center gap-1 text-[13px] font-semibold text-[#010138] hover:text-[#010170] transition-colors duration-150"
            >
              {link.label}
              {link.hasDropdown && (
                <ChevronDown size={13} className="opacity-70" />
              )}
            </a>
          ))}
        </div>

        {/* Right actions */}
        <div className="relative flex items-center gap-2">
          {/* Bell */}
          <button
            type="button"
            aria-label="Notifications"
            className="relative hidden sm:flex h-9 w-9 items-center justify-center rounded-full border border-[#e0dfee] bg-[#f7f7fb] hover:bg-[#eeeef8] transition-colors"
          >
            <Bell size={15} className="text-[#010138]" />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#010170] text-[8px] font-bold text-white">
              3
            </span>
          </button>

          {!isAuthenticated && (
            <Link
              to="/login"
              className="hidden sm:inline-flex h-9 items-center justify-center rounded-full border border-[#d7d6e8] bg-white px-4 text-[12px] font-semibold text-[#010138] hover:bg-[#f7f7fb] transition-colors"
            >
              Sign in / Log in
            </Link>
          )}

          {/* Avatar */}
          {isAuthenticated && (
            <Link
              to={profilePath}
              aria-label="Profile"
              className="hidden sm:flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-[#cccce2] bg-[#f4f4f8]"
            >
              <img
                src={IMG.avatar}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            </Link>
            )}

          {/* Hamburger */}
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            className="flex md:hidden h-9 w-9 items-center justify-center rounded-full border border-[#e0dfee] bg-[#f7f7fb] hover:bg-[#eeeef8] transition-colors"
          >
            {menuOpen ? (
              <X size={15} className="text-[#010138]" />
            ) : (
              <Menu size={15} className="text-[#010138]" />
            )}
          </button>

          {/* Mobile dropdown */}
          {menuOpen && (
            <div className="absolute right-0 top-11 z-50 flex min-w-44 flex-col gap-0.5 rounded-xl border border-[#e4e3f0] bg-white p-2 shadow-xl md:hidden">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="rounded-lg px-3 py-2 text-[13px] font-semibold text-[#010138] hover:bg-[#f4f4f8] transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <Link
                to={isAuthenticated ? profilePath : "/login"}
                className="rounded-lg px-3 py-2 text-[13px] font-semibold text-[#010138] hover:bg-[#f4f4f8] transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {isAuthenticated ? "Profile" : "Sign in / Log in"}
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
