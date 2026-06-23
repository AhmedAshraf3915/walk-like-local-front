import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";

import Navbar from "@/components/home/Navbar.jsx";
import Footer from "@/components/home/Footer.jsx";
import PaymentDone from "@/features/bookingTour/components/PaymentDone";
import PaymentFail from "@/features/bookingTour/components/PaymentFail";
import { paymentApi } from "@/features/payment/api/paymentApi";

const PAID_STATES   = new Set(["paid", "success", "completed"]);
const FAILED_STATES = new Set(["failed", "declined", "cancelled", "canceled"]);

const REDIRECT_AFTER_SECONDS = 60;

function getPaymentState(payment) {
  return String(payment?.status ?? payment?.paymentStatus ?? "pending").toLowerCase();
}

/**
 * Landing page Stripe redirects back to after checkout.
 *
 *   TODO: Register this route in your app router:
 *     /tourist/bookings/:bookingId/confirmation
 *
 * Flow:
 *  paid    → <PaymentDone>  then auto-redirect to /tourist/bookings after 60 s
 *  failed  → <PaymentFail>  with retry button (re-opens Stripe)
 *  pending → waiting screen with manual "Check again" button
 */
export default function CheckoutResult() {
  const { bookingId: routeBookingId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const timerRef = useRef(null);

  const bookingId =
    routeBookingId ??
    searchParams.get("bookingId") ??
    searchParams.get("booking_id") ??
    sessionStorage.getItem("pendingPaymentBookingId") ??
    "";

  const [payment,      setPayment]      = useState(null);
  const [isLoading,    setIsLoading]    = useState(Boolean(bookingId));
  const [isRetrying,   setIsRetrying]   = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    bookingId ? "" : "The payment return did not include a booking reference.",
  );
  const [countdown, setCountdown] = useState(REDIRECT_AFTER_SECONDS);

  // ── 1. Fetch payment status ───────────────────────────────────────────────
  useEffect(() => {
    if (!bookingId) return;
    let alive = true;

    paymentApi
      .getPaymentStatus(bookingId)
      .then((result) => {
        if (!alive) return;
        setPayment(result);
        setErrorMessage("");
        sessionStorage.removeItem("pendingPaymentBookingId");
      })
      .catch((err) => {
        if (!alive) return;
        setErrorMessage(err?.message ?? "Unable to retrieve payment status.");
      })
      .finally(() => { if (alive) setIsLoading(false); });

    return () => { alive = false; };
  }, [bookingId]);

  const paymentState = useMemo(
    () => (payment ? getPaymentState(payment) : "pending"),
    [payment],
  );
  const isPaid   = PAID_STATES.has(paymentState);
  const isFailed = FAILED_STATES.has(paymentState);

  // ── 2. Auto-redirect countdown (success only) ─────────────────────────────
  useEffect(() => {
    if (!isPaid) return;

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          navigate("/tourist/bookings");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [isPaid, navigate]);

  // ── 3. Retry Stripe checkout ──────────────────────────────────────────────
  const retryCheckout = async () => {
    if (!bookingId || isRetrying) return;
    setIsRetrying(true);
    setErrorMessage("");
    try {
      sessionStorage.setItem("pendingPaymentBookingId", bookingId);
      const { checkoutUrl } = await paymentApi.createCheckoutSession(bookingId);
      paymentApi.redirectToCheckout(checkoutUrl);
    } catch (err) {
      setErrorMessage(err?.message ?? "Unable to restart secure checkout.");
      setIsRetrying(false);
    }
  };

  // ── 4. Build booking summary for PaymentDone ──────────────────────────────
  const bookingSummary = useMemo(() => {
    if (!payment) return undefined;
    const b = payment.booking ?? payment;

    const fmt = (dateStr) => {
      if (!dateStr) return "—";
      const d = new Date(dateStr);
      return isNaN(d.getTime())
        ? dateStr
        : d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
    };

    const start = b.startTime ?? b.slot?.startTime ?? "";
    const end   = b.endTime   ?? b.slot?.endTime   ?? "";

    return {
      reference:
        payment.reference ?? payment.transactionId ?? payment.paymentIntentId ?? bookingId,
      package: b.package ?? b.groupType ?? b.packageType ?? "—",
      when: [
        fmt(b.date ?? b.slot?.date ?? b.tourDate),
        start && end ? `${start} – ${end}` : start,
      ].filter(Boolean).join(" · ") || "—",
      where: b.meetingPoint ?? b.destination ?? b.location ?? "—",
      paid:
        payment.amount  != null ? `$${payment.amount}`  :
        b.totalPrice    != null ? `$${b.totalPrice}`    : "—",
    };
  }, [payment, bookingId]);

  const goToBookings = () => navigate("/tourist/bookings");

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <Shell>
        <Card>
          <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4 border-[#010170] border-t-transparent" />
          <h1 className="text-3xl font-bold text-[#010138]">Confirming payment</h1>
          <p className="mt-3 text-sm leading-6 text-[#65638a]">
            Please wait while we verify your checkout with Stripe.
          </p>
        </Card>
      </Shell>
    );
  }

  // ── No booking ID ─────────────────────────────────────────────────────────
  if (!bookingId) {
    return (
      <Shell>
        <Card>
          <h1 className="text-3xl font-bold text-[#ae1818]">Something went wrong</h1>
          <p className="mt-3 text-sm leading-6 text-[#65638a]">{errorMessage}</p>
          <Btn onClick={goToBookings} className="mt-8">View my bookings</Btn>
        </Card>
      </Shell>
    );
  }

  // ── Success ───────────────────────────────────────────────────────────────
  if (isPaid) {
    return (
      <Shell>
        <PaymentDone booking={bookingSummary} onDone={goToBookings} />
        <p className="text-center text-sm text-[#65638a]">
          Redirecting to your bookings in{" "}
          <span className="font-semibold text-[#010170]">{countdown}s</span>
          {" · "}
          <button onClick={goToBookings} className="text-[#010170] underline font-medium">
            Go now
          </button>
        </p>
      </Shell>
    );
  }

  // ── Failed / Cancelled ────────────────────────────────────────────────────
  if (isFailed) {
    return (
      <Shell>
        <PaymentFail onBack={() => navigate(-1)} onRetry={retryCheckout} />
        {errorMessage && (
          <p className="text-center text-sm text-[#ae1818]">{errorMessage}</p>
        )}
      </Shell>
    );
  }

  // ── Pending ───────────────────────────────────────────────────────────────
  return (
    <Shell>
      <Card>
        <h1 className="text-3xl font-bold text-[#010138]">Payment pending</h1>
        <p className="mt-3 text-sm leading-6 text-[#65638a]">
          We're still waiting for your payment provider to confirm this transaction.
        </p>
        <Btn onClick={() => window.location.reload()} className="mt-8">
          Check again
        </Btn>
      </Card>
    </Shell>
  );
}

// ── Tiny layout helpers ───────────────────────────────────────────────────────
function Shell({ children }) {
  return (
    <div className="min-h-screen bg-[#f7f7fb] text-[#010138]">
      <Navbar />
      <main className="max-w-[1728px] mx-auto px-8 lg:px-24 py-16 flex flex-col gap-6">
        {children}
      </main>
      <Footer />
    </div>
  );
}

function Card({ children }) {
  return (
    <section className="mx-auto w-full max-w-2xl rounded-3xl border border-[#dfdeed] bg-white p-8 text-center shadow-[0_18px_55px_rgba(1,1,56,0.12)] sm:p-10">
      {children}
    </section>
  );
}

function Btn({ children, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`h-11 px-8 rounded-2xl text-white text-base font-medium bg-gradient-to-r from-[#010170] to-[#5656a0] ${className}`}
    >
      {children}
    </button>
  );
}