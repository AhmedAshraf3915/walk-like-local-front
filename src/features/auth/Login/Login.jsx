import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, MapPin, Compass, Lock } from "lucide-react";
import AuthLayout from "../../../components/layouts/AuthLayout";
import useAuth from "@/contexts/useAuth";
import Button from "../../../components/shared/Button";
import Input from "../../../components/shared/Input";
import PasswordInput from "../../../components/shared/PasswordInput";
import FormError from "../../../components/shared/FormError";
import Loader from "../../../components/shared/Loader";
import { validateLoginForm } from "./validation/loginValidation";

const roleOptions = [
  {
    value: "tourist",
    label: "Tourist",
    description: "Explore with local experiences.",
  },
  {
    value: "local_guide",
    label: "Guide",
    description: "Offer tours and local expertise.",
  },
];

const initialFormState = {
  email: "",
  password: "",
  role: "tourist",
  rememberMe: false,
  showPassword: false,
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading, error, resetMessages } = useAuth();
  const [formValues, setFormValues] = useState(initialFormState);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (["email", "password", "role"].includes(name)) {
      resetMessages();
    }
  };

  const handleTogglePassword = () => {
    setFormValues((prev) => ({ ...prev, showPassword: !prev.showPassword }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateLoginForm(formValues);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }
    try {
      const res = await login({
        email: formValues.email.trim(),
        password: formValues.password,
        role: formValues.role,
        rememberMe: formValues.rememberMe,
      });
      const user = res?.user;
      if (user?.isFirstLogin || !user?.profileComplete) {
        navigate("/complete-profile");
      } else {
        navigate("/");
      }
    } catch {
      // Error state is handled in context.
    }
  };

  

  return (
    <AuthLayout
      title="Continue your journey"
      subtitle="Sign in to explore Egypt with hand-picked local guides."
    >
      <form className="flex w-full flex-col gap-4" onSubmit={handleSubmit} noValidate>
        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-semibold text-[#010170]">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formValues.email}
            onChange={handleChange}
            placeholder="you@example.com"
            leftIcon={<Mail className="h-4 w-4" />}
            aria-invalid={Boolean(fieldErrors.email)}
          />
          <FormError message={fieldErrors.email} />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-semibold text-[#010170]">
            Password
          </label>
          <Input
            id="password"
            name="password"
            type={formValues.showPassword ? "text" : "password"}
            value={formValues.password}
            onChange={handleChange}
            placeholder="••••••••••••"
            leftIcon={<Lock className="h-4 w-4" />}
            rightSlot={
              <PasswordInput
                show={formValues.showPassword}
                onToggle={handleTogglePassword}
              />
            }
            aria-invalid={Boolean(fieldErrors.password)}
          />
          <FormError message={fieldErrors.password} />
        </div>

        {/* Role */}
        <fieldset className="m-0 border-0 p-0">
          <legend className="mb-2 block text-sm font-semibold text-[#010170]">
            Signing in as a...
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {roleOptions.map((option) => {
              const isActive = formValues.role === option.value;
              return (
                <label
                  key={option.value}
                  className={`flex min-h-16 cursor-pointer flex-col items-start justify-center gap-1 rounded-xl border px-4 py-3 text-left transition ${
                    isActive
                      ? "border-[#010170] bg-white text-[#010170] shadow-md"
                      : "border-white/30 bg-white/20 text-[#010170]/90 hover:bg-white/30"
                  }`}
                >
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    <input
                      type="radio"
                      name="role"
                      value={option.value}
                      checked={isActive}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    {option.value === "tourist" ? (
                      <MapPin className="h-4 w-4 text-[#BE9D46]" />
                    ) : (
                      <Compass className="h-4 w-4 text-[#BE9D46]" />
                    )}
                    <span>{option.label}</span>
                  </span>
                  <span className="text-xs opacity-80">{option.description}</span>
                </label>
              );
            })}
          </div>
          <FormError message={fieldErrors.role} />
        </fieldset>

        {/* Remember me + Forgot password */}
        <div className="flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2">
              <div
                onClick={() =>
                  setFormValues((prev) => ({ ...prev, rememberMe: !prev.rememberMe }))
                }
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all duration-200 ${
                  formValues.rememberMe
                    ? "border-[#010170] bg-[#010170]"
                    : "border-[#010170]/40 bg-white/60"
                }`}
              >
                {formValues.rememberMe && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path
                      d="M1 4L3.5 6.5L9 1"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <span className="text-sm text-[#010170]">Remember me</span>
            </label>
          <Link
            to="/forgot-password"
            className="text-sm font-semibold text-[#010170] underline underline-offset-4 hover:text-[#5656A0]"
          >
            Forgot password?
          </Link>
        </div>

        {/* API Error */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Submit */}
        <Button type="submit" fullWidth disabled={loading} className="mt-1">
          {loading ? (
            <>
              <Loader />
              <span>Signing in...</span>
            </>
          ) : (
            "Sign in"
          )}
        </Button>

        {/* Divider */}
        <div className="flex items-center gap-2 text-[#010170] text-xs font-semibold tracking-wider uppercase">
          <span className="h-px flex-1 bg-[rgba(51,65,120,0.35)]" />
          <small>OR</small>
          <span className="h-px flex-1 bg-[rgba(51,65,120,0.35)]" />
        </div>

        {/* Google */}
        <Button type="button" variant="secondary" fullWidth className="bg-white/95">
          <svg viewBox="0 0 48 48" className="h-4 w-4" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.15 0 5.99 1.09 8.24 3.23l6.14-6.14C35.66 3.26 30.31 1 24 1 14.59 1 6.43 6.39 2.48 14.24l7.16 5.57C11.52 13.55 17.28 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.5 24.5c0-1.58-.14-3.09-.4-4.5H24v8.52h12.7c-.55 2.96-2.22 5.47-4.74 7.15l7.24 5.62C43.88 37.47 46.5 31.74 46.5 24.5z"/>
            <path fill="#FBBC05" d="M9.64 28.81A14.48 14.48 0 0 1 8.8 24c0-1.68.29-3.3.84-4.81L2.48 13.6A23.9 23.9 0 0 0 0 24c0 3.84.92 7.47 2.48 10.4l7.16-5.59z"/>
            <path fill="#34A853" d="M24 47c6.49 0 11.94-2.13 15.92-5.81l-7.24-5.62c-2.02 1.36-4.6 2.17-8.68 2.17-6.72 0-12.48-4.05-14.36-9.81l-7.16 5.59C6.42 41.61 14.58 47 24 47z"/>
          </svg>
          <span>Sign in with Google</span>
        </Button>
      </form>

      {/* Sign up link */}
      <p className="text-center text-sm text-[#010170]">
        Don't have an account?{" "}
        <Link
          to="/signup"
          className="font-semibold underline underline-offset-4 hover:text-[#5656A0]"
        >
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
}