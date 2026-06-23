import { useState } from "react";
import { BadgeCheck, FileCheck2, Languages, UserRound } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import useAuth from "@/contexts/useAuth";
import GuideAccountShell from "@/features/guide/components/GuideAccountShell";
import VerificationStep from "@/features/guideVerification/components/VerificationStep";
import AiAssessmentStep from "@/features/guideVerification/components/AiAssessmentStep";
import ProfileStep from "@/features/guideVerification/components/ProfileStep";
import { useVerificationAssets } from "@/features/guideVerification/hooks/useVerificationAssets";
import { useAiAssessment } from "@/features/guideVerification/hooks/useAiAssessment";
import { useGuideProfile } from "@/features/guideVerification/hooks/useGuideProfile";
import {
  EXPERIENCE_OPTIONS,
  INTEREST_OPTIONS,
  LANGUAGE_OPTIONS,
} from "@/features/guideVerification/constants";
import { EGYPT_GOVERNORATES } from "@/features/tours/constants/tourOptions";

const SUB_TABS = [
  {
    label: "Documents",
    to: "/guide/complete-profile",
    icon: FileCheck2,
    end: true,
  },
  {
    label: "AI language test",
    to: "/guide/complete-profile/language-test",
    icon: Languages,
  },
  {
    label: "Profile details",
    to: "/guide/complete-profile/details",
    icon: UserRound,
  },
];

export default function GuideCompleteProfilePage() {
  const { pathname } = useLocation();
  const isLanguageTab = pathname.endsWith("/language-test");
  const isProfileTab = pathname.endsWith("/details");
  const { user, updateUser } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const verification = useVerificationAssets({ setErrorMessage });
  const assessment = useAiAssessment({ setErrorMessage });
  const guideProfile = useGuideProfile({ initialProfile: user });

  const saveProfile = async () => {
    setSuccessMessage("");

    if (!guideProfile.isProfileReady) {
      setErrorMessage("Please complete all profile details before saving.");
      return;
    }

    setErrorMessage("");

    try {
      const savedProfile = await guideProfile.submitProfile({
        selectedLanguages: assessment.selectedLanguages,
      });
      if (savedProfile) updateUser(savedProfile);
      setSuccessMessage("Your public profile details were saved.");
    } catch (error) {
      setErrorMessage(error?.message ?? "Unable to save profile details.");
    }
  };

  return (
    <GuideAccountShell>
      <nav
        aria-label="Complete guide profile"
        className="mx-auto grid max-w-3xl grid-cols-1 gap-2 rounded-2xl border border-[#d8d7e8] bg-white p-2 shadow-[0_10px_28px_rgba(1,1,56,0.10)] sm:grid-cols-3"
      >
        {SUB_TABS.map(({ label, to, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex h-12 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition ${
                isActive
                  ? "bg-[#07078c] text-white"
                  : "text-[#010138] hover:bg-[#f3f2f8]"
              }`
            }
          >
            <Icon className="h-4 w-4" /> {label}
          </NavLink>
        ))}
      </nav>

      {errorMessage ? (
        <p
          role="alert"
          className="mx-auto mt-6 max-w-4xl rounded-xl border border-[#efc2c2] bg-[#fff3f3] px-4 py-3 text-sm text-[#9f2626]"
        >
          {errorMessage}
        </p>
      ) : null}

      {successMessage ? (
        <p
          role="status"
          className="mx-auto mt-6 max-w-4xl rounded-xl border border-[#b9dca0] bg-[#f3fbe9] px-4 py-3 text-sm text-[#41651f]"
        >
          {successMessage}
        </p>
      ) : null}

      <div className="mt-8">
        {isProfileTab ? (
          <div>
            <ProfileStep
              profile={guideProfile.profile}
              languageOptions={LANGUAGE_OPTIONS}
              experienceOptions={EXPERIENCE_OPTIONS}
              interestOptions={INTEREST_OPTIONS}
              locationOptions={EGYPT_GOVERNORATES}
              onBioChange={guideProfile.setBio}
              onLocationChange={guideProfile.setCity}
              onExperienceChange={guideProfile.setExperience}
              onToggleLanguage={guideProfile.toggleLanguage}
              onToggleInterest={guideProfile.toggleInterest}
            />
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                disabled={guideProfile.submittingProfile}
                onClick={() => {
                  void saveProfile();
                }}
                className="h-12 rounded-xl bg-gradient-to-r from-[#010170] to-[#5656A0] px-7 text-sm font-semibold text-white disabled:opacity-50"
              >
                {guideProfile.submittingProfile
                  ? "Saving..."
                  : "Save profile details"}
              </button>
            </div>
          </div>
        ) : isLanguageTab ? (
          assessment.aiTestCompleted ? (
            <section className="mx-auto max-w-3xl rounded-3xl border border-[#cce6b8] bg-white px-6 py-14 text-center shadow-[0_12px_38px_rgba(1,1,56,0.09)]">
              <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#eefbdc] text-[#41651f]">
                <BadgeCheck className="h-10 w-10" />
              </span>
              <h1 className="mt-6 text-3xl font-bold">
                {assessment.testResult?.pass
                  ? "Test Passed!"
                  : "Test Completed"}
              </h1>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#65638a]">
                Your answers were submitted successfully. Verified languages
                appear on your public guide profile after review.
              </p>
              {assessment.testResult && (
                <div className="mt-6 space-y-3 text-left max-w-md mx-auto">
                  <p className="text-lg text-[#3b3a70]">
                    <span className="font-medium">Score:</span>{" "}
                    {assessment.testResult.score}
                  </p>
                  <p className="text-lg text-[#3b3a70]">
                    <span className="font-medium">Status:</span>{" "}
                    {assessment.testResult.pass ? "Passed" : "Not passed"}
                  </p>
                  {assessment.testResult.feedback && (
                    <p className="text-lg text-[#3b3a70]">
                      <span className="font-medium">Feedback:</span>{" "}
                      {assessment.testResult.feedback}
                    </p>
                  )}
                  <p className="text-lg text-[#3b3a70]">
                    <span className="font-medium">Attempts remaining:</span>{" "}
                    {assessment.testResult.attemptsRemaining} of{" "}
                    {assessment.testResult.maxAttempts}
                  </p>
                  {assessment.testResult.issues &&
                    assessment.testResult.issues.length > 0 && (
                      <div className="mt-3">
                        <p className="font-medium text-[#3b3a70]">Issues:</p>
                        <ul className="mt-1 list-inside list-disc text-[#3b3a70]">
                          {assessment.testResult.issues.map((issue, index) => (
                            <li key={index}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              )}
            </section>
          ) : (
            <AiAssessmentStep
              languageOptions={LANGUAGE_OPTIONS}
              questions={assessment.questions}
              aiQuestionIndex={assessment.aiQuestionIndex}
              aiAnswers={assessment.aiAnswers}
              aiVoiceClips={assessment.aiVoiceClips}
              selectedLanguages={assessment.selectedLanguages}
              isAiSessionStarted={assessment.isAiSessionStarted}
              isRecording={assessment.isRecording}
              recordingSeconds={assessment.recordingSeconds}
              remainingSeconds={assessment.remainingSeconds}
              startingAiSession={assessment.startingAiSession}
              aiUploadingAudio={assessment.aiUploadingAudio}
              submittingAiTest={assessment.submittingAiTest}
              formatDuration={assessment.formatDuration}
              aiTestCompleted={assessment.aiTestCompleted}
              onLanguageToggle={assessment.handleLanguageToggle}
              onStartSession={assessment.startSession}
              onTextAnswerChange={assessment.handleTextAnswerChange}
              onStartRecording={assessment.handleStartRecording}
              onStopRecording={assessment.stopRecording}
              onPrevious={assessment.handlePreviousQuestion}
              onNext={() => {
                void assessment.handleNextQuestion();
              }}
              onRestartSession={assessment.resetSession}
              testResult={assessment.testResult}
            />
          )
        ) : (
          <div>
            <VerificationStep
              loadingStatus={verification.loadingStatus}
              verificationStatus={verification.verificationStatus}
              assets={verification.assets}
              uploadingField={verification.uploadingField}
              openFilePicker={verification.openFilePicker}
              nationalIdInputRef={verification.nationalIdInputRef}
              licenseInputRef={verification.licenseInputRef}
              profilePhotoInputRef={verification.profilePhotoInputRef}
              introVideoInputRef={verification.introVideoInputRef}
              handleUpload={verification.handleUpload}
            />

            {!["approved", "pending"].includes(
              verification.verificationStatus,
            ) ? (
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  disabled={
                    verification.loadingStatus ||
                    verification.submittingVerification
                  }
                  onClick={() => {
                    void verification.submitVerification();
                  }}
                  className="h-12 rounded-xl bg-gradient-to-r from-[#010170] to-[#5656A0] px-7 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {verification.submittingVerification
                    ? "Submitting..."
                    : verification.verificationStatus === "rejected"
                      ? "Resubmit documents"
                      : "Submit for verification"}
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </GuideAccountShell>
  );
}
