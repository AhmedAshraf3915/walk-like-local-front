import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";

import Navbar from "@/components/home/Navbar.jsx";
import Footer from "@/components/home/Footer.jsx";
import PaymentDone from "@/features/bookingTour/components/PaymentDone";
import { paymentApi } from "@/features/payment/api/paymentApi";
import { apiClient } from "@/services/apiClient";

const REDIRECT_AFTER_SECONDS = 30;

/**
 * Landing page Stripe redirects back to after successful checkout.
 */
export default function CheckoutResult() {
  const { bookingId: routeBookingId } = useParams();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const urlStatus = searchParams.get("status"); 
  const navigate = useNavigate();
  const timerRef = useRef(null);

  const bookingId =
    routeBookingId ??
    searchParams.get("bookingId") ??
    searchParams.get("booking_id") ??
    sessionStorage.getItem("pendingPaymentBookingId") ??
    "";

  const [payment, setPayment] = useState(null);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [countdown, setCountdown] = useState(REDIRECT_AFTER_SECONDS);

  const isSuccessFlow = urlStatus === "success";
  const isFailedFlow = urlStatus === "failed";

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      setIsLoading(true);
      try {
        let currentBookingId = bookingId;
        
        if (sessionId && !currentBookingId) {
          try {
            const sessionData = await paymentApi.getSessionData(sessionId);
            currentBookingId = 
              sessionData?.metadata?.bookingId || 
              sessionData?.metadata?.booking_id || 
              sessionData?.bookingId ||
              sessionData?.client_reference_id;
            
            if (currentBookingId && isMounted) {
              sessionStorage.setItem("pendingPaymentBookingId", currentBookingId);
            }
          } catch (err) {
            console.warn("Could not get bookingId from session:", err);
          }
        }

        if (currentBookingId) {
          try {
            const paymentResult = await paymentApi.getPaymentStatus(currentBookingId);
            if (isMounted) setPayment(paymentResult);
          } catch (err) {
            console.warn("Payment API failed, ignoring since we trust Stripe redirect.", err);
          }

          try {
            const bookingResult = await apiClient.get(`/tourists/bookings/${currentBookingId}`).then(res => res.data);
            if (isMounted) setBookingDetails(bookingResult);
          } catch (err) {
            console.warn("Booking API failed, optional details will be hidden.", err);
          }
        }

        if (isMounted) {
          if (isFailedFlow) {
            setErrorMessage("Payment was cancelled or failed.");
          } else {
            setErrorMessage("");
          }
        }
      } catch (err) {
        console.error("Error in data fetching:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, [sessionId, bookingId, isFailedFlow]);

  const isPaid = useMemo(() => {
    if (isSuccessFlow) return true;
    if (isFailedFlow) return false;
    if (!payment) return false;
    
    const status = String(
      payment?.paymentState ??
      payment?.status ?? 
      payment?.data?.paymentState ??
      payment?.data?.status ?? 
      ""
    ).toLowerCase();
    
    return ["paid", "success", "completed", "succeeded"].includes(status);
  }, [payment, isSuccessFlow, isFailedFlow]);

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
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isLoading, isPaid, errorMessage, navigate]);

  const goToBookings = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    navigate("/tourist/bookings");
  };

  const retryPayment = async () => {
    if (!bookingId) return;
    setIsRetrying(true);
    try {
      const { checkoutUrl } = await paymentApi.createCheckoutSession(bookingId);
      if (checkoutUrl) window.location.href = checkoutUrl;
    } catch (err) {
      console.error("Retry payment failed:", err);
      setErrorMessage("Could not restart checkout session.");
    } finally {
      setIsRetrying(false);
    }
  };

  const bookingSummary = useMemo(() => {
    const rawBooking = bookingDetails?.data ?? bookingDetails ?? payment?.data ?? payment;
    const b = rawBooking?.booking ?? rawBooking;
    
    const tourObj = b?.tourId ?? b?.tour;
    const slotObj = b?.slotId ?? b?.slot;

    const fmt = (dateStr) => {
      if (!dateStr) return "";
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
    };

    const start = b?.startTime ?? slotObj?.startTime ?? "";
    const end = b?.endTime ?? slotObj?.endTime ?? "";
    const timeStr = start && end ? `${start} – ${end}` : start;

    const rawDate = b?.date ?? slotObj?.date ?? b?.tourDate ?? "";
    const dateStr = fmt(rawDate);

    let inferredPackage = b?.package ?? b?.groupType ?? b?.packageType ?? tourObj?.packageType ?? "";
    if (inferredPackage === "—") inferredPackage = "";

    const whereLocation = b?.meetingPoint ?? tourObj?.meetingPoint ?? b?.destination ?? tourObj?.destination ?? b?.location ?? "";
    const cost = payment?.amount ?? payment?.data?.amount ?? b?.totalPrice ?? b?.total ?? b?.price ?? "";

    return {
      reference: b?.reference ?? b?._id ?? b?.id ?? bookingId ?? "Confirmed",
      package: inferredPackage,
      when: [dateStr, timeStr].filter(Boolean).join(" · "),
      where: whereLocation === "—" ? "" : whereLocation,
      paid: cost ? (String(cost).startsWith('$') ? cost : `$${cost}`) : "",
    };
  }, [payment, bookingDetails, bookingId]);

  if (isLoading) {
    return (
      <Shell>
        <Card>
          <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4 border-[#010170] border-t-transparent" />
          <h1 className="text-3xl font-bold text-[#010138]">Confirming payment</h1>
          <p className="mt-3 text-sm leading-6 text-[#65638a]">Verifying your checkout session...</p>
        </Card>
      </Shell>
    );
  }

  if (errorMessage && !isPaid) {
    return (
      <Shell>
        <Card>
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <svg className="h-8 w-8 text-[#ae1818]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-[#ae1818]">Payment not completed</h1>
          <p className="mt-3 text-sm leading-6 text-[#65638a]">{errorMessage}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {bookingId && <Btn onClick={retryPayment} disabled={isRetrying}>{isRetrying ? "Processing..." : "Try again"}</Btn>}
            <Btn onClick={goToBookings} className="bg-[#65638a] hover:bg-[#4a4870]">View my bookings</Btn>
          </div>
        </Card>
      </Shell>
    );
  }

  return (
    <Shell>
      <PaymentDone booking={bookingSummary} onDone={goToBookings} />
      <p className="text-center text-sm text-[#65638a] mt-4">
        Redirecting to your bookings in{" "}
        <span className="font-semibold text-[#010170]">{countdown}s</span>
        {" · "}
        <button onClick={goToBookings} className="font-medium text-[#010170] underline ml-1">Go now</button>
      </p>
    </Shell>
  );
}

function Shell({ children }) {
  return (
    <div className="min-h-screen bg-[#f7f7fb] text-[#010138] flex flex-col justify-between">
      <Navbar />
      <main className="mx-auto flex-1 flex flex-col justify-center w-full max-w-[1728px] gap-6 px-8 py-16 lg:px-24">{children}</main>
      <Footer />
    </div>
  );
}

function Card({ children }) {
  return <section className="mx-auto w-full max-w-2xl rounded-3xl border border-[#dfdeed] bg-white p-8 text-center shadow-[0_18px_55px_rgba(1,1,56,0.12)] sm:p-10">{children}</section>;
}

function Btn({ children, onClick, className = "", disabled = false }) {
  return (
    <button onClick={onClick} disabled={disabled} className={`h-11 rounded-2xl px-8 text-base font-medium text-white transition-opacity ${disabled ? "cursor-not-allowed opacity-60" : "hover:opacity-90"} bg-gradient-to-r from-[#010170] to-[#5656a0] ${className}`}>
      {children}
    </button>
  );
}