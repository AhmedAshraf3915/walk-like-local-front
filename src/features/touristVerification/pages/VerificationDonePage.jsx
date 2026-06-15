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
      <div className="max-w-[1440px] mx-auto px-8 py-12 flex flex-col gap-12">
        <OnboardingStepBar step={2} />

        <div className="text-center flex flex-col gap-5">
          <p className="text-sm font-light tracking-[0.2em] text-[#010138] uppercase">
            Step 2 of 3
          </p>
          <h1 className="text-4xl font-semibold tracking-wide text-[#010138]">
            Verify Your Identity
          </h1>
          <p className="text-2xl text-[#353572]">
            Earn a Verified Tourist badge so top local guides instantly trust your booking.
          </p>
        </div>

        {/* Upload card — file selected state */}
        <div className="bg-white border border-[#353572] rounded-2xl p-10">
          <div className="flex items-center gap-16 flex-wrap">
            {/* Upload zone — uploaded state */}
            <div className="flex-1 min-w-[280px] bg-[#f4f4f8] border-4 border-dashed border-[#010170] rounded-2xl flex flex-col items-center justify-center gap-5 py-16">
              {/* Gold check circle */}
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: "linear-gradient(to bottom, #edc84c, #87722b)" }}
              >
                <img src={checkGoldIcon} alt="uploaded" className="w-8 h-8 object-contain" />
              </div>
              <div className="text-center">
                <p className="text-xl text-[#353572]">Upload ID or passport</p>
                <p className="text-base text-[#aaaacf] mt-1">MyID.JPG</p>
              </div>
            </div>

            {/* Badge preview */}
            <div className="flex flex-col items-center gap-5 w-60 text-center shrink-0">
              <div
                className="w-24 h-24 rounded-3xl flex items-center justify-center"
                style={{ background: "linear-gradient(to bottom, #010170, #5656a0)" }}
              >
                <img src={verifiedIcon} alt="verified" className="w-12 h-12 object-contain" />
              </div>
              <div>
                <p className="text-xl font-medium text-[#010138]">Verified Tourist Badge</p>
                <p className="text-base text-[#353572] mt-2">
                  Unlocked once your document is reviewed.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-[#010138]">
          <img src={lockIcon} alt="lock" className="w-5 h-5 object-contain" />
          <span className="text-base font-light">
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
