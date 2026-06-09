import { Check, Lock } from "lucide-react";
import CreditCard from "@/features/guideVerification/components/CreditCard";

const PaymentStep = ({
  payment,
  isPaymentFormOpen,
  isPaymentSaved,
  onTogglePaymentForm,
  onPaymentChange,
  onSaveCard,
}) => {
  const cardholderName = payment.nameOnCard?.trim() || "YOUR NAME";
  const expiry = payment.expiryDate?.trim() || "MM/YY";

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
          <h3 className="mt-6 text-[46px] font-semibold text-[#101041]">
            Payout Method Added Successfully!
          </h3>
          <p className="mt-3 text-[20px] text-[#3b3a5f]">
            Card ending in 2222 is now connected to your Locale wallet.
          </p>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={onTogglePaymentForm}
            className="mx-auto mt-6 flex h-12 w-full max-w-[460px] items-center justify-center rounded-xl border border-[#20225a] bg-white text-base font-medium text-[#1c2058] transition-all duration-300 hover:bg-[#151a58] hover:text-white"
          >
            Add card +
          </button>

          {isPaymentFormOpen ? (
            <div className="mx-auto mt-8 w-full max-w-[560px] space-y-4 rounded-2xl border border-[#d8d9e8] bg-white p-5 text-left shadow-[0_12px_28px_rgba(18,21,76,0.08)]">
              <InputRow
                label="Name on card"
                value={payment.nameOnCard}
                onChange={(value) => onPaymentChange("nameOnCard", value)}
                placeholder="Sami Aibo"
              />
              <InputRow
                label="Card number"
                value={payment.cardNumber}
                onChange={(value) => onPaymentChange("cardNumber", value)}
                placeholder="123 456 789 321"
              />

              <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
                <InputRow
                  label="Expiry date"
                  value={payment.expiryDate}
                  onChange={(value) => onPaymentChange("expiryDate", value)}
                  placeholder="MM/YY"
                />
                <InputRow
                  label="CVV"
                  value={payment.cvv}
                  onChange={(value) => onPaymentChange("cvv", value)}
                  placeholder="993"
                />
              </div>

              <button
                type="button"
                onClick={onSaveCard}
                className="mt-3 h-12 w-full rounded-xl bg-[#18179f] text-[17px] font-medium text-white transition-all duration-300 hover:brightness-110"
              >
                Save Card
              </button>
            </div>
          ) : null}
        </>
      )}

      <p className="mt-4 flex items-center justify-center gap-2 text-sm text-[#2f2e55]">
        <Lock className="h-4 w-4" />
        Your payment details are encrypted end-to-end.
      </p>
    </div>
  );
};

const InputRow = ({ label, value, onChange, placeholder }) => {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-[#22214f]">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-md border border-[#bebdd2] px-3 text-sm text-[#161543] outline-none placeholder:text-[#b2b2c3] transition-colors focus:border-[#7b7aae]"
      />
    </label>
  );
};

export default PaymentStep;
