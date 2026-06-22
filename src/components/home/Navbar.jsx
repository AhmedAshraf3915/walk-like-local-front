import { useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { IMG } from "@/assets/images/landingPage/images.js";
import useAuth from "@/contexts/useAuth";

const NAV_LINKS = [
  { label: "Explore Trips", href: "#tours", hasDropdown: false },
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

const getAssetUrl = (value) => {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "";

  return value.secureUrl ?? value.secure_url ?? value.url ?? value.src ?? "";
};

const getUserAvatar = (user) => {
  const candidates = [
    user?.profilePhoto,
    user?.profilePicture,
    user?.avatar,
    user?.photo,
    user?.profile?.profilePhoto,
    user?.guideProfile?.profilePhoto,
    user?.touristProfile?.profilePhoto,
    user?.guideVerification?.profilePhoto,
    user?.guideVerification?.verificationDocuments?.profilePhoto,
  ];

  return candidates.map(getAssetUrl).find(Boolean) ?? "";
};

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const { isAuthenticated, user, userRole } = useAuth();
  const hasAuthSession = Boolean(isAuthenticated && user);
  const profilePath = getProfilePath(userRole);
  const userAvatar = getUserAvatar(user);
  const hideNavLinks =
    pathname.startsWith("/tours") || pathname.startsWith("/guides");

  return (
    <nav className="relative z-50 border-b border-[#deddea] bg-[#f4f3f8]/95 shadow-[0_1px_12px_rgba(1,1,56,0.07)] backdrop-blur-xl">
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
        {!hideNavLinks && (
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
        )}

        {/* Right actions */}
        <div className="relative flex items-center gap-2">
          {!hasAuthSession && (
            <Link
              to="/signup"
              className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-full bg-gradient-to-r from-[#010170] to-[#5656A0] px-3 text-[11px] font-semibold text-white shadow-[0_4px_12px_rgba(1,1,112,0.22)] transition hover:opacity-90 sm:px-5 sm:text-[12px]"
            >
              Sign up / Log in
            </Link>
          )}

          {hasAuthSession ? (
            <Link
              to={profilePath}
              aria-label="Profile"
              className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-[#cccce2] bg-[#f4f4f8]"
            >
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={`${user?.fullName ?? user?.name ?? "User"} profile`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-[11px] font-bold uppercase text-[#010170]">
                  {(user?.fullName ?? user?.name ?? "U").slice(0, 1)}
                </span>
              )}
            </Link>
          ) : null}

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
              {!hideNavLinks &&
                NAV_LINKS.map((link) => (
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
                to={hasAuthSession ? profilePath : "/signup"}
                className="rounded-lg px-3 py-2 text-[13px] font-semibold text-[#010138] hover:bg-[#f4f4f8] transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {hasAuthSession ? "Profile" : "Sign up / Log in"}
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
