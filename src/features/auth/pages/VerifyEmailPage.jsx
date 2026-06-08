import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import AuthLayout from "../../../components/layouts/AuthLayout";
import { authApi } from "@/features/auth/api/authApi";
import useAuth from "@/contexts/useAuth";
import Button from "../../../components/shared/Button";
import Loader from "../../../components/shared/Loader";

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState(() =>
    token ? null : "No verification token provided.",
  );
  const [successMessage, setSuccessMessage] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      return;
    }

    let mounted = true;

    authApi
      .verifyEmail(token)
      .then((response) => {
        if (!mounted) return;

        // Try to log the user in if backend returned tokens/user
        try {
          login(response);
          setSuccessMessage("Email verified and signed in.");
          // navigate to root or dashboard
          navigate("/");
        } catch {
          // If login failed due to missing tokens, show success notice
          setSuccessMessage("Email verified. You may now sign in.");
        }
      })
      .catch((err) => {
        setError(err?.message ?? "Verification failed. Please try again.");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [token, login, navigate]);

  return (
    <AuthLayout
      title="Verifying your email"
      subtitle="Finishing account setup."
    >
      <div className="flex w-full max-w-md flex-col gap-4">
        {loading ? (
          <div className="flex items-center gap-3">
            <Loader />
            <span className="text-sm text-[#010170]">Verifying token...</span>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : successMessage ? (
          <div className="flex flex-col gap-3">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {successMessage}
            </div>
            <div className="flex gap-2">
              <Button onClick={() => navigate("/login")}>Sign in</Button>
              <Button variant="secondary" onClick={() => navigate("/")}>
                Go home
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-[#010170]">
            Ready to verify your email.
          </div>
        )}
      </div>
    </AuthLayout>
  );
};

export default VerifyEmailPage;
