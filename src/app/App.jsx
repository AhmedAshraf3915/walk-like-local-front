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
import GuideHomePage from "../features/guide/pages/GuideHomePage";
import GuideProfilePage from "../features/guide/pages/GuideProfilePage";
import GuideSettingsPage from "../features/guide/pages/GuideSettingsPage";
import GuideCompleteProfilePage from "../features/guide/pages/GuideCompleteProfilePage";
import GuideBookingsPage from "../features/guide/pages/GuideBookingsPage";
import GuideEarningsPage from "../features/guide/pages/GuideEarningsPage";
import TourCreationPage from "../features/tours/pages/TourCreationPage";
import AllToursPage from "../features/tours/pages/AllToursPage";
import { useGuideVerificationStatus } from "../features/guideVerification/hooks/useGuideVerificationStatus";

import {
  ForgotPassword,
  EnterOTP,
  ChangePassword,
  PasswordResetSuccess,
} from "../features/auth/Login/ForgotPassword";

import { TouristRoutes } from "../features/touristVerification/onboardingRoutes.jsx";
import HomePage from "../pages/HomePage.jsx";

// import TourBrowsePage from "../features/tours/pages/TourBrowsePage";
import ProfileSettings from "../features/touristProfile/pages/ProfileSettings.jsx";
import BookingHistory from "../features/touristProfile/pages/BookingHistory.jsx";
import Payments from "../features/touristProfile/pages/Payments.jsx";
import ViewAllGuidePage from "../pages/ViewAllGuidePage.jsx";
import ViewAllPlacesPage from "../pages/ViewAllPlacesPage.jsx";
import VerificationPage from "../features/touristVerification/pages/VerificationPage.jsx";
import TourDetail from "../features/tours/pages/TourDetail.jsx";
import CheckoutResult from "../features/bookingTour/pages/CheckoutResult.jsx";
import GuideDetailsPage from "../features/guide/pages/GuideDetailsPage.jsx";

function TouristRoute() {
  const { isAuthenticated, userRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (String(userRole).toLowerCase() !== "tourist") {
    return <Navigate to={getRoleBasedVerificationPath(userRole)} replace />;
  }

  return <TouristRoutes />;
}

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

function RequireVerifiedGuide({ children }) {
  const { isAuthenticated, user, userRole } = useAuth();
  const isGuide = normalizeRole(userRole) === "guide";
  const { isVerified, isLoading } = useGuideVerificationStatus({
    user,
    enabled: isAuthenticated && isGuide,
  });

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isGuide) {
    return <Navigate to={getRoleBasedVerificationPath(userRole)} replace />;
  }

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#FDFDFF] px-4 text-center text-[#010138]">
        <div>
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-[#d9d8ec] border-t-[#010170]" />
          <p className="mt-4 text-sm font-semibold">
            Confirming guide verification...
          </p>
        </div>
      </div>
    );
  }

  if (!isVerified) {
    return <Navigate to="/guide/complete-profile" replace />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tours" element={<AllToursPage />} />
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
          path="/guide"
          element={
            <RequireRole allowedRoles={["guide"]}>
              <GuideHomePage />
            </RequireRole>
          }
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
          path="/guide/settings"
          element={
            <RequireRole allowedRoles={["guide"]}>
              <GuideSettingsPage />
            </RequireRole>
          }
        />
        <Route
          path="/guide/complete-profile"
          element={
            <RequireRole allowedRoles={["guide"]}>
              <GuideCompleteProfilePage />
            </RequireRole>
          }
        />
        <Route
          path="/guide/complete-profile/language-test"
          element={
            <RequireRole allowedRoles={["guide"]}>
              <GuideCompleteProfilePage />
            </RequireRole>
          }
        />
        <Route
          path="/guide/complete-profile/details"
          element={
            <RequireRole allowedRoles={["guide"]}>
              <GuideCompleteProfilePage />
            </RequireRole>
          }
        />
        <Route
          path="/guide/bookings"
          element={
            <RequireRole allowedRoles={["guide"]}>
              <GuideBookingsPage />
            </RequireRole>
          }
        />
        <Route
          path="/guide/earnings"
          element={
            <RequireRole allowedRoles={["guide"]}>
              <GuideEarningsPage />
            </RequireRole>
          }
        />
        <Route
          path="/guide/account"
          element={<Navigate to="/guide/settings" replace />}
        />
        <Route
          path="/guide/tours/new"
          element={
            <RequireVerifiedGuide>
              <TourCreationPage />
            </RequireVerifiedGuide>
          }
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

        <Route path="/onboarding/*" element={<TouristRoute />} />
        <Route path="/tours/:id" element={<TourDetail />} />
        <Route
          path="/tourist/profile"
          element={
            <RequireRole allowedRoles={["tourist"]}>
              <ProfileSettings />
            </RequireRole>
          }
        />
        <Route
          path="/tourist/verification"
          element={
            <RequireRole allowedRoles={["tourist"]}>
              <VerificationPage />
            </RequireRole>
          }
        />
        <Route
          path="/tourist/bookings"
          element={
            <RequireRole allowedRoles={["tourist"]}>
              <BookingHistory />
            </RequireRole>
          }
        />
        <Route
          path="/tourist/payments"
          element={
            <RequireRole allowedRoles={["tourist"]}>
              <Payments />
            </RequireRole>
          }
        />
        <Route
          path="/tourist/bookings/:bookingId/confirmation"
          element={
            <RequireRole allowedRoles={["tourist"]}>
              <CheckoutResult />
            </RequireRole>
          }
        />
        <Route
          path="/tourist"
          element={<Navigate to="/tourist/profile" replace />}
        />

        <Route path="/guides" element={<ViewAllGuidePage />} />
        <Route path="/guides/:guideId" element={<GuideDetailsPage />} />
        <Route path="/places" element={<ViewAllPlacesPage />} />
        <Route path="/tourist/bookings/:bookingId/confirmation" element={<CheckoutResult />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
