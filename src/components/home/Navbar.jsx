import { useEffect, useRef, useState } from "react";
import { LogOut, Menu, User, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { IMG } from "@/assets/images/landingPage/images.js";
import useAuth from "@/contexts/useAuth";

const NAV_LINKS = [
  { label: "Explore Trips", href: "#tours" },
  { label: "Places", href: "#destinations" },
  { label: "Guides", href: "#guides" },
];

const PROFILE_PATHS = {
  admin: "/admin/profile",
  guide: "/guide/profile",
  tourist: "/tourist/profile",
};

const getProfilePath = (role) =>
  PROFILE_PATHS[String(role).toLowerCase()] || "/profile";

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
  const [menuOpen, setMenuOpen]     = useState(false);
  const [dropdownOpen, setDropdown] = useState(false);
  const dropdownRef                 = useRef(null);
  const { pathname }                = useLocation();
  const navigate                    = useNavigate();
  const { isAuthenticated, user, userRole, logout } = useAuth();

  const hasAuthSession = Boolean(isAuthenticated && user);
  const profilePath    = getProfilePath(userRole);
  const userAvatar     = getUserAvatar(user);
  const userInitial    = (user?.fullName ?? user?.name ?? "U").slice(0, 1).toUpperCase();

  // Nav links are intentionally hidden on /tours and /guides pages
  const hideNavLinks =
    pathname.startsWith("/tours") || pathname.startsWith("/guides") || pathname.startsWith("/tourist");

  // Close avatar dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdown(false);
    setMenuOpen(false);
    navigate("/");
  };

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

        {/* Desktop nav links — hidden on /tours & /guides, hidden on mobile */}
        {!hideNavLinks && (
          <div className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-[13px] font-semibold text-[#010138] hover:text-[#010170] transition-colors duration-150"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}

        {/* Right actions */}
        <div className="flex items-center gap-2">

          {/* Not logged in */}
          {!hasAuthSession && (
            <Link
              to="/signup"
              className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-full bg-gradient-to-r from-[#010170] to-[#5656A0] px-3 text-[11px] font-semibold text-white shadow-[0_4px_12px_rgba(1,1,112,0.22)] transition hover:opacity-90 sm:px-5 sm:text-[12px]"
            >
              Sign up / Log in
            </Link>
          )}

          {/* Avatar + dropdown */}
          {hasAuthSession && (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                aria-label="Account menu"
                aria-expanded={dropdownOpen}
                onClick={() => setDropdown((o) => !o)}
                className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-[#cccce2] bg-[#f4f4f8] transition hover:border-[#010170]"
              >
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={user?.fullName ?? "Profile"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-[11px] font-bold uppercase text-[#010170]">
                    {userInitial}
                  </span>
                )}
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 top-11 z-50 min-w-[160px] rounded-xl border border-[#e4e3f0] bg-white p-1.5 shadow-xl">
                  {/* User name */}
                  <div className="px-3 py-2 text-[11px] font-semibold text-[#aaaacf] uppercase tracking-wide truncate">
                    {user?.fullName ?? user?.name ?? "Account"}
                  </div>
                  <hr className="border-[#f0f0f8] my-1" />
                  <Link
                    to={profilePath}
                    onClick={() => setDropdown(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium text-[#010138] hover:bg-[#f4f4f8] transition-colors"
                  >
                    <User className="size-4 text-[#5656a0]" />
                    Profile
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="size-4" />
                    Log out
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Hamburger (mobile only) */}
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
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-[#e4e3f0] bg-white px-4 py-3 flex flex-col gap-1">
          {/* Nav links (only on pages where they're shown) */}
          {!hideNavLinks &&
            NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="rounded-lg px-3 py-2.5 text-[13px] font-semibold text-[#010138] hover:bg-[#f4f4f8] transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}

          <hr className="border-[#f0f0f8] my-1" />

          {hasAuthSession ? (
            <>
              {/* User info */}
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 border-[#cccce2] bg-[#f4f4f8] flex-shrink-0">
                  {userAvatar ? (
                    <img src={userAvatar} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-[10px] font-bold uppercase text-[#010170]">{userInitial}</span>
                  )}
                </div>
                <span className="text-[13px] font-semibold text-[#010138] truncate">
                  {user?.fullName ?? user?.name ?? "Account"}
                </span>
              </div>

              <Link
                to={profilePath}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-[13px] font-medium text-[#010138] hover:bg-[#f4f4f8] transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <User className="size-4 text-[#5656a0]" />
                Profile
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-[13px] font-medium text-red-600 hover:bg-red-50 transition-colors w-full"
              >
                <LogOut className="size-4" />
                Log out
              </button>
            </>
          ) : (
            <Link
              to="/signup"
              className="rounded-lg px-3 py-2.5 text-[13px] font-semibold text-[#010138] hover:bg-[#f4f4f8] transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Sign up / Log in
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}