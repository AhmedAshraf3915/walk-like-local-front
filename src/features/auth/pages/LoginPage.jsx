import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Compass, Lock, Mail, MapPin, User } from "lucide-react";
import AuthLayout from "../../../components/layouts/AuthLayout";
import Button from "../../../components/shared/Button";
import FormError from "../../../components/shared/FormError";
import GoogleAuthButton from "../components/GoogleAuthButton";
import Input from "../../../components/shared/Input";
import Loader from "../../../components/shared/Loader";
import { authApi } from "@/features/auth/api/authApi";
import useAuth from "@/contexts/useAuth";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formValues, setFormValues] = useState({
    email: "",
    password: "",
    role: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));

    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formValues.role) {
      setError("Please choose a role.");
      return;
    }

    if (!formValues.email.trim() || !formValues.password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await authApi.login({
        email: formValues.email.trim(),
        password: formValues.password,
        role: formValues.role,
      });

      login(response);
      navigate("/test", { replace: true });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to sign in. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    if (!formValues.role) {
      setError("Please choose a role before continuing with Google.");
      return;
    }

    window.location.assign(
      authApi.getGoogleAuthUrl("/test", {
        role: formValues.role,
        mode: "signin",
      }),
    );
  };

  return (
    <AuthLayout
      title="Sign in"
      subtitle="Use your verified account to continue into Walk Like Local."
    >
      <form
        className="flex w-full flex-col gap-4"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="flex flex-col gap-1.5">
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
            value={formValues.email}
            onChange={handleChange}
            placeholder="you@example.com"
            leftIcon={<Mail className="h-4 w-4" />}
            aria-invalid={Boolean(error)}
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
            name="password"
            type="password"
            value={formValues.password}
            onChange={handleChange}
            placeholder="••••••••"
            leftIcon={<Lock className="h-4 w-4" />}
            aria-invalid={Boolean(error)}
          />
        </div>

        <fieldset className="m-0 border-0 p-0">
          <legend className="mb-2 block text-sm font-semibold text-[#010170]">
            Signing in as a...
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              {
                value: "tourist",
                label: "Tourist",
                description: "Explore with local experiences.",
                icon: <MapPin className="h-4 w-4 text-[#BE9D46]" />,
              },
              {
                value: "guide",
                label: "Guide",
                description: "Manage tours and local expertise.",
                icon: <Compass className="h-4 w-4 text-[#BE9D46]" />,
              },
            ].map((option) => {
              const isActive = formValues.role === option.value;

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
                      onChange={handleChange}
                      className="sr-only"
                    />
                    {option.icon}
                    <span>{option.label}</span>
                  </span>
                  <span className="text-xs opacity-80">
                    {option.description}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {error ? <FormError message={error} /> : null}

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

        <GoogleAuthButton onClick={handleGoogleAuth}>
          Sign In With Google
        </GoogleAuthButton>

        <p className="text-center text-sm text-[#010170]">
          Need an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="font-semibold underline underline-offset-4"
          >
            Sign up
          </button>
        </p>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
