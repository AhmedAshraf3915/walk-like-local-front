import { Compass, Lock, Mail, MapPin, User } from "lucide-react";
import Button from "../../../components/shared/Button";
import FormError from "../../../components/shared/FormError";
import GoogleAuthButton from "./GoogleAuthButton";
import Input from "../../../components/shared/Input";
import Loader from "../../../components/shared/Loader";
import PasswordInput from "../../../components/shared/PasswordInput";

const roleOptions = [
  {
    value: "tourist",
    label: "Tourist",
    description: "Explore with local experiences.",
  },
  {
    value: "guide",
    label: "Guide",
    description: "Offer tours and local expertise.",
  },
];

const SignUpForm = ({
  values,
  errors,
  apiError,
  successMessage,
  loading,
  onChange,
  onSubmit,
  onTogglePassword,
  onToggleConfirmPassword,
  onGoogleAuth,
}) => {
  return (
    <form className="flex w-full flex-col gap-4" onSubmit={onSubmit} noValidate>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label
            htmlFor="fullName"
            className="text-sm font-semibold text-[#010170]"
          >
            Full Name
          </label>
          <Input
            id="fullName"
            name="fullName"
            value={values.fullName}
            onChange={onChange}
            placeholder="Sara Abdo"
            leftIcon={<User className="h-4 w-4" />}
            aria-invalid={Boolean(errors.fullName)}
          />
          <FormError message={errors.fullName} />
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label
            htmlFor="email"
            className="text-sm font-semibold text-[#010170]"
          >
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            value={values.email}
            onChange={onChange}
            placeholder="you@example.com"
            leftIcon={<Mail className="h-4 w-4" />}
            aria-invalid={Boolean(errors.email)}
          />
          <FormError message={errors.email} />
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label
            htmlFor="password"
            className="text-sm font-semibold text-[#010170]"
          >
            Password
          </label>
          <Input
            id="password"
            name="password"
            type={values.showPassword ? "text" : "password"}
            value={values.password}
            onChange={onChange}
            placeholder="••••••••••••"
            leftIcon={<Lock className="h-4 w-4" />}
            rightSlot={
              <PasswordInput
                show={values.showPassword}
                onToggle={onTogglePassword}
              />
            }
            aria-invalid={Boolean(errors.password)}
          />
          <FormError message={errors.password} />
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label
            htmlFor="confirmPassword"
            className="text-sm font-semibold text-[#010170]"
          >
            Confirm Password
          </label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={values.showConfirmPassword ? "text" : "password"}
            value={values.confirmPassword}
            onChange={onChange}
            placeholder="••••••••••••"
            leftIcon={<Lock className="h-4 w-4" />}
            rightSlot={
              <PasswordInput
                show={values.showConfirmPassword}
                onToggle={onToggleConfirmPassword}
              />
            }
            aria-invalid={Boolean(errors.confirmPassword)}
          />
          <FormError message={errors.confirmPassword} />
        </div>
      </div>

      <fieldset className="m-0 border-0 p-0">
        <legend className="mb-2 block text-sm font-semibold text-[#010170]">
          Joining as a...
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {roleOptions.map((option) => {
            const isActive = values.role === option.value;

            return (
              <label
                key={option.value}
                className={`flex min-h-16 cursor-pointer flex-col items-start justify-center gap-1 rounded-xl border px-4 py-3 text-left transition ${isActive ? "border-[#010170] bg-white text-[#010170] shadow-md" : "border-white/30 bg-white/20 text-[#010170]/90 hover:bg-white/30"}`}
              >
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <input
                    type="radio"
                    name="role"
                    value={option.value}
                    checked={isActive}
                    onChange={onChange}
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
        <FormError message={errors.role} />
      </fieldset>

      {apiError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {apiError}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      <Button type="submit" fullWidth disabled={loading} className="mt-1">
        {loading ? (
          <>
            <Loader />
            <span>Creating account...</span>
          </>
        ) : (
          "Create account"
        )}
      </Button>

      <div className="flex items-center gap-2 text-[#010170] text-xs font-semibold tracking-wider uppercase">
        <span className="h-px flex-1 bg-[rgba(51,65,120,0.35)]" />
        <small>OR</small>
        <span className="h-px flex-1 bg-[rgba(51,65,120,0.35)]" />
      </div>

      <GoogleAuthButton onClick={onGoogleAuth}>
        Sign Up With Google
      </GoogleAuthButton>
    </form>
  );
};

export default SignUpForm;
