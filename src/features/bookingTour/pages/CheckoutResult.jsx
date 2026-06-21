import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import Navbar from "@/components/home/Navbar.jsx";
import Footer from "@/components/home/Footer.jsx";
import { paymentApi } from "@/features/payment/api/paymentApi";

const PAID_STATES = new Set(["paid", "succeeded", "success", "completed"]);
const FAILED_STATES = new Set(["failed", "cancelled", "canceled", "expired"]);

const getPaymentState = (payload) => {
  const payment = payload?.payment ?? payload?.data?.payment ?? payload ?? {};

  return String(
    payment?.status ??
      payload?.paymentStatus ??
      payload?.booking?.paymentStatus ??
      "pending",
  ).toLowerCase();
};

const getPaymentReference = (payload, bookingId) => {
  const payment = payload?.payment ?? payload ?? {};

  return (
    payment?.reference ??
    payment?.transactionId ??
    payment?.paymentIntentId ??
    bookingId
  );
};

function StatusCard({ icon, title, description, tone = "pending", children }) {
  const tones = {
    success: {
      icon: "bg-[#eaf7df] text-[#396504]",
      title: "text-[#396504]",
    },
    error: {
      icon: "bg-[#fff0f0] text-[#ae1818]",
      title: "text-[#ae1818]",
    },
    pending: {
      icon: "bg-[#efeff9] text-[#010170]",
      title: "text-[#010138]",
    },
  };
  const style = tones[tone];

  return (
    <section className="mx-auto w-full max-w-2xl rounded-3xl border border-[#dfdeed] bg-white p-6 text-center shadow-[0_18px_55px_rgba(1,1,56,0.12)] sm:p-10">
      <div className={`mx-auto grid h-20 w-20 place-items-center rounded-full ${style.icon}`}>
        {icon}
      </div>
      <h1 className={`mt-6 text-3xl font-bold ${style.title}`}>{title}</h1>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#65638a]">
        {description}
      </p>
      {children ? <div className="mt-8">{children}</div> : null}
    </section>
  );
}

export default function CheckoutResult() {
  const { bookingId: routeBookingId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const storedBookingId =
    typeof window === "undefined"
      ? ""
      : sessionStorage.getItem("pendingPaymentBookingId") ?? "";
  const bookingId =
    routeBookingId ??
    searchParams.get("bookingId") ??
    searchParams.get("booking_id") ??
    storedBookingId;
  const missingBookingMessage =
    "The payment return did not include a booking reference.";

  const [payment, setPayment] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(bookingId));
  const [isRetrying, setIsRetrying] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    bookingId ? "" : missingBookingMessage,
  );
  const [reloadKey, setReloadKey] = useState(0);

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

        if (PAID_STATES.has(getPaymentState(result))) {
          sessionStorage.removeItem("pendingPaymentBookingId");
        }
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
  }, [bookingId, reloadKey]);

  const checkAgain = () => {
    setIsLoading(true);
    setErrorMessage("");
    setReloadKey((current) => current + 1);
  };

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

  const paymentState = payment ? getPaymentState(payment) : "pending";
  const isPaid = PAID_STATES.has(paymentState);
  const isFailed = FAILED_STATES.has(paymentState);
  const isRefunded = paymentState === "refunded";

  return (
    <div className="min-h-screen bg-[#f7f7fb] text-[#010138]">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="mb-8 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#65638a]">
          <ShieldCheck className="h-4 w-4 text-[#EDC84C]" />
          Secure Stripe checkout
        </div>

        {isLoading ? (
          <StatusCard
            icon={<RefreshCw className="h-9 w-9 animate-spin" />}
            title="Checking your payment"
            description="We are confirming the latest payment state with the server."
          />
        ) : null}

        {!isLoading && isPaid ? (
          <StatusCard
            tone="success"
            icon={<CheckCircle2 className="h-10 w-10" />}
            title="Payment confirmed"
            description={`Your booking is confirmed. Reference: ${getPaymentReference(payment, bookingId)}`}
          >
            <button
              type="button"
              onClick={() => navigate("/tourist/bookings")}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-[#010170] to-[#5656A0] px-6 text-sm font-semibold text-white"
            >
              View my bookings <ArrowRight className="h-4 w-4" />
            </button>
          </StatusCard>
        ) : null}

        {!isLoading && !isPaid && !isFailed && !isRefunded && !errorMessage ? (
          <StatusCard
            icon={<Clock3 className="h-10 w-10" />}
            title="Payment is still pending"
            description="Stripe has not confirmed the payment yet. This can take a few seconds after checkout."
          >
            <button
              type="button"
              onClick={checkAgain}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#010170] px-6 text-sm font-semibold text-white"
            >
              <RefreshCw className="h-4 w-4" /> Check again
            </button>
          </StatusCard>
        ) : null}

        {!isLoading && (isFailed || errorMessage) ? (
          <StatusCard
            tone="error"
            icon={<AlertCircle className="h-10 w-10" />}
            title="Payment was not completed"
            description={
              errorMessage ||
              "Stripe could not complete this payment. Your pending booking can be used to try again."
            }
          >
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                to="/tours"
                className="inline-flex h-11 items-center rounded-xl border border-[#d5d4ea] px-5 text-sm font-semibold text-[#353572]"
              >
                Back to tours
              </Link>
              {bookingId ? (
                <button
                  type="button"
                  onClick={retryCheckout}
                  disabled={isRetrying}
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#010170] px-6 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {isRetrying ? "Opening Stripe..." : "Try payment again"}
                </button>
              ) : null}
            </div>
          </StatusCard>
        ) : null}

        {!isLoading && isRefunded ? (
          <StatusCard
            icon={<RefreshCw className="h-10 w-10" />}
            title="Payment refunded"
            description="This payment has been refunded to its original payment method."
          >
            <Link
              to="/tourist/bookings"
              className="inline-flex h-11 items-center rounded-xl bg-[#010170] px-6 text-sm font-semibold text-white"
            >
              View booking history
            </Link>
          </StatusCard>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}
