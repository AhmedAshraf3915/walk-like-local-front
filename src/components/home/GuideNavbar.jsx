import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Menu, User, X } from "lucide-react";

import { IMG } from "@/assets/images/landingPage/images.js";
import useAuth from "@/contexts/useAuth";
import {
  readGuideVerificationStatus,
  useGuideVerificationStatus,
} from "@/features/guideVerification/hooks/useGuideVerificationStatus";

const GUIDE_LINKS = [
  { label: "Explore tours", to: "/tours" },
  { label: "Guide home", to: "/guide" },
  { label: "Profile details", to: "/guide/complete-profile/details" },
];

const TOURIST_LINKS = [
  { label: "Explore tours", to: "/tours" },
  { label: "Guides", to: "/guides" },
  { label: "Places", to: "/places" },
];

const PUBLIC_LINKS = [
  { label: "Explore tours", to: "/tours" },
  { label: "Guides", to: "/guides" },
  { label: "Places", to: "/places" },
];

const PROFILE_PATHS = {
  guide: "/guide/complete-profile/details",
  tourist: "/tourist/profile",
};

const getProfilePath = (role) =>
  PROFILE_PATHS[String(role ?? "").toLowerCase()] ?? "/login";

const getAssetUrl = (value) => {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "";

  return value.secureUrl ?? value.url ?? value.src ?? "";
};

export default function GuideNavbar({
  verified: verifiedProp,
  profilePhoto = "",
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, userRole, isAuthenticated, logout } = useAuth();
  const normalizedRole = String(userRole ?? "").toLowerCase();
  const isGuide = normalizedRole === "guide";
  const isTourist = normalizedRole === "tourist";
  const hasAuthSession = Boolean(isAuthenticated && user);
  const shouldLoadVerification = typeof verifiedProp !== "boolean";
  const { isVerified, isLoading, verification } = useGuideVerificationStatus({
    user,
    enabled: isGuide && shouldLoadVerification && Boolean(user),
  });
  const localVerificationStatus = readGuideVerificationStatus(user);
  const locallyVerified = localVerificationStatus === "approved";
  const verified =
    typeof verifiedProp === "boolean"
      ? verifiedProp
      : isLoading
        ? locallyVerified
        : isVerified || locallyVerified;
  const canRenderAction =
    !isGuide ||
    typeof verifiedProp === "boolean" ||
    !isLoading ||
    locallyVerified;
  const links = isGuide
    ? GUIDE_LINKS
    : isTourist
      ? TOURIST_LINKS
      : PUBLIC_LINKS;
  const profilePath = getProfilePath(normalizedRole);
  const avatar =
    getAssetUrl(profilePhoto) ||
    getAssetUrl(user?.profilePhoto) ||
    getAssetUrl(user?.profilePicture) ||
    getAssetUrl(user?.avatar) ||
    getAssetUrl(verification?.profilePhoto) ||
    getAssetUrl(verification?.verificationDocuments?.profilePhoto);
  const userInitial = (user?.fullName ?? user?.name ?? "U")
    .slice(0, 1)
    .toUpperCase();
  const action = canRenderAction
    ? isGuide
      ? verified
        ? { label: "Create tour", to: "/guide/tours/new" }
        : { label: "Complete profile", to: "/guide/complete-profile" }
      : !hasAuthSession
        ? { label: "Sign up / Log in", to: "/signup" }
        : null
    : null;

  const isActive = (to) => pathname === to;

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    setMenuOpen(false);
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-[1000] border-b border-[#e8e7f2] bg-white/95 shadow-[0_1px_12px_rgba(1,1,56,0.07)] backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <img
            src={IMG.WLLLogo}
            alt="Walk Like A Local"
            className="h-8 w-8 [filter:brightness(0)_saturate(100%)_invert(9%)_sepia(68%)_saturate(4043%)_hue-rotate(239deg)_brightness(79%)_contrast(111%)]"
          />
          <span className="hidden text-sm font-bold text-[#010138] xl:inline">
            Walk Like A Local
          </span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              aria-current={isActive(link.to) ? "page" : undefined}
              className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                isActive(link.to)
                  ? "bg-[#f0f0fa] text-[#010170]"
                  : "text-[#353572] hover:bg-[#f7f7fb] hover:text-[#010138]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="relative flex items-center gap-2">
          {action ? (
            <Link
              to={action.to}
              className={`hidden h-10 items-center justify-center rounded-lg px-4 text-xs font-semibold shadow-[0_4px_12px_rgba(1,1,112,0.18)] sm:inline-flex ${
                isGuide && verified
                  ? "bg-gradient-to-r from-[#010170] to-[#5656A0] text-white"
                  : "border border-[#EDC84C] bg-[#fff9df] text-[#010138]"
              }`}
            >
              {action.label}
            </Link>
          ) : null}

          {hasAuthSession ? (
            <div className="relative hidden sm:block" ref={dropdownRef}>
              <button
                type="button"
                aria-label="Account menu"
                aria-expanded={dropdownOpen}
                onClick={() => setDropdownOpen((open) => !open)}
                className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-[#EDC84C] bg-[#f1f0f8] text-[#65638a]"
              >
                {avatar ? (
                  <img
                    src={avatar}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-[11px] font-bold uppercase text-[#010170]">
                    {userInitial}
                  </span>
                )}
              </button>

              {dropdownOpen ? (
                <div className="absolute right-0 top-12 z-50 min-w-[170px] rounded-xl border border-[#e4e3f0] bg-white p-1.5 shadow-xl">
                  <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-[#aaaacf]">
                    {user?.fullName ?? user?.name ?? "Account"}
                  </div>
                  <hr className="my-1 border-[#f0f0f8]" />
                  <Link
                    to={profilePath}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium text-[#010138] transition-colors hover:bg-[#f4f4f8]"
                  >
                    <User className="size-4 text-[#5656a0]" />
                    Profile
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium text-red-600 transition-colors hover:bg-red-50"
                  >
                    <LogOut className="size-4" />
                    Log out
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}

          <button
            type="button"
            aria-label={menuOpen ? "Close guide menu" : "Open guide menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="grid h-10 w-10 place-items-center rounded-full border border-[#e0dfee] bg-[#f7f7fb] text-[#010138] transition hover:bg-[#eeeef8] lg:hidden"
          >
            {menuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          {menuOpen ? (
            <div className="absolute right-0 top-12 z-50 w-56 rounded-xl border border-[#e4e3f0] bg-white p-2 shadow-xl lg:hidden">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  aria-current={isActive(link.to) ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                  className={`block rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                    isActive(link.to)
                      ? "bg-[#f0f0fa] text-[#010170]"
                      : "text-[#353572] hover:bg-[#f7f7fb]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {action ? (
                <Link
                  to={action.to}
                  onClick={() => setMenuOpen(false)}
                  className="mt-2 block rounded-lg bg-[#010138] px-3 py-2.5 text-center text-sm font-semibold text-white"
                >
                  {action.label}
                </Link>
              ) : null}

              {hasAuthSession ? (
                <>
                  <Link
                    to={profilePath}
                    onClick={() => setMenuOpen(false)}
                    className="mt-2 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-[#010138] transition hover:bg-[#f7f7fb]"
                  >
                    <User className="size-4 text-[#5656a0]" />
                    Profile
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    <LogOut className="size-4" />
                    Log out
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
