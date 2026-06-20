import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  OnboardingPage,
  OnboardingStepBar,
  OnboardingFooter,
} from "../layouts/OnboardingLayout";
import { CreditCard } from "../components/CreditCard";
import { ICONS } from "../../../assets/images/touristVerification/images.js";

const checkGoldIcon = ICONS.checkGoldIcon;

export default function PaymentDonePage() {
  const navigate = useNavigate();

  // Auto-redirect to profile after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/tourist/profile");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

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

        <div className="flex flex-col items-center gap-4 sm:gap-6 lg:gap-8">
          <CreditCard />

          <div className="flex flex-col items-center gap-3 sm:gap-4 text-center max-w-md">
            <div
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(to bottom, #edc84c, #87722b)" }}
            >
              <img src={checkGoldIcon} alt="success" className="w-7 h-7 sm:w-8 sm:h-8 object-contain" />
            </div>
            <div className="flex flex-col gap-2 sm:gap-3">
              <p className="text-lg sm:text-xl lg:text-2xl font-medium text-[#010138]">
                Payout Method Added Successfully!
              </p>
              <p className="text-sm sm:text-base lg:text-lg font-light text-[#353572]">
                Card ending in 2222 is now connected to your Locale wallet.
              </p>
              <p className="text-xs sm:text-sm text-[#aaaacf] mt-2">
                Redirecting to your profile...
              </p>
            </div>
          </div>
        </div>
      </div>

      <OnboardingFooter
        backTo="/onboarding/payment-form"
        continueTo="/tourist/profile"
        continueLabel="Finish & Explore"
        continueEnabled
      />
    </OnboardingPage>
  );
}