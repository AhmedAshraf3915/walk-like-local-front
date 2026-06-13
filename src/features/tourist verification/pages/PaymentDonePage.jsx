import {
  OnboardingPage,
  OnboardingStepBar,
  OnboardingFooter,
} from "../layouts/OnboardingLayout";
import { CreditCard } from "../components/CreditCard";

const checkGoldIcon = "https://www.figma.com/api/mcp/asset/7cd852ca-33bc-4c5f-8276-9c6382656d9b";

export default function PaymentDonePage() {
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

        {/* Card + success */}
        <div className="flex flex-col items-center gap-10">
          <CreditCard />

          {/* Success message */}
          <div className="flex flex-col items-center gap-6 text-center max-w-lg">
            {/* Gold check */}
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(to bottom, #edc84c, #87722b)" }}
            >
              <img src={checkGoldIcon} alt="success" className="w-10 h-10 object-contain" />
            </div>
            <div className="flex flex-col gap-4">
              <p className="text-3xl font-medium text-[#010138]">
                Payout Method Added Successfully!
              </p>
              <p className="text-2xl font-light text-[#353572]">
                Card ending in 2222 is now connected to your Locale wallet.
              </p>
            </div>
          </div>
        </div>
      </div>

      <OnboardingFooter
        backTo="/onboarding/payment-form"
        continueTo="/"
        continueLabel="Finish & Explore"
        continueEnabled
      />
    </OnboardingPage>
  );
}
