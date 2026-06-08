import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { authApi } from "../api/authApi";
import authBg from "../../../assets/images/auth-bg.jpg";


// ── Shared primitives ─────────────────────────────────────────────────────────

const GlassCard = ({ children, className = "" }) => (
  <div
    className={`relative z-10 w-full max-w-[440px] mx-4 rounded-2xl px-10 py-10 ${className}`}
    style={{
      background: "rgba(255,255,255,0.15)",
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
      border: "1px solid rgba(255,255,255,0.35)",
      boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
    }}
  >
    {children}
  </div>
);

const IconBox = ({ children }) => (
  <div
    className="w-[80px] h-[80px] rounded-2xl mx-auto mb-6 flex items-center justify-center"
    style={{ background: "linear-gradient(145deg,#2929a8,#010170)" }}
  >
    {children}
  </div>
);

const PrimaryBtn = ({ children, type = "button", disabled = false, onClick }) => (
  <button
    type={type}
    disabled={disabled}
    onClick={onClick}
    className="w-full h-[44px] rounded-md text-white text-sm font-semibold flex items-center justify-center gap-2 transition-opacity disabled:opacity-60"
    style={{ background: "linear-gradient(90deg,#010170,#5656A0)" }}
  >
    {children}
  </button>
);

const OutlineBtn = ({ children, type = "button", onClick }) => (
  <button
    type={type}
    onClick={onClick}
    className="w-full h-[44px] rounded-md text-[#010170] text-sm font-semibold flex items-center justify-center gap-2 border border-[#010170]/40 bg-white/30 hover:bg-white/50 transition-all"
  >
    {children}
  </button>
);

const BackBtn = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex items-center gap-1 text-sm text-[#0a0a5e] font-medium mb-6 hover:opacity-70 transition-opacity"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
    Back
  </button>
);

const FieldError = ({ msg }) =>
  msg ? <p className="text-red-500 text-xs mt-1">{msg}</p> : null;

const Spinner = () => (
  <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);

const ArrowRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

// ── Icons ─────────────────────────────────────────────────────────────────────

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// ── Shared PasswordInput ──────────────────────────────────────────────────────

const PasswordInput = ({ value, onChange, name, placeholder = "••••••••••" }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative w-full">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#010170]">
        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </span>
      <input
        className="input input-bordered w-full h-[44px] rounded-md bg-white/70 backdrop-blur-sm text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#010170] pl-9 pr-10"
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        name={name}
      />
      <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#010170]">
        {show ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.73 5.073A11 11 0 0 1 12 5c4.664 0 8.4 2.903 10 7a11.6 11.6 0 0 1-1.555 2.788M6.52 6.519C4.48 7.764 2.9 9.693 2 12c1.6 4.097 5.336 7 10 7a10.44 10.44 0 0 0 5.48-1.52m-7.6-7.6a3 3 0 1 0 4.243 4.243" /><path d="m4 4 16 16" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0" /><path d="M2 12c1.6-4.097 5.336-7 10-7s8.4 2.903 10 7c-1.6 4.097-5.336 7-10 7s-8.4-2.903-10-7" />
          </svg>
        )}
      </button>
    </div>
  );
};

// ── Schemas ───────────────────────────────────────────────────────────────────

const emailSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
});

const newPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1 — Forget Password (email entry)
// ─────────────────────────────────────────────────────────────────────────────

export function ForgotPassword() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  const form = useForm({
    defaultValues: { email: "" },
    onSubmit: async ({ value }) => {
      setServerError("");
      try {
        await authApi.forgotPassword({ email: value.email });
        navigate("/enter-otp", { state: { email: value.email } });
      } catch (err) {
        const msg = err?.response?.data?.message;
        setServerError(msg || "Something went wrong.");
      }
    },
  });

  return (
    <PageShell>
      <GlassCard>
        <BackBtn onClick={() => navigate(-1)} />

        <IconBox><MailIcon /></IconBox>

        <h1 className="text-center text-[#0a0a5e] font-bold text-2xl mb-2">
          Forget password!
        </h1>
        <p className="text-center text-sm text-[#0a0a5e]/70 mb-6">
          Enter your email and we'll send a one-time code.
        </p>

        <form
          onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}
          className="flex flex-col gap-4"
        >
          <div>
            <label className="text-sm font-medium text-[#0a0a5e] mb-1 block">Email</label>
            <form.Field
              name="email"
              validators={{
                onChange: ({ value }) => {
                  const r = emailSchema.shape.email.safeParse(value);
                  return r.success ? undefined : r.error.issues[0].message;
                },
              }}
            >
              {(field) => (
                <>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#010170]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                    </span>
                    <input
                      className="input input-bordered w-full h-[44px] rounded-md bg-white/70 backdrop-blur-sm text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#010170] pl-9"
                      type="email"
                      placeholder="You@Example.Com"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </div>
                  <FieldError msg={field.state.meta.errors[0]} />
                </>
              )}
            </form.Field>
          </div>

          {serverError && <p className="text-red-500 text-xs">{serverError}</p>}

          <form.Subscribe selector={(s) => [s.isSubmitting]}>
            {([isSubmitting]) => (
              <PrimaryBtn type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Spinner /> : "Send code"}
              </PrimaryBtn>
            )}
          </form.Subscribe>
        </form>
      </GlassCard>
    </PageShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 — Enter OTP
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export function EnterOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const OTP_LENGTH = 6;
  const TIMER_SECONDS = 59;

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef([]);

  const fullCode = otp.join("");
  const isComplete = fullCode.length === OTP_LENGTH && otp.every((d) => d !== "");
  const canResend = timeLeft === 0;

  // Countdown
  useEffect(() => {
    if (timeLeft === 0) return;
    const t = setTimeout(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft]);

  const handleDigit = (idx, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < OTP_LENGTH - 1) inputRefs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((ch, i) => (next[i] = ch));
    setOtp(next);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
    e.preventDefault();
  };

  const handleResend = async () => {
    try {
      await authApi.resendOtp({ email });
      setOtp(Array(OTP_LENGTH).fill(""));
      setTimeLeft(TIMER_SECONDS);
      setError("");
    } catch {
      setError("Failed to resend. Try again.");
    }
  };

  const handleVerify = async () => {
    if (!isComplete) return;
    setVerifying(true);
    setError("");
    try {
      await authApi.verifyOtp({ email, otp: fullCode });
      navigate("/change-password", { state: { email, otp: fullCode } });
    } catch (err) {
      const msg = err?.response?.data?.message;
      setError(msg || "Invalid code.");
    } finally {
      setVerifying(false);
    }
  };

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");

  return (
    <PageShell>
      <GlassCard>
        <BackBtn onClick={() => navigate(-1)} />

        <IconBox><MailIcon /></IconBox>

        <h1 className="text-center text-[#0a0a5e] font-bold text-2xl mb-2">
          Enter the code
        </h1>
        <p className="text-center text-sm text-[#0a0a5e]/70 mb-8">
          We sent a 6-digit code to your email.
        </p>

        {/* OTP inputs */}
        <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputRefs.current[idx] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigit(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-[48px] h-[52px] rounded-xl text-center text-xl font-bold text-[#0a0a5e] focus:outline-none focus:ring-2 focus:ring-[#010170]/40 transition-all"
              style={{
                background: digit ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.55)",
                border: digit ? "1.5px solid rgba(1,1,112,0.3)" : "1.5px solid rgba(255,255,255,0.6)",
              }}
            />
          ))}
        </div>

        {error && <p className="text-red-500 text-xs text-center mb-3">{error}</p>}

        {/* Verify button */}
        <PrimaryBtn disabled={!isComplete || verifying} onClick={handleVerify}>
          {verifying ? <Spinner /> : <>Verify code <ArrowRight /></>}
        </PrimaryBtn>

        {/* Timer / Resend */}
        <div className="mt-5 flex flex-col items-center gap-3">
          {!canResend ? (
            <p className="text-[#010170] font-semibold text-sm tracking-widest">
              {mm} : {ss}
            </p>
          ) : (
            <OutlineBtn onClick={handleResend}>
              Resent OTP
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </OutlineBtn>
          )}
        </div>
      </GlassCard>
    </PageShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 3 — Change Password
// ─────────────────────────────────────────────────────────────────────────────

export function ChangePassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const { email } = location.state || {};
  const [serverError, setServerError] = useState("");

  const form = useForm({
    defaultValues: { password: "", confirmPassword: "" },
    onSubmit: async ({ value }) => {
      const parsed = newPasswordSchema.safeParse(value);
      if (!parsed.success) return;
      setServerError("");
      try {
        await authApi.resetPassword({
            email,
            password: value.password,
            confirmPassword: value.confirmPassword,  
          });
        navigate("/password-reset-success");
      } catch (err) {
        const msg = err?.response?.data?.message;
        setServerError(msg || "Failed to reset password.");
      }
    },
  });

  return (
    <PageShell>
      <GlassCard>
        <BackBtn onClick={() => navigate(-1)} />

        <IconBox><LockIcon /></IconBox>

        <h1 className="text-center text-[#0a0a5e] font-bold text-2xl mb-6">
          Enter new password
        </h1>

        <form
          onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}
          className="flex flex-col gap-4"
        >
          {/* Password */}
          <div>
            <label className="text-sm font-medium text-[#0a0a5e] mb-1 block">Password</label>
            <form.Field
              name="password"
              validators={{
                onChange: ({ value }) => {
                  if (!value || value.length < 8) return "Password must be at least 8 characters";
                  return undefined;
                },
              }}
            >
              {(field) => (
                <>
                  <PasswordInput
                    name="password"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldError msg={field.state.meta.errors[0]} />
                </>
              )}
            </form.Field>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-sm font-medium text-[#0a0a5e] mb-1 block">Repeat Password</label>
            <form.Field
              name="confirmPassword"
              validators={{
                onChangeListenTo: ["password"],
                onChange: ({ value, fieldApi }) => {
                  if (value && value !== fieldApi.form.getFieldValue("password")) {
                    return "Passwords do not match";
                  }
                  return undefined;
                },
              }}
            >
              {(field) => (
                <>
                  <PasswordInput
                    name="confirmPassword"
                    placeholder="You@Example.Com"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldError msg={field.state.meta.errors[0]} />
                </>
              )}
            </form.Field>
          </div>

          {serverError && <p className="text-red-500 text-xs">{serverError}</p>}

          <form.Subscribe selector={(s) => [s.isSubmitting]}>
            {([isSubmitting]) => (
              <PrimaryBtn type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Spinner /> : <>Confirm <ArrowRight /></>}
              </PrimaryBtn>
            )}
          </form.Subscribe>
        </form>
      </GlassCard>
    </PageShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 4 — Password Reset Success
// ─────────────────────────────────────────────────────────────────────────────

export function PasswordResetSuccess() {
  const navigate = useNavigate();

  return (
    <PageShell>
      <GlassCard className="text-center">
        <IconBox><CheckIcon /></IconBox>

        <h1 className="text-[#0a0a5e] font-bold text-2xl mb-2">
          Password reset
        </h1>
        <p className="text-sm text-[#0a0a5e]/70 mb-8">
          You can now sign in with your new password.
        </p>

        <PrimaryBtn onClick={() => navigate("/login")}>
          Back to sign in <ArrowRight />
        </PrimaryBtn>
      </GlassCard>
    </PageShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared background wrapper
// ─────────────────────────────────────────────────────────────────────────────

function PageShell({ children }) {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center"
      style={{
        backgroundImage: `url(${authBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {children}
    </div>
  );
}
