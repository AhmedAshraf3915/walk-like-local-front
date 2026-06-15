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
      <div className="max-w-[1440px] mx-auto px-8 py-12 flex flex-col gap-12">
        <OnboardingStepBar step={3} />

        <div className="text-center flex flex-col gap-5">
          <p className="text-sm font-light tracking-[0.2em] text-[#010138] uppercase">
            Step 3 of 3
          </p>
          <h1 className="text-4xl font-semibold tracking-wide text-[#010138]">
            Add Payment Method
          </h1>
          <p className="text-2xl text-[#353572]">
            Securely save a card so booking a trip is one tap away.
          </p>
        </div>

        {/* Card + CTA */}
        <div className="flex flex-col items-center gap-8">
          <CreditCard />

          {/* Add card button */}
          <button
            onClick={() => navigate("/onboarding/payment-form")}
            className="flex items-center gap-2 h-12 px-12 rounded-2xl border border-[#010170] text-base font-medium text-[#010138] hover:bg-[#f4f4f8] transition-colors w-[400px] justify-center"
          >
            Add card
            <img src={plusIcon} alt="+" className="w-5 h-5 object-contain" />
          </button>
        </div>

        {/* Security note */}
        <div className="flex items-center justify-center gap-2 text-black">
          <img src={lockIcon} alt="lock" className="w-5 h-5 object-contain" />
          <span className="text-sm font-light">Your payment details are encrypted end-to-end.</span>
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
