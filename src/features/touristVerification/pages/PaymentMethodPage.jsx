import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  OnboardingPage,
  OnboardingStepBar,
  OnboardingFooter,
} from "../layouts/OnboardingLayout";
import { CreditCard } from "../components/CreditCard";
import { apiClient } from "@/services/apiClient";
import { ICONS } from "../../../assets/images/touristVerification/images.js";

const plusIcon = ICONS.plusIcon;
const lockIcon = ICONS.lockIcon;

export default function PaymentMethodPage() {
  const navigate = useNavigate();
  const [savedCards, setSavedCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch saved payment methods
    const fetchPaymentMethods = async () => {
      try {
        // Assuming there's an endpoint to get saved cards
        // const response = await apiClient.get("/tourists/payment-methods");
        // setSavedCards(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch payment methods:", error);
        setLoading(false);
      }
    };
    fetchPaymentMethods();
  }, []);

  // Handle skip - go directly to profile
  const handleSkip = () => {
    navigate("/tourist/profile");
  };

  // Handle finish - go to profile if cards exist, otherwise go to payment form
  const handleFinish = () => {
    if (savedCards.length > 0) {
      navigate("/tourist/profile");
    } else {
      navigate("/onboarding/payment-form");
    }
  };

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

        <div className="flex flex-col items-center gap-4 sm:gap-6">
          <CreditCard />

          {/* عرض البطاقات المحفوظة */}
          {savedCards.length > 0 && (
            <div className="w-full max-w-sm">
              {savedCards.map((card, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg mb-2">
                  <span>**** {card.last4}</span>
                  <span className="text-sm text-gray-500">Expires {card.expiry}</span>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => navigate("/onboarding/payment-form")}
            className="flex items-center gap-2 h-10 sm:h-11 px-6 sm:px-10 rounded-xl sm:rounded-2xl border border-[#010170] text-sm sm:text-base font-medium text-[#010138] hover:bg-[#f4f4f8] transition-colors w-full max-w-sm justify-center"
          >
            Add card
            <img src={plusIcon} alt="+" className="w-4 h-4 sm:w-5 sm:h-5 object-contain" />
          </button>
        </div>

        <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-black">
          <img src={lockIcon} alt="lock" className="w-4 h-4 sm:w-5 sm:h-5 object-contain" />
          <span className="text-[11px] sm:text-sm font-light">Your payment details are encrypted end-to-end.</span>
        </div>
      </div>

      <OnboardingFooter
        backTo="/onboarding/verification-done"
        continueLabel="Finish & Explore"
        continueEnabled={savedCards.length > 0}
        onContinue={handleFinish}
        skipLabel="Skip for now"
        onSkip={handleSkip}  // Skip goes directly to profile
      />
    </OnboardingPage>
  );
}