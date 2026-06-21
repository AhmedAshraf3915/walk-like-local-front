/**
 * Onboarding Routes
 */

import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import ProfileDetailsPage from "./pages/ProfileDetailsPage";
import VerificationPage from "./pages/VerificationPage";
import VerificationDonePage from "./pages/VerificationDonePage";
import PaymentMethodPage from "./pages/PaymentMethodPage";
import PaymentFormPage from "./pages/PaymentFormPage";
import PaymentDonePage from "./pages/PaymentDonePage";

<<<<<<< HEAD
import ProfileDetailsPage  from "./pages/ProfileDetailsPage";
import  VerificationPage  from "./pages/VerificationPage";
import  VerificationDonePage  from "./pages/VerificationDonePage";
import  PaymentMethodPage  from "./pages/PaymentMethodPage";
export { OnboardingNavbar, OnboardingStepBar, OnboardingFooter, OnboardingPage } from "./layouts/OnboardingLayout";
=======
import { touristApi } from "./api/touristApi";
import { getPaymentMethods } from "../bookingTour/services/paymentMethods.js";
import { OnboardingNavbar, OnboardingStepBar, OnboardingFooter, OnboardingPage } from "./layouts/OnboardingLayout";
>>>>>>> d57a5a11e18e8157fdfe8483580dd8c3298bbdfe

// Re-export for use in other files
export { OnboardingNavbar, OnboardingStepBar, OnboardingFooter, OnboardingPage };

const isProfileComplete = (profile) =>
  Boolean(
    profile &&
      profile.nationality &&
      profile.preferredLanguages?.length &&
      profile.interests?.length
  );

<<<<<<< HEAD
import { Navigate, Routes, Route } from "react-router-dom";
=======
/**
 * Entry point for "/onboarding". Figures out which step the tourist
 * actually still needs and sends them straight there, instead of always
 * restarting the flow from the profile page. Used whenever someone lands
 * on the bare /onboarding route (first visit, refresh, or coming back
 * after closing the tab mid-flow).
 */
function OnboardingEntry() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const resume = async () => {
      try {
        const [profile, verificationStatus, paymentRes] = await Promise.allSettled([
          touristApi.getProfile(),
          touristApi.getVerificationStatus(),
          getPaymentMethods(),
        ]);

        if (cancelled) return;

        const profileData = profile.status === "fulfilled" ? profile.value : null;
        const vStatus = verificationStatus.status === "fulfilled" ? verificationStatus.value : null;
        const cardsRaw = paymentRes.status === "fulfilled" ? paymentRes.value : null;
        const cards = Array.isArray(cardsRaw?.data ?? cardsRaw) ? (cardsRaw?.data ?? cardsRaw) : [];

        if (!isProfileComplete(profileData)) {
          navigate("/onboarding/profile", { replace: true });
        } else if (vStatus === "pending") {
          navigate("/onboarding/verification-done", { replace: true });
        } else if (vStatus !== "approved") {
          // null / "rejected" / unknown → still needs to (re)submit a document
          navigate("/onboarding/verification", { replace: true });
        } else if (cards.length === 0) {
          navigate("/onboarding/payment", { replace: true });
        } else {
          // Everything is already done — nothing left to onboard
          navigate("/tourist/profile", { replace: true });
        }
      } catch (error) {
        console.error("Failed to resume onboarding:", error);
        if (!cancelled) navigate("/onboarding/profile", { replace: true });
      } finally {
        if (!cancelled) setChecking(false);
      }
    };

    resume();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (!checking) return null;

  return (
    <OnboardingPage>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-[#010170] border-t-transparent rounded-full animate-spin" />
      </div>
    </OnboardingPage>
  );
}
>>>>>>> d57a5a11e18e8157fdfe8483580dd8c3298bbdfe

export function TouristRoutes() {
  return (
    <Routes>
      <Route index element={<OnboardingEntry />} />
      <Route path="profile" element={<ProfileDetailsPage />} />
      <Route path="verification" element={<VerificationPage />} />
      <Route path="verification-done" element={<VerificationDonePage />} />
      <Route path="payment" element={<PaymentMethodPage />} />
<<<<<<< HEAD
      <Route path="payment-form" element={<Navigate to="../payment" replace />} />
      <Route path="payment-done" element={<Navigate to="/tourist/profile" replace />} />
=======
      <Route path="payment-form" element={<PaymentFormPage />} />
      <Route path="payment-done" element={<PaymentDonePage />} />
      <Route path="*" element={<Navigate to="." replace />} />
>>>>>>> d57a5a11e18e8157fdfe8483580dd8c3298bbdfe
    </Routes>
  );
}