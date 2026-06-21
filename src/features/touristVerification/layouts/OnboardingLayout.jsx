import { Link } from "react-router-dom";

import { IMG } from "@/assets/images/landingPage/images.js";
import { ICONS } from "@/assets/images/touristVerification/images.js";



// 
// Navbar
// 

const localGuideIcon = ICONS.localGuideIcon;
const checkIcon = ICONS.checkGoldIcon;
const goldLine = ICONS.goldLine;
const greyLine = ICONS.greyLine;
const leftArrowIcon = ICONS.leftArrowIcon;
const rightArrowIcon = ICONS.rightArrowIcon;


export function OnboardingNavbar() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[rgba(1,1,112,0.25)] shadow-[0_8px_24px_rgba(1,1,112,0.1)]">
      <div className="max-w-[1728px] mx-auto px-4 sm:px-6 lg:px-10 h-14 sm:h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
          <img
            src={IMG.WLLLogo}
            alt="Walk Like A Local"
            className="h-7 w-7 [filter:brightness(0)_saturate(100%)_invert(9%)_sepia(68%)_saturate(4043%)_hue-rotate(239deg)_brightness(79%)_contrast(111%)]"
          />
          <span className="">
          Walk like a Local
        </span>
        </Link>

        {/* Role badge */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-[#f4f4f8] border border-[#aaaacf] rounded-full px-3 sm:px-5 py-1.5 sm:py-2 text-[11px] sm:text-sm text-[#010170] font-['Inter',sans-serif]">
          <img src={localGuideIcon} alt="" className="w-4 h-4 sm:w-5 sm:h-5 object-contain" />
          <span className="hidden xs:inline">Joining as a</span> tourist
        </div>
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────
// Step indicator
// ─────────────────────────────────────────────────────────────


function StepNode({
  number,
  label,
  status,
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 sm:gap-3">
      {status === "done" ? (
        <div
          className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 rounded-full flex items-center justify-center"
          style={{ background: "linear-gradient(to bottom, #edc84c, #87722b)" }}
        >
          <img src={checkIcon} alt="done" className="w-4 h-4 sm:w-5 sm:h-5 lg:w-7 lg:h-7 object-contain" />
        </div>
      ) : status === "active" ? (
        <div className="p-1 sm:p-1.5 lg:p-2 rounded-full border-[3px] sm:border-[4px] lg:border-[6px] border-[rgba(237,200,76,0.18)]">
          <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 rounded-full flex items-center justify-center border-[3px] sm:border-[4px] lg:border-[5px] border-[#edc84c]">
            <span className="text-xs sm:text-sm lg:text-lg font-semibold text-[#010138]">{number}</span>
          </div>
        </div>
      ) : (
        <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 rounded-full flex items-center justify-center border-[3px] sm:border-[4px] lg:border-[5px] border-[#cccce2]">
          <span className="text-xs sm:text-sm lg:text-lg font-semibold text-[#cccce2]">{number}</span>
        </div>
      )}
      <span
        className={`text-[10px] sm:text-xs lg:text-sm font-medium whitespace-nowrap ${
          status === "upcoming" ? "text-[#cccce2]" : "text-[#010170]"
        }`}
      >
        {label}
      </span>
    </div>
  );
}



function StepConnector({ gold }) {
  return (
    <div className="flex-1 max-w-[220px] h-px overflow-hidden">
      <img
        src={gold ? goldLine : greyLine}
        alt=""
        className="w-full h-px object-cover"
      />
    </div>
  );
}

export function OnboardingStepBar({ step }) {
const statuses =
    step === 1
      ? ["active", "upcoming", "upcoming"]
      : step === 2
      ? ["done", "active", "upcoming"]
      : ["done", "done", "active"];

  return (
    <div className="flex items-center justify-center gap-4">
      <StepNode number={1} label="Profile details" status={statuses[0]} />
      <StepConnector gold={step >= 2} />
      <StepNode number={2} label="Verification" status={statuses[1]} />
      <StepConnector gold={step >= 3} />
      <StepNode number={3} label="Secure checkout" status={statuses[2]} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Bottom nav bar
// ─────────────────────────────────────────────────────────────



export function OnboardingFooter({
  backTo,
  onContinue,
  continueLabel = "Continue",
  continueEnabled = true,
  skipLabel = "Skip for now",
  onSkip,
  continueTo,
}) {
  const btnBase =
    "flex items-center gap-1.5 sm:gap-2 h-10 sm:h-12 px-5 sm:px-8 lg:px-10 rounded-xl sm:rounded-2xl text-sm sm:text-base font-medium transition-opacity";

  const continueButton = (
    <button
      onClick={onContinue}
      disabled={!continueEnabled}
      className={`${btnBase} text-white ${
        continueEnabled ? "" : "cursor-not-allowed"
      }`}
      style={{
        background: continueEnabled
          ? "linear-gradient(to right, #010170, #5656a0)"
          : "linear-gradient(to right, #878796, #b7b7c4)",
        color: continueEnabled ? "#fff" : "#ccc",
      }}
    >
      <span>{continueLabel}</span>
      <img src={rightArrowIcon} alt="" className="w-5 h-5 object-contain" />
    </button>
  );

  return (
    <footer className="border-t border-[rgba(53,53,114,0.25)] shadow-[0_8px_24px_rgba(53,53,114,0.15)] bg-white">
      <div className="max-w-[1728px] mx-auto px-4 sm:px-6 lg:px-10 h-14 sm:h-16 flex items-center justify-between">
        {/* Back */}
        {backTo ? (
          <Link
            to={backTo}
            className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm lg:text-base text-[#cccce2] hover:text-[#010170] transition-colors"
          >
            <img src={leftArrowIcon} alt="" className="w-4 h-4 sm:w-5 sm:h-5 object-contain" />
            <span>Back</span>
          </Link>
        ) : (
          <div />
        )}
        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-4 lg:gap-5">
          {(skipLabel && onSkip) && (
            <button
              onClick={onSkip}
              className="text-xs sm:text-sm lg:text-base font-medium text-[#010170] hover:underline"
            >
              {skipLabel}
            </button>
          )}
          {continueTo ? (
            <Link to={continueTo}>
              {continueButton}
            </Link>
          ) : (
            continueButton
          )}
        </div>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────
// Page shell
// ─────────────────────────────────────────────────────────────
export function OnboardingPage({ children }) {
  return (
    <div className="min-h-screen bg-[#fdfdff] flex flex-col">
      <OnboardingNavbar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
