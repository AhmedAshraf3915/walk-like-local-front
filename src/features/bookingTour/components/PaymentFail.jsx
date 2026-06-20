import { AlertCircle } from 'lucide-react'
import BackButton from './BackButton'

export default function PaymentFail({ onBack, onRetry }) {
  return (
    <div className="bg-[var(--mediabackground)] rounded-2xl p-16 w-full">
      <div className="bg-white border border-[var(--lighttext)] rounded-2xl shadow-[0px_8px_24px_0px_rgba(1,1,56,0.08)] px-12 md:px-24 py-16 w-full">
        <div className="flex flex-col gap-12 items-center w-full">
          <div className="flex flex-col gap-8 items-center w-full max-w-[890px]">
            <div className="bg-[rgba(228,29,29,0.1)] rounded-full size-[136px] flex items-center justify-center">
              <AlertCircle className="size-16 text-[rgba(174,24,24,0.9)]" />
            </div>
            <div className="flex flex-col gap-6 items-center text-center w-full">
              <p className="font-semibold text-3xl md:text-4xl text-[rgba(174,24,24,0.9)]">Payment Failed.</p>
              <p className="font-medium text-xl md:text-3xl text-[#a5a5b9]">
                Declined by bank. Please contact your bank or try another card
              </p>
            </div>
          </div>

          <hr className="border-[var(--lighttext)] w-full" />

          <div className="flex items-center justify-between w-full">
            <BackButton onClick={onBack} />
            <button
              onClick={onRetry}
              className="h-14 px-12 rounded-2xl bg-gradient-to-r from-[#010170] to-[#5656a0] shadow-[0px_4px_4px_0px_rgba(1,1,56,0.2)] text-white font-medium text-xl"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
