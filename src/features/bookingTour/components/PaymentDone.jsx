import { Check } from 'lucide-react'

export default function PaymentDone({ onDone, booking }) {
  const b = booking || {
    package: 'Private',
    when: 'Thu · Jun 18 · 09:00',
    where: 'Cairo, Egypt',
    paid: '$445',
    reference: 'AEG-Y3H637',
  }

  return (
    <div className="bg-[var(--mediabackground)] rounded-2xl p-16 w-full">
      <div className="bg-white border border-[var(--lighttext)] rounded-2xl shadow-[0px_8px_24px_0px_rgba(1,1,56,0.08)] px-12 md:px-24 py-16 w-full">
        <div className="flex flex-col gap-12 items-end w-full">
          <div className="flex flex-col gap-10 items-center w-full">
            <div className="flex flex-col gap-8 items-center w-full max-w-[323px]">
              <div className="bg-[rgba(123,224,0,0.15)] rounded-full size-[136px] flex items-center justify-center">
                <Check className="size-12 text-[var(--darksuccess,#396504)]" />
              </div>
              <div className="flex flex-col items-center text-center w-full">
                <p className="font-semibold text-3xl md:text-4xl text-[var(--darksuccess,#396504)]">
                  You&apos;re confirmed.
                </p>
                <p className="font-medium text-xl md:text-3xl text-[rgba(57,101,4,0.7)]">
                  Reference {b.reference}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-6 w-full text-xl md:text-3xl text-[var(--maincolor)]">
              <div className="flex items-center justify-between w-full">
                <p>Package</p>
                <p className="font-semibold">{b.package}</p>
              </div>
              <div className="flex items-center justify-between w-full">
                <p>When</p>
                <p>{b.when}</p>
              </div>
              <div className="flex items-center justify-between w-full">
                <p>Where</p>
                <p>{b.where}</p>
              </div>
              <div className="flex items-center justify-between w-full">
                <p>Paid</p>
                <p className="font-semibold">{b.paid}</p>
              </div>
            </div>
          </div>
          <hr className="border-[var(--lighttext)] w-full" />

          <button
            onClick={onDone}
            className="h-14 px-12 rounded-2xl bg-gradient-to-r from-[#010170] to-[#5656a0] shadow-[0px_4px_4px_0px_rgba(1,1,56,0.2)] text-white font-medium text-xl"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
