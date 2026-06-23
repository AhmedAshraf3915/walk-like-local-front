// import { Navigate, Route, Routes } from "react-router-dom";
// import { AuthProvider } from "../contexts/AuthContext.jsx";
// import useAuth from "../contexts/useAuth";
// import {
//   getRoleBasedVerificationPath,
//   normalizeRole,
// } from "../features/auth/utils/roleRedirect";

// import CheckEmailNoticePage from "../features/auth/pages/CheckEmailNoticePage";
// import EmailVerifiedPage from "../features/auth/pages/EmailVerifiedPage";
// import GoogleAuthCallbackPage from "../features/auth/pages/GoogleAuthCallbackPage";
// import LoginPage from "../features/auth/pages/LoginPage";
// import SignUpPage from "../features/auth/pages/SignUpPage";
// import VerifyEmailPage from "../features/auth/pages/VerifyEmailPage";

// import TestPage from "../features/test/pages/TestPage.jsx";
// import GuideVerificationPage from "../features/guideVerification/pages/GuideVerificationPage";
// import AdminDashboardPage from "../features/admin/pages/AdminDashboardPage";
// import GuideHomePage from "../features/guide/pages/GuideHomePage";
// import GuideProfilePage from "../features/guide/pages/GuideProfilePage";
// import GuideSettingsPage from "../features/guide/pages/GuideSettingsPage";
// import GuideCompleteProfilePage from "../features/guide/pages/GuideCompleteProfilePage";
// import GuideBookingsPage from "../features/guide/pages/GuideBookingsPage";
// import GuideEarningsPage from "../features/guide/pages/GuideEarningsPage";
// import TourCreationPage from "../features/tours/pages/TourCreationPage";
// import AllToursPage from "../features/tours/pages/AllToursPage";
// import { useGuideVerificationStatus } from "../features/guideVerification/hooks/useGuideVerificationStatus";

// import {
//   ForgotPassword,
//   EnterOTP,
//   ChangePassword,
//   PasswordResetSuccess,
// } from "../features/auth/Login/ForgotPassword";

// import { TouristRoutes } from "../features/touristVerification/onboardingRoutes.jsx";
// import HomePage from "../pages/HomePage.jsx";

// // import TourBrowsePage from "../features/tours/pages/TourBrowsePage";
// import ProfileSettings from "../features/touristProfile/pages/ProfileSettings.jsx";
// import BookingHistory from "../features/touristProfile/pages/BookingHistory.jsx";
// import Payments from "../features/touristProfile/pages/Payments.jsx";
// import ViewAllGuidePage from "../pages/ViewAllGuidePage.jsx";
// import ViewAllPlacesPage from "../pages/ViewAllPlacesPage.jsx";
// import VerificationPage from "../features/touristVerification/pages/VerificationPage.jsx";
// import TourDetail from "../features/tours/pages/TourDetail.jsx";
// import CheckoutResult from "../features/bookingTour/pages/CheckoutResult.jsx";
// import GuideDetailsPage from "../features/guide/pages/GuideDetailsPage.jsx";

// function TouristRoute() {
//   const { isAuthenticated, userRole } = useAuth();

//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }

//   if (String(userRole).toLowerCase() !== "tourist") {
//     return <Navigate to={getRoleBasedVerificationPath(userRole)} replace />;
//   }

//   return <TouristRoutes />;
// }

// function GuideVerificationRoute() {
//   const { isAuthenticated, userRole } = useAuth();

//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }

//   if (String(userRole).toLowerCase() !== "guide") {
//     return <Navigate to={getRoleBasedVerificationPath(userRole)} replace />;
//   }

//   return <GuideVerificationPage />;
// }

// function RequireRole({ allowedRoles, children }) {
//   const { isAuthenticated, userRole } = useAuth();

//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }

//   const normalizedRole = normalizeRole(userRole);
//   const normalizedAllowedRoles = allowedRoles.map((role) =>
//     normalizeRole(role),
//   );

//   if (!normalizedAllowedRoles.includes(normalizedRole)) {
//     return <Navigate to={getRoleBasedVerificationPath(userRole)} replace />;
//   }

//   return children;
// }

// function RequireVerifiedGuide({ children }) {
//   const { isAuthenticated, user, userRole } = useAuth();
//   const isGuide = normalizeRole(userRole) === "guide";
//   const { isVerified, isLoading } = useGuideVerificationStatus({
//     user,
//     enabled: isAuthenticated && isGuide,
//   });

//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }

//   if (!isGuide) {
//     return <Navigate to={getRoleBasedVerificationPath(userRole)} replace />;
//   }

//   if (isLoading) {
//     return (
//       <div className="grid min-h-screen place-items-center bg-[#FDFDFF] px-4 text-center text-[#010138]">
//         <div>
//           <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-[#d9d8ec] border-t-[#010170]" />
//           <p className="mt-4 text-sm font-semibold">
//             Confirming guide verification...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   if (!isVerified) {
//     return <Navigate to="/guide/complete-profile" replace />;
//   }

//   return children;
// }

// function App() {
//   return (
//     <AuthProvider>
//       <Routes>
//         <Route path="/" element={<HomePage />} />
//         <Route path="/tours" element={<AllToursPage />} />
//         {/* <Route path="/" element={<RootRedirect />} /> */}
//         <Route path="/signup" element={<SignUpPage />} />
//         <Route path="/register" element={<Navigate to="/signup" replace />} />
//         <Route path="/login" element={<LoginPage />} />
//         <Route path="/test" element={<TestPage />} />
//         <Route
//           path="/admin"
//           element={
//             <RequireRole allowedRoles={["admin"]}>
//               <AdminDashboardPage />
//             </RequireRole>
//           }
//         />
//         <Route
//           path="/guide-verification"
//           element={<GuideVerificationRoute />}
//         />
//         <Route
//           path="/guide"
//           element={
//             <RequireRole allowedRoles={["guide"]}>
//               <GuideHomePage />
//             </RequireRole>
//           }
//         />
//         <Route
//           path="/guide/profile"
//           element={
//             <RequireRole allowedRoles={["guide"]}>
//               <GuideProfilePage />
//             </RequireRole>
//           }
//         />
//         <Route
//           path="/guide/settings"
//           element={
//             <RequireRole allowedRoles={["guide"]}>
//               <GuideSettingsPage />
//             </RequireRole>
//           }
//         />
//         <Route
//           path="/guide/complete-profile"
//           element={
//             <RequireRole allowedRoles={["guide"]}>
//               <GuideCompleteProfilePage />
//             </RequireRole>
//           }
//         />
//         <Route
//           path="/guide/complete-profile/language-test"
//           element={
//             <RequireRole allowedRoles={["guide"]}>
//               <GuideCompleteProfilePage />
//             </RequireRole>
//           }
//         />
//         <Route
//           path="/guide/complete-profile/details"
//           element={
//             <RequireRole allowedRoles={["guide"]}>
//               <GuideCompleteProfilePage />
//             </RequireRole>
//           }
//         />
//         <Route
//           path="/guide/bookings"
//           element={
//             <RequireRole allowedRoles={["guide"]}>
//               <GuideBookingsPage />
//             </RequireRole>
//           }
//         />
//         <Route
//           path="/guide/earnings"
//           element={
//             <RequireRole allowedRoles={["guide"]}>
//               <GuideEarningsPage />
//             </RequireRole>
//           }
//         />
//         <Route
//           path="/guide/account"
//           element={<Navigate to="/guide/settings" replace />}
//         />
//         <Route
//           path="/guide/tours/new"
//           element={
//             <RequireVerifiedGuide>
//               <TourCreationPage />
//             </RequireVerifiedGuide>
//           }
//         />
//         <Route
//           path="/auth/google/callback"
//           element={<GoogleAuthCallbackPage />}
//         />
//         <Route path="/check-email" element={<CheckEmailNoticePage />} />
//         <Route
//           path="/verify-email-notice"
//           element={<Navigate to="/check-email" replace />}
//         />
//         <Route path="/verify-email" element={<VerifyEmailPage />} />
//         <Route path="/email-verified" element={<EmailVerifiedPage />} />
//         <Route path="/email-verified/:token" element={<VerifyEmailPage />} />
//         <Route path="/forgot-password" element={<ForgotPassword />} />
//         <Route path="/enter-otp" element={<EnterOTP />} />
//         <Route path="/change-password" element={<ChangePassword />} />
//         <Route
//           path="/password-reset-success"
//           element={<PasswordResetSuccess />}
//         />

//         <Route path="/onboarding/*" element={<TouristRoute />} />
//         <Route path="/tours/:id" element={<TourDetail />} />
//         <Route
//           path="/tourist/profile"
//           element={
//             <RequireRole allowedRoles={["tourist"]}>
//               <ProfileSettings />
//             </RequireRole>
//           }
//         />
//         <Route
//           path="/tourist/verification"
//           element={
//             <RequireRole allowedRoles={["tourist"]}>
//               <VerificationPage />
//             </RequireRole>
//           }
//         />
//         <Route
//           path="/tourist/bookings"
//           element={
//             <RequireRole allowedRoles={["tourist"]}>
//               <BookingHistory />
//             </RequireRole>
//           }
//         />
//         <Route
//           path="/tourist/payments"
//           element={
//             <RequireRole allowedRoles={["tourist"]}>
//               <Payments />
//             </RequireRole>
//           }
//         />
//         <Route
//           path="/tourist/bookings/:bookingId/confirmation"
//           element={
//             <RequireRole allowedRoles={["tourist"]}>
//               <CheckoutResult />
//             </RequireRole>
//           }
//         />
//         <Route
//           path="/tourist"
//           element={<Navigate to="/tourist/profile" replace />}
//         />

//         <Route path="/guides" element={<ViewAllGuidePage />} />
//         <Route path="/guides/:guideId" element={<GuideDetailsPage />} />
//         <Route path="/places" element={<ViewAllPlacesPage />} />
//         <Route path="/tourist/bookings/:bookingId/confirmation" element={<CheckoutResult />} />
//         <Route path="*" element={<Navigate to="/" replace />} />
//       </Routes>
//     </AuthProvider>
//   );
// }

// export default App;







// import { useEffect, useState } from "react";
// import { authApi } from "@/features/auth/api/authApi";
// import AuthContext from "./authContext";

// const AUTH_STORAGE_KEYS = {
//   accessToken: "accessToken",
//   refreshToken: "refreshToken",
//   user: "user",
// };

// const safeJsonParse = (value) => {
//   if (typeof value !== "string") {
//     return null;
//   }

//   try {
//     return JSON.parse(value);
//   } catch {
//     return null;
//   }
// };

// const clearAuthStorage = () => {
//   if (typeof window === "undefined") {
//     return;
//   }

//   localStorage.removeItem(AUTH_STORAGE_KEYS.accessToken);
//   localStorage.removeItem(AUTH_STORAGE_KEYS.refreshToken);
//   localStorage.removeItem(AUTH_STORAGE_KEYS.user);
// };

// const getStoredUser = () => {
//   const parsedUser = safeJsonParse(
//     localStorage.getItem(AUTH_STORAGE_KEYS.user),
//   );

//   if (!parsedUser || typeof parsedUser !== "object") {
//     return null;
//   }

//   return parsedUser;
// };

// const readStoredAuth = () => {
//   if (typeof window === "undefined") {
//     return {
//       user: null,
//       accessToken: null,
//       refreshToken: null,
//       isAuthenticated: false,
//       userRole: null,
//     };
//   }

//   const user = getStoredUser();
//   const accessToken = localStorage.getItem(AUTH_STORAGE_KEYS.accessToken);
//   const refreshToken = localStorage.getItem(AUTH_STORAGE_KEYS.refreshToken);

//   if (!user || !accessToken) {
//     clearAuthStorage();

//     return {
//       user: null,
//       accessToken: null,
//       refreshToken: null,
//       isAuthenticated: false,
//       userRole: null,
//     };
//   }

//   return {
//     user,
//     accessToken,
//     refreshToken,
//     isAuthenticated: true,
//     userRole: user?.role ?? null,
//   };
// };

// const persistAuthStorage = ({ accessToken, refreshToken, user }) => {
//   if (typeof window === "undefined") {
//     return;
//   }

//   localStorage.setItem(AUTH_STORAGE_KEYS.accessToken, accessToken);
//   localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(user));

//   if (refreshToken) {
//     localStorage.setItem(AUTH_STORAGE_KEYS.refreshToken, refreshToken);
//   } else {
//     localStorage.removeItem(AUTH_STORAGE_KEYS.refreshToken);
//   }
// };

// const normalizeAuthResponse = (authResponse) => {
//   const candidate =
//     authResponse?.data?.data ?? authResponse?.data ?? authResponse;

//   if (!candidate || typeof candidate !== "object") {
//     return null;
//   }

//   const accessToken = candidate.accessToken ?? candidate.token ?? null;
//   const refreshToken = candidate.refreshToken ?? null;
//   const user = candidate.user ?? null;

//   if (!accessToken || !user || typeof user !== "object") {
//     return null;
//   }

//   return {
//     accessToken,
//     refreshToken,
//     user,
//   };
// };

// const normalizeSignupResponse = (signupResponse) => {
//   if (!signupResponse || typeof signupResponse !== "object") {
//     return null;
//   }

//   const accessToken =
//     signupResponse.accessToken ?? signupResponse.token ?? null;
//   const refreshToken = signupResponse.refreshToken ?? null;
//   const user = signupResponse.user ?? null;

//   if (!accessToken || !user || typeof user !== "object") {
//     return null;
//   }

//   return {
//     accessToken,
//     refreshToken,
//     user,
//   };
// };

// const normalizeAllowedRoles = (allowedRoles) => {
//   if (Array.isArray(allowedRoles)) {
//     return allowedRoles;
//   }

//   if (typeof allowedRoles === "string") {
//     return [allowedRoles];
//   }

//   return [];
// };

// export const AuthProvider = ({ children }) => {
//   const [authState, setAuthState] = useState(() => readStoredAuth());
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [successMessage, setSuccessMessage] = useState(null);
//   const [pendingVerificationEmail, setPendingVerificationEmail] =
//     useState(null);
//   const [verificationResendCooldownSeconds, setVerificationResendCooldownSeconds] =
//     useState(0);


//   useEffect(() => {
//     if (verificationResendCooldownSeconds <= 0) return undefined;

//     const timer = window.setTimeout(() => {
//       setVerificationResendCooldownSeconds((current) =>
//         Math.max(0, current - 1),
//       );
//     }, 1000);

//     return () => window.clearTimeout(timer);
//   }, [verificationResendCooldownSeconds]);

//   useEffect(() => {
//     if (!authState.isAuthenticated) {
//       clearAuthStorage();
//     }
//   }, [authState.isAuthenticated]);

//   const clearAuth = () => {
//     clearAuthStorage();
//     setAuthState({
//       user: null,
//       accessToken: null,
//       refreshToken: null,
//       isAuthenticated: false,
//       userRole: null,
//     });
//   };

//   const login = (authResponse) => {
//     const normalizedAuth = normalizeAuthResponse(authResponse);

//     if (!normalizedAuth) {
//       throw new Error("Invalid auth response shape.");
//     }

//     persistAuthStorage(normalizedAuth);

//     setAuthState({
//       user: normalizedAuth.user,
//       accessToken: normalizedAuth.accessToken,
//       refreshToken: normalizedAuth.refreshToken,
//       isAuthenticated: true,
//       userRole: normalizedAuth.user?.role ?? null,
//     });
//   };

//   const logout = () => {
//     clearAuth();
//   };

//   const resetMessages = () => {
//     setError(null);
//     setSuccessMessage(null);
//   };

//   const signup = async ({
//     fullName,
//     email,
//     password,
//     confirmPassword,
//     role,
//   }) => {
//     setLoading(true);
//     resetMessages();

//     try {
//       const signupPayload = {
//         fullName,
//         email,
//         password,
//         confirmPassword,
//       };

//       const signupResponse =
//         role === "guide"
//           ? await authApi.registerGuide(signupPayload)
//           : await authApi.registerTourist(signupPayload);

//       const normalizedSignup = normalizeSignupResponse(signupResponse);

//       if (normalizedSignup) {
//         persistAuthStorage(normalizedSignup);

//         setAuthState({
//           user: normalizedSignup.user,
//           accessToken: normalizedSignup.accessToken,
//           refreshToken: normalizedSignup.refreshToken,
//           isAuthenticated: true,
//           userRole: normalizedSignup.user?.role ?? null,
//         });
//       }

//       setPendingVerificationEmail(email);
//       setSuccessMessage(
//         "Account created successfully. Please check your email to verify your account.",
//       );

//       return {
//         email,
//         response: signupResponse,
//       };
//     } catch (signupError) {
//       const message =
//         signupError instanceof Error
//           ? signupError.message
//           : "Unable to create your account. Please try again.";

//       setError(message);

//       throw signupError;
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resendVerificationEmail = async (email) => {
//     const targetEmail = email ?? pendingVerificationEmail;

//     if (!targetEmail) {
//       throw new Error(
//         "Please provide an email address to resend verification.",
//       );
//     }

//     setLoading(true);
//     resetMessages();

//     try {
//       await authApi.resendVerificationEmail(targetEmail);

//       setPendingVerificationEmail(targetEmail);
//       setVerificationResendCooldownSeconds(0);
//       setSuccessMessage("Verification email sent. Please check your inbox.");

//       return targetEmail;
//     } catch (resendError) {
//       const cooldownSeconds = Number(resendError?.cooldownSeconds ?? 0);

//       if (Number.isFinite(cooldownSeconds) && cooldownSeconds > 0) {
//         setError(null);
//         setVerificationResendCooldownSeconds(Math.ceil(cooldownSeconds));
//         return null;
//       }

//       const message =
//         resendError instanceof Error
//           ? resendError.message
//           : "Unable to resend verification email. Please try again.";

//       setError(message);

//       throw resendError;
//     } finally {
//       setLoading(false);
//     }
//   };

//   const updateUser = (updatedUser) => {
//     if (!updatedUser || typeof updatedUser !== "object") {
//       return;
//     }

//     setAuthState((currentState) => {
//       const nextUser = {
//         ...currentState.user,
//         ...updatedUser,
//       };

//       if (typeof window !== "undefined") {
//         localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(nextUser));
//       }

//       return {
//         ...currentState,
//         user: nextUser,
//         userRole: nextUser?.role ?? null,
//       };
//     });
//   };

//   const hasRole = (allowedRoles) => {
//     const roles = normalizeAllowedRoles(allowedRoles);

//     if (!roles.length) {
//       return false;
//     }

//     return roles.includes(authState.userRole);
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         user: authState.user,
//         accessToken: authState.accessToken,
//         refreshToken: authState.refreshToken,
//         isAuthenticated: authState.isAuthenticated,
//         isAuthLoading: loading,
//         userRole: authState.userRole,
//         loading,
//         error,
//         successMessage,
//         pendingVerificationEmail,
//         verificationResendCooldownSeconds,
//         login,
//         signup,
//         resendVerificationEmail,
//         logout,
//         updateUser,
//         hasRole,
//         clearAuth,
//         resetMessages,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };
