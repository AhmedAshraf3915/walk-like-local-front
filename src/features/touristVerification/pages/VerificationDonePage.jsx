import { useNavigate } from "react-router-dom";
import {
  OnboardingPage,
  OnboardingStepBar,
  OnboardingFooter,
} from "../layouts/OnboardingLayout";
import { ICONS } from "../../../assets/images/touristVerification/images.js";


const checkGoldIcon = ICONS.checkGoldIcon;
const verifiedIcon  = ICONS.verifiedIcon;
const lockIcon      = ICONS.lockIcon;

export default function VerificationDonePage() {
  const navigate = useNavigate();

  return (
    <OnboardingPage>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 flex flex-col gap-6 sm:gap-8 lg:gap-10">
        <OnboardingStepBar step={2} />

        <div className="text-center flex flex-col gap-2 sm:gap-3">
          <p className="text-[10px] sm:text-xs lg:text-sm font-light tracking-[0.2em] text-[#010138] uppercase">
            Step 2 of 3
          </p>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-wide text-[#010138]">
            Verify Your Identity
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-[#353572]">
            Earn a Verified Tourist badge so top local guides instantly trust your booking.
          </p>
        </div>

        {/* Upload card — file selected state */}
        <div className="bg-white border border-[#353572] rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-10">
            {/* Upload zone — uploaded state */}
            <div className="flex-1 w-full min-w-[240px] bg-[#f4f4f8] border-3 sm:border-4 border-dashed border-[#010170] rounded-xl sm:rounded-2xl flex flex-col items-center justify-center gap-3 sm:gap-4 py-8 sm:py-10 lg:py-12">
              {/* Gold check circle */}
              <div
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center"
                style={{ background: "linear-gradient(to bottom, #edc84c, #87722b)" }}
              >
                <img src={checkGoldIcon} alt="uploaded" className="w-6 h-6 sm:w-7 sm:h-7 object-contain" />
              </div>
              <div className="text-center">
                <p className="text-sm sm:text-base text-[#353572]">Upload ID or passport</p>
                <p className="text-xs text-[#aaaacf] mt-1">MyID.JPG</p>
              </div>
            </div>

            {/* Badge preview */}
            <div className="flex flex-row lg:flex-col items-center gap-3 sm:gap-4 lg:gap-5 text-center shrink-0">
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl flex items-center justify-center"
                style={{ background: "linear-gradient(to bottom, #010170, #5656a0)" }}
              >
                <img src={verifiedIcon} alt="verified" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
              </div>
              <div>
                <p className="text-sm sm:text-base lg:text-lg font-medium text-[#010138]">Verified Tourist Badge</p>
                <p className="text-xs sm:text-sm text-[#353572] mt-1">
                  Unlocked once your document is reviewed.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-[#010138]">
          <img src={lockIcon} alt="lock" className="w-4 h-4 sm:w-5 sm:h-5 object-contain" />
          <span className="text-[11px] sm:text-sm font-light">
            Your documents are stored end-to-end encrypted and only used for verification.
          </span>
        </div>
      </div>

      <OnboardingFooter
        backTo="/onboarding/verification"
        continueTo="/onboarding/payment"
        continueLabel="Continue"
        continueEnabled
        skipLabel="Skip for now"
        onSkip={() => navigate("/onboarding/payment")}
      />
    </OnboardingPage>
  );
}
