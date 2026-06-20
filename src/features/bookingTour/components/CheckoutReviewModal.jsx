import { ArrowRight } from 'lucide-react'
import BackButton from './BackButton'

export default function CheckoutReviewModal({ onClose, onBack, onContinue, summary }) {
  const s = summary || {
    package: 'Private',
    guestsNote: 'Strictly 1 guest',
    price: '$320',
    activities: [
      { name: 'Guided Architectural Walk of Al-Muizz Street', price: '$85' },
      { name: 'El-Fishawy Café Cultural Immersion', price: 'Included' },
      { name: 'Guided Architectural Walk of Al-Muizz Street', price: '$85' },
    ],
    date: 'Tue . 14 Jun 2026',
    time: '09:00 - 12:00',
    total: '$445',
  }

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[var(--mediabackground)] rounded-2xl p-8 m-24 md:p-16 w-full max-w-[1000px] flex flex-col gap-12">
        <div className="flex flex-col gap-8 p-32">
          <p className="font-bold text-2xl text-[var(--mediumfont)] tracking-[4.8px] uppercase">Checkout</p>
          <p className="font-semibold text-3xl md:text-4xl text-[var(--maincolor)]">Review</p>
        </div>

        <div className="bg-white border border-[var(--lighttext)] rounded-2xl shadow-[0px_8px_24px_0px_rgba(1,1,56,0.08)] px-8 md:px-24 py-12 md:py-16 w-full">
          <div className="flex flex-col gap-12 w-full">
            <div className="flex flex-col gap-6 w-full">
              <p className="font-semibold text-xl text-[var(--mediumfont)] tracking-[3.6px] uppercase">Package</p>
              <div className="flex flex-col gap-4 w-full">
                <div className="flex items-end justify-between w-full text-[var(--maincolor)]">
                  <p className="font-medium text-2xl md:text-3xl">{s.package}</p>
                  <div className="flex items-end gap-2">
                    <p className="font-semibold text-2xl md:text-4xl">{s.price}</p>
                    <p className="text-lg md:text-2xl">USD</p>
                  </div>
                </div>
                <p className="text-xl md:text-2xl text-[var(--mediumfont)]">{s.guestsNote}</p>
              </div>
            </div>

            <hr className="border-[var(--lighttext)]" />

            <div className="flex flex-col gap-6 w-full">
              <p className="font-semibold text-xl text-[var(--mediumfont)] tracking-[3.6px] uppercase">Activities</p>
              <div className="flex flex-col gap-3 w-full">
                {s.activities.map((a, i) => (
                  <div key={i} className="flex items-center justify-between w-full text-xl md:text-2xl text-[var(--maincolor)]">
                    <p>{a.name}</p>
                    <p>{a.price}</p>
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-[var(--lighttext)]" />

            <div className="flex flex-col gap-6 w-full">
              <p className="font-semibold text-xl text-[var(--mediumfont)] tracking-[3.6px] uppercase">Time</p>
              <div className="flex items-center justify-between w-full font-medium text-2xl md:text-3xl text-[var(--maincolor)]">
                <p>{s.date}</p>
                <p>{s.time}</p>
              </div>
            </div>

            <hr className="border-[var(--lighttext)]" />

            <div className="flex flex-col gap-6">
              <p className="font-semibold text-xl text-[var(--mediumfont)] tracking-[3.6px] uppercase">Total</p>
              <div className="flex items-end gap-2 text-[var(--maincolor)]">
                <p className="font-semibold text-2xl md:text-4xl">{s.total}</p>
                <p className="text-lg md:text-2xl">USD</p>
              </div>
            </div>

            <hr className="border-[var(--lighttext)]" />

            <div className="flex items-center justify-between w-full">
              <BackButton onClick={onBack} />
              <button
                onClick={onContinue}
                className="h-14 px-10 rounded-2xl bg-gradient-to-r from-[#010170] to-[#5656a0] shadow-[0px_4px_4px_0px_rgba(1,1,56,0.2)] text-white font-medium text-xl flex items-center gap-2"
              >
                Continue <ArrowRight className="size-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
