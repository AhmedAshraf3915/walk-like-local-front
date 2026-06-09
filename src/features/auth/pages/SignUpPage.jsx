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

const SignUpPage = () => {
  const navigate = useNavigate();
  const { signup, loading, error, resetMessages, clearAuth } = useAuth();
  const [formValues, setFormValues] = useState(initialFormState);
  const [fieldErrors, setFieldErrors] = useState({});

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
    if (!formValues.role) {
      setFieldErrors((currentErrors) => ({
        ...currentErrors,
        role: "Please choose a role.",
      }));
      return;
    }

    window.location.assign(
      authApi.getGoogleSignupUrl(formValues.role, "/test"),
    );
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join travelers exploring Egypt with hand-picked local guides."
    >
      <SignUpForm
        values={formValues}
        errors={fieldErrors}
        apiError={error}
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
