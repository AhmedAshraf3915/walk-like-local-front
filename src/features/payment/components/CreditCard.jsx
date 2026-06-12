const CreditCard = ({ cardholderName, expiryDate }) => {
  return (
    <div className="group relative mx-auto h-[280px] w-full max-w-[460px] overflow-hidden rounded-[24px] bg-[linear-gradient(125deg,#12138f_0%,#252c9c_42%,#a89252_76%,#dcbc57_100%)] px-8 py-7 text-white shadow-[0_26px_56px_rgba(13,18,82,0.35)] transition-transform duration-300 hover:-translate-y-1.5">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(255,255,255,0.28),transparent_40%),radial-gradient(circle_at_83%_78%,rgba(255,255,255,0.13),transparent_38%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-35 [background-image:radial-gradient(circle_at_15%_25%,rgba(255,255,255,0.32)_0,transparent_28%),radial-gradient(circle_at_42%_60%,rgba(255,255,255,0.22)_0,transparent_24%),radial-gradient(circle_at_78%_28%,rgba(255,255,255,0.24)_0,transparent_31%),radial-gradient(circle_at_66%_74%,rgba(255,255,255,0.2)_0,transparent_27%)]" />
      <div className="pointer-events-none absolute -right-24 top-6 h-60 w-72 rotate-[12deg] bg-gradient-to-l from-white/30 via-white/10 to-transparent blur-xl" />

      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-center justify-between">
          <p className="text-base tracking-wide text-white/95">Credit card</p>
          <p className="text-base font-semibold tracking-wide text-white/95">
            MoneyBank
          </p>
        </div>

        <div className="mt-8 h-11 w-16 rounded-lg bg-gradient-to-br from-[#f2cf69] via-[#d8a83f] to-[#af7d16] shadow-[inset_0_1px_1px_rgba(255,255,255,0.45)]" />

        <p className="mt-9 font-mono text-[30px] tracking-[0.28em] text-white/95">
          **** **** **** 6789
        </p>

        <div className="mt-auto flex items-end justify-between pb-1">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/75">
              Card holder
            </p>
            <p className="mt-1 text-[14px] font-medium tracking-[0.06em] text-white/95">
              {cardholderName}
            </p>
          </div>

          <div className="text-right">
            <p className="text-[11px] uppercase tracking-[0.14em] text-white/75">
              Valid Till
            </p>
            <p className="mt-1 text-[14px] tracking-[0.08em] text-white/95">
              Month/Year {expiryDate}
            </p>
          </div>

          <span className="rounded-md bg-white px-2.5 py-1 text-xs font-semibold tracking-[0.16em] text-[#1a225c]">
            VISA
          </span>
        </div>
      </div>
    </div>
  );
};

export default CreditCard;
