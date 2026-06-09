import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "../contexts/AuthContext.jsx";
import CheckEmailNoticePage from "../features/auth/pages/CheckEmailNoticePage";
import EmailVerifiedPage from "../features/auth/pages/EmailVerifiedPage";
import GoogleAuthCallbackPage from "../features/auth/pages/GoogleAuthCallbackPage";
import LoginPage from "../features/auth/pages/LoginPage";
import SignUpPage from "../features/auth/pages/SignUpPage";
import VerifyEmailPage from "../features/auth/pages/VerifyEmailPage";
import TestPage from "../features/test/pages/TestPage.jsx";
import GuideVerificationPage from "../features/guideVerification/pages/GuideVerificationPage";
import {
  ForgotPassword,
  EnterOTP,
  ChangePassword,
  PasswordResetSuccess,
} from "../features/auth/Login/ForgotPassword";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/signup" replace />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/guide-verification" element={<GuideVerificationPage />} />
        <Route
          path="/auth/google/callback"
          element={<GoogleAuthCallbackPage />}
        />
        <Route path="/register" element={<Navigate to="/signup" replace />} />
        <Route path="/check-email" element={<CheckEmailNoticePage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/email-verified/:token" element={<VerifyEmailPage />} />
        <Route path="/email-verified" element={<EmailVerifiedPage />} />
        <Route
          path="/verified-email"
          element={<Navigate to="/email-verified" replace />}
        />
        <Route
          path="/verify-email-notice"
          element={<Navigate to="/check-email" replace />}
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/enter-otp" element={<EnterOTP />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route
          path="/password-reset-success"
          element={<PasswordResetSuccess />}
        />
        <Route path="*" element={<Navigate to="/signup" replace />} />
      </Routes>
    </AuthProvider>
  );
}
export default App;
