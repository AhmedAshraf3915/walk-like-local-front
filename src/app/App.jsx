import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { AuthProvider } from "../contexts/AuthContext.jsx";
import useAuth from "../contexts/useAuth";
import {
  getRoleBasedVerificationPath,
  normalizeRole,
} from "../features/auth/utils/roleRedirect";
import { useEffect, useState } from "react";

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
import ProfileSettings from "../features/touristProfile/pages/ProfileSettings.jsx";
import BookingHistory from "../features/touristProfile/pages/BookingHistory.jsx";
import ViewAllGuidePage from "../pages/ViewAllGuidePage.jsx";
import ViewAllPlacesPage from "../pages/ViewAllPlacesPage.jsx";
import VerificationPage from "../features/touristVerification/pages/VerificationPage.jsx";
import TourDetail from "../features/tours/pages/TourDetail.jsx";
import CheckoutResult from "../features/bookingTour/pages/CheckoutResult.jsx";
import GuideDetailsPage from "../features/guide/pages/GuideDetailsPage.jsx";
import GroupSelection from "../features/bookingTour/components/GroupSelection.jsx";
import { touristApi } from "../features/touristVerification/api/touristApi.js";

// ─── Spinner shown while async checks run ────────────────────────────────────
function Spinner() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#FDFDFF]">
      <div className="w-12 h-12 border-4 border-[#d9d8ec] border-t-[#010170] rounded-full animate-spin" />
    </div>
  );
}

// ─── Tourist-only guard ───────────────────────────────────────────────────────
// Checks profile completeness BEFORE rendering the page.
// New tourist (no nationality/languages/interests) → /onboarding/profile
// Returning tourist → render children normally
function RequireRoleTourist({ children }) {
  const { isAuthenticated, userRole } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true); // start true so we show spinner first

  useEffect(() => {
    // Only run the API check for authenticated tourists
    if (!isAuthenticated || normalizeRole(userRole) !== "tourist") {
      setChecking(false);
      return;
    }

    let cancelled = false;

    touristApi.getProfile()
      .then((profile) => {
        if (cancelled) return;

        const isComplete =
          profile &&
          profile.nationality &&
          Array.isArray(profile.preferredLanguages) && profile.preferredLanguages.length > 0 &&
          Array.isArray(profile.interests) && profile.interests.length > 0;

        if (!isComplete) {
          navigate("/onboarding/profile", { replace: true });
        } else {
          setChecking(false); // profile complete → render the page
        }
      })
      .catch(() => {
        // API error → assume not complete, send to onboarding
        if (!cancelled) navigate("/onboarding/profile", { replace: true });
      });

    return () => { cancelled = true; };
  }, [isAuthenticated, userRole]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (normalizeRole(userRole) !== "tourist")
    return <Navigate to={getRoleBasedVerificationPath(userRole)} replace />;
  if (checking) return <Spinner />;

  return children;
}

// ─── Generic role guard (admin, guide, etc.) ─────────────────────────────────
// No onboarding logic here — this was causing the loop before.
function RequireRole({ allowedRoles, children }) {
  const { isAuthenticated, userRole } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const normalizedRole = normalizeRole(userRole);
  const normalizedAllowed = allowedRoles.map(normalizeRole);

  if (!normalizedAllowed.includes(normalizedRole))
    return <Navigate to={getRoleBasedVerificationPath(userRole)} replace />;

  return children;
}

// ─── Onboarding entry (handles /onboarding/*) ────────────────────────────────
function TouristRoute() {
  const { isAuthenticated, userRole } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (normalizeRole(userRole) !== "tourist")
    return <Navigate to={getRoleBasedVerificationPath(userRole)} replace />;
  return <TouristRoutes />;
}

function GuideVerificationRoute() {
  const { isAuthenticated, userRole } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (normalizeRole(userRole) !== "guide")
    return <Navigate to={getRoleBasedVerificationPath(userRole)} replace />;
  return <GuideVerificationPage />;
}

function RequireVerifiedGuide({ children }) {
  const { isAuthenticated, user, userRole } = useAuth();
  const isGuide = normalizeRole(userRole) === "guide";
  const { isVerified, isLoading } = useGuideVerificationStatus({
    user,
    enabled: isAuthenticated && isGuide,
  });

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isGuide) return <Navigate to={getRoleBasedVerificationPath(userRole)} replace />;
  if (isLoading) return (
    <div className="grid min-h-screen place-items-center bg-[#FDFDFF] px-4 text-center text-[#010138]">
      <div>
        <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-[#d9d8ec] border-t-[#010170]" />
        <p className="mt-4 text-sm font-semibold">Confirming guide verification...</p>
      </div>
    </div>
  );
  if (!isVerified) return <Navigate to="/guide/complete-profile" replace />;
  return children;
}

function LandingRoute() {
  const { isAuthenticated, userRole } = useAuth();
  if (isAuthenticated && normalizeRole(userRole) === "guide")
    return <Navigate to="/guide" replace />;
  return <HomePage />;
}

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingRoute />} />
        <Route path="/tours" element={<AllToursPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/register" element={<Navigate to="/signup" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/test" element={<TestPage />} />

        <Route path="/admin" element={<RequireRole allowedRoles={["admin"]}><AdminDashboardPage /></RequireRole>} />
        <Route path="/guide-verification" element={<GuideVerificationRoute />} />
        <Route path="/guide" element={<RequireRole allowedRoles={["guide"]}><GuideHomePage /></RequireRole>} />
        <Route path="/guide/profile" element={<Navigate to="/guide/complete-profile/details" replace />} />
        <Route path="/guide/settings" element={<Navigate to="/guide/complete-profile/details" replace />} />
        <Route path="/guide/account" element={<Navigate to="/guide/complete-profile/details" replace />} />
        <Route path="/guide/complete-profile" element={<RequireRole allowedRoles={["guide"]}><GuideCompleteProfilePage /></RequireRole>} />
        <Route path="/guide/complete-profile/language-test" element={<RequireRole allowedRoles={["guide"]}><GuideCompleteProfilePage /></RequireRole>} />
        <Route path="/guide/complete-profile/details" element={<RequireRole allowedRoles={["guide"]}><GuideCompleteProfilePage /></RequireRole>} />
        <Route path="/guide/bookings" element={<RequireRole allowedRoles={["guide"]}><GuideBookingsPage /></RequireRole>} />
        <Route path="/guide/earnings" element={<RequireRole allowedRoles={["guide"]}><GuideEarningsPage /></RequireRole>} />
        <Route path="/guide/tours/new" element={<RequireVerifiedGuide><TourCreationPage /></RequireVerifiedGuide>} />

        <Route path="/auth/google/callback" element={<GoogleAuthCallbackPage />} />
        <Route path="/check-email" element={<CheckEmailNoticePage />} />
        <Route path="/verify-email-notice" element={<Navigate to="/check-email" replace />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/email-verified" element={<EmailVerifiedPage />} />
        <Route path="/email-verified/:token" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/enter-otp" element={<EnterOTP />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/password-reset-success" element={<PasswordResetSuccess />} />

        {/* Onboarding flow */}
        <Route path="/onboarding/*" element={<TouristRoute />} />

        <Route path="/tours/:id" element={<TourDetail />} />

        {/* Tourist pages — all use RequireRoleTourist which includes the onboarding guard */}
        <Route path="/tourist/profile" element={<RequireRoleTourist><ProfileSettings /></RequireRoleTourist>} />
        <Route path="/tourist/verification" element={<RequireRoleTourist><VerificationPage /></RequireRoleTourist>} />
        <Route path="/tourist/bookings" element={<RequireRoleTourist><BookingHistory /></RequireRoleTourist>} />
        <Route path="/payment/success" element={<RequireRoleTourist><CheckoutResult /></RequireRoleTourist>} />
        <Route path="/tourist" element={<Navigate to="/tourist/profile" replace />} />

        <Route path="/guides" element={<ViewAllGuidePage />} />
        <Route path="/guides/:guideId" element={<GuideDetailsPage />} />
        <Route path="/places" element={<ViewAllPlacesPage />} />
        <Route path="/groupeSelection" element={<GroupSelection />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;