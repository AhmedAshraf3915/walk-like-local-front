import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  OnboardingPage,
  OnboardingStepBar,
  OnboardingFooter,
} from "../layouts/OnboardingLayout";
import { CreditCard } from "../components/CreditCard";

const lockIcon = "https://www.figma.com/api/mcp/asset/5225eeab-a4cf-4da5-9086-37ee9e13bc96";

function FormField({
  label,
  placeholder,
  value,
  onChange,
  className = "",
}) {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <label className="text-base text-[#010138]">{label}</label>
      <div className="border border-[#010170] rounded-2xl px-6 py-4 bg-white/20">
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-sm text-[#5656a0] placeholder-[#5656a0] capitalize outline-none"
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

  const isValid = name && cardNum && expiry && cvv;

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

        {/* Card + form */}
        <div className="flex flex-col items-center gap-10">
          {/* Card preview */}
          <div className="flex flex-col items-center gap-4">
            <CreditCard />
            {/* Placeholder add card link */}
            <button
              className="flex items-center gap-2 h-12 px-12 rounded-2xl border border-[#010170] text-base font-medium text-[#010138] hover:bg-[#f4f4f8] transition-colors w-[400px] justify-center"
              onClick={() => navigate("/onboarding/payment")}
            >
              ← Change card
            </button>
          </div>

          {/* Form */}
          <div className="w-full max-w-[700px] flex flex-col gap-8">
            <FormField
              label="Name on card"
              placeholder="Sarah Abdo"
              value={name}
              onChange={setName}
            />
            <FormField
              label="Card number"
              placeholder="123 456 789 321"
              value={cardNum}
              onChange={setCardNum}
            />
            <div className="flex gap-6">
              <FormField
                label="Expiry date"
                placeholder="MM/YY"
                value={expiry}
                onChange={setExpiry}
                className="flex-1"
              />
              <FormField
                label="CVV"
                placeholder="999"
                value={cvv}
                onChange={setCvv}
                className="w-40"
              />
            </div>

            {/* Save card button */}
            <button
              onClick={() => {
                if (isValid) navigate("/onboarding/payment-done");
              }}
              className="h-12 px-12 rounded-2xl text-base font-medium w-full transition-colors"
              style={{
                background: isValid
                  ? "linear-gradient(to right, #010170, #5656a0)"
                  : "linear-gradient(to right, #878796, #b7b7c4)",
                color: isValid ? "#fff" : "#ccc",
                cursor: isValid ? "pointer" : "not-allowed",
              }}
            >
              Save Card
            </button>
          </div>
        </div>

        {/* Security note */}
        <div className="flex items-center justify-center gap-2 text-black">
          <img src={lockIcon} alt="lock" className="w-5 h-5 object-contain" />
          <span className="text-sm font-light">Your payment details are encrypted end-to-end.</span>
        </div>
      </div>

      <OnboardingFooter
        backTo="/onboarding/payment"
        continueLabel="Finish & Explore"
        continueEnabled={false}
        skipLabel="Skip for now"
        onSkip={() => navigate("/onboarding/payment-done")}
      />
    </OnboardingPage>
  );
}
