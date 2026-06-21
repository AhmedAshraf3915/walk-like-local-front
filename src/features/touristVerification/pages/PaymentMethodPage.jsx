<<<<<<< HEAD
import { CreditCard, LockKeyhole, ShieldCheck } from "lucide-react";

=======
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
>>>>>>> d57a5a11e18e8157fdfe8483580dd8c3298bbdfe
import {
  OnboardingPage,
  OnboardingStepBar,
  OnboardingFooter,
<<<<<<< HEAD
} from "@/features/touristVerification/layouts/OnboardingLayout";
=======
} from "../layouts/OnboardingLayout";
import { CreditCard } from "../components/CreditCard";
import { getPaymentMethods } from "../../bookingTour/services/paymentMethods.js";
import { ICONS } from "../../../assets/images/touristVerification/images.js";

const lockIcon = ICONS.lockIcon;
const checkGoldIcon = ICONS.checkGoldIcon;
>>>>>>> d57a5a11e18e8157fdfe8483580dd8c3298bbdfe

/**
 * Step 3 intro screen — "do you already have a card on file?"
 * - Same navbar / step bar / footer as every other onboarding page.
 * - Waits for the backend before rendering anything (no flash of empty state).
 * - If the tourist already added a card before (e.g. they left onboarding and
 *   came back), we don't make them re-enter it — we just let them finish.
 */
export default function PaymentMethodPage() {
<<<<<<< HEAD
=======
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

>>>>>>> d57a5a11e18e8157fdfe8483580dd8c3298bbdfe
  return (
    <OnboardingPage>
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-8 sm:px-6 lg:py-10">
        <OnboardingStepBar step={3} />

        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#65638a]">
            Step 3 of 3
          </p>
          <h1 className="mt-3 text-3xl font-bold text-[#010138]">
            Secure payment at booking
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#353572] sm:text-base">
            You do not need to save a card during onboarding. When you book a
            tour, Stripe opens a secure checkout page for that booking.
          </p>
        </div>

<<<<<<< HEAD
        <section className="mx-auto grid w-full max-w-2xl gap-4 rounded-3xl border border-[#dfdeed] bg-white p-6 shadow-[0_16px_45px_rgba(1,1,56,0.10)] sm:grid-cols-3 sm:p-8">
          {[
            [CreditCard, "Choose a tour"],
            [ShieldCheck, "Open Stripe"],
            [LockKeyhole, "Pay securely"],
          ].map(([Icon, label]) => (
            <div key={label} className="text-center">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#eeeeF8] text-[#010170]">
                <Icon className="h-6 w-6" />
              </span>
              <p className="mt-3 text-sm font-semibold text-[#010138]">
                {label}
              </p>
            </div>
          ))}
        </section>

        <p className="text-center text-xs text-[#65638a]">
          Walk Like A Local never receives or stores your full card number or CVV.
        </p>
=======
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
>>>>>>> d57a5a11e18e8157fdfe8483580dd8c3298bbdfe
      </div>

      <OnboardingFooter
        backTo="/onboarding/verification-done"
<<<<<<< HEAD
        continueTo="/tourist/profile"
        continueLabel="Finish & Explore"
        continueEnabled
        skipLabel=""
=======
        onContinue={hasCard ? handleFinish : undefined}
        continueTo={hasCard ? undefined : undefined}
        continueLabel={hasCard ? "Finish & Explore" : "Continue"}
        continueEnabled={hasCard}
        skipLabel="Skip for now"
        onSkip={handleSkip}
>>>>>>> d57a5a11e18e8157fdfe8483580dd8c3298bbdfe
      />
    </OnboardingPage>
  );
}