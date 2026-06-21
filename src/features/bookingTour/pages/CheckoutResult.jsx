import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

import Navbar from "@/components/home/Navbar.jsx";
import Footer from "@/components/home/Footer.jsx";
import { paymentApi } from "@/features/payment/api/paymentApi";

const PAID_STATES = new Set(["paid", "success", "completed"]);
const FAILED_STATES = new Set(["failed", "declined", "cancelled"]);

function getPaymentState(payment) {
  return String(
    payment?.status ?? payment?.paymentStatus ?? "pending",
  ).toLowerCase();
}

export default function CheckoutResult() {
  const { bookingId: routeBookingId } = useParams();
  const [searchParams] = useSearchParams();

  const bookingId =
    routeBookingId ??
    searchParams.get("bookingId") ??
    searchParams.get("booking_id") ??
    "";

  const [payment, setPayment] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(bookingId));
  const [isRetrying, setIsRetrying] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    bookingId ? "" : "The payment return did not include a booking reference.",
  );

  useEffect(() => {
    let isMounted = true;

    if (!bookingId) {
      return () => {
        isMounted = false;
      };
    }

    paymentApi
      .getPaymentStatus(bookingId)
      .then((result) => {
        if (!isMounted) return;
        setPayment(result);
        setErrorMessage("");
      })
      .catch((error) => {
        if (!isMounted) return;
        setErrorMessage(error?.message ?? "Unable to retrieve payment status.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [bookingId]);

  const retryCheckout = async () => {
    if (!bookingId) return;

    setIsRetrying(true);
    setErrorMessage("");

    try {
      sessionStorage.setItem("pendingPaymentBookingId", bookingId);
      const { checkoutUrl } = await paymentApi.createCheckoutSession(bookingId);
      paymentApi.redirectToCheckout(checkoutUrl);
    } catch (error) {
      setErrorMessage(error?.message ?? "Unable to restart secure checkout.");
      setIsRetrying(false);
    }
  };

  const paymentState = useMemo(
    () => (payment ? getPaymentState(payment) : "pending"),
    [payment],
  );
  const isPaid = PAID_STATES.has(paymentState);
  const isFailed = FAILED_STATES.has(paymentState);

  const paymentReference =
    payment?.reference ??
    payment?.transactionId ??
    payment?.paymentIntentId ??
    bookingId;

  return (
    <div className="min-h-screen bg-[#f7f7fb] text-[#010138]">
      <Navbar />
      <main className="max-w-[1728px] mx-auto px-8 lg:px-24 py-16">
        {isLoading && (
          <section className="mx-auto w-full max-w-2xl rounded-3xl border border-[#dfdeed] bg-white p-8 text-center shadow-[0_18px_55px_rgba(1,1,56,0.12)] sm:p-10">
            <h1 className="text-3xl font-bold text-[#010138]">
              Confirming payment
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#65638a]">
              Please wait while we verify your checkout.
            </p>
          </section>
        )}

        {!isLoading && isPaid && (
          <section className="mx-auto w-full max-w-2xl rounded-3xl border border-[#dfdeed] bg-white p-8 text-center shadow-[0_18px_55px_rgba(1,1,56,0.12)] sm:p-10">
            <h1 className="text-3xl font-bold text-[#396504]">
              Payment confirmed
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#65638a]">
              Your booking is now confirmed. Reference: {paymentReference}
            </p>
          </section>
        )}

        {!isLoading && isFailed && (
          <section className="mx-auto w-full max-w-2xl rounded-3xl border border-[#dfdeed] bg-white p-8 text-center shadow-[0_18px_55px_rgba(1,1,56,0.12)] sm:p-10">
            <h1 className="text-3xl font-bold text-[#ae1818]">
              Payment not completed
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#65638a]">
              {errorMessage ||
                "Your payment did not complete. You can retry securely via Stripe."}
            </p>
            <div className="mt-8">
              <button
                type="button"
                onClick={retryCheckout}
                disabled={isRetrying}
                className="h-11 px-8 rounded-2xl text-white text-base font-medium bg-gradient-to-r from-[#010170] to-[#5656a0] disabled:opacity-60"
              >
                {isRetrying ? "Opening Stripe..." : "Try payment again"}
              </button>
            </div>
          </section>
        )}

        {!isLoading && !isPaid && !isFailed && (
          <section className="mx-auto w-full max-w-2xl rounded-3xl border border-[#dfdeed] bg-white p-8 text-center shadow-[0_18px_55px_rgba(1,1,56,0.12)] sm:p-10">
            <h1 className="text-3xl font-bold text-[#010138]">
              Payment pending
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#65638a]">
              We are still waiting for your payment provider to confirm this
              transaction.
            </p>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
