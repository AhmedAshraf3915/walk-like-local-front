import { Lock, Mail, User } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "@/components/shared/Button";
import FormError from "@/components/shared/FormError";
import GoogleAuthButton from "./GoogleAuthButton";
import Input from "@/components/shared/Input";
import Loader from "@/components/shared/Loader";
import PasswordInput from "@/components/shared/PasswordInput";

const LoginForm = ({
  values,
  errors,
  apiError,
  loading,
  onChange,
  onSubmit,
  onTogglePassword,
  onGoogleAuth,
}) => {
  return (
    <form className="flex w-full flex-col gap-4" onSubmit={onSubmit} noValidate>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-semibold text-[#010170]">
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

      <div className="flex flex-col gap-1.5">
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
          placeholder="••••••••"
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

      {apiError ? <FormError message={apiError} /> : null}

      <Button type="submit" fullWidth disabled={loading}>
        {loading ? (
          <>
            <Loader />
            <span>Signing in...</span>
          </>
        ) : (
          <>
            <User className="h-4 w-4" />
            <span>Sign in</span>
          </>
        )}
      </Button>

      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#010170]">
        <span className="h-px flex-1 bg-[rgba(51,65,120,0.35)]" />
        <small>OR</small>
        <span className="h-px flex-1 bg-[rgba(51,65,120,0.35)]" />
      </div>

      <GoogleAuthButton onClick={onGoogleAuth}>
        Sign In With Google
      </GoogleAuthButton>

      <div className="flex items-center justify-between text-sm text-[#010170]">
        <Link
          to="/forgot-password"
          className="font-semibold underline underline-offset-4 hover:text-[#5656A0]"
        >
          Forgot password?
        </Link>
        <span>
          Need an account?{" "}
          <Link
            to="/signup"
            className="font-semibold underline underline-offset-4"
          >
            Sign up
          </Link>
        </span>
      </div>
    </form>
  );
};

export default LoginForm;
