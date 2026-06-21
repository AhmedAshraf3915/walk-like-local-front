import { useEffect, useState } from 'react'
import { Wallet as WalletIcon, Calendar, Loader2 } from 'lucide-react'
import { getWallet, getRefundHistory } from '../services/wallet.js'

export default function WalletCredits() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [balance, setBalance] = useState(0)
  const [discountTotal, setDiscountTotal] = useState(0)
  const [credits, setCredits] = useState([])
  const [refunds, setRefunds] = useState([])

  const extractErrorMessage = (err) =>
    err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Something went wrong'

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
          const w = walletRes.value?.data ?? walletRes.value ?? {}
          setBalance(w.balance ?? 0)
          setDiscountTotal(w.discountCreditsTotal ?? 0)
          setCredits(Array.isArray(w.credits) ? w.credits : [])
        } else {
          console.error(walletRes.reason)
        }

        if (refundsRes.status === 'fulfilled') {
          const list = refundsRes.value?.data ?? refundsRes.value ?? []
          setRefunds(Array.isArray(list) ? list : [])
        } else {
          console.error(refundsRes.reason)
        }
      } catch (err) {
        setError(extractErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-24">
        <Loader2 className="size-10 animate-spin text-[var(--maincolor)]" />
        <p className="text-xl text-[var(--mediumfont)]">Loading your wallet…</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-16 w-full">
      {error && (
        <div className="bg-[rgba(228,29,29,0.1)] border border-[rgba(228,29,29,0.5)] text-[rgba(174,24,24,0.9)] rounded-2xl px-6 py-4 text-lg">
          {error}
        </div>
      )}

      <div className="bg-gradient-to-r from-[var(--maincolor)] to-[var(--maintaxt)] rounded-2xl px-8 md:px-16 py-8 flex items-center justify-between gap-6">
        <div className="flex flex-col gap-4">
          <p className="text-[var(--lightblue)] font-semibold tracking-[1.2px] uppercase text-lg">Wallet balance</p>
          <div className="flex flex-col gap-2">
            <div className="flex items-end gap-2">
              <p className="text-white font-bold text-4xl">${balance.toFixed(2)}</p>
              <p className="text-[var(--lightblue)] text-lg">USD</p>
            </div>
            <p className="text-white font-semibold text-xl">
              {discountTotal > 0 ? `Includes $${discountTotal} in discount credits` : 'No discount credits yet'}
            </p>
          </div>
        </div>
        <div className="bg-[var(--secondarycolor)] rounded-full p-5 shrink-0">
          <WalletIcon className="size-9 text-[var(--maincolor)]" />
        </div>
      </div>

      <section className="border border-[var(--mediumfont)] rounded-2xl shadow-[0px_8px_24px_0px_rgba(1,1,56,0.08)] p-8 md:p-16 flex flex-col gap-12">
        <div className="flex flex-col gap-4">
          <h2 className="text-3xl md:text-4xl font-medium text-[var(--maintaxt)]">Discount credits</h2>
          <p className="text-xl md:text-2xl text-[var(--mediumfont)]">From guide cancellations</p>
        </div>
        {credits.length === 0 ? (
          // ✅ empty state
          <p className="text-xl text-[var(--mediumfont)] text-center py-10">
            No discount credits at the moment.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {credits.map((c) => (
              <div
                key={c.id ?? c._id}
                className="bg-[rgba(237,200,76,0.05)] border border-[var(--lightgold)] rounded-2xl px-6 md:px-10 py-6 flex flex-wrap items-center justify-between gap-4"
              >
                <div className="flex flex-col gap-3">
                  <p className="text-[var(--maincolor)] font-semibold text-lg md:text-xl">{c.label}</p>
                  <div className="flex flex-wrap items-center gap-6 md:gap-8">
                    <span className="text-[var(--maincolor)] font-semibold">{c.id ?? c._id}</span>
                    <span className="text-[var(--mediumfont)]">{c.expires}</span>
                  </div>
                </div>
                <p className="text-[var(--maincolor)] font-semibold text-2xl">{c.amount}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="border border-[var(--mediumfont)] rounded-2xl shadow-[0px_8px_24px_0px_rgba(1,1,56,0.08)] p-8 md:p-16 flex flex-col gap-12">
        <div className="flex flex-col gap-4">
          <h2 className="text-3xl md:text-4xl font-medium text-[var(--maintaxt)]">Refund history</h2>
          <p className="text-xl md:text-2xl text-[var(--mediumfont)]">A chronological log of refunds issued to you</p>
        </div>

        {refunds.length === 0 ? (
          <p className="text-xl text-[var(--mediumfont)] text-center py-10">
            No refunds yet.
          </p>
        ) : (
          <div className="border border-[var(--lighttext)] rounded-2xl overflow-hidden w-full">
            <div className="bg-[var(--mediabackground)] border-b border-[var(--lighttext)] px-7 py-6 hidden md:grid grid-cols-5 gap-4 text-xl font-medium text-[var(--maincolor)]">
              <span>Tour</span>
              <span>Date</span>
              <span>Amount</span>
              <span>Destination</span>
              <span>Status</span>
            </div>
            {refunds.map((r, i) => (
              <div
                key={r.id ?? r._id}
                className={`px-7 py-8 grid grid-cols-1 md:grid-cols-5 gap-2 md:gap-4 items-center ${
                  i !== refunds.length - 1 ? 'border-b border-[var(--lighttext)]' : ''
                }`}
              >
                <span className="text-[var(--maintaxt)] font-medium text-lg">{r.tour}</span>
                <span className="text-[var(--maincolor)] text-lg">{r.date}</span>
                <span className="text-[var(--maincolor)] text-lg">{r.amount}</span>
                <span className="text-[var(--maincolor)] text-lg">{r.destination}</span>
                <span className="inline-flex items-center gap-2 bg-[rgba(123,224,0,0.15)] text-[#396504] rounded-full px-6 py-2 w-fit">
                  <Calendar className="size-5" />
                  <span className="font-medium">Refunded</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}