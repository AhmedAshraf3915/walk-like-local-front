import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  OnboardingPage,
  OnboardingStepBar,
  OnboardingFooter,
} from "../layouts/OnboardingLayout";
import { touristApi } from "../api/touristApi";
import { ICONS } from "../../../assets/images/touristVerification/images.js";


const uploadIcon   = ICONS.uploadIcon;
const checkGoldIcon = ICONS.checkGoldIcon;
const verifiedIcon = ICONS.verifiedIcon;
const lockIcon     = ICONS.lockIcon;

export default function VerificationPage() {
  const navigate  = useNavigate();
  const inputRef  = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);  // File object
  const [uploading, setUploading]        = useState(false);
  const [uploadError, setUploadError]    = useState(null);
  const [submitted, setSubmitted]        = useState(false);

  // ── File chosen 
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setUploadError(null);
    setSubmitted(false);
  };

  // ── Submit passport to backend 
  const handleSubmit = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setUploadError(null);
    try {
      await touristApi.submitPassport(selectedFile);
      setSubmitted(true);
      navigate("/onboarding/verification-done");
    } catch (err) {
      setUploadError(
        err?.message ?? "Passport upload failed. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  const fileReady = Boolean(selectedFile) && !uploading;

  return (
    <OnboardingPage>
      <div className="max-w-[1440px] mx-auto px-8 py-12 flex flex-col gap-12">
        {/* Step bar */}
        <OnboardingStepBar step={2} />

        {/* Hero copy */}
        <div className="text-center flex flex-col gap-5">
          <p className="text-sm font-light tracking-[0.2em] text-[#010138] uppercase">
            Step 2 of 3
          </p>
          <h1 className="text-4xl font-semibold tracking-wide text-[#010138]">
            Verify Your Identity
          </h1>
          <p className="text-2xl text-[#353572]">
            Earn a Verified Tourist badge so top local guides instantly trust your booking.
          </p>
        </div>

        {/* Upload card */}
        <div className="bg-white border border-[#353572] rounded-2xl p-10">
          <div className="flex items-center gap-16 flex-wrap">

            {/* Upload zone */}
            <div
              className={`flex-1 min-w-[280px] bg-[#f4f4f8] rounded-2xl flex flex-col items-center justify-center gap-5 py-16 cursor-pointer transition-colors ${
                selectedFile
                  ? "border-4 border-dashed border-[#010170]"
                  : "border-4 border-dashed border-[#aaaacf] hover:border-[#010170]"
              }`}
              onClick={() => !uploading && inputRef.current?.click()}
            >
              {uploading ? (
                /* Uploading spinner */
                <>
                  <div className="w-14 h-14 border-4 border-[#010170] border-t-transparent rounded-full animate-spin" />
                  <p className="text-xl text-[#353572] animate-pulse">Uploading…</p>
                </>
              ) : selectedFile ? (
                /* File chosen — show gold check + filename */
                <>
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ background: "linear-gradient(to bottom, #edc84c, #87722b)" }}
                  >
                    <img src={checkGoldIcon} alt="uploaded" className="w-8 h-8 object-contain" />
                  </div>
                  <div className="text-center px-4">
                    <p className="text-xl text-[#353572]">Document ready</p>
                    {/* File name */}
                    <p className="text-base font-medium text-[#010170] mt-1 break-all">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-[#aaaacf] mt-1">
                      {(selectedFile.size / 1024).toFixed(0)} KB — tap to change
                    </p>
                  </div>
                </>
              ) : (
                /* Empty state */
                <>
                  <img src={uploadIcon} alt="upload" className="w-14 h-14 object-contain" />
                  <div className="text-center">
                    <p className="text-xl text-[#353572]">Upload ID or passport</p>
                    <p className="text-base text-[#aaaacf] mt-1">JPG, PNG or PDF · max 10 MB</p>
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
            <div className="flex flex-col items-center gap-5 w-60 text-center shrink-0">
              <div
                className="w-24 h-24 rounded-3xl flex items-center justify-center"
                style={{ background: "linear-gradient(to bottom, #010170, #5656a0)" }}
              >
                <img src={verifiedIcon} alt="verified" className="w-12 h-12 object-contain" />
              </div>
              <div>
                <p className="text-xl font-medium text-[#010138]">Verified Tourist Badge</p>
                <p className="text-base text-[#353572] mt-2">
                  Unlocked once your document is reviewed.
                </p>
              </div>
            </div>
          </div>

          {/* Error */}
          {uploadError && (
            <p className="mt-6 text-center text-sm text-red-500">{uploadError}</p>
          )}

          {/* Submit button — shown only when file is chosen */}
          {selectedFile && !submitted && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleSubmit}
                disabled={uploading}
                className="h-12 px-16 rounded-2xl text-base font-medium text-white transition-opacity disabled:opacity-60"
                style={{
                  background: "linear-gradient(to right, #010170, #5656a0)",
                }}
              >
                {uploading ? "Submitting…" : "Submit for Verification"}
              </button>
            </div>
          )}
        </div>

        {/* Security note */}
        <div className="flex items-center justify-center gap-2 text-[#010138]">
          <img src={lockIcon} alt="lock" className="w-5 h-5 object-contain" />
          <span className="text-base font-light">
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
        onSkip={() => navigate("/onboarding/payment")}
      />
    </OnboardingPage>
  );
}
