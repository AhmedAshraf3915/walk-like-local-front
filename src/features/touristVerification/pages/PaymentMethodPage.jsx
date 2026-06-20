import { useNavigate } from "react-router-dom";
import {
  OnboardingPage,
  OnboardingStepBar,
  OnboardingFooter,
} from "../layouts/OnboardingLayout";
import { CreditCard } from "../components/CreditCard";
import { ICONS } from "../../../assets/images/touristVerification/images.js";


const plusIcon = ICONS.plusIcon;
const lockIcon = ICONS.lockIcon;

export default function PaymentMethodPage() {
  const navigate = useNavigate();

  return (
    <OnboardingPage>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 flex flex-col gap-6 sm:gap-8 lg:gap-10">
        <OnboardingStepBar step={3} />

        <div className="text-center flex flex-col gap-2 sm:gap-3">
          <p className="text-[10px] sm:text-xs lg:text-sm font-light tracking-[0.2em] text-[#010138] uppercase">
            Step 3 of 3
          </p>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-wide text-[#010138]">
            Add Payment Method
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-[#353572]">
            Securely save a card so booking a trip is one tap away.
          </p>
        </div>

        {/* Card + CTA */}
        <div className="flex flex-col items-center gap-4 sm:gap-6">
          <CreditCard />

          {/* Add card button */}
          <button
            onClick={() => navigate("/onboarding/payment-form")}
            className="flex items-center gap-2 h-10 sm:h-11 px-6 sm:px-10 rounded-xl sm:rounded-2xl border border-[#010170] text-sm sm:text-base font-medium text-[#010138] hover:bg-[#f4f4f8] transition-colors w-full max-w-sm justify-center"
          >
            Add card
            <img src={plusIcon} alt="+" className="w-4 h-4 sm:w-5 sm:h-5 object-contain" />
          </button>
        </div>

        {/* Security note */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-black">
          <img src={lockIcon} alt="lock" className="w-4 h-4 sm:w-5 sm:h-5 object-contain" />
          <span className="text-[11px] sm:text-sm font-light">Your payment details are encrypted end-to-end.</span>
        </div>
      </div>

      <OnboardingFooter
        backTo="/onboarding/verification-done"
        continueLabel="Finish & Explore"
        continueEnabled={false}
        skipLabel="Skip for now"
        onSkip={() => navigate("/onboarding/payment-done")}
      />
    </OnboardingPage>
  );
}
