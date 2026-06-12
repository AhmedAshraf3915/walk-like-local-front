import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../../../components/layouts/AuthLayout";
import { authApi } from "@/features/auth/api/authApi";
import { getRoleBasedVerificationPath } from "@/features/auth/utils/roleRedirect";
import useAuth from "@/contexts/useAuth";
import LoginForm from "../components/LoginForm";
import { validateLoginForm } from "../validation/loginValidation";

const initialFormState = {
  email: "",
  password: "",
  showPassword: false,
};

const getUserRoleFromAuthResponse = (authResponse) => {
  const candidate =
    authResponse?.data?.data ?? authResponse?.data ?? authResponse ?? null;

  return candidate?.user?.role ?? null;
};

const getGoogleAuthErrorMessage = (error) => {
  const message = error instanceof Error ? error.message : "";

  if (!message) {
    return "Google sign in is temporarily unavailable. Please sign in with email and password.";
  }

  return message;
};

const LoginPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const prefilledEmail =
    typeof location.state?.email === "string" ? location.state.email : "";

  const [formValues, setFormValues] = useState(() => ({
    ...initialFormState,
    email: prefilledEmail,
  }));
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));

    if (fieldErrors[name]) {
      setFieldErrors((currentErrors) => ({
        ...currentErrors,
        [name]: undefined,
      }));
    }

    if (error) {
      setError(null);
    }
  };

  const handleTogglePassword = () => {
    setFormValues((currentValues) => ({
      ...currentValues,
      showPassword: !currentValues.showPassword,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    const validationErrors = validateLoginForm(formValues);

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await authApi.login({
        email: formValues.email.trim(),
        password: formValues.password,
      });

      login(response);
      const userRole = getUserRoleFromAuthResponse(response);
      navigate(getRoleBasedVerificationPath(userRole), { replace: true });
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
    try {
      const googleAuthUrl = authApi.getGoogleSigninUrl("/");
      window.location.assign(googleAuthUrl);
    } catch (googleError) {
      setError(getGoogleAuthErrorMessage(googleError));
    }
  };

  return (
    <AuthLayout
      title="Sign in"
      subtitle="Use your verified account to continue into Walk Like Local."
    >
      <LoginForm
        values={formValues}
        errors={fieldErrors}
        apiError={error}
        loading={loading}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onTogglePassword={handleTogglePassword}
        onGoogleAuth={handleGoogleAuth}
      />
    </AuthLayout>
  );
};

export default LoginPage;
