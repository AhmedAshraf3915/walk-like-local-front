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
    <div className="min-h-screen bg-[var(--background)]">
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