import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import Navbar from "@/components/home/Navbar.jsx";
import PaymentDone from '../components/PaymentDone'
import PaymentFail from '../components/PaymentFail'
import { touristApi } from '../../touristVerification/api/touristApi.js'
import { Loader2 } from 'lucide-react'

const Footer = () => null

const POLL_INTERVAL_MS = 3000
const MAX_POLLS = 20 // ~1 minute timeout

export default function CheckoutResult() {
  const navigate = useNavigate()
  const { bookingId } = useParams() 
  const [searchParams] = useSearchParams()

  const resolvedBookingId = bookingId || searchParams.get('bookingId')

  const [status, setStatus] = useState('loading') // 'loading' | 'success' | 'fail'
  const [booking, setBooking] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!resolvedBookingId) {
      setError('Missing booking reference.')
      setStatus('fail')
      return
    }

    let cancelled = false
    let pollCount = 0
    let timeoutId

    const poll = async () => {
      try {
        const result = await touristApi.getPaymentStatus(resolvedBookingId)
        const paymentStatus = (result?.status || result?.paymentStatus || '').toLowerCase()

        if (cancelled) return

        if (paymentStatus === 'paid' || paymentStatus === 'success' || paymentStatus === 'completed') {
          setBooking(result?.booking ?? result)
          setStatus('success')
          return
        }

        if (paymentStatus === 'failed' || paymentStatus === 'declined' || paymentStatus === 'cancelled') {
          setStatus('fail')
          return
        }

        // still pending → keep polling until MAX_POLLS
        pollCount += 1
        if (pollCount >= MAX_POLLS) {
          setError('We could not confirm your payment in time. Please check your bookings.')
          setStatus('fail')
          return
        }
        timeoutId = setTimeout(poll, POLL_INTERVAL_MS)
      } catch (err) {
        if (cancelled) return
        console.error('Failed to fetch payment status:', err)
        setError(err?.message ?? 'Unable to confirm payment status.')
        setStatus('fail')
      }
    }

    poll()

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
  }, [resolvedBookingId])

  const handleRetry = () => {
    navigate(-1)
  }

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
      <main className="max-w-[1728px] mx-auto px-8 lg:px-24 py-16">
        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center gap-6 min-h-[40vh]">
            <Loader2 className="size-10 animate-spin text-[var(--maincolor)]" />
            <p className="text-xl text-[var(--mediumfont)]">Confirming your payment…</p>
          </div>
        )}

        {status === 'success' && (
          <PaymentDone booking={booking} onDone={() => navigate('/bookings')} />
        )}

        {status === 'fail' && (
          <PaymentFail onBack={() => navigate(-1)} onRetry={handleRetry} />
        )}

        {error && status === 'fail' && (
          <p className="text-center text-lg text-red-500 mt-6">{error}</p>
        )}
      </main>
      <Footer />
    </div>
  )
}
