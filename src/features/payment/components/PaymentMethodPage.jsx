import PaymentStep from "@/features/payment/components/PaymentStep";

const PaymentMethodPage = ({
  payment,
  isPaymentFormOpen,
  isPaymentSaved,
  isSavingPayment,
  paymentError,
  onTogglePaymentForm,
  onPaymentChange,
  onSaveCard,
}) => {
  return (
    <section className="mx-auto max-w-[1200px] text-center">
      <p className="text-xs font-semibold tracking-[0.28em] text-[#21204a]">
        STEP 4 OF 4
      </p>
      <h1 className="mt-3 text-[38px] font-bold leading-tight text-[#111042] sm:text-[48px]">
        Add Payment Method
      </h1>
      <p className="mx-auto mt-3 max-w-3xl text-[17px] leading-8 text-[#3a3a61] sm:text-[20px]">
        Add a card to receive your traveler earnings. You can do this later.
      </p>

      <div className="mx-auto mt-10 max-w-[760px] pb-4">
        <PaymentStep
          payment={payment}
          isPaymentFormOpen={isPaymentFormOpen}
          isPaymentSaved={isPaymentSaved}
          isSavingPayment={isSavingPayment}
          paymentError={paymentError}
          onTogglePaymentForm={onTogglePaymentForm}
          onPaymentChange={onPaymentChange}
          onSaveCard={onSaveCard}
        />
      </div>
    </section>
  );
};

export default PaymentMethodPage;
