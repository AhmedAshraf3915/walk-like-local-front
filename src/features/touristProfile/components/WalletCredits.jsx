import { useState, useEffect } from 'react'
import { Wallet as WalletIcon, Calendar, Loader2 } from 'lucide-react'
import { getWallet, getRefundHistory } from '../../bookingTour/services/wallet.js'

export default function Wallet() {
  const [wallet, setWallet] = useState(null)
  const [refunds, setRefunds] = useState([])
  const [credits, setCredits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const extractData = (res) => res?.data?.data ?? res?.data ?? res

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const [walletRes, refundsRes] = await Promise.allSettled([
          getWallet(),
          getRefundHistory(),
        ])

        if (walletRes.status === 'fulfilled') {
          const w = extractData(walletRes.value)
          setWallet(w)
          if (w.discountCredits) setCredits(Array.isArray(w.discountCredits) ? w.discountCredits : [])
        }

        if (refundsRes.status === 'fulfilled') {
          const r = extractData(refundsRes.value)
          setRefunds(Array.isArray(r) ? r : Array.isArray(r?.refunds) ? r.refunds : [])
        }
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || 'Failed to load wallet data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-[var(--maincolor)]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-500 text-lg">{error}</div>
    )
  }

  const balance = wallet?.balance ?? 0
  const creditTotal = wallet?.totalDiscountCredits ?? credits.reduce((sum, c) => sum + (c.amount || c.value || 0), 0)

  return (
    <div className="flex flex-col gap-16 w-full">
      <div className="bg-gradient-to-r from-[var(--maincolor)] to-[var(--maintaxt)] rounded-2xl px-8 md:px-16 py-8 flex items-center justify-between gap-6">
        <div className="flex flex-col gap-4">
          <p className="text-[var(--lightblue)] font-semibold tracking-[1.2px] uppercase text-lg">Wallet balance</p>
          <div className="flex flex-col gap-2">
            <div className="flex items-end gap-2">
              <p className="text-white font-bold text-4xl">${Number(balance).toFixed(2)}</p>
              <p className="text-[var(--lightblue)] text-lg">USD</p>
            </div>
            {creditTotal > 0 && (
              <p className="text-white font-semibold text-xl">Includes ${Number(creditTotal).toFixed(2)} in discount credits</p>
            )}
          </div>
        </div>
        <div className="bg-[var(--secondarycolor)] rounded-full p-5 shrink-0">
          <WalletIcon className="size-9 text-[var(--maincolor)]" />
        </div>
      </div>

      {credits.length > 0 && (
        <section className="border border-[var(--mediumfont)] rounded-2xl shadow-[0px_8px_24px_0px_rgba(1,1,56,0.08)] p-8 md:p-16 flex flex-col gap-12">
          <div className="flex flex-col gap-4">
            <h2 className="text-3xl md:text-4xl font-medium text-[var(--maintaxt)]">Discount credits</h2>
            <p className="text-xl md:text-2xl text-[var(--mediumfont)]">From guide cancellations</p>
          </div>
          <div className="flex flex-col gap-4">
            {credits.map((c, i) => {
              const id = c.id || c._id || `credit-${i}`
              const label = c.label || c.description || 'Complimentary credit'
              const expires = c.expires || c.expiryDate || c.expiration
              const amount = c.amount || c.value || 0
              return (
                <div
                  key={id}
                  className="bg-[rgba(237,200,76,0.05)] border border-[var(--lightgold)] rounded-2xl px-6 md:px-10 py-6 flex flex-wrap items-center justify-between gap-4"
                >
                  <div className="flex flex-col gap-3">
                    <p className="text-[var(--maincolor)] font-semibold text-lg md:text-xl">{label}</p>
                    {(id || expires) && (
                      <div className="flex flex-wrap items-center gap-6 md:gap-8">
                        {id && <span className="text-[var(--maincolor)] font-semibold">{id}</span>}
                        {expires && <span className="text-[var(--mediumfont)]">{expires}</span>}
                      </div>
                    )}
                  </div>
                  <p className="text-[var(--maincolor)] font-semibold text-2xl">+ ${Number(amount).toFixed(2)}</p>
                </div>
              )
            })}
          </div>
        </section>
      )}

      <section className="border border-[var(--mediumfont)] rounded-2xl shadow-[0px_8px_24px_0px_rgba(1,1,56,0.08)] p-8 md:p-16 flex flex-col gap-12">
        <div className="flex flex-col gap-4">
          <h2 className="text-3xl md:text-4xl font-medium text-[var(--maintaxt)]">Refund history</h2>
          <p className="text-xl md:text-2xl text-[var(--mediumfont)]">A chronological log of refunds issued to you</p>
        </div>
        <div className="border border-[var(--lighttext)] rounded-2xl overflow-hidden w-full">
          <div className="bg-[var(--mediabackground)] border-b border-[var(--lighttext)] px-7 py-6 hidden md:grid grid-cols-5 gap-4 text-xl font-medium text-[var(--maincolor)]">
            <span>Tour</span>
            <span>Date</span>
            <span>Amount</span>
            <span>Destination</span>
            <span>Status</span>
          </div>
          {refunds.length === 0 ? (
            <div className="px-7 py-8 text-center text-lg text-[var(--mediumfont)]">No refunds yet.</div>
          ) : (
            refunds.map((r, i) => {
              const id = r.id || r._id || i
              const tourTitle = r.tour?.title || r.tourName || r.tour || r.booking?.tour?.title || 'Tour'
              const date = r.date || r.createdAt ? new Date(r.date || r.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : ''
              const amount = r.amount ? `$${Number(r.amount).toFixed(2)}` : ''
              const destination = r.destination || r.refundDestination || r.paymentMethod || (r.toWallet ? 'Wallet credit' : 'Original card') || ''
              const status = r.status || 'Refunded'
              return (
                <div
                  key={id}
                  className={`px-7 py-8 grid grid-cols-1 md:grid-cols-5 gap-2 md:gap-4 items-center ${
                    i !== refunds.length - 1 ? 'border-b border-[var(--lighttext)]' : ''
                  }`}
                >
                  <span className="text-[var(--maintaxt)] font-medium text-lg">{tourTitle}</span>
                  <span className="text-[var(--maincolor)] text-lg">{date}</span>
                  <span className="text-[var(--maincolor)] text-lg">{amount}</span>
                  <span className="text-[var(--maincolor)] text-lg">{destination}</span>
                  <span className="inline-flex items-center gap-2 bg-[rgba(123,224,0,0.15)] text-[#396504] rounded-full px-6 py-2 w-fit">
                    <Calendar className="size-5" />
                    <span className="font-medium">{status}</span>
                  </span>
                </div>
              )
            })
          )}
        </div>
      </section>
    </div>
  )
}
