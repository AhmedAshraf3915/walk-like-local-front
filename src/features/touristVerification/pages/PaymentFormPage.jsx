import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  OnboardingPage,
  OnboardingStepBar,
  OnboardingFooter,
} from "../layouts/OnboardingLayout";
import { CreditCard } from "../components/CreditCard";
import { apiClient } from "@/services/apiClient";
import { ICONS } from "../../../assets/images/touristVerification/images.js";

const lockIcon = ICONS.lockIcon;

function FormField({ label, placeholder, value, onChange, className = "" }) {
  return (
    <div className={`flex flex-col gap-1.5 sm:gap-2 ${className}`}>
      <label className="text-xs sm:text-sm text-[#010138]">{label}</label>
      <div className="border border-[#010170] rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 bg-white/20">
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-xs sm:text-sm text-[#5656a0] placeholder-[#5656a0] capitalize outline-none"
        />
      </div>
    </div>
  );
}

export default function PaymentFormPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [cardNum, setCardNum] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const isValid = name && cardNum && expiry && cvv;

  const handleSaveCard = async () => {
    if (!isValid) return;
    setSaving(true);
    setError(null);
    try {
      const response = await apiClient.post("/tourists/payment-methods", {
        cardholderName: name,
        cardNumber: cardNum.replace(/\s/g, ""),
        expiry: expiry,
        cvv: cvv,
      });

      // ✅ FIX: pass the real saved card back through navigation state
      // instead of PaymentDonePage hardcoding "2222"
      const savedCard = response?.data?.data ?? response?.data ?? {};
      navigate("/onboarding/payment-done", {
        state: {
          last4: savedCard.last4 ?? cardNum.replace(/\s/g, "").slice(-4),
        },
      });
    } catch (err) {
      setError("Failed to save card. Please check your details and try again.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    navigate("/tourist/profile");
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

        <div className="flex flex-col items-center gap-4 sm:gap-6 lg:gap-8">
          <div className="flex flex-col items-center gap-2 sm:gap-3">
            <CreditCard />
            <button
              className="flex items-center gap-2 h-10 sm:h-11 px-6 sm:px-10 rounded-xl sm:rounded-2xl border border-[#010170] text-xs sm:text-sm font-medium text-[#010138] hover:bg-[#f4f4f8] transition-colors w-full max-w-sm justify-center"
              onClick={() => navigate("/onboarding/payment")}
            >
              ← Change card
            </button>
          </div>

          <div className="w-full max-w-lg flex flex-col gap-4 sm:gap-5 lg:gap-6">
            <FormField label="Name on card" placeholder="Sarah Abdo" value={name} onChange={setName} />
            <FormField label="Card number" placeholder="123 456 789 321" value={cardNum} onChange={setCardNum} />
            <div className="flex gap-3 sm:gap-4">
              <FormField label="Expiry date" placeholder="MM/YY" value={expiry} onChange={setExpiry} className="flex-1" />
              <FormField label="CVV" placeholder="999" value={cvv} onChange={setCvv} className="w-28 sm:w-32" />
            </div>

            {error && (
              <p className="text-xs sm:text-sm text-red-500 text-center">{error}</p>
            )}

            <button
              onClick={handleSaveCard}
              disabled={!isValid || saving}
              className="h-10 sm:h-11 px-8 sm:px-10 rounded-xl sm:rounded-2xl text-sm sm:text-base font-medium w-full transition-colors"
              style={{
                background: isValid && !saving
                  ? "linear-gradient(to right, #010170, #5656a0)"
                  : "linear-gradient(to right, #878796, #b7b7c4)",
                color: isValid && !saving ? "#fff" : "#ccc",
                cursor: isValid && !saving ? "pointer" : "not-allowed",
              }}
            >
              {saving ? "Saving…" : "Save Card"}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-black">
          <img src={lockIcon} alt="lock" className="w-4 h-4 sm:w-5 sm:h-5 object-contain" />
          <span className="text-[11px] sm:text-sm font-light">Your payment details are encrypted end-to-end.</span>
        </div>
      </div>

      <OnboardingFooter
        backTo="/onboarding/payment"
        continueLabel="Save Card"
        continueEnabled={false}
        skipLabel="Skip for now"
        onSkip={handleSkip}
      />
    </OnboardingPage>
  );
}