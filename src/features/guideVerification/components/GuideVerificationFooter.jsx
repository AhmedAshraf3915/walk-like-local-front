import { ArrowLeft, ArrowRight } from "lucide-react";

/**
 * Sticky bottom footer shared across all guide-verification steps.
 * Stateless — all interaction is handled by parent callbacks.
 */
const GuideVerificationFooter = ({
  step,
  continueLabel,
  isContinueDisabled,
  canSkipFromFooter,
  onBack,
  onContinue,
  onSkip,
}) => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 border-t border-[#d8d7e8] bg-white/98 backdrop-blur-sm">
      <div className="mx-auto flex h-20 max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-10">
        <button
          type="button"
          onClick={onBack}
          className={`inline-flex items-center gap-2 text-[17px] transition-colors ${
            step === 1
              ? "text-[#bfbfcf]"
              : "text-[#202050] hover:text-[#12135b]"
          }`}
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onSkip}
            disabled={!canSkipFromFooter}
            className="text-[17px] text-[#1a1949] transition-colors hover:text-[#11135a] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Skip for now
          </button>
          <button
            type="button"
            disabled={isContinueDisabled}
            onClick={onContinue}
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#18179f] px-6 text-sm font-medium text-white transition-all duration-300 hover:brightness-110 disabled:opacity-70"
          >
            {continueLabel} <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default GuideVerificationFooter;
