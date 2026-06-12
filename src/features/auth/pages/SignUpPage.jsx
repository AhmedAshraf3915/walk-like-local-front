import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../../components/layouts/AuthLayout";
import { authApi } from "@/features/auth/api/authApi";
import useAuth from "@/contexts/useAuth";
import SignUpForm from "../components/SignUpForm";
import { validateSignupForm } from "../validation/signupValidation";

const initialFormState = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "",
  showPassword: false,
  showConfirmPassword: false,
};

const ALLOWED_GOOGLE_SIGNUP_ROLES = new Set(["guide", "tourist"]);

const getGoogleAuthErrorMessage = (error) => {
  const message = error instanceof Error ? error.message : "";

  if (!message) {
    return "Google sign up is temporarily unavailable. Please use email and password.";
  }

  return message;
};

const SignUpPage = () => {
  const navigate = useNavigate();
  const { signup, loading, error, resetMessages, clearAuth } = useAuth();
  const [formValues, setFormValues] = useState(initialFormState);
  const [fieldErrors, setFieldErrors] = useState({});
  const [oauthError, setOauthError] = useState(null);

  const handleChange = (event) => {
    const { name, value, type } = event.target;

    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: type === "radio" ? value : value,
    }));

    if (fieldErrors[name]) {
      setFieldErrors((currentErrors) => ({
        ...currentErrors,
        [name]: undefined,
      }));
    }

    if (
      name === "fullName" ||
      name === "email" ||
      name === "password" ||
      name === "confirmPassword" ||
      name === "role"
    ) {
      resetMessages();
    }

    if (oauthError) {
      setOauthError(null);
    }
  };

  const handleTogglePassword = () => {
    setFormValues((currentValues) => ({
      ...currentValues,
      showPassword: !currentValues.showPassword,
    }));
  };

  const handleToggleConfirmPassword = () => {
    setFormValues((currentValues) => ({
      ...currentValues,
      showConfirmPassword: !currentValues.showConfirmPassword,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    const validationErrors = validateSignupForm(formValues);

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    try {
      const result = await signup({
        fullName: formValues.fullName.trim(),
        email: formValues.email.trim(),
        password: formValues.password,
        confirmPassword: formValues.confirmPassword,
        role: formValues.role,
      });

      // Keep the flow deterministic: after signup we always re-authenticate via login.
      clearAuth();

      navigate("/check-email", {
        replace: true,
        state: { email: result?.email ?? formValues.email.trim() },
      });
    } catch {
      // Error state is handled in context.
    }
  };

  const handleGoogleAuth = () => {
    setOauthError(null);

    const selectedRole =
      typeof formValues.role === "string"
        ? formValues.role.trim().toLowerCase()
        : "";

    if (!selectedRole) {
      setFieldErrors((currentErrors) => ({
        ...currentErrors,
        role: "Please choose a role.",
      }));
      return;
    }

    if (!ALLOWED_GOOGLE_SIGNUP_ROLES.has(selectedRole)) {
      setFieldErrors((currentErrors) => ({
        ...currentErrors,
        role: "Invalid role selected. Please choose Guide or Tourist.",
      }));
      return;
    }

    try {
      const googleUrl = authApi.getGoogleSignupUrl(selectedRole, "/");
      window.location.assign(googleUrl);
    } catch (googleError) {
      setOauthError(getGoogleAuthErrorMessage(googleError));
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join travelers exploring Egypt with hand-picked local guides."
    >
      <SignUpForm
        values={formValues}
        errors={fieldErrors}
        apiError={oauthError ?? error}
        successMessage={null}
        loading={loading}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onTogglePassword={handleTogglePassword}
        onToggleConfirmPassword={handleToggleConfirmPassword}
        onGoogleAuth={handleGoogleAuth}
      />

      <p className="text-center text-sm text-[#010170]">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold underline underline-offset-4"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default SignUpPage;
