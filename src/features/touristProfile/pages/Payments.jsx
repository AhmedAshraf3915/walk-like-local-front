import { ArrowRight, CreditCard, LockKeyhole, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

import Navbar from "@/components/home/Navbar.jsx";
import Footer from "@/components/home/Footer.jsx";
import AccountTabs from "@/features/touristProfile/components/AccountTabs";

const PAYMENT_POINTS = [
  {
    icon: CreditCard,
    title: "Pay per booking",
    description:
      "Choose a tour and confirm its booking details before payment starts.",
  },
  {
    icon: ShieldCheck,
    title: "Hosted by Stripe",
    description:
      "Card details are entered only on Stripe's secure checkout page.",
  },
  {
    icon: LockKeyhole,
    title: "No cards stored here",
    description:
      "Walk Like A Local never collects or stores your full card number or CVV.",
  },
];

export default function Payments() {
  return (
    <div className="min-h-screen bg-[#f8f8fc] text-[#010138]">
      <Navbar />
      <main className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6">
        <AccountTabs />

        <section className="overflow-hidden rounded-3xl border border-[#deddec] bg-white shadow-[0_18px_55px_rgba(1,1,56,0.10)]">
          <div className="bg-gradient-to-br from-[#010170] to-[#24246f] px-6 py-10 text-white sm:px-10">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#EDC84C]">
              Secure payments
            </p>
            <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
              Payments happen at checkout.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75">
              The backend creates a Stripe Checkout session for each pending
              booking. There is no saved-card endpoint, so card details are not
              collected on this page.
            </p>
          </div>

          <div className="grid gap-4 p-6 sm:p-10 md:grid-cols-3">
            {PAYMENT_POINTS.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="rounded-2xl border border-[#e4e3f0] bg-[#fafafe] p-5"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#ececf8] text-[#010170]">
                  <Icon className="h-5 w-5" />
                </span>
                <h2 className="mt-4 font-bold">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-[#65638a]">
                  {description}
                </p>
              </article>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 border-t border-[#e4e3f0] px-6 py-6 sm:px-10">
            <Link
              to="/tours"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-[#010170] to-[#5656A0] px-6 text-sm font-semibold text-white"
            >
              Browse tours <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/tourist/bookings"
              className="inline-flex h-11 items-center rounded-xl border border-[#d5d4ea] px-6 text-sm font-semibold text-[#353572]"
            >
              View booking history
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
