import { Wallet as WalletIcon, Calendar } from 'lucide-react'

const credits = [
  { id: 'CD438', label: 'Complimentary credit · Guide cancellation', expires: 'Expires Aug 12, 2026', amount: '+ $10' },
]

const refunds = [
  { id: 1, tour: 'White Desert Sunset Drive', date: 'Mar 19, 2026', amount: '$70', destination: 'Wallet credit' },
  { id: 2, tour: 'Cairo Food Trail', date: 'Feb 02, 2026', amount: '$22', destination: 'Original card' },
]

export default function Wallet() {
  return (
    <div className="flex flex-col gap-16 w-full">
      <div className="bg-gradient-to-r from-[var(--maincolor)] to-[var(--maintaxt)] rounded-2xl px-8 md:px-16 py-8 flex items-center justify-between gap-6">
        <div className="flex flex-col gap-4">
          <p className="text-[var(--lightblue)] font-semibold tracking-[1.2px] uppercase text-lg">Wallet balance</p>
          <div className="flex flex-col gap-2">
            <div className="flex items-end gap-2">
              <p className="text-white font-bold text-4xl">$30.50</p>
              <p className="text-[var(--lightblue)] text-lg">USD</p>
            </div>
            <p className="text-white font-semibold text-xl">Includes $35 in discount credits</p>
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
        <div className="flex flex-col gap-4">
          {credits.map((c) => (
            <div
              key={c.id}
              className="bg-[rgba(237,200,76,0.05)] border border-[var(--lightgold)] rounded-2xl px-6 md:px-10 py-6 flex flex-wrap items-center justify-between gap-4"
            >
              <div className="flex flex-col gap-3">
                <p className="text-[var(--maincolor)] font-semibold text-lg md:text-xl">{c.label}</p>
                <div className="flex flex-wrap items-center gap-6 md:gap-8">
                  <span className="text-[var(--maincolor)] font-semibold">{c.id}</span>
                  <span className="text-[var(--mediumfont)]">{c.expires}</span>
                </div>
              </div>
              <p className="text-[var(--maincolor)] font-semibold text-2xl">{c.amount}</p>
            </div>
          ))}
        </div>
      </section>

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
          {refunds.map((r, i) => (
            <div
              key={r.id}
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
      </section>
    </div>
  )
}
