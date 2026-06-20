import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from "@/components/home/Navbar.jsx";
import PaymentDone from '../components/PaymentDone'
import PaymentFail from '../components/PaymentFail'

// Replace with your own <Footer /> component import
const Footer = () => null

export default function CheckoutResult() {
  // In real usage, `status` comes from the payment provider response.
  const [status, setStatus] = useState('success') // 'success' | 'fail'
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />
      <main className="max-w-[1728px] mx-auto px-8 lg:px-24 py-16">
        {status === 'success' ? (
          <PaymentDone onDone={() => navigate('/bookings')} />
        ) : (
          <PaymentFail onBack={() => navigate(-1)} onRetry={() => setStatus('success')} />
        )}
      </main>
      <Footer />
    </div>
  )
}
