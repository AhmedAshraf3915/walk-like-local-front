import { useState } from "react";
import { ArrowRight, Mail, Send } from "lucide-react";
import FormError from "../../../components/shared/FormError";

const CheckEmailNotice = ({
  initialEmail,
  loading,
  apiError,
  successMessage,
  onResend,
}) => {
  const [email, setEmail] = useState(initialEmail ?? "");
  const displayEmail = email || "your email address";

  const handleResend = async () => {
    const sentEmail = await onResend(email);

    if (sentEmail) {
      setEmail(sentEmail);
    }
  };

  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-32.5 w-32.5 items-center justify-center rounded-[20px] bg-linear-to-b from-[#010170] to-[#5656a0] shadow-[0_18px_42px_rgba(1,1,112,0.28)]">
        <Mail className="h-12 w-12 text-[#d0a817]" strokeWidth={2.4} />
      </div>

      <h1 className="mt-8 text-[clamp(2rem,4vw,2.6rem)] font-extrabold leading-none text-[#010170]">
        Check your inbox
      </h1>

      <div className="mt-6 max-w-105 text-[0.98rem] leading-tight text-white/78">
        <p>
          We sent a verification link to{" "}
          <span className="font-bold text-[#010170]">{displayEmail}</span> Tap
          the link to activate your account.
        </p>
      </div>

      <div className="mt-20 flex w-full flex-col gap-6 sm:mt-21">
        <button
          type="button"
          disabled
          className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-3 rounded-md bg-white/46 px-4 text-sm font-semibold text-white/74 shadow-sm"
        >
          I&apos;ve verified my email
          <ArrowRight className="h-6 w-6" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={handleResend}
          disabled={loading}
          className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-[#010170]/55 bg-transparent px-4 text-sm font-bold text-[#010170] transition hover:bg-white/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#010170]/40 disabled:opacity-60"
        >
          {loading ? "Sending..." : "Resend verification email"}
          <Send className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {apiError ? (
        <div className="mt-5 w-full text-left">
          <FormError message={apiError} />
        </div>
      ) : null}

      {successMessage ? (
        <p className="mt-5 w-full rounded-xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </p>
      ) : null}
    </div>
  );
};

export default CheckEmailNotice;
