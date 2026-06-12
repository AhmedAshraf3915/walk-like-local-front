import { Check, Lock, AlertCircle } from "lucide-react";
import CreditCard from "@/features/payment/components/CreditCard";

const PaymentStep = ({
  payment,
  isPaymentFormOpen,
  isPaymentSaved,
  isSavingPayment,
  paymentError,
  onTogglePaymentForm,
  onPaymentChange,
  onSaveCard,
}) => {
  const cardholderName = payment.nameOnCard?.trim() || "YOUR NAME";
  const expiry = payment.expiryDate?.trim() || "MM/YY";
  const cardLastFourDigits = payment.cardNumber?.trim().slice(-4) || "2222";

  return (
    <div className="mx-auto max-w-[760px] px-2 sm:px-0">
      <CreditCard
        cardholderName={
          cardholderName === "YOUR NAME" ? "Jeffrey Richardson" : cardholderName
        }
        expiryDate={expiry === "MM/YY" ? "09/25" : expiry}
      />

      {isPaymentSaved ? (
        <div className="mt-12 text-center">
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-[#d8bb42]">
            <Check className="h-12 w-12 text-[#111042]" />
          </div>
          <h3 className="mt-6 text-[38px] font-semibold text-[#101041] sm:text-[46px]">
            Payout Method Added Successfully!
          </h3>
          <p className="mt-3 text-[17px] text-[#3b3a5f] sm:text-[20px]">
            Card ending in {cardLastFourDigits} is now connected to your Locale
            wallet.
          </p>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={onTogglePaymentForm}
            disabled={isSavingPayment}
            className="mx-auto mt-6 flex h-12 w-full max-w-[460px] items-center justify-center rounded-xl border border-[#20225a] bg-white text-base font-medium text-[#1c2058] transition-all duration-300 hover:bg-[#151a58] hover:text-white disabled:opacity-60"
          >
            {isPaymentFormOpen ? "Hide" : "Add card +"}
          </button>

          {isPaymentFormOpen ? (
            <div className="mx-auto mt-8 w-full max-w-[560px] space-y-4 rounded-2xl border border-[#d8d9e8] bg-white p-5 text-left shadow-[0_12px_28px_rgba(18,21,76,0.08)]">
              {paymentError && (
                <div className="flex gap-3 rounded-lg border border-[#eab2b2] bg-[#fff3f3] px-4 py-3 text-sm text-[#9f2626]">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span>{paymentError}</span>
                </div>
              )}

              <InputRow
                label="Name on card"
                value={payment.nameOnCard}
                onChange={(value) => onPaymentChange("nameOnCard", value)}
                placeholder="Sami Aibo"
                maxLength={50}
              />

              <InputRow
                label="Card number"
                value={payment.cardNumber}
                onChange={(value) => onPaymentChange("cardNumber", value)}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
              />

              <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
                <InputRow
                  label="Expiry date"
                  value={payment.expiryDate}
                  onChange={(value) => onPaymentChange("expiryDate", value)}
                  placeholder="MM/YY"
                  maxLength={5}
                />
                <InputRow
                  label="CVV"
                  value={payment.cvv}
                  onChange={(value) => onPaymentChange("cvv", value)}
                  placeholder="123"
                  maxLength={4}
                  type="password"
                />
              </div>

              <button
                type="button"
                onClick={onSaveCard}
                disabled={isSavingPayment}
                className="mt-3 h-12 w-full rounded-xl bg-[#18179f] text-[17px] font-medium text-white transition-all duration-300 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSavingPayment ? "Saving..." : "Save Card"}
              </button>
            </div>
          ) : null}
        </>
      )}

      <p className="mt-4 flex items-center justify-center gap-2 text-sm text-[#2f2e55]">
        <Lock className="h-4 w-4" />
        Your payment details are encrypted end-to-end and processed securely by
        Stripe.
      </p>
    </div>
  );
};

const InputRow = ({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  type = "text",
}) => {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-[#22214f]">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="h-11 w-full rounded-md border border-[#bebdd2] px-3 text-sm text-[#161543] outline-none placeholder:text-[#b2b2c3] transition-colors focus:border-[#7b7aae] focus:ring-1 focus:ring-[#7b7aae]"
      />
    </label>
  );
};

export default PaymentStep;
