import { ArrowRight, AlertCircle, Loader2, X } from 'lucide-react'
import BackButton from './BackButton'

export default function CheckoutReviewModal({ onClose, onBack, onContinue, summary, error, loading }) {
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
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-xs">
      <div className="bg-[var(--mediabackground,#f4f4f9)] rounded-2xl p-8 md:p-16 w-full max-w-[1000px] flex flex-col gap-12 my-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">

        {/* Close button — proper structural interactive alignment icon */}
        <button
          type="button"
          aria-label="Close checkout review"
          onClick={onClose}
          className="ml-auto grid h-10 w-10 place-items-center rounded-full bg-white text-[var(--maincolor,#010170)] shadow-sm hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col gap-4">
          <p className="font-bold text-2xl text-[var(--mediumfont,#65638a)] tracking-[4.8px] uppercase">Checkout</p>
          <p className="font-semibold text-3xl md:text-4xl text-[var(--maincolor,#010170)]">Review Details</p>
        </div>

        <div className="bg-white border border-[var(--lighttext,#dfdeed)] rounded-2xl shadow-[0px_8px_24px_0px_rgba(1,1,56,0.08)] px-8 md:px-24 py-12 md:py-16 w-full">
          <div className="flex flex-col gap-12 w-full">
            
            {/* Package metadata metrics block */}
            <div className="flex flex-col gap-6 w-full">
              <p className="font-semibold text-xl text-[var(--mediumfont,#65638a)] tracking-[3.6px] uppercase">Package</p>
              <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4 w-full">
                <div className="flex flex-col gap-2">
                  <p className="font-semibold text-2xl md:text-3xl text-[var(--maincolor,#010170)]">{s.package}</p>
                  <p className="text-lg md:text-xl text-[var(--mediumfont,#65638a)]">{s.guestsNote}</p>
                </div>
                <p className="text-xl md:text-2xl font-medium text-[var(--maincolor,#010170)]">{s.price}</p>
              </div>
              <hr className="border-[var(--lighttext,#dfdeed)]" />
            </div>

            

            {/* Customized Activities List */}
            {s.activities && s.activities.length > 0 && (
              <div className="flex flex-col gap-6 w-full">
                <p className="font-semibold text-xl text-[var(--mediumfont,#65638a)] tracking-[3.6px] uppercase">Itinerary Add-ons</p>
                <div className="flex flex-col gap-4 w-full">
                  {s.activities.map((act, index) => (
                    <div key={index} className="flex justify-between items-start gap-4 w-full text-lg md:text-xl">
                      <p className="text-[var(--maincolor,#010170)] font-medium max-w-[75%]">{act.name}</p>
                      <p className="text-[var(--mediumfont,#65638a)] whitespace-nowrap">{act.price}</p>
                    </div>
                  ))}
                </div>
                <hr className="border-[var(--lighttext,#dfdeed)]" />
              </div>
              
            )}

            

            {/* Time slot schedule rows */}
            <div className="flex flex-col gap-6 w-full">
              <p className="font-semibold text-xl text-[var(--mediumfont,#65638a)] tracking-[3.6px] uppercase">Schedule Slot</p>
              <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2 w-full text-lg md:text-xl">
                <p className="text-[var(--maincolor,#010170)] font-medium">{s.date}</p>
                <p className="text-[var(--mediumfont,#65638a)]">{s.time}</p>
              </div>
            </div>

            <hr className="border-[var(--lighttext,#dfdeed)]" />

            {/* Grand Total Footer Panel Display */}
            <div className="flex justify-between items-baseline w-full">
              <p className="font-semibold text-xl text-[var(--mediumfont,#65638a)] tracking-[3.6px] uppercase">Total Due</p>
              <div className="flex items-baseline gap-2 text-[var(--maincolor,#010170)] font-bold">
                <p className="text-3xl md:text-4xl">{s.total}</p>
                <p className="text-lg md:text-2xl uppercase font-medium">USD</p>
              </div>
            </div>

            {/* Server side error notices handling banner block */}
            {error && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-6 py-4">
                <AlertCircle className="size-6 shrink-0 text-red-500" />
                <p className="text-lg font-medium">
                  {/* This will show your friendly error message instead of the raw code */}
                  {error.includes("idDocument") ? "One or more guests are missing a required ID document." : error}
                </p>
              </div>
            )}

            {/* Form actions control buttons row */}
            <div className="flex items-center justify-between w-full pt-4">
              <BackButton onClick={onBack} />
              
              <button
                type="button"
                onClick={onContinue}
                disabled={loading}
                className="h-14 px-10 rounded-2xl bg-gradient-to-r from-[#010170] to-[#5656a0] hover:from-[#000059] hover:to-[#4a4a8f] shadow-[0px_4px_4px_0px_rgba(1,1,56,0.2)] text-white font-medium text-xl flex items-center gap-3 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    Opening Stripe Payment Hub... 
                    <Loader2 className="size-5 animate-spin" />
                  </>
                ) : (
                  <>
                    Continue to Checkout 
                    <ArrowRight className="size-5" />
                  </>
                )}
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
