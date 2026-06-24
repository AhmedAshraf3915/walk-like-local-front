import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  OnboardingPage,
  OnboardingStepBar,
  OnboardingFooter,
} from "../layouts/OnboardingLayout";
import { touristApi } from "../api/touristApi";
import { ICONS } from "../../../assets/images/touristVerification/images.js";

const uploadIcon    = ICONS.uploadIcon;
const checkGoldIcon = ICONS.checkGoldIcon;
const verifiedIcon  = ICONS.verifiedIcon;
const lockIcon      = ICONS.lockIcon;

export default function VerificationPage() {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [selectedFile,       setSelectedFile]       = useState(null);
  const [uploading,          setUploading]          = useState(false);
  const [uploadError,        setUploadError]        = useState(null);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [loadingStatus,      setLoadingStatus]      = useState(true);

  // Check status ONCE on mount — single useEffect
  useEffect(() => {
    touristApi.getVerificationStatus()
      .then((status) => {
        setVerificationStatus(status);
        if (status === "approved") {
          // Already verified — skip to the app
          navigate("/tourist/profile", { replace: true });
        } else if (status === "pending") {
          // Already submitted — go to waiting page, can't resubmit
          navigate("/onboarding/verification-done", { replace: true });
        }
        // "rejected" or null → stay here so they can (re)submit
      })
      .catch((err) => console.error("Failed to get verification status:", err))
      .finally(() => setLoadingStatus(false));
  }, [navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setUploadError(null);
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setUploadError(null);
    try {
      if (verificationStatus === "rejected") {
        await touristApi.resubmitPassport(selectedFile);
      } else {
        await touristApi.submitPassport(selectedFile);
      }
      navigate("/onboarding/verification-done", { replace: true });
    } catch (err) {
      setUploadError(err?.message ?? "Passport upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const fileReady = Boolean(selectedFile) && !uploading;

  if (loadingStatus) {
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

        {verificationStatus === "rejected" && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <p className="text-red-600 font-medium">
              Your verification was rejected. Please upload a new document.
            </p>
          </div>
        )}

        <div className="bg-white border border-[#353572] rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-10">
            {/* Drop zone */}
            <div
              className={`flex-1 w-full min-w-[240px] bg-[#f4f4f8] rounded-xl sm:rounded-2xl flex flex-col items-center justify-center gap-3 sm:gap-4 py-8 sm:py-10 lg:py-12 cursor-pointer transition-colors ${
                selectedFile
                  ? "border-3 sm:border-4 border-dashed border-[#010170]"
                  : "border-3 sm:border-4 border-dashed border-[#aaaacf] hover:border-[#010170]"
              }`}
              onClick={() => !uploading && inputRef.current?.click()}
            >
              {uploading ? (
                <>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 border-3 sm:border-4 border-[#010170] border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm sm:text-base text-[#353572] animate-pulse">Uploading…</p>
                </>
              ) : selectedFile ? (
                <>
                  <div
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center"
                    style={{ background: "linear-gradient(to bottom, #edc84c, #87722b)" }}
                  >
                    <img src={checkGoldIcon} alt="uploaded" className="w-6 h-6 sm:w-7 sm:h-7 object-contain" />
                  </div>
                  <div className="text-center px-3">
                    <p className="text-sm sm:text-base text-[#353572]">Document ready</p>
                    <p className="text-xs sm:text-sm font-medium text-[#010170] mt-1 break-all">{selectedFile.name}</p>
                    <p className="text-[10px] sm:text-xs text-[#aaaacf] mt-1">
                      {(selectedFile.size / 1024).toFixed(0)} KB — tap to change
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <img src={uploadIcon} alt="upload" className="w-10 h-10 sm:w-12 sm:h-12 object-contain" />
                  <div className="text-center">
                    <p className="text-sm sm:text-base text-[#353572]">
                      {verificationStatus === "rejected" ? "Upload new ID or passport" : "Upload ID or passport"}
                    </p>
                    <p className="text-xs text-[#aaaacf] mt-1">JPG, PNG or PDF · max 10 MB</p>
                  </div>
                </>
              )}
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileChange}
              />
            </div>

            {/* Badge preview */}
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
                  {verificationStatus === "rejected"
                    ? "Please resubmit your document."
                    : "Unlocked once your document is reviewed."}
                </p>
              </div>
            </div>
          </div>

          {uploadError && (
            <p className="mt-4 text-center text-xs sm:text-sm text-red-500">{uploadError}</p>
          )}

          {selectedFile && (
            <div className="mt-4 sm:mt-6 flex justify-center">
              <button
                onClick={handleSubmit}
                disabled={uploading}
                className="h-10 sm:h-11 px-8 sm:px-12 rounded-xl sm:rounded-2xl text-sm sm:text-base font-medium text-white transition-opacity disabled:opacity-60"
                style={{ background: "linear-gradient(to right, #010170, #5656a0)" }}
              >
                {verificationStatus === "rejected" ? "Resubmit for Verification" : "Submit for Verification"}
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
        backTo="/onboarding/profile"
        continueLabel="Continue"
        continueEnabled={fileReady}
        onContinue={handleSubmit}
        skipLabel="Skip for now"
        onSkip={() => navigate("/tourist/profile")}
      />
    </OnboardingPage>
  );
}