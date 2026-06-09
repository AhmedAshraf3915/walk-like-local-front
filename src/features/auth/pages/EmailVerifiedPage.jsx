import { useEffect } from "react";
import { ArrowRight, Check, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useCountdown from "../../../hooks/useCountdown";
import VerificationGlassShell from "../components/VerificationGlassShell";
import useAuth from "@/contexts/useAuth";

const EmailVerifiedPage = () => {
  const navigate = useNavigate();
  const { userRole, isAuthenticated } = useAuth();
  const { secondsLeft, isComplete } = useCountdown(5);
  const nextRoute = userRole === "guide" ? "/guide-verification" : "/test";

  useEffect(() => {
    if (!isComplete) {
      return;
    }

    if (!isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }

    navigate(nextRoute, { replace: true });
  }, [isComplete, isAuthenticated, navigate, nextRoute]);

  const handleGoToLogin = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    navigate(nextRoute);
  };

  return (
    <VerificationGlassShell cardClassName="sm:py-16">
      <section
        className="flex flex-col items-center text-center"
        aria-labelledby="email-verified-title"
      >
        <div className="flex h-32.5 w-32.5 items-center justify-center rounded-[20px] bg-linear-to-b from-[#010170] to-[#5656a0] shadow-[0_18px_42px_rgba(1,1,112,0.28)]">
          <div className="relative">
            <Mail className="h-12 w-12 text-[#d0a817]" strokeWidth={2.4} />
            <Check
              className="absolute -right-4 bottom-0 h-6 w-6 text-[#d0a817]"
              strokeWidth={3}
              aria-hidden="true"
            />
          </div>
        </div>

        <h1
          id="email-verified-title"
          className="mt-9 text-[clamp(2.2rem,4vw,2.75rem)] font-extrabold leading-none text-[#010170]"
        >
          Verified!
        </h1>

        <p className="sr-only" aria-live="polite">
          Redirecting in {secondsLeft} second
          {secondsLeft === 1 ? "" : "s"}.
        </p>

        <button
          type="button"
          onClick={handleGoToLogin}
          className="mt-12 inline-flex h-11 w-full items-center justify-center gap-3 rounded-md bg-linear-to-r from-[#010170] to-[#5656a0] px-4 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(1,1,112,0.24)] transition hover:from-[#00005a] hover:to-[#454596] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#010170]/40 sm:max-w-110"
          aria-label="Go to Login"
        >
          I&apos;ve verified my email
          <ArrowRight className="h-6 w-6" aria-hidden="true" />
        </button>
      </section>
    </VerificationGlassShell>
  );
};

export default EmailVerifiedPage;
