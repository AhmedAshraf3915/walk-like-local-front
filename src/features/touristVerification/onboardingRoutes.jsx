/**
 * Onboarding Routes

 */

// import {
//   ProfileDetailsPage,
//   VerificationPage,
//   VerificationDonePage,
//   PaymentMethodPage,
//   PaymentFormPage,
//   PaymentDonePage,
// } from "./index.js";


import ProfileDetailsPage  from "./pages/ProfileDetailsPage";
import  VerificationPage  from "./pages/VerificationPage";
import  VerificationDonePage  from "./pages/VerificationDonePage";
import  PaymentMethodPage  from "./pages/PaymentMethodPage";
import  PaymentFormPage  from "./pages/PaymentFormPage";
import  PaymentDonePage  from "./pages/PaymentDonePage";
export { OnboardingNavbar, OnboardingStepBar, OnboardingFooter, OnboardingPage } from "./layouts/OnboardingLayout";



import { Routes, Route } from "react-router-dom";

export function OnboardingRoutes() {
  return (
    <Routes>
      <Route path="profile" element={<ProfileDetailsPage />} />
      <Route path="verification" element={<VerificationPage />} />
      <Route path="verification-done" element={<VerificationDonePage />} />
      <Route path="payment" element={<PaymentMethodPage />} />
      <Route path="payment-form" element={<PaymentFormPage />} />
      <Route path="payment-done" element={<PaymentDonePage />} />
    </Routes>
  );
}

