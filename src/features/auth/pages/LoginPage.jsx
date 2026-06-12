import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../../../components/layouts/AuthLayout";
import { authApi } from "@/features/auth/api/authApi";
import useAuth from "@/contexts/useAuth";
import LoginForm from "../components/LoginForm";
import { validateLoginForm } from "../validation/loginValidation";

const initialFormState = {
  email: "",
  password: "",
  showPassword: false,
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
      navigate("/", { replace: true });
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
    window.location.assign(authApi.getGoogleSigninUrl("/guide-verification"));
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
