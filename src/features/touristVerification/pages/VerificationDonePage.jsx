import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  OnboardingPage,
  OnboardingStepBar,
  OnboardingFooter,
} from "../layouts/OnboardingLayout";
import { touristApi } from "../api/touristApi";
import { ICONS } from "../../../assets/images/touristVerification/images.js";

const checkGoldIcon = ICONS.checkGoldIcon;
const verifiedIcon = ICONS.verifiedIcon;
const lockIcon = ICONS.lockIcon;

const POLL_INTERVAL_MS = 8000; //  FIX: poll every 8s instead of checking once

export default function VerificationDonePage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const pollRef = useRef(null);

  const checkStatus = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const verificationStatus = await touristApi.getVerificationStatus();
      setStatus(verificationStatus);

      if (verificationStatus === "rejected") {
        navigate("/onboarding/verification");
      }
    } catch (error) {
      console.error("Failed to get verification status:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    checkStatus();

    pollRef.current = setInterval(() => {
      checkStatus({ silent: true });
    }, POLL_INTERVAL_MS);

    return () => clearInterval(pollRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Stop polling once we leave "pending"
  useEffect(() => {
    if (status !== "pending" && pollRef.current) {
      clearInterval(pollRef.current);
    }
  }, [status]);

  if (loading) {
    return (
      <OnboardingPage>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-12 h-12 border-4 border-[#010170] border-t-transparent rounded-full animate-spin" />
        </div>
      </OnboardingPage>
    );
  }

  return (
    <OnboardingPage>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 flex flex-col gap-6 sm:gap-8 lg:gap-10">
        <OnboardingStepBar step={2} />

        <div className="text-center flex flex-col gap-2 sm:gap-3">
          <p className="text-[10px] sm:text-xs lg:text-sm font-light tracking-[0.2em] text-[#010138] uppercase">
            Step 2 of 2
          </p>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-wide text-[#010138]">
            Verify Your Identity
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-[#353572]">
            Earn a Verified Tourist badge so top local guides instantly trust your booking.
          </p>
        </div>

        <div className="bg-white border border-[#353572] rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-10">
            <div className="flex-1 w-full min-w-[240px] bg-[#f4f4f8] border-3 sm:border-4 border-dashed border-[#010170] rounded-xl sm:rounded-2xl flex flex-col items-center justify-center gap-3 sm:gap-4 py-8 sm:py-10 lg:py-12">
              <div
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center"
                style={{ background: "linear-gradient(to bottom, #edc84c, #87722b)" }}
              >
                <img src={checkGoldIcon} alt="uploaded" className="w-6 h-6 sm:w-7 sm:h-7 object-contain" />
              </div>
              <div className="text-center">
                <p className="text-sm sm:text-base text-[#353572]">
                  {status === "pending" ? "Document submitted for review" : "Document verified"}
                </p>
                <p className="text-xs text-[#aaaacf] mt-1">
                  {status === "pending"
                    ? "Your passport is being reviewed. This usually takes 24-48 hours."
                    : "Your identity has been verified successfully!"}
                </p>
              </div>
            </div>

            <div className="flex flex-row lg:flex-col items-center gap-3 sm:gap-4 lg:gap-5 text-center shrink-0">
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl flex items-center justify-center"
                style={{ background: "linear-gradient(to bottom, #010170, #5656a0)" }}
              >
                <img src={verifiedIcon} alt="verified" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
              </div>
              <div>
                <p className="text-sm sm:text-base lg:text-lg font-medium text-[#010138]">Verified Tourist Badge</p>
                <p className="text-xs sm:text-sm text-[#353572] mt-1">
                  {status === "pending"
                    ? "Your badge will be unlocked once approved."
                    : "Your badge is active!"}
                </p>
              </div>
            </div>
          </div>

          {/*  FIX: manual refresh option in addition to auto-polling */}
          {status === "pending" && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => checkStatus()}
                disabled={refreshing}
                className="text-xs sm:text-sm font-medium text-[#010170] hover:underline disabled:opacity-50"
              >
                {refreshing ? "Checking…" : "Check status now"}
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-[#010138]">
          <img src={lockIcon} alt="lock" className="w-4 h-4 sm:w-5 sm:h-5 object-contain" />
          <span className="text-[11px] sm:text-sm font-light">
            Your documents are stored end-to-end encrypted and only used for verification.
          </span>
        </div>
      </div>

      <OnboardingFooter
        backTo="/onboarding/verification"
        continueTo={status === "pending" ? null : "/tourist/profile"}
        continueLabel={status === "pending" ? "Wait for Review" : "Finish & Explore"}
        continueEnabled={status !== "pending"}
        skipLabel={status === "pending" ? "Continue anyway" : null}
        onSkip={status === "pending" ? () => navigate("/tourist/profile") : null}
      />
    </OnboardingPage>
  );
}