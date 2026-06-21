import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  OnboardingPage,
  OnboardingStepBar,
  OnboardingFooter,
} from "../layouts/OnboardingLayout";
import { CreditCard } from "../components/CreditCard";
import { getPaymentMethods } from "../../bookingTour/services/paymentMethods.js";
import { ICONS } from "../../../assets/images/touristVerification/images.js";

const lockIcon = ICONS.lockIcon;
const checkGoldIcon = ICONS.checkGoldIcon;

/**
 * Step 3 intro screen — "do you already have a card on file?"
 * - Same navbar / step bar / footer as every other onboarding page.
 * - Waits for the backend before rendering anything (no flash of empty state).
 * - If the tourist already added a card before (e.g. they left onboarding and
 *   came back), we don't make them re-enter it — we just let them finish.
 */
export default function PaymentMethodPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hasCard, setHasCard] = useState(false);
  const [last4, setLast4] = useState(null);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const checkExistingCard = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const res = await getPaymentMethods();
        const list = res?.data ?? res ?? [];
        const cards = Array.isArray(list) ? list : [];
        if (cancelled) return;

        if (cards.length > 0) {
          const first = cards[0];
          setHasCard(true);
          setLast4(first.last4 ?? first.cardNumber?.slice(-4) ?? "••••");
        } else {
          setHasCard(false);
        }
      } catch (err) {
        if (cancelled) return;
        // Don't block the user from continuing just because the check failed
        console.error("Failed to load payment methods:", err);
        setLoadError("Couldn't check your saved cards, but you can still add one.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    checkExistingCard();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAddCard = () => navigate("/onboarding/payment-form");
  const handleSkip = () => navigate("/tourist/profile");
  const handleFinish = () => navigate("/tourist/profile");

  if (loading) {
    return (
      <OnboardingPage>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-12 h-12 border-4 border-[#010170] border-t-transparent rounded-full animate-spin" />
        </div>
      </OnboardingPage>
    );
  }

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

        {loadError && (
          <p className="text-center text-xs sm:text-sm text-red-500">{loadError}</p>
        )}

        <div className="flex flex-col items-center gap-4 sm:gap-6 lg:gap-8">
          <CreditCard />

          {hasCard ? (
            <div className="flex flex-col items-center gap-3 sm:gap-4 text-center max-w-md">
              <div
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center"
                style={{ background: "linear-gradient(to bottom, #edc84c, #87722b)" }}
              >
                <img src={checkGoldIcon} alt="saved" className="w-6 h-6 sm:w-7 sm:h-7 object-contain" />
              </div>
              <p className="text-sm sm:text-base lg:text-lg font-medium text-[#010138]">
                You already have a card ending in {last4} on file.
              </p>
              <button
                onClick={handleAddCard}
                className="text-xs sm:text-sm font-medium text-[#010170] hover:underline"
              >
                Add a different card instead
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddCard}
              className="h-10 sm:h-11 px-8 sm:px-10 rounded-xl sm:rounded-2xl text-sm sm:text-base font-medium w-full max-w-sm text-white transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(to right, #010170, #5656a0)" }}
            >
              Add Card
            </button>
          )}
        </div>

        <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-[#010138]">
          <img src={lockIcon} alt="lock" className="w-4 h-4 sm:w-5 sm:h-5 object-contain" />
          <span className="text-[11px] sm:text-sm font-light">
            Your payment details are encrypted end-to-end.
          </span>
        </div>
      </div>

      <OnboardingFooter
        backTo="/onboarding/verification-done"
        onContinue={hasCard ? handleFinish : undefined}
        continueTo={hasCard ? undefined : undefined}
        continueLabel={hasCard ? "Finish & Explore" : "Continue"}
        continueEnabled={hasCard}
        skipLabel="Skip for now"
        onSkip={handleSkip}
      />
    </OnboardingPage>
  );
}