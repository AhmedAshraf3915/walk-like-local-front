import { ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import useAuth from "@/contexts/useAuth";
import CheckEmailNotice from "../components/CheckEmailNotice";
import VerificationGlassShell from "../components/VerificationGlassShell";

const CheckEmailNoticePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    pendingVerificationEmail,
    resendVerificationEmail,
    loading,
    error,
    successMessage,
  } = useAuth();

  const emailFromNavigation = location.state?.email ?? null;
  const initialEmail = emailFromNavigation ?? pendingVerificationEmail ?? "";

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/signup", { replace: true });
  };

  return (
    <VerificationGlassShell>
      <button
        type="button"
        onClick={handleBack}
        className="mb-12 inline-flex items-center gap-3 text-base font-medium text-white/62 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45"
      >
        <ArrowLeft className="h-6 w-6" aria-hidden="true" />
        Back
      </button>

      <CheckEmailNotice
        initialEmail={initialEmail}
        loading={loading}
        apiError={error}
        successMessage={successMessage}
        onResend={resendVerificationEmail}
      />
    </VerificationGlassShell>
  );
};

export default CheckEmailNoticePage;
