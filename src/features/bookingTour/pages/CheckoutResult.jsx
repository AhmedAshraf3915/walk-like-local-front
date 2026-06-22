import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";

import Navbar from "@/components/home/Navbar.jsx";
import Footer from "@/components/home/Footer.jsx";
import PaymentDone from "@/features/bookingTour/components/PaymentDone";
import PaymentFail from "@/features/bookingTour/components/PaymentFail";
import { paymentApi } from "@/features/payment/api/paymentApi";

const PAID_STATES = new Set(["paid", "success", "completed"]);
const FAILED_STATES = new Set(["failed", "declined", "cancelled"]);

function getPaymentState(payment) {
  return String(
    payment?.status ?? payment?.paymentStatus ?? "pending",
  ).toLowerCase();
}

/**
 * Landing page Stripe redirects back to after checkout.
 *
 * Route (both success_url and cancel_url should point here):
 *   /tourist/bookings/:bookingId/confirmation
 *
 * Also supports ?bookingId= query param as fallback.
 *
 * Polls paymentApi.getPaymentStatus(bookingId) once on mount to
 * determine the actual payment outcome, then renders PaymentDone
 * or PaymentFail accordingly.
 */
export default function CheckoutResult() {
  const { bookingId: routeBookingId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const bookingId =
    routeBookingId ??
    searchParams.get("bookingId") ??
    searchParams.get("booking_id") ??
    // Fallback: check if TourDetail stashed the ID in sessionStorage
    // (for the case where Stripe doesn't echo our booking ID back)
    sessionStorage.getItem("pendingPaymentBookingId") ??
    "";

  const [payment, setPayment] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(bookingId));
  const [isRetrying, setIsRetrying] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    bookingId ? "" : "The payment return did not include a booking reference.",
  );

  useEffect(() => {
    if (!bookingId) return;

    let isMounted = true;

    paymentApi
      .getPaymentStatus(bookingId)
      .then((result) => {
        if (!isMounted) return;
        setPayment(result);
        setErrorMessage("");
        // Clear the stashed ID once we have a definitive result
        sessionStorage.removeItem("pendingPaymentBookingId");
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

  // Build the booking summary for PaymentDone from whatever the
  // payment status endpoint returns (fields may vary by backend).
  const bookingSummary = useMemo(() => {
    if (!payment) return undefined;

    const b = payment.booking ?? payment;
    const reference =
      payment.reference ??
      payment.transactionId ??
      payment.paymentIntentId ??
      bookingId;

    const formatDate = (dateStr) => {
      if (!dateStr) return "—";
      const d = new Date(dateStr);
      return isNaN(d.getTime())
        ? dateStr
        : d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
    };

    const startTime = b.startTime ?? b.slot?.startTime ?? "";
    const endTime   = b.endTime   ?? b.slot?.endTime   ?? "";

    return {
      reference,
      package: b.package ?? b.groupType ?? b.packageType ?? "—",
      when: [
        formatDate(b.date ?? b.slot?.date ?? b.tourDate),
        startTime && endTime ? `${startTime} – ${endTime}` : startTime,
      ]
        .filter(Boolean)
        .join(" · ") || "—",
      where: b.meetingPoint ?? b.destination ?? b.location ?? "—",
      paid:
        payment.amount != null
          ? `$${payment.amount}`
          : b.totalPrice != null
          ? `$${b.totalPrice}`
          : "—",
    };
  }, [payment, bookingId]);

  const handleDone = () => navigate("/tourist/bookings");
  const handleBack = () => navigate(-1);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f7fb] text-[#010138]">
        <Navbar />
        <main className="max-w-[1728px] mx-auto px-8 lg:px-24 py-16">
          <section className="mx-auto w-full max-w-2xl rounded-3xl border border-[#dfdeed] bg-white p-8 text-center shadow-[0_18px_55px_rgba(1,1,56,0.12)] sm:p-10">
            <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4 border-[#010170] border-t-transparent" />
            <h1 className="text-3xl font-bold text-[#010138]">Confirming payment</h1>
            <p className="mt-3 text-sm leading-6 text-[#65638a]">
              Please wait while we verify your checkout with Stripe.
            </p>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  // ── No booking ID ─────────────────────────────────────────────────────────
  if (!bookingId) {
    return (
      <div className="min-h-screen bg-[#f7f7fb] text-[#010138]">
        <Navbar />
        <main className="max-w-[1728px] mx-auto px-8 lg:px-24 py-16">
          <section className="mx-auto w-full max-w-2xl rounded-3xl border border-[#dfdeed] bg-white p-8 text-center shadow-[0_18px_55px_rgba(1,1,56,0.12)] sm:p-10">
            <h1 className="text-3xl font-bold text-[#ae1818]">Something went wrong</h1>
            <p className="mt-3 text-sm leading-6 text-[#65638a]">{errorMessage}</p>
            <button
              onClick={() => navigate("/tourist/bookings")}
              className="mt-8 h-11 px-8 rounded-2xl text-white text-base font-medium bg-gradient-to-r from-[#010170] to-[#5656a0]"
            >
              View my bookings
            </button>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Success ───────────────────────────────────────────────────────────────
  if (isPaid) {
    return (
      <div className="min-h-screen bg-[#f7f7fb] text-[#010138]">
        <Navbar />
        <main className="max-w-[1728px] mx-auto px-8 lg:px-24 py-16">
          <PaymentDone booking={bookingSummary} onDone={handleDone} />
        </main>
        <Footer />
      </div>
    );
  }

  // ── Failed / Cancelled ────────────────────────────────────────────────────
  if (isFailed) {
    return (
      <div className="min-h-screen bg-[#f7f7fb] text-[#010138]">
        <Navbar />
        <main className="max-w-[1728px] mx-auto px-8 lg:px-24 py-16">
          <PaymentFail
            onBack={handleBack}
            onRetry={isRetrying ? undefined : retryCheckout}
          />
          {errorMessage && (
            <p className="mt-4 text-center text-sm text-[#ae1818]">{errorMessage}</p>
          )}
        </main>
        <Footer />
      </div>
    );
  }

  // ── Pending ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f7f7fb] text-[#010138]">
      <Navbar />
      <main className="max-w-[1728px] mx-auto px-8 lg:px-24 py-16">
        <section className="mx-auto w-full max-w-2xl rounded-3xl border border-[#dfdeed] bg-white p-8 text-center shadow-[0_18px_55px_rgba(1,1,56,0.12)] sm:p-10">
          <h1 className="text-3xl font-bold text-[#010138]">Payment pending</h1>
          <p className="mt-3 text-sm leading-6 text-[#65638a]">
            We are still waiting for your payment provider to confirm this transaction.
            This page will show the result once Stripe responds.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-8 h-11 px-8 rounded-2xl text-white text-base font-medium bg-gradient-to-r from-[#010170] to-[#5656a0]"
          >
            Check again
          </button>
        </section>
      </main>
      <Footer />
    </div>
  );
}