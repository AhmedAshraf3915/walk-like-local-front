import { useState } from 'react'
import { X, AlertTriangle, Ban, AlertCircle, Loader2 } from 'lucide-react'

const reasons = [
  "It's too expensive",
  "I couldn't figure out how to use it",
  "I don't need it anymore",
  'Other',
]

export default function CancelModal({ booking, onClose, onConfirm, error, confirming }) {
  const [selected, setSelected] = useState("I don't need it anymore")

  if (!booking) return null

  const within24h = booking.withinRefundWindow

  return (
    <div className="fixed inset-0 bg-black/35 z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--mediabackground)] rounded-2xl p-10 md:p-16 w-full max-w-[650px] flex flex-col items-end gap-6">
        <button onClick={onClose} className="flex items-center justify-center size-[60px] rounded-full bg-[rgba(204,204,226,0.3)] border border-[rgba(170,170,207,0.2)]">
          <X className="size-8 text-[var(--maintaxt)]" />
        </button>

        {within24h ? (
          <div className="w-full rounded-2xl border border-[var(--lightgold)] bg-[rgba(237,200,76,0.05)] px-6 py-4 flex items-center gap-4">
            <AlertTriangle className="size-7 text-[var(--darkgold)] shrink-0" />
            <p className="text-[var(--darkgold)] text-lg text-center flex-1">
              Cancelling within 24 hours of booking: You will receive a 70% refund
            </p>
          </div>
        ) : (
          <div className="w-full rounded-2xl border border-[rgba(228,29,29,0.8)] bg-[rgba(228,29,29,0.1)] px-6 py-4 flex items-center gap-4">
            <Ban className="size-7 text-[rgba(174,24,24,0.9)] shrink-0" />
            <p className="text-[rgba(174,24,24,0.9)] text-lg text-center flex-1">
              Cancelling after 24 hours of booking: This booking is non-refundable (0% refund)
            </p>
          </div>
        )}

        <div className="flex flex-col gap-8 w-full">
          <div className="flex flex-col gap-8 items-center w-full">
            <p className="font-semibold text-2xl text-[var(--maintaxt)] text-center">
              Please let us know why you are cancelling today:
            </p>
            <div className="flex flex-col gap-4 self-start">
              {reasons.map((reason) => (
                <label key={reason} className="flex items-center gap-4 cursor-pointer">
                  <span
                    className={`size-10 rounded-2xl border border-[var(--maincolor)] flex items-center justify-center shrink-0 ${
                      selected === reason ? 'bg-[var(--maincolor)]' : ''
                    }`}
                    onClick={() => setSelected(reason)}
                  />
                  <span className="text-xl text-[var(--maincolor)]" onClick={() => setSelected(reason)}>
                    {reason}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* ✅ error message inside the modal */}
          {error && (
            <div className="flex items-center gap-3 bg-[rgba(228,29,29,0.1)] border border-[rgba(228,29,29,0.5)] text-[rgba(174,24,24,0.9)] rounded-2xl px-6 py-4">
              <AlertCircle className="size-6 shrink-0" />
              <p className="text-lg">{error}</p>
            </div>
          )}

          <div className="flex gap-6 w-full">
            <button
              onClick={onClose}
              disabled={confirming}
              className="h-14 px-10 rounded-2xl bg-gradient-to-r from-[#010170] to-[#5656a0] shadow-[0px_4px_4px_0px_rgba(1,1,56,0.2)] text-white font-medium text-xl disabled:opacity-60"
            >
              Keep my plan
            </button>
            <button
              onClick={() => onConfirm(booking, selected)}
              disabled={confirming}
              className="h-14 px-10 rounded-2xl bg-red-50 text-red-600 border border-red-200 font-medium text-xl disabled:opacity-60 flex items-center gap-2"
            >
              {confirming && <Loader2 className="size-5 animate-spin" />}
              Confirm cancellation
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}