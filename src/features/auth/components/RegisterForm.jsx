import { useState } from "react";
import { Lock, Mail, MapPin, User } from "lucide-react";
import Button from "../../../components/shared/Button";
import Input from "../../../components/shared/Input";
import PasswordInput from "../../../components/shared/PasswordInput";

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  return (
    <form className="flex flex-col gap-4 w-full">
      <section className="grid grid-cols-2 gap-2 rounded-xl border border-white/25 bg-white/25 p-1 shadow-inner backdrop-blur-sm">
        <Button
          variant="secondary"
          className="rounded-lg bg-white/95 font-bold text-sm text-[#010170] shadow-md"
        >
          Sign Up
        </Button>
        <Button
          variant="ghost"
          className="rounded-lg font-bold text-sm text-[#010170]/80"
        >
          Log In
        </Button>
      </section>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="fullName"
            className="text-sm font-semibold text-[#010170]"
          >
            Full Name
          </label>
          <Input
            id="fullName"
            name="fullName"
            placeholder="Sara Abdo"
            leftIcon={<User className="h-4 w-4" />}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="email"
            className="text-sm font-semibold text-[#010170]"
          >
            Email
          </label>
          <Input
            id="email"
            type="email"
            name="email"
            placeholder="you@example.com"
            leftIcon={<Mail className="h-4 w-4" />}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="password"
            className="text-sm font-semibold text-[#010170]"
          >
            Password
          </label>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="••••••••••••"
            leftIcon={<Lock className="h-4 w-4" />}
            rightSlot={
              <PasswordInput
                show={showPassword}
                onToggle={() => setShowPassword((value) => !value)}
              />
            }
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="repeatPassword"
            className="text-sm font-semibold text-[#010170]"
          >
            Repeat Password
          </label>
          <Input
            id="repeatPassword"
            type={showRepeatPassword ? "text" : "password"}
            name="repeatPassword"
            placeholder="••••••••••••"
            leftIcon={<Lock className="h-4 w-4" />}
            rightSlot={
              <PasswordInput
                show={showRepeatPassword}
                onToggle={() => setShowRepeatPassword((value) => !value)}
              />
            }
          />
        </div>
      </div>

      <fieldset className="m-0 border-0 p-0">
        <legend className="mb-2 block text-sm font-semibold text-[#010170]">
          Joining as a...
        </legend>
        <div className="grid grid-cols-2 gap-2 rounded-md border border-white/25 bg-white/24 p-1">
          <label className="inline-flex min-h-10 select-none items-center justify-center gap-2 rounded-md bg-white/95 px-3 text-sm font-semibold text-[#010170] shadow-md">
            <input
              type="radio"
              name="role"
              value="tourist"
              defaultChecked
              className="sr-only"
            />
            <MapPin className="h-4 w-4 text-[#BE9D46]" />
            <span>Tourist</span>
          </label>

          <label className="inline-flex min-h-10 select-none items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold text-[#010170]">
            <input type="radio" name="role" value="guide" className="sr-only" />
            <MapPin className="h-4 w-4 text-[#BE9D46]" />
            <span>Local Guide</span>
          </label>
        </div>
      </fieldset>

      <label className="flex items-start gap-2.5 text-xs text-[#010170]">
        <input type="checkbox" className="mt-0.5 w-4 h-4 accent-[#010170]" />
        <span>
          I agree to all{" "}
          <a href="#terms" className="text-[#010170] underline">
            Terms of Services
          </a>{" "}
          and{" "}
          <a href="#privacy" className="text-[#010170] underline">
            Privacy Policy
          </a>
        </span>
      </label>

      <Button fullWidth>Create account</Button>

      <div className="flex items-center gap-2 text-[#010170] text-xs font-semibold tracking-wider uppercase">
        <span className="h-px flex-1 bg-[rgba(51,65,120,0.35)]" />
        <small>OR</small>
        <span className="h-px flex-1 bg-[rgba(51,65,120,0.35)]" />
      </div>

      <Button variant="secondary" fullWidth className="bg-white/95">
        <svg viewBox="0 0 48 48" className="w-4 h-4">
          <path
            fill="#EA4335"
            d="M24 9.5c3.15 0 5.99 1.09 8.24 3.23l6.14-6.14C35.66 3.26 30.31 1 24 1 14.59 1 6.43 6.39 2.48 14.24l7.16 5.57C11.52 13.55 17.28 9.5 24 9.5z"
          />
          <path
            fill="#4285F4"
            d="M46.5 24.5c0-1.58-.14-3.09-.4-4.5H24v8.52h12.7c-.55 2.96-2.22 5.47-4.74 7.15l7.24 5.62C43.88 37.47 46.5 31.74 46.5 24.5z"
          />
          <path
            fill="#FBBC05"
            d="M9.64 28.81A14.48 14.48 0 0 1 8.8 24c0-1.68.29-3.3.84-4.81L2.48 13.6A23.9 23.9 0 0 0 0 24c0 3.84.92 7.47 2.48 10.4l7.16-5.59z"
          />
          <path
            fill="#34A853"
            d="M24 47c6.49 0 11.94-2.13 15.92-5.81l-7.24-5.62c-2.02 1.36-4.6 2.17-8.68 2.17-6.72 0-12.48-4.05-14.36-9.81l-7.16 5.59C6.42 41.61 14.58 47 24 47z"
          />
        </svg>
        <span>Sign Up With Google</span>
      </Button>

      <p className="text-center text-sm text-[#010170]">
        Already have account?{" "}
        <a href="/login" className="text-[#010170] underline">
          Sign in
        </a>
      </p>
    </form>
  );
};

export default RegisterForm;
