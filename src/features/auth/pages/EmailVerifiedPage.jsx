import { useNavigate } from "react-router-dom";
import { Check, Home, LogIn, Compass, MapPin } from "lucide-react";
import VerificationGlassShell from "../components/VerificationGlassShell";
import Button from "../../../components/shared/Button";

const EmailVerifiedPage = () => {
  const navigate = useNavigate();

  const handleGoToLogin = () => {
    navigate("/login");
  };

  const handleGoToHome = () => {
    navigate("/");
  };

  return (
    <VerificationGlassShell cardClassName="sm:py-12">
      <section
        className="flex flex-col items-center text-center"
        aria-labelledby="email-verified-title"
      >
        <div className="relative flex h-36 w-36 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500/10 opacity-75 duration-1000" />

          <div className="absolute inset-0 animate-[spin_20s_linear_infinite] rounded-full border-2 border-dashed border-[#010170]/10" />

          <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-tr from-[#010170] to-[#5656a0] shadow-lg">
            <MapPin
              className="h-12 w-12 text-[#d0a817] animate-bounce"
              strokeWidth={2}
            />
            <Compass
              className="absolute inset-2 h-24 w-24 text-white/5 opacity-20 animate-spin"
              strokeWidth={1}
            />

            <div className="absolute -bottom-1 -right-1 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white/95 bg-emerald-500 shadow-md">
              <Check className="h-5 w-5 text-white" strokeWidth={3} />
            </div>
          </div>
        </div>

        <h1
          id="email-verified-title"
          className="mt-8 text-3xl font-extrabold tracking-tight text-[#010170] sm:text-4xl"
        >
          Email Verified Successfully
        </h1>

        <p className="mt-4 max-w-md text-base leading-relaxed text-slate-700">
          Pack your bags! Your email has been verified. Welcome to{" "}
          <span className="font-semibold text-[#010170]">Walk Like Local</span>.
          Get ready to connect with authentic local guides, discover hidden
          gems, and experience destinations like a true local.
        </p>

        <div className="mt-10 flex w-full flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
          <Button
            onClick={handleGoToLogin}
            variant="primary"
            className="group inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] sm:w-auto min-w-[150px]"
          >
            <LogIn className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            Go to Login
          </Button>

          <Button
            onClick={handleGoToHome}
            variant="secondary"
            className="group inline-flex items-center justify-center gap-2 border border-[#010170]/20 bg-white/40 backdrop-blur-sm px-6 py-3 text-sm font-semibold text-[#010170] hover:bg-white/80 transition-all hover:scale-[1.02] active:scale-[0.98] sm:w-auto min-w-[150px]"
          >
            <Home className="h-4 w-4" />
            Go to Home
          </Button>
        </div>
      </section>
    </VerificationGlassShell>
  );
};

export default EmailVerifiedPage;
