import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";

import Navbar from "@/components/home/Navbar.jsx";
import Footer from "@/components/home/Footer.jsx";
import PaymentDone from "@/features/bookingTour/components/PaymentDone";
import { paymentApi } from "@/features/payment/api/paymentApi";

const REDIRECT_AFTER_SECONDS = 60;

/**
 * Landing page Stripe redirects back to after successful checkout.
 */
export default function CheckoutResult() {
  const { bookingId: routeBookingId } = useParams();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const navigate = useNavigate();
  const timerRef = useRef(null);

  const bookingId =
    routeBookingId ??
    searchParams.get("bookingId") ??
    searchParams.get("booking_id") ??
    sessionStorage.getItem("pendingPaymentBookingId") ??
    "";

  const [payment, setPayment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [countdown, setCountdown] = useState(REDIRECT_AFTER_SECONDS);

  // 1. Fetch Payment Status
  useEffect(() => {
    let isMounted = true;
    
    const fetchPaymentStatus = async () => {
      setIsLoading(true);
      try {
        let currentBookingId = bookingId;
        
        if (sessionId && !currentBookingId) {
          try {
            const sessionData = await paymentApi.getSessionData(sessionId);
            // تأمين جلب الـ bookingId من الـ metadata أو الـ session مباشرة
            currentBookingId = 
              sessionData?.metadata?.bookingId || 
              sessionData?.metadata?.booking_id || 
              sessionData?.bookingId;
            
            if (currentBookingId && isMounted) {
              sessionStorage.setItem("pendingPaymentBookingId", currentBookingId);
            }
          } catch (err) {
            console.warn("Could not get bookingId from session:", err);
          }
        }

        if (!currentBookingId) {
          if (isMounted) {
            setErrorMessage("No booking reference found.");
            setIsLoading(false);
          }
          return;
        }

        const result = await paymentApi.getPaymentStatus(currentBookingId);
        
        if (isMounted) {
          setPayment(result);
          setErrorMessage("");
        }
      } catch (err) {
        console.error("Error fetching payment:", err);
        if (isMounted) {
          setErrorMessage(err?.response?.data?.message || err?.message || "Unable to retrieve payment status.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    if (sessionId || bookingId) {
      fetchPaymentStatus();
    } else {
      setErrorMessage("No payment session or booking reference found.");
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [sessionId, bookingId]);

  // 2. Check if Paid (Added Stripe's standard "succeeded" status)
  const isPaid = useMemo(() => {
    if (!payment) return false;
    // فحص الحالة من الكائن الرئيسي أو من داخل تفاصيل الدفع
    const status = String(
      payment?.status ?? 
      payment?.data?.status ?? 
      payment?.paymentStatus ?? 
      payment?.data?.paymentStatus ?? 
      ""
    ).toLowerCase();
    
    return ["paid", "success", "completed", "succeeded"].includes(status);
  }, [payment]);

  // 3. Countdown Timer and Auto Redirect Logic
  useEffect(() => {
    if (!isLoading && isPaid && !errorMessage) {
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
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isLoading, isPaid, errorMessage, navigate]);

  const goToBookings = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    navigate("/tourist/bookings");
  };

  // 4. Retry payment logic
  const retryPayment = async () => {
    if (!bookingId) return;
    setIsRetrying(true);
    try {
      const { checkoutUrl } = await paymentApi.createCheckoutSession(bookingId);
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      }
    } catch (err) {
      console.error("Retry payment failed:", err);
      setErrorMessage("Could not restart checkout session. Please try from your bookings page.");
    } finally {
      setIsRetrying(false);
    }
  };

  // 5. Build booking summary safely
  const bookingSummary = useMemo(() => {
    if (!payment) return undefined;
    
    // استخراج كائن الحجز والدفع بأي شكل متوقع من الـ API (سواء كان ملفوف داخل data أو مباشر)
    const rawData = payment?.data ?? payment;
    const b = rawData?.booking ?? rawData;

    const fmt = (dateStr) => {
      if (!dateStr) return "—";
      const d = new Date(dateStr);
      return isNaN(d.getTime())
        ? dateStr
        : d.toLocaleDateString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
          });
    };

    const start = b?.startTime ?? b?.slot?.startTime ?? "";
    const end = b?.endTime ?? b?.slot?.endTime ?? "";

    return {
      reference:
        rawData?.reference ?? 
        rawData?.transactionId ?? 
        rawData?.paymentIntentId ?? 
        rawData?.id ?? 
        bookingId,
      package: b?.package ?? b?.groupType ?? b?.packageType ?? "—",
      when: [
        fmt(b?.date ?? b?.slot?.date ?? b?.tourDate),
        start && end ? `${start} – ${end}` : start,
      ]
        .filter(Boolean)
        .join(" · ") || "—",
      where: b?.meetingPoint ?? b?.destination ?? b?.location ?? "—",
      paid:
        rawData?.amount != null
          ? `$${rawData.amount}`
          : b?.totalPrice != null
          ? `$${b.totalPrice}`
          : "—",
    };
  }, [payment, bookingId]);

  // ── Loading Screen ───────────────────────────────────────────────────────────
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

  // ── Error / Failed Screen ────────────────────────────────────────────────────
  if (errorMessage || !isPaid) {
    return (
      <Shell>
        <Card>
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <svg
              className="h-8 w-8 text-[#ae1818]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-[#ae1818]">
            {errorMessage || "Payment not completed"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#65638a]">
            {errorMessage
              ? "Please try again or contact support if the issue persists."
              : "We couldn't confirm your payment. Please try again."}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {bookingId && (
              <Btn onClick={retryPayment} disabled={isRetrying}>
                {isRetrying ? "Processing..." : "Try again"}
              </Btn>
            )}
            <Btn onClick={goToBookings} className="bg-[#65638a] hover:bg-[#4a4870]">
              View my bookings
            </Btn>
          </div>
        </Card>
      </Shell>
    );
  }

  // ── Success Screen ───────────────────────────────────────────────────────────
  return (
    <Shell>
      <PaymentDone booking={bookingSummary} onDone={goToBookings} />
      <p className="text-center text-sm text-[#65638a] mt-4">
        Redirecting to your bookings in{" "}
        <span className="font-semibold text-[#010170]">{countdown}s</span>
        {" · "}
        <button onClick={goToBookings} className="font-medium text-[#010170] underline ml-1">
          Go now
        </button>
      </p>
    </Shell>
  );
}

// ── Tiny layout helpers ───────────────────────────────────────────────────────
function Shell({ children }) {
  return (
    <div className="min-h-screen bg-[#f7f7fb] text-[#010138] flex flex-col justify-between">
      <Navbar />
      <main className="mx-auto flex-1 flex flex-col justify-center w-full max-w-[1728px] gap-6 px-8 py-16 lg:px-24">
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

function Btn({ children, onClick, className = "", disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`h-11 rounded-2xl px-8 text-base font-medium text-white transition-opacity ${
        disabled ? "cursor-not-allowed opacity-60" : "hover:opacity-90"
      } bg-gradient-to-r from-[#010170] to-[#5656a0] ${className}`}
    >
      {children}
    </button>
  );
}