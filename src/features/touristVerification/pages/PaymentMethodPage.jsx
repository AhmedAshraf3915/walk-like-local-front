import { CreditCard, LockKeyhole, ShieldCheck } from "lucide-react";

import {
  OnboardingPage,
  OnboardingStepBar,
  OnboardingFooter,
} from "@/features/touristVerification/layouts/OnboardingLayout";

export default function PaymentMethodPage() {
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
      </div>

      <OnboardingFooter
        backTo="/onboarding/verification-done"
        continueTo="/tourist/profile"
        continueLabel="Finish & Explore"
        continueEnabled
        skipLabel=""
      />
    </OnboardingPage>
  );
}
