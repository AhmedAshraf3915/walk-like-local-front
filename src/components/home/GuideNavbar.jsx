import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, UserRound, X } from "lucide-react";

import { IMG } from "@/assets/images/landingPage/images.js";
import useAuth from "@/contexts/useAuth";
import { useGuideVerificationStatus } from "@/features/guideVerification/hooks/useGuideVerificationStatus";

const GUIDE_LINKS = [
  { label: "Explore tours", to: "/tours" },
  { label: "Guide home", to: "/guide" },
  { label: "Profile", to: "/guide/profile" },
];

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
  const { pathname } = useLocation();
  const { user } = useAuth();
  const shouldLoadVerification = typeof verifiedProp !== "boolean";
  const { isVerified, isLoading, verification } =
    useGuideVerificationStatus({
      user,
      enabled: shouldLoadVerification && Boolean(user),
    });
  const verified =
    typeof verifiedProp === "boolean"
      ? verifiedProp
      : isVerified && !isLoading;
  const avatar =
    getAssetUrl(profilePhoto) ||
    getAssetUrl(user?.profilePhoto) ||
    getAssetUrl(user?.profilePicture) ||
    getAssetUrl(user?.avatar) ||
    getAssetUrl(verification?.profilePhoto) ||
    getAssetUrl(verification?.verificationDocuments?.profilePhoto);
  const action = verified
    ? { label: "Create tour", to: "/guide/tours/new" }
    : { label: "Complete profile", to: "/guide/complete-profile" };

  const isActive = (to) => pathname === to;

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
          {GUIDE_LINKS.map((link) => (
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
          <Link
            to={action.to}
            className={`hidden h-10 items-center justify-center rounded-lg px-4 text-xs font-semibold shadow-[0_4px_12px_rgba(1,1,112,0.18)] sm:inline-flex ${
              verified
                ? "bg-gradient-to-r from-[#010170] to-[#5656A0] text-white"
                : "border border-[#EDC84C] bg-[#fff9df] text-[#010138]"
            }`}
          >
            {action.label}
          </Link>

          <Link
            to="/guide/profile"
            aria-label="Guide profile"
            className="hidden h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-[#EDC84C] bg-[#f1f0f8] text-[#65638a] sm:flex"
          >
            {avatar ? (
              <img src={avatar} alt="" className="h-full w-full object-cover" />
            ) : (
              <UserRound className="h-5 w-5" />
            )}
          </Link>

          <button
            type="button"
            aria-label={menuOpen ? "Close guide menu" : "Open guide menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="grid h-10 w-10 place-items-center rounded-full border border-[#e0dfee] bg-[#f7f7fb] text-[#010138] transition hover:bg-[#eeeef8] lg:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {menuOpen ? (
            <div className="absolute right-0 top-12 z-50 w-56 rounded-xl border border-[#e4e3f0] bg-white p-2 shadow-xl lg:hidden">
              {GUIDE_LINKS.map((link) => (
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
              <Link
                to={action.to}
                onClick={() => setMenuOpen(false)}
                className="mt-2 block rounded-lg bg-[#010138] px-3 py-2.5 text-center text-sm font-semibold text-white"
              >
                {action.label}
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
