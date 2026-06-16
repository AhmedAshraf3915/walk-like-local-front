import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "../contexts/AuthContext.jsx";
import useAuth from "../contexts/useAuth";
import {
  getRoleBasedVerificationPath,
  normalizeRole,
} from "../features/auth/utils/roleRedirect";

import CheckEmailNoticePage from "../features/auth/pages/CheckEmailNoticePage";
import EmailVerifiedPage from "../features/auth/pages/EmailVerifiedPage";
import GoogleAuthCallbackPage from "../features/auth/pages/GoogleAuthCallbackPage";
import LoginPage from "../features/auth/pages/LoginPage";
import SignUpPage from "../features/auth/pages/SignUpPage";
import VerifyEmailPage from "../features/auth/pages/VerifyEmailPage";

import TestPage from "../features/test/pages/TestPage.jsx";
import GuideVerificationPage from "../features/guideVerification/pages/GuideVerificationPage";
import AdminDashboardPage from "../features/admin/pages/AdminDashboardPage";
import GuideProfilePage from "../features/guide/pages/GuideProfilePage";
import TourCreationPage from "../features/tours/pages/TourCreationPage";

import {
  ForgotPassword,
  EnterOTP,
  ChangePassword,
  PasswordResetSuccess,
} from "../features/auth/Login/ForgotPassword";

import { OnboardingRoutes } from "../features/touristVerification/onboardingRoutes.jsx";
import HomePage from "../pages/HomePage.jsx";

function GuideVerificationRoute() {
  const { isAuthenticated, userRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (String(userRole).toLowerCase() !== "guide") {
    return <Navigate to={getRoleBasedVerificationPath(userRole)} replace />;
  }

  return <GuideVerificationPage />;
}

function RequireRole({ allowedRoles, children }) {
  const { isAuthenticated, userRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const normalizedRole = normalizeRole(userRole);
  const normalizedAllowedRoles = allowedRoles.map((role) =>
    normalizeRole(role),
  );

  if (!normalizedAllowedRoles.includes(normalizedRole)) {
    return <Navigate to={getRoleBasedVerificationPath(userRole)} replace />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* <Route path="/" element={<RootRedirect />} /> */}
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/register" element={<Navigate to="/signup" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/test" element={<TestPage />} />
        <Route
          path="/admin"
          element={
            <RequireRole allowedRoles={["admin"]}>
              <AdminDashboardPage />
            </RequireRole>
          }
        />
        <Route
          path="/guide-verification"
          element={<GuideVerificationRoute />}
        />
        <Route
          path="/guide/profile"
          element={
            <RequireRole allowedRoles={["guide"]}>
              <GuideProfilePage />
            </RequireRole>
          }
        />
        <Route
          path="/guide/tours/new"
          element={
            <RequireRole allowedRoles={["guide"]}>
              <TourCreationPage />
            </RequireRole>
          }
        />
        <Route
          path="/guide"
          element={<Navigate to="/guide/profile" replace />}
        />
        <Route
          path="/auth/google/callback"
          element={<GoogleAuthCallbackPage />}
        />
        <Route path="/check-email" element={<CheckEmailNoticePage />} />
        <Route
          path="/verify-email-notice"
          element={<Navigate to="/check-email" replace />}
        />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/email-verified" element={<EmailVerifiedPage />} />
        <Route path="/email-verified/:token" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/enter-otp" element={<EnterOTP />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route
          path="/password-reset-success"
          element={<PasswordResetSuccess />}
        />

        <Route path="/onboarding/*" element={<OnboardingRoutes />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
