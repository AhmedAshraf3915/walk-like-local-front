/**
 * Onboarding Routes — 2-step flow: Profile → Verification
 */

import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import ProfileDetailsPage from "./pages/ProfileDetailsPage";
import VerificationPage from "./pages/VerificationPage";
import VerificationDonePage from "./pages/VerificationDonePage";

import { touristApi } from "./api/touristApi";
import {
  OnboardingNavbar,
  OnboardingStepBar,
  OnboardingFooter,
  OnboardingPage,
} from "./layouts/OnboardingLayout";

// Re-export for use in other files
export { OnboardingNavbar, OnboardingStepBar, OnboardingFooter, OnboardingPage };

const isProfileComplete = (profile) =>
  Boolean(
    profile &&
      profile.nationality &&
      profile.preferredLanguages?.length &&
      profile.interests?.length
  );

/**
 * Resumes the tourist at whichever step they actually need next,
 * instead of always restarting at step 1.
 */
function OnboardingEntry() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const resume = async () => {
      try {
        const [profileRes, verificationRes] = await Promise.allSettled([
          touristApi.getProfile(),
          touristApi.getVerificationStatus(),
        ]);

        if (cancelled) return;

        const profile = profileRes.status === "fulfilled" ? profileRes.value : null;
        const vStatus =
          verificationRes.status === "fulfilled" ? verificationRes.value : null;

        if (!isProfileComplete(profile)) {
          navigate("/onboarding/profile", { replace: true });
        } else if (vStatus === "pending") {
          navigate("/onboarding/verification-done", { replace: true });
        } else if (vStatus === "approved") {
          // All done
          navigate("/tourist/profile", { replace: true });
        } else {
          // null / "rejected" → still needs to (re)submit
          navigate("/onboarding/verification", { replace: true });
        }
      } catch {
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

export function TouristRoutes() {
  return (
    <Routes>
      <Route index element={<OnboardingEntry />} />
      <Route path="profile" element={<ProfileDetailsPage />} />
      <Route path="verification" element={<VerificationPage />} />
      <Route path="verification-done" element={<VerificationDonePage />} />
      <Route path="*" element={<Navigate to="." replace />} />
    </Routes>
  );
}